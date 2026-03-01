import request from '@/utils/request'

const apiPrefix = '/system/messageRecord'

/**
 * 获取消息列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码（可选，默认1）
 * @param {number} params.pageSize - 每页条数（可选，默认10）
 * @param {string} params.orderByColumn - 排序列，如：create_time
 * @param {string} params.isAsc - 排序方向，asc-升序，desc-降序，默认asc
 * @param {boolean} params.reasonable - 分页参数合理化，true-合理化处理，false-不进行合理化处理，默认true
 */
export function getMessageList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

/**
 * 修改消息阅读状态
 * @param {number} messageId - 消息ID
 * @param {number} isRead - 阅读状态：0-未读，1-已读
 */
export function updateMessageReadStatus(messageId, isRead) {
    return request({
        url: `${apiPrefix}/updateMessageReadStatus`,
        method: 'post',
        data: { messageId, isRead }
    })
}

/**
 * 获取未读消息列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码（可选，默认1）
 * @param {number} params.pageSize - 每页条数（可选，默认10）
 */
export function getUnreadMessageList(params) {
    return request({
        url: `${apiPrefix}/listUnread`,
        method: 'get',
        params
    })
}

/**
 * 获取已读消息列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码（可选，默认1）
 * @param {number} params.pageSize - 每页条数（可选，默认10）
 */
export function getReadMessageList(params) {
    return request({
        url: `${apiPrefix}/listRead`,
        method: 'get',
        params
    })
}

/**
 * 全部已读
 */
export function allReadMessage() {
    return request({
        url: `${apiPrefix}/allRead`,
        method: 'post'
    })
}

/**
 * 删除消息
 * @param {string} ids - 消息ID数组，多个ID用逗号分隔
 */
export function deleteMessage(ids) {
    return request({
        url: `${apiPrefix}/delete/${ids}`,
        method: 'post'
    })
}

/**
 * 清空消息
 */
export function cleanMessage() {
    return request({
        url: `${apiPrefix}/clean`,
        method: 'post'
    })
}
