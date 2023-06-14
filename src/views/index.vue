<template>
    <div class="home">
        <h1>
            here is home page
        </h1>
        <hr />
        <!-- 为提高seo，需要提供没有带参数的url(?)供浏览器爬虫爬取 -->
        <router-link
            :to="{ path: `/demo/${someId}` }"
            :event="''"
            @click.native.prevent="gotoForSEO(someId, 'someQueryxxx')"
            >
            click to demoPage with gotoForSEO
        </router-link>
    </div>
</template>

<script>
let isDispatched = false
export default {
    data () {
        return {
            someId: 'xxxxsomId'
        }
    },
    asyncData ({ store }) {
        // 有重复请求的 bug 指标不治本 待修复
        if (isDispatched) return Promise.resolve()
        isDispatched = true
        const getSomeDemoList = () => {
            return store.dispatch('getDemoList', { category: 'xxx' })
        }
        const getAthoerDemoList = () => {
            return store.dispatch('getDemoList', { pageSize: 'xxx' })
        }
        return Promise.all([getSomeDemoList(), getAthoerDemoList()])
    },
    computed: {
        demoList () {
            return this.$store.state.demoList
        }
    },
    methods: {
        gotoForSEO (id, flag) {
            let to = {
                name: 'demo',
                params: {
                    id: id
                }
            }
            flag && (to = {
                ...to,
                query: {
                    flag
                }
            })
            this.$router.push(to)
        }
    }
}
</script>

<style lang="scss" scoped>
.home {
    color: blue;
    font-size: 35px;
}
</style>
