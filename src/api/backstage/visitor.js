import request from '@/utils/request'

const apiPrefix = '/system/visitor/record'

/**
 * 获取访客记录列表
 * @param {Object} params - 查询参数
 * @param {string} params.ipaddr - IP地址（可选，模糊查询）
 * @param {string} params.location - 地区位置（可选，模糊查询）
 * @param {string} params.startTime - 开始时间（可选）
 * @param {string} params.endTime - 结束时间（可选）
 * @param {string} params.blacklist - 是否黑名单，Y:是 N:否（必填）
 * @param {number} params.pageNum - 页码（可选，默认1）
 * @param {number} params.pageSize - 每页条数（可选，默认10）
 */
export function getVisitorList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

/**
 * 获取访客记录详情
 * @param {string} visitorRecordId - 访客记录ID
 */
export function getVisitorDetail(visitorRecordId) {
    return request({
        url: `${apiPrefix}/detail`,
        method: 'get',
        params: { visitorRecordId }
    })
}

/**
 * 更新访客记录黑名单状态
 * @param {string} visitorRecordId - 访客记录ID
 * @param {string} isBlacklist - 是否加入黑名单，'Y':加入 'N':移除
 * @param {string} reason - 拉黑原因（加入黑名单时必填）
 */
export function updateBlacklist(visitorRecordId, isBlacklist, reason) {
    return request({
        url: `${apiPrefix}/update/blacklist`,
        method: 'post',
        data: { visitorRecordId, isBlacklist, reason }
    })
}

/**
 * 清空访客记录
 */
export function cleanVisitorRecords() {
    return request({
        url: `${apiPrefix}/clean`,
        method: 'post'
    })
}
