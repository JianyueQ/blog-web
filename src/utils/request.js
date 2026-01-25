/**
 * API 请求封装
 * 当后端 API 准备好后，只需修改 request 函数即可
 */

// API 基础 URL（从环境变量读取）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 通用请求函数
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置
 * @returns {Promise} - 返回 Promise
 */
export const request = async (url, options = {}) => {
  try {
    // 后端 API 准备好后，取消注释以下代码
    // const response = await fetch(`${API_BASE_URL}${url}`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     ...options.headers,
    //   },
    //   ...options,
    // })
    // 
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`)
    // }
    // 
    // return await response.json()

    // 临时：直接返回假数据（根据 URL 判断）
    console.log(`[Mock API] ${url}`, options)
    return null
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * GET 请求
 */
export const get = (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return request(fullUrl, { method: 'GET' })
}

/**
 * POST 请求
 */
export const post = (url, data = {}) => {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT 请求
 */
export const put = (url, data = {}) => {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE 请求
 */
export const del = (url) => {
  return request(url, { method: 'DELETE' })
}
