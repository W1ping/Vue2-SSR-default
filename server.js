/* eslint-disable no-magic-numbers */

process.env.VUE_ENV = 'server'
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
const favicon = require('serve-favicon')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')
const microcache = require('route-cache')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')

const isLocal = process.env.NODE_ENV === 'local'

const useMicroCache = process.env.MICRO_CACHE !== 'false'
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const app = express()

// 创建一个 Vue 服务器渲染的渲染器，可以将 Vue 组件渲染成 HTML 字符串
function createRenderer (bundle, options) {
    return createBundleRenderer(bundle, Object.assign(options, {
    // for component caching
        cache: LRU({
            max: 2000,
            maxAge: 1000 * 60 * 15
        }),
        // this is only needed when vue-server-renderer is npm-linked
        basedir: resolve('./dist'),
        // recommended for performance
        runInNewContext: false,
        // 路由太多，导致会fetch巨多脚本，影响页面渲染
        shouldPrefetch: (file, type) => {
            return type !== 'script' || !file.match(/^\d+./)
        }
    }))
}

let renderer
let readyPromise
const templatePath = resolve('./index.template.html') // 服务端渲染模板
if (!isLocal) {
    const template = fs.readFileSync(templatePath, 'utf-8')
    // 生产环境下，webpack结合vue-ssr-webpack-plugin插件生成的server bundle
    const bundle = require('./dist/vue-ssr-server-bundle.json')
    // client manifests是可选项，但他允许渲染器自动插入preload/prefetch特性（如脚本）至后续渲染的HTML中，以改善客户端性能
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    // 通过vue-server-renderer创建vue bundle渲染器并绑定server bundle, 设置HTML模板
    renderer = createRenderer(bundle, {
        template,
        clientManifest
    })
} else {
    // 本地开发环境下，使用dev-server来通过回调把生成在内存中的bundle文件传回
    // 通过dev server的webpack-dev-middleware和webpack-hot-middleware实现客户端代码的热更新
    // 以及通过webpack的watch功能实现服务端代码的热更新
    readyPromise = require('./build/setup-dev-server')(
        app,
        templatePath,
        (bundle, options) => {
            renderer = createRenderer(bundle, options)
        }
    )
}

// 创建一个 Express 中间件来暴露指定目录下的静态文件。
const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache && !isLocal ? 1000 * 60 * 60 * 24 * 30 : 0,
    setHeaders: function (res, path, stat) {
        if (this.req.query && this.req.query.max_age) {
            try {
                res.setHeader('Cache-Control', 'max-age=' + this.req.query.max_age)
            } catch (error) {
                console.error('设置文件头部max-age失败：', this.req.url)
                console.error(error)
            }
        }
    }
})

// 依次装载一系列Express中间件，用来处理静态资源，数据压缩等
app.use(favicon(resolve('./public/favicon.ico')))
app.use('/dist', serve('./dist', true))
app.use(serve('./public', true)) // 根目录
app.use('/manifest.json', serve('./manifest.json', true))
app.use('/service-worker.js', serve('./dist/service-worker.js'))
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' })) // 支持 application/x-www-form-urlencoded 请求
app.use(bodyParser.json({ limit: '20mb' })) // 支持 application/json content-type 请求
app.use(cookieParser())
app.use(fileupload())
// 无用户特定内容，可设置 1s 微缓存. https://www.nginx.com/blog/benefits-of-microcaching-nginx/
app.use(microcache.cacheSeconds(1, req => {
    // fix: 修复后台一次上传多张照片，实际请求只有一次bug。仅当文件上传时不缓存接口。
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) return false
    // fix: api接口参数不同，返回错误cache bug
    const cacheKey = `${req.originalUrl}${req.method === 'POST' ? `_${JSON.stringify(req.body)}` : ''}`
    return useMicroCache && cacheKey
}))

function render (req, res) {
    const s = Date.now()

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Server', serverInfo)

    const handleError = err => {
        if (err.url) {
            res.redirect(err.url)
        } else if (err.code === 404) {
            res.status(404).send('404 | Page Not Found')
        } else {
        // Render Error Page or Redirect
            res.status(500).send('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err.stack)
        }
    }
    // 设置要注入的上下文，默认注入，动态 TDK 注入看 ssr.mixin.js
    const context = {
        title: 'xxx-title', // 默认
        url: req.url,
        keywords: 'xxx-keywords',
        description: 'xxx-description'
    }
    // 为渲染器绑定的server bundle（即entry-server.js）设置入参context
    renderer.renderToString(context, (err, html) => {
        if (err) {
            return handleError(err)
        }
        res.send(html)
        if (isLocal) {
            console.log(`whole request: ${Date.now() - s}ms`)
        }
    })
}

app.get('*', !isLocal ? render : (req, res) => {
    readyPromise.then(() => render(req, res))
})

const port = process.env.PORT || 80
app.listen(port, () => {
    console.log(`server started at localhost:${port}`)
})
