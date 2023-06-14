<template>
    <div class="demo-components">
        该 demo 组件展示在组件内如何使用 aysncData
    </div>
</template>

<script>
import asyncDataMixin from '@/mixins/asyncData.mixin'
export default {
    name: 'demoComponents',
    mixins: [asyncDataMixin],
    asyncData ({ store }) {
        const getSomething = () => {
            return store.dispatch('getDemoList')
        }
        return Promise.all([getSomething()])
    },
    computed: {
        list () {
            return this.$store.state.demoList
        }
    }
}
</script>

<style scoped lang='scss'>
</style>
