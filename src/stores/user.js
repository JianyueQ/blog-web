import { defineStore } from 'pinia'
import { getInfo } from '@/api/backstage/login'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    permissions: [],
    roles: [],
    // 消息刷新触发器 - 用于跨组件同步消息状态
    messageRefreshTrigger: 0
  }),
  actions: {
    // 获取用户信息
    async getInfo() {
      try {
        const res = await getInfo()
        if (res.code === 200) {
          this.user = res.user
          return res
        }
      } catch (error) {
        console.error('获取用户信息失败', error)
        return Promise.reject(error)
      }
    },
    // 清除用户信息
    clearUser() {
      this.user = null
      this.permissions = []
      this.roles = []
    },
    // 触发消息刷新 - 供消息管理页面调用
    triggerMessageRefresh() {
      this.messageRefreshTrigger++
    }
  },
  getters: {
    nickname: (state) => state.user?.nickname || 'Administrator',
    avatar: (state) => state.user?.avatar || '',
    username: (state) => state.user?.username || ''
  }
})
