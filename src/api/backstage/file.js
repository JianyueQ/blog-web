import request from '@/utils/request'

let apiPrefix = '/common'

export function uploadImage(data){
    return request({
        url: `${apiPrefix}/uploadImage`,
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}
