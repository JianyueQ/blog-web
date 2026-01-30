import request from '@/utils/request'

//前缀
let apiPrefix = '/blog/user/profile'

export function getBlogOwnerProfile() {
    return request({
        url: `${apiPrefix}/getBlogOwnerProfile`,
        method: 'get'
    })
}
