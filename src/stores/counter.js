import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  // 加载状态
  const imgLoadStatus = ref(false)
  const innerWidth = ref(window.innerWidth)

  // 设置加载状态
  const setLoadStatus = (status) => {
    imgLoadStatus.value = status
  }

  // 更新窗口宽度
  const updateInnerWidth = () => {
    innerWidth.value = window.innerWidth
  }

  return {
    imgLoadStatus,
    innerWidth,
    setLoadStatus,
    updateInnerWidth
  }
})
