import request from '@/utils/request'

let apiPrefix = '/blog/announcement'

/**
 * 获取公告计划（前台接口）
 * @returns {Promise}
 */
export function getAnnouncement() {
    return request({
        url: `${apiPrefix}`,
        method: 'get'
    })
}
