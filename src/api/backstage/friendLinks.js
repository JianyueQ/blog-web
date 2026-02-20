import request from '@/utils/request'

let apiPrefix = '/system/friendLinks'

// 1. 获取友链列表
export function getFriendLinksList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

// 2. 获取友链详情
export function getFriendLinksDetail(friendLinksId) {
    return request({
        url: `${apiPrefix}/detail`,
        method: 'get',
        params: { friendLinksId }
    })
}

// 3. 获取通过前台申请的友链列表
export function getApprovedFriendLinksList(params) {
    return request({
        url: `${apiPrefix}/approvedList`,
        method: 'get',
        params
    })
}

// 4. 新增友链
export function addFriendLinks(data) {
    return request({
        url: `${apiPrefix}/add`,
        method: 'post',
        data
    })
}

// 5. 修改友链
export function updateFriendLinks(data) {
    return request({
        url: `${apiPrefix}/update`,
        method: 'post',
        data
    })
}

// 6. 修改友链展示状态
export function updateFriendLinksStatus(data) {
    return request({
        url: `${apiPrefix}/status`,
        method: 'post',
        data
    })
}

// 7. 删除友链
export function deleteFriendLinks(friendLinksId) {
    return request({
        url: `${apiPrefix}/delete/${friendLinksId}`,
        method: 'post'
    })
}
