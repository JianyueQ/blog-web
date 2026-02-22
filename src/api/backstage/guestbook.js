import request from '@/utils/request'

const apiPrefix = '/system/guestbook'

/**
 * 获取留言列表（后台管理）
 * @param {Object} params - 查询参数
 * @param {string} params.startTime - 开始时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} params.endTime - 结束时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.orderByColumn - 排序列
 * @param {string} params.isAsc - 排序方向，asc-升序，desc-降序
 * @param {boolean} params.reasonable - 分页参数合理化
 */
export function getGuestbookList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

/**
 * 后台回复留言
 * @param {Object} data - 回复数据
 * @param {string} data.content - 回复内容（必填）
 * @param {number} data.rootId - 根留言ID，0表示根留言（必填）
 * @param {number} data.parentId - 回复留言ID，0表示直接回复根留言（必填）
 */
export function adminReplyMessage(data) {
    return request({
        url: `${apiPrefix}/adminReplyMessage`,
        method: 'post',
        data
    })
}

/**
 * 修改留言状态
 * @param {Object} data - 状态数据
 * @param {number} data.guestbookId - 留言ID（必填）
 * @param {number} data.status - 状态：0-隐藏，1-显示，2-审核中（必填）
 */
export function updateGuestbookStatus(data) {
    return request({
        url: `${apiPrefix}/updateStatus`,
        method: 'post',
        data
    })
}

/**
 * 删除留言
 * @param {number} id - 留言ID
 */
export function deleteGuestbook(id) {
    return request({
        url: `${apiPrefix}/delete/${id}`,
        method: 'post'
    })
}
