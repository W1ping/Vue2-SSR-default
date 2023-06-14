import Vue from 'vue'
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import ssrMixin from './mixins/ssr.mixin.js'

// 服务端、客户端渲染差异mixin
Vue.mixin(ssrMixin)

Vue.config.productionTip = false

// 仅客户端时才渲染
if (typeof window !== 'undefined') {
    const ElementUI = require('element-ui')
    require('element-ui/lib/theme-chalk/index.css')
    Vue.use(ElementUI)
}

const store = createStore()
const router = createRouter()

export function createApp () {
    // sync the router with the vuex store. this registers `store.state.route`
    sync(store, router)

    const app = new Vue({
        router,
        store,
        render: h => h(App)
    })

    return { app, store, router }
}
