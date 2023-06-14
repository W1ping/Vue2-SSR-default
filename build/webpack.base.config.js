const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const isLocal = process.env.NODE_ENV === 'local'
const isProd = process.env.NODE_ENV === 'production'

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}
const defaultPlugins = [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
        'process.browser': true
    })
]
const localPlugins = [
    new FriendlyErrorsPlugin()
]
const prodPlugins = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[id].[contenthash].css'
    })
]
module.exports = {
    // 开发环境下，开启代码调试map，方便调试断点时代码寻址
    devtool: !isLocal ? false : '#cheap-module-source-map',
    // 去掉ExtractTextPlugin时各部分内容的终端输出
    stats: { children: false },
    output: {
        path: resolve('dist'),
        publicPath: '/dist/',
        // filename: '[name].[chunkhash].js',
        filename: 'js/[name].[chunkhash].js',
        chunkFilename: 'js/[id].[chunkhash].js'
    },
    mode: isProd ? 'production' : 'development',
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            public: resolve('public'),
            assets: resolve('src/assets'),
            '@': resolve('src'),
            // 预编译+运行时, 有预编译转化成纯javascrit过程;  运行时，纯粹全是javascript
            vue$: isLocal ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js', // $ 表示精准匹配
            vuex$: 'vuex/dist/vuex.esm.js',
            'vue-router$': 'vue-router/dist/vue-router.esm.js'
        }
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'initial',
                    minChunks: 2
                }
            }
        },
        minimizer: [
            new OptimizeCSSAssetsPlugin(),
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        comments: false
                    },
                    compress: {
                        drop_debugger: true,
                        drop_console: true
                    }
                }
            })
        ]
    },
    module: {
        noParse: /node_modules\/(element-ui\.js|es6-promise\.js)/, // 无依赖项
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: true,
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory=true',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'img/[name].[ext]?[hash]&max_age=999999'
                }
            },
            {
                test: /\.css$/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
                    'css-loader',
                    'postcss-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                            data: `
                                @import "@/assets/css/base.scss";
                            `
                        }
                    }
                ]
            },
            {
                test: /\.(otf|eot|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader',
                include: [resolve('src'), resolve('node_modules/element-ui')]
            }, {
                test: /\.(mp4)$/,
                loader: 'file-loader',
                include: [resolve('dist')]
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },
    performance: {
        hints: false
    },
    plugins: !isLocal ? [
        ...defaultPlugins,
        ...prodPlugins
    ] : [
        ...defaultPlugins,
        ...localPlugins
    ]
}
