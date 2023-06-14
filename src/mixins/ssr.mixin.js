// 处理页面 title
function getTitle (vm) {
    const { title } = vm.$options
    // fix: 服务端/客户端渲染时，子组件的title也会应用上
    if (title && !vm.isInner) {
        return typeof title === 'function'
            ? title.call(vm)
            : title
    }
}
// 动态TDK
function getTDK (vm) {
    const { keywords, description } = vm.$options
    return { keywords, description }
}
const serverMixin = {
    created () {
        const title = getTitle(this)
        if (title) {
            this.$ssrContext.title = `${title}`
        }
        const { keywords, description } = getTDK(this)
        if (keywords || description) {
            this.$ssrContext.keywords = keywords
            this.$ssrContext.description = description
        }
    }
}
const clientMixin = {
    data () {
        return {
            isMounted: false
        }
    },
    mounted () {
        this.isMounted = true
        this.$ssrMixin__init()
    },
    methods: {
        $ssrMixin__init () {
            this.$ssrMixin__setTitle()
            this.$ssrMixin__setMeta()
        },
        $ssrMixin__setTitle () {
            const title = getTitle(this)
            if (title) {
                document.title = `${title}`
            }
        },
        // 客户端同步更新 keywords 和 description
        $ssrMixin__setMeta () {
            const keywordsArr = document.getElementsByName('keywords')
            const descriptionArr = document.getElementsByName('description')
            const { keywords, description } = getTDK(this)
            if (keywords) {
                keywordsArr[1].content = keywords
            }
            if (description) {
                descriptionArr[0].content = description
            }
        }
    }
}

export default process.env.VUE_ENV === 'server'
    ? serverMixin
    : clientMixin
