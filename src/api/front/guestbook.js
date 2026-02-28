import request from '@/utils/request'
import JSONbig from 'json-bigint'

const JSONbigString = JSONbig({ storeAsString: true })

// 前缀
let apiPrefix = '/blog/user/guestbook'

/**
 * 获取前台展示留言列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.orderByColumn - 排序列，如：create_time
 * @param {string} params.isAsc - 排序方向，asc-升序，desc-降序
 * @param {boolean} params.reasonable - 分页参数合理化
 */
export function getGuestbookList(params) {
  return request({
    url: `${apiPrefix}/list/isRoot`,
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 10,
      orderByColumn: 'create_time',
      isAsc: 'desc',
      reasonable: true,
      ...params
    },
    transformResponse: [data => {
      try {
        return JSONbigString.parse(data)
      } catch (e) {
        return data
      }
    }]
  })
}

/**
 * 获取前台展示子留言列表
 * @param {Object} params - 查询参数
 * @param {number} params.guestbookId - 根留言ID
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.orderByColumn - 排序列，如：create_time
 * @param {string} params.isAsc - 排序方向，asc-升序，desc-降序
 * @param {boolean} params.reasonable - 分页参数合理化
 */
export function getChildGuestbookList(params) {
  return request({
    url: `${apiPrefix}/list/child`,
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 5,
      orderByColumn: 'create_time',
      isAsc: 'asc',
      ...params
    },
    transformResponse: [data => {
      try {
        return JSONbigString.parse(data)
      } catch (e) {
        return data
      }
    }]
  })
}

/**
 * 前台留言或回复
 * @param {Object} data - 留言数据
 * @param {string} data.nickname - 昵称
 * @param {string} data.email - 邮箱
 * @param {string} data.content - 留言内容
 * @param {string} data.avatar - 头像地址（可选）
 * @param {number} data.rootId - 根留言ID，0表示根留言
 * @param {number} data.parentId - 回复留言ID，0表示直接回复根留言
 */
export function addGuestbookMessage(data) {
  return request({
    url: `${apiPrefix}/add`,
    method: 'post',
    data,
    transformResponse: [data => {
      try {
        return JSONbigString.parse(data)
      } catch (e) {
        return data
      }
    }]
  })
}
