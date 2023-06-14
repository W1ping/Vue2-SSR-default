import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: require('@/views/index').default,
            meta: {
                title: '首页'
            }
        },
        {
            path: '/demo/:id',
            name: 'demo',
            component: require('@/views/demo').default,
            meta: {
                title: 'demo页面'
            }
        }
    ]
})
export function createRouter () {
    return router
}
