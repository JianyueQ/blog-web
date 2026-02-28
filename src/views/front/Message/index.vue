<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'

// 异步加载组件，实现代码分割
const DesktopIndex = defineAsyncComponent(() => import('./DesktopIndex.vue'))
const MobileIndex = defineAsyncComponent(() => import('./MobileIndex.vue'))

const isMobile = ref(false)

const checkMobile = () => {
  // 768px 作为移动端断点
  isMobile.value = window.innerWidth <= 768
}

const currentComponent = computed(() => isMobile.value ? MobileIndex : DesktopIndex)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
