import request from '@/utils/request'

let apiPrefix = '/blog/user/friendLinks'

// 1. 获取前台展示友链列表
export function getDisplayedFriendLinks(params) {
    return request({
        url: `${apiPrefix}/getDisplayedFriendLinks`,
        method: 'get',
        params
    })
}

// 2. 前台申请添加友链
export function requestToAddFriendLink(data) {
    return request({
        url: `${apiPrefix}/requestToAdd`,
        method: 'post',
        data
    })
}
