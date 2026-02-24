import request from '@/utils/request'

let apiPrefix = '/system/announcement'

/**
 * 获取公告计划
 * @returns {Promise}
 */
export function getAnnouncement() {
    return request({
        url: `${apiPrefix}`,
        method: 'get'
    })
}

/**
 * 修改公告计划
 * @param {string} content - 公告内容
 * @returns {Promise}
 */
export function updateAnnouncement(content) {
    return request({
        url: `${apiPrefix}`,
        method: 'post',
        data: { content }
    })
}
