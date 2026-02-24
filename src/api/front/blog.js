import request from '@/utils/request'

export function listBlog(params) {
    return request({
        url: '/blog/article/list',
        method: 'get',
        params
    })
}
