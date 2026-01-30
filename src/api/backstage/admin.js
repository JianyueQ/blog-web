import request from '@/utils/request'

/**
 * 上传头像
 * @param data
 * @returns {*}
 */
export function uploadAvatar(data) {
    return request({
        url: '/avatar',
        method: 'post',
        data
    })
}
