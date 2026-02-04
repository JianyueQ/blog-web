import request from '@/utils/request'

//前缀
let apiPrefix = '/blog/user/profile'

export function getBlogOwnerAboutMe() {
    return request({
        url: `${apiPrefix}/getBlogOwnerAboutMe`,
        method: 'get'
    })
}
