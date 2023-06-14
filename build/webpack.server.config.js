const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(base, {
    // 指定生成后的运行环境在node
    target: 'node',
    // 设置代码调试map
    devtool: '#source-map',
    // 配置编译的入口文件
    entry: './entry-server.js',
    // 设置输出文件名，并设置模块导出为commonjs2类型
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    // 设置不打包规则
    externals: nodeExternals({
    // 排除CSS文件、生产依赖项（即打包），以防我们需要从dep导入它
        whitelist: Object.keys(require('../package.json').dependencies).push(/\.css$/)
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"' // json
        }),
        new VueSSRServerPlugin()
    ]
})
