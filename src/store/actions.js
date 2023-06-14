import api from '@/api/apis.js'
function handleError (error, redirect) {
    console.error(error || '请求失败')
}
export default {
    // action getDemoList
    async getDemoList ({ commit }, params) {
        try {
            const data = await api.getDemoList(params)
            commit('setDemoList', data)
        } catch (error) {
            handleError(error)
        }
    }
}
