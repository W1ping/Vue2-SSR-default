import { createApp } from './src/app'

const isDev = process.env.NODE_ENV !== 'production'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default context => {
    return new Promise((resolve, reject) => {
        const s = isDev && Date.now()
        const { app, router, store } = createApp()

        const { url } = context
        const { fullPath } = router.resolve(url).route

        if (fullPath !== url) {
            return reject({ url: fullPath })
        }

        // set router's location
        router.push(url)

        // wait until router has resolved possible async hooks
        router.onReady(() => {
            // 获取该url路由下的所有Component，这些组件定义在Vue Router中。
            const matchedComponents = router.getMatchedComponents()
            // 匹配不到的路由，执行 reject 函数，并返回 404
            if (!matchedComponents.length) {
                return reject({ code: 404 })
            }
            // 使用Promise.all执行匹配到的Component的asyncData方法，即预取数据
            Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
                store,
                route: router.currentRoute
            })))
                .then(() => {
                    isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
                    // 把vuex的state设置到传入的context.state
                    context.state = store.state
                    // 返回state、router已经设置好的Vue实例app
                    resolve(app)
                })
                .catch(reject)
        }, reject)
    })
}
