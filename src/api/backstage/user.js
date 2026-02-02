import request from '@/utils/request.js'

let apiPrefix = '/system/user'

/**
 * 获取后台管理用户列表
 */
export function getAdminList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params: params
    })
}

/**
 * 获取用户详细信息
 */
export function getUser(adminId) {
    return request({
        url: `${apiPrefix}/${adminId}`,
        method: 'get'
    })
}

/**
 * 新增用户
 */
export function addUser(data) {
    return request({
        url: apiPrefix,
        method: 'post',
        data: data
    })
}

/**
 * 修改用户
 */
export function updateUser(data) {
    return request({
        url: apiPrefix,
        method: 'put',
        data: data
    })
}

/**
 * 删除用户
 */
export function delUser(adminId) {
    return request({
        url: `${apiPrefix}/${adminId}`,
        method: 'delete'
    })
}

/**
 * 重置密码
 */
export function resetUserPwd(adminId, password) {
    const data = {
        adminId,
        password
    }
    return request({
        url: `${apiPrefix}/resetPwd`,
        method: 'put',
        data: data
    })
}
