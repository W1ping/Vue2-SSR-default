import { httpPost, httpGet } from '../utils/http'

class apis {
    static getDemoList (data) {
        return Promise.resolve('res')
        // return httpGet('/xxx/getDemoList', data)
    }
}

export default apis
