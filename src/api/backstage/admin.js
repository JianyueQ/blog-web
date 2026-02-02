import request from '@/utils/request'

let apiPrefix = '/system/admin/profile'

/**
 * 上传头像
 * @param data
 * @returns {*}
 */
export function uploadAvatar(data) {
    return request({
        url: `${apiPrefix}/avatar`,
        method: 'post',
        data: data,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

/**
 * 基本资料修改
 */
export function updateProfile(data) {
    return request({
        url: `${apiPrefix}`,
        method: 'put',
        data: data
    })
}

/**
 * 修改密码
 */
export function updatePassword(data) {
    return request({
        url: `${apiPrefix}/changePassword`,
        method: 'put',
        data: data
    })
}




