/**
 * 友链相关 API
 */
import { get } from '../utils/request.js'

// ==================== 假数据 ====================
// 后端 API 准备好后，删除以下假数据部分

const MOCK_LINKS = [
  {
    id: 1,
    name: 'Friend One',
    description: '热爱前端开发，专注于 Vue 生态',
    avatar: '/images/icon/logo.png',
    url: 'https://example.com',
  },
  {
    id: 2,
    name: 'Friend Two',
    description: '全栈开发者，分享技术心得',
    avatar: '/images/icon/logo.png',
    url: 'https://example.com',
  },
  {
    id: 3,
    name: 'Friend Three',
    description: 'UI/UX 设计师，追求极致体验',
    avatar: '/images/icon/logo.png',
    url: 'https://example.com',
  },
  {
    id: 4,
    name: 'Friend Four',
    description: '后端工程师，专注性能优化',
    avatar: '/images/icon/logo.png',
    url: 'https://example.com',
  },
]

// ==================== API 接口 ====================

/**
 * 获取友链列表
 */
export const getLinkList = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/links')

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_LINKS), 300)
  })
}
