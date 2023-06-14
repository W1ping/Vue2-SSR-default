<template>
    <div class="demo">
        <h1>
            here is demo Page
        </h1>
        <h3>
            currDemoList--{{ currdemoList }}
        </h3>
        <!-- 为提高seo，需要提供没有带参数的url(?)供浏览器爬虫爬取 -->
        <router-link
            :to="{ path: '/' }"
            :event="''"
            @click.native.prevent="gotoForSEO"
            >
            click go to homePage with gotoForSEO
        </router-link>
    </div>
</template>
<script>
export default {
    name: 'demo',
    // sever app获取不到 通用组件的 asyncData
    asyncData ({ store }) {
        return store.dispatch('getDemoList')
    },
    computed: {
        currdemoList () {
            return this.$store.state.demoList
        }
    },
    methods: {
        gotoForSEO () {
            this.$router.push({
                name: 'home'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.demo {
    color: red;
    font-size: 30px;
}
</style>
