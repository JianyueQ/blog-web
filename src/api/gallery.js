/**
 * 相册相关 API
 */
import { get } from '../utils/request.js'

// ==================== 假数据 ====================
// 后端 API 准备好后，删除以下假数据部分

const MOCK_IMAGES = [
  { id: 1, url: '/images/background1.jpg', title: '风景 1', date: '2024-12-01', description: '美丽的风景' },
  { id: 2, url: '/images/background2.jpg', title: '风景 2', date: '2024-11-15', description: '美丽的风景' },
  { id: 3, url: '/images/background3.jpg', title: '风景 3', date: '2024-10-20', description: '美丽的风景' },
  { id: 4, url: '/images/background4.jpg', title: '风景 4', date: '2024-09-10', description: '美丽的风景' },
  { id: 5, url: '/images/background5.jpg', title: '风景 5', date: '2024-08-05', description: '美丽的风景' },
  { id: 6, url: '/images/background6.jpg', title: '风景 6', date: '2024-07-25', description: '美丽的风景' },
  { id: 7, url: '/images/background7.jpg', title: '风景 7', date: '2024-06-18', description: '美丽的风景' },
  { id: 8, url: '/images/background8.jpg', title: '风景 8', date: '2024-05-30', description: '美丽的风景' },
]

// ==================== API 接口 ====================

/**
 * 获取相册图片列表
 * @param {object} params - 查询参数 { page, pageSize }
 */
export const getGalleryList = async (params = {}) => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/gallery', params)

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        list: MOCK_IMAGES,
        total: MOCK_IMAGES.length,
      })
    }, 300)
  })
}
