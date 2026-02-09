import request from '@/utils/request'

const apiPrefix = '/monitor/online'

/**
 * 查询在线用户列表
 * @param {Object} params - 查询参数
 * @param {string} params.ipaddr - IP地址（可选）
 * @param {string} params.userName - 用户名（可选）
 */
export function getOnlineUserList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

/**
 * 强制用户下线
 * @param {string} tokenId - 会话令牌ID
 */
export function forceLogout(tokenId) {
    return request({
        url: `${apiPrefix}/${tokenId}`,
        method: 'delete'
    })
}
