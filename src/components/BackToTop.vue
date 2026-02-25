<template>
  <Transition name="fade">
    <button
      v-show="showBackToTop"
      class="back-to-top"
      title="回到顶部"
      @click="scrollToTop"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showBackToTop = ref(false)

// 监听滚动事件
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // 初始化检查
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
// 回到顶部按钮 - 右下角往上移动
.back-to-top {
  position: fixed;
  right: 2rem;
  bottom: 8rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  transition: all 0.3s ease;
  z-index: 100;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
  }

  &:active {
    transform: translateY(-1px);
  }
}

// 按钮淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// 移动端适配回到顶部按钮
@media (max-width: 768px) {
  .back-to-top {
    right: 1rem;
    bottom: 8rem;
    width: 44px;
    height: 44px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
