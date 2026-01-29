<template>
  <div class="front-layout">
    <Loading />
    <MainBox />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Loading from '@/components/Loading.vue'
import MainBox from '@/components/MainBox.vue'
import cursorInit from '@/utils/cursor'
import { checkDays } from '@/utils/getTime'
import { useMainStore } from '@/stores/counter'

const store = useMainStore()

onMounted(() => {
  // 初始化自定义光标
  cursorInit()

  // 检查特殊日子
  checkDays()

  // 模拟加载过程，实际项目中可以等待资源加载完成
  const images = document.querySelectorAll('img')
  let loadedCount = 0
  const totalImages = images.length

  // 如果没有图片，直接设置为加载完成
  if (totalImages === 0) {
    setTimeout(() => {
      store.setLoadStatus(true)
    }, 1500) // 1.5秒后显示页面
  } else {
    // 监听图片加载
    images.forEach((img) => {
      if (img.complete) {
        loadedCount++
      } else {
        img.addEventListener('load', () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setTimeout(() => {
              store.setLoadStatus(true)
            }, 500)
          }
        })
        img.addEventListener('error', () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setTimeout(() => {
              store.setLoadStatus(true)
            }, 500)
          }
        })
      }
    })

    // 检查是否所有图片都已经加载
    if (loadedCount === totalImages) {
      setTimeout(() => {
        store.setLoadStatus(true)
      }, 500)
    }
  }

  // 最多等待5秒，强制显示页面
  setTimeout(() => {
    if (!store.imgLoadStatus) {
      store.setLoadStatus(true)
    }
  }, 5000)

  // 监听窗口大小变化
  window.addEventListener('resize', store.updateInnerWidth)
})
</script>

<style lang="scss" scoped>
.front-layout {
  width: 100%;
  height: 100%;
  position: relative;
  // 确保前台布局有备用背景色
  //background-color: #333;
}
</style>
