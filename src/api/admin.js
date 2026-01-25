import { get, post } from '@/utils/request'

// ==================== 假数据 ====================
// 后端 API 准备好后，删除以下假数据部分

const MOCK_ADMIN_INFO = {
  id: 1,
  username: 'admin',
  name: 'Administrator',
  email: 'admin@jianyue.cloud',
  avatar: '/images/icon/logo.png',
  role: 'admin',
  permissions: ['*']
}

// ==================== API 接口 ====================

/**
 * 管理员登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @param {boolean} credentials.remember - 是否记住登录
 * @returns {Promise<Object>} 登录结果（包含 token 和用户信息）
 */
export const login = async (credentials) => {
  // 后端 API 准备好后，取消注释以下代码
  // return await post('/api/admin/login', credentials)
  
  // 临时返回假数据
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟验证
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        resolve({
          success: true,
          token: 'mock_token_' + Date.now(),
          user: MOCK_ADMIN_INFO
        })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 800)
  })
}

/**
 * 退出登录
 * @returns {Promise<Object>} 退出结果
 */
export const logout = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await post('/api/admin/logout')
  
  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getCurrentUser = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/admin/current')
  
  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_ADMIN_INFO), 300)
  })
}

/**
 * 获取仪表盘统计数据
 * @returns {Promise<Object>} 统计数据
 */
export const getDashboardStats = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/admin/dashboard/stats')
  
  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        posts: { total: 128, trend: 12 },
        views: { total: 12543, trend: 8 },
        comments: { total: 856, trend: -3 },
        links: { total: 24, trend: 5 }
      })
    }, 300)
  })
}

/**
 * 获取最近文章列表
 * @param {number} limit - 获取数量
 * @returns {Promise<Array>} 文章列表
 */
export const getRecentPosts = async (limit = 10) => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get(`/api/admin/posts/recent?limit=${limit}`)
  
  // 临时返回假数据
  return new Promise((resolve) => {
    const mockPosts = [
      { id: 1, title: 'Vue 3 最佳实践指南', date: '2024-12-15', views: 1234, status: 'published', statusText: '已发布' },
      { id: 2, title: '前端性能优化技巧', date: '2024-12-10', views: 856, status: 'published', statusText: '已发布' },
      { id: 3, title: 'TypeScript 进阶教程', date: '2024-12-08', views: 645, status: 'draft', statusText: '草稿' },
      { id: 4, title: 'Vite 构建工具深入解析', date: '2024-12-05', views: 923, status: 'published', statusText: '已发布' },
      { id: 5, title: 'CSS 动画实战案例', date: '2024-12-01', views: 512, status: 'published', statusText: '已发布' }
    ]
    setTimeout(() => resolve(mockPosts.slice(0, limit)), 300)
  })
}
