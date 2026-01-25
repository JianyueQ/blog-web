/**
 * 博客文章相关 API
 */
import { get } from '../utils/request.js'

// ==================== 假数据 ====================
// 后端 API 准备好后，删除以下假数据部分

const MOCK_POSTS = [
  {
    id: 1,
    title: 'Vue 3 组合式 API 最佳实践',
    description: '深入探讨 Vue 3 Composition API 的使用技巧和最佳实践方案',
    date: '2024-12-15',
    year: '2024',
    tags: ['Vue3', '前端'],
    cover: '/images/background1.jpg',
    content: '文章内容...',
  },
  {
    id: 2,
    title: 'TypeScript 高级类型应用',
    description: '学习 TypeScript 中的高级类型，提升代码质量',
    date: '2024-11-20',
    year: '2024',
    tags: ['TypeScript', '前端'],
    cover: '/images/background2.jpg',
    content: '文章内容...',
  },
  {
    id: 3,
    title: 'Vite 构建优化指南',
    description: '掌握 Vite 构建工具的优化技巧，提升开发效率',
    date: '2024-10-08',
    year: '2024',
    tags: ['Vite', '工具'],
    cover: '/images/background3.jpg',
    content: '文章内容...',
  },
  {
    id: 4,
    title: 'CSS Grid 布局实战',
    description: '使用 CSS Grid 创建现代化的响应式布局',
    date: '2024-09-12',
    year: '2024',
    tags: ['CSS', '布局'],
    cover: '/images/background4.jpg',
    content: '文章内容...',
  },
]

// ==================== API 接口 ====================

/**
 * 获取文章列表
 * @param {object} params - 查询参数 { page, pageSize, tag, year }
 */
export const getPostList = async (params = {}) => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/posts', params)

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        list: MOCK_POSTS,
        total: MOCK_POSTS.length,
      })
    }, 300)
  })
}

/**
 * 获取文章详情
 * @param {number} id - 文章 ID
 */
export const getPostDetail = async (id) => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get(`/api/posts/${id}`)

  // 临时返回假数据
  return new Promise((resolve) => {
    const post = MOCK_POSTS.find(p => p.id === id)
    setTimeout(() => resolve(post || null), 300)
  })
}

/**
 * 获取文章归档（按年份分组）
 */
export const getPostArchive = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/posts/archive')

  // 临时返回假数据
  return new Promise((resolve) => {
    const archive = {}
    MOCK_POSTS.forEach(post => {
      if (!archive[post.year]) {
        archive[post.year] = []
      }
      archive[post.year].push(post)
    })
    setTimeout(() => resolve(archive), 300)
  })
}
