/**
 * 关于页面相关 API
 */
import { get } from '../utils/request.js'

// ==================== 假数据 ====================
// 后端 API 准备好后，删除以下假数据部分

const MOCK_ABOUT_INFO = {
  introduction: '我是一名热爱编程的开发者，专注于前端技术栈。喜欢研究新技术，热衷于分享和记录学习过程。通过这个博客，我希望能够记录自己的成长轨迹，同时也能帮助到有需要的人。',
  skills: [
    { name: 'Vue.js', level: 90 },
    { name: 'JavaScript/TypeScript', level: 85 },
    { name: 'HTML/CSS', level: 88 },
    { name: 'Node.js', level: 75 },
    { name: 'React', level: 70 },
    { name: 'Python', level: 65 },
  ],
  contacts: [
    { type: 'Email', value: 'your@email.com', icon: '/images/icon/email.png' },
    { type: 'GitHub', value: 'github.com/yourname', icon: '/images/icon/github.png' },
    { type: 'Bilibili', value: 'bilibili.com/yourname', icon: '/images/icon/bilibili.png' },
  ],
}

// ==================== API 接口 ====================

/**
 * 获取关于页面信息
 */
export const getAboutInfo = async () => {
  // 后端 API 准备好后，取消注释以下代码
  // return await get('/api/about')

  // 临时返回假数据
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_ABOUT_INFO), 300)
  })
}
