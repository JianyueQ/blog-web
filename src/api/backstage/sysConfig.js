import request from '@/utils/request'

/**
 * 查询系统配置列表
 * @returns {Promise}
 */
export function getSysConfig() {
  return request({
    url: '/system/config/sysConfig',
    method: 'get'
  })
}

/**
 * 修改系统配置
 * @param {Object} data - 配置数据
 * @param {number} data.configId - 参数ID
 * @param {string} data.configName - 参数名称
 * @param {string} data.configValue - 参数值
 * @param {string} data.configKey - 参数键名
 * @param {string} [data.remark] - 备注信息
 * @returns {Promise}
 */
export function updateSysConfig(data) {
  return request({
    url: '/system/config/sysConfig',
    method: 'put',
    data
  })
}

/**
 * 新增系统配置
 * @param {Object} data - 配置数据
 * @param {string} data.configName - 参数名称
 * @param {string} data.configValue - 参数值
 * @param {string} data.configKey - 参数键名(需唯一)
 * @param {string} [data.remark] - 备注信息
 * @returns {Promise}
 */
export function addSysConfig(data) {
  return request({
    url: '/system/config',
    method: 'post',
    data
  })
}

/**
 * 删除系统配置
 * @param {string|number|Array} configIds - 配置ID，多个用逗号分隔
 * @returns {Promise}
 */
export function deleteSysConfig(configIds) {
  const ids = Array.isArray(configIds) ? configIds.join(',') : configIds
  return request({
    url: `/system/config/${ids}`,
    method: 'delete'
  })
}
