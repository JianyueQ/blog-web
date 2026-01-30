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
