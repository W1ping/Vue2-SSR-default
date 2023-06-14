// for：其他非路由组件，想使用asyncData场景
export default {
    data () {
        return {
            dataPromise: null
        }
    },
    beforeMount () {
        const { asyncData } = this.$options
        if (asyncData) {
            // 将获取数据操作分配给 promise。以便在组件中，我们可以在数据准备就绪后，通过运行 `this.dataPromise.then(...)` 来执行其他任务
            // console.log('beforeMount asyncData')
            this.dataPromise = asyncData({
                store: this.$store,
                route: this.$route
            })
        }
    },
    beforeRouteUpdate (to, from, next) {
        const { asyncData } = this.$options
        if (asyncData) {
            // console.log('beforeRouteUpdate asyncData')
            asyncData({
                store: this.$store,
                route: to
            }).then(next).catch(next)
        } else {
            next()
        }
    }
}
