import { defineStore } from 'pinia'
import { getInfo } from '@/api/backstage/login'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    permissions: [],
    roles: []
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
    }
  },
  getters: {
    nickname: (state) => state.user?.nickname || 'Administrator',
    avatar: (state) => state.user?.avatar || '',
    username: (state) => state.user?.username || ''
  }
})
