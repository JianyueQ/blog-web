import request from '@/utils/request'

//前缀
let apiPrefix = '/blog/user/profile'

//获取博主的社交联系信息
export function getBlogOwnerSocialInfo() {
    return request({
        url: `${apiPrefix}/getBlogOwnerSocialInfo`,
        method: 'get'
    })
}


