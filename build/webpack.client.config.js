const base = require('./webpack.base.config')
const webpack = require('webpack')
const merge = require('webpack-merge')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const config = merge(base, {
    entry: {
        app: './entry-client.js'
    },
    plugins: [
    // 设置换件变量：生产环境下可以剥离 vue源代码中的开发人员代码
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"client"'
        }),
        new VueSSRClientPlugin()
    ]
})

module.exports = config
