/**
 * 用户/个人信息相关 API
 */
import { get } from '../utils/request.js'

// ==================== 假数据 ====================
// 后端 API 准备好后，删除以下假数据部分

const MOCK_USER_INFO = {
  name: 'Your Name',
  title: 'Full Stack Developer',
  description: '热爱编程，喜欢分享，专注于前端开发与技术探索',
  avatar: '/images/icon/logo.png',
  email: 'your@email.com',
  github: 'https://github.com/yourusername',
  bilibili: 'https://bilibili.com',
  qq: 'https://qm.qq.com',
}

const MOCK_SOCIAL_LINKS = [
  { name: 'GitHub', icon: '/images/icon/github.png', tip: '去 Github 看看', url: 'https://github.com' },
  { name: 'Bilibili', icon: '/images/icon/bilibili.png', tip: 'Bilibili(゜-゜)つロ 干杯 ~', url: 'https://bilibili.com' },
  { name: 'Email', icon: '/images/icon/email.png', tip: '来封 Email ~', url: 'mailto:your@email.com' },
  { name: 'QQ', icon: '/images/icon/qq.png', tip: '有什么事吗', url: 'https://qm.qq.com' },
]

const MOCK_SITE_CONFIG = {
  siteName: 'My Blog',
  siteUrl: 'https://jianyue.cloud',
  brandName: 'jianyue.cloud',
  siteStartDate: '2024-01-01',
  icp: '',
}

// ==================== API 接口 ====================

/**
 * 获取个人信息
 */
export const getUserInfo = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/user/info')

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_USER_INFO), 300)
  })
}

/**
 * 获取社交链接列表
 */
export const getSocialLinks = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/user/social-links')

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_SOCIAL_LINKS), 300)
  })
}

/**
 * 获取网站配置信息
 */
export const getSiteConfig = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/site/config')

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_SITE_CONFIG), 300)
  })
}
