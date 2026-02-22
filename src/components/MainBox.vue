<template>
  <div class="main-box">
    <div class="background-container">
      <div class="background-image" :style="{ backgroundImage: `url(${currentBackground})` }"></div>
      <div class="background-overlay"></div>
    </div>

    <Header />

    <main
      class="main-content"
      :class="{ 'is-transitioning': isTransitioning, 'is-swiping': isSwiping }"
      ref="mainContentRef"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="content-wrapper">
        <router-view v-slot="{ Component, route }">
          <transition
            name="fade-transform"
            mode="out-in"
            @before-leave="handleBeforeLeave"
            @after-enter="handleAfterEnter"
          >
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </main>

    <Footer />

    <!-- 滑动提示指示器 -->
    <div v-if="showSwipeHint" class="swipe-hint" :class="{ 'fade-out': !showSwipeHint }">
      <div class="swipe-hint-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span>左右滑动切换页面</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'

const router = useRouter()
const route = useRoute()

// 随机选择背景图片
const backgrounds = [
  '/images/background1.jpg',
  '/images/background2.jpg',
  '/images/background3.jpg',
  '/images/background4.jpg',
  '/images/background5.jpg',
  '/images/background6.jpg',
  '/images/background7.jpg',
  '/images/background8.jpg',
  '/images/background9.jpg',
  '/images/background10.jpg'
]

const currentBackground = ref('')
const mainContentRef = ref(null)

// 需要缓存的页面（静态页面可以缓存，动态数据页面不建议缓存）
const cachedViews = ref(['home', 'about', 'links', 'more'])

// 过渡动画状态
const isTransitioning = ref(false)

// 滑动相关状态
const isSwiping = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const showSwipeHint = ref(false)

// 前台页面路由顺序（用于滑动切换）
const frontPageRoutes = [
  { name: 'home', path: '/home' },
  { name: 'archive', path: '/archive' },
  { name: 'gallery', path: '/gallery' },
  { name: 'about', path: '/about' },
  { name: 'more', path: '/more' },
  { name: 'message', path: '/message' },
  { name: 'links', path: '/links' }
]

// 动画开始前 - 标记过渡状态
const handleBeforeLeave = () => {
  isTransitioning.value = true
}

// 动画结束后 - 恢复状态
const handleAfterEnter = () => {
  isTransitioning.value = false
}

// 触摸开始
const handleTouchStart = (e) => {
  // 只在移动端启用滑动切换
  if (window.innerWidth > 768) return

  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchEndX.value = touchStartX.value
  isSwiping.value = false
}

// 触摸移动
const handleTouchMove = (e) => {
  // 只在移动端启用滑动切换
  if (window.innerWidth > 768) return

  touchEndX.value = e.touches[0].clientX

  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value

  // 判断是否为水平滑动（水平滑动距离大于垂直滑动距离，且水平滑动超过阈值）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    isSwiping.value = true
  }
}

// 触摸结束
const handleTouchEnd = () => {
  // 只在移动端启用滑动切换
  if (window.innerWidth > 768) return

  const deltaX = touchEndX.value - touchStartX.value
  const minSwipeDistance = 80 // 最小滑动距离

  // 只有在水平滑动时才切换页面
  if (isSwiping.value && Math.abs(deltaX) > minSwipeDistance) {
    const currentPath = route.path
    const currentIndex = frontPageRoutes.findIndex(r => r.path === currentPath)

    if (currentIndex === -1) return

    if (deltaX < 0 && currentIndex < frontPageRoutes.length - 1) {
      // 向左滑动，切换到下一个页面
      router.push(frontPageRoutes[currentIndex + 1].path)
    } else if (deltaX > 0 && currentIndex > 0) {
      // 向右滑动，切换到上一个页面
      router.push(frontPageRoutes[currentIndex - 1].path)
    }
  }

  isSwiping.value = false
}

// 检查是否是首次访问（用于显示滑动提示）
const checkFirstVisit = () => {
  const hasVisited = localStorage.getItem('hasVisitedBefore')
  if (!hasVisited && window.innerWidth <= 768) {
    showSwipeHint.value = true
    localStorage.setItem('hasVisitedBefore', 'true')

    // 3秒后隐藏提示
    setTimeout(() => {
      showSwipeHint.value = false
    }, 3000)
  }
}

onMounted(() => {
  // 随机选择一张背景图
  const randomIndex = Math.floor(Math.random() * backgrounds.length)
  currentBackground.value = backgrounds[randomIndex]

  // 检查是否是首次访问
  checkFirstVisit()
})
</script>

<style lang="scss" scoped>
.main-box {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;

  .background-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    animation: zoomIn 1.5s ease-out forwards;
  }

  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
}

.main-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 120px 2rem 150px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  .content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 270px);
  }

  // 过渡动画期间禁用内容区域的交互，但保持导航栏可点击
  &.is-transitioning .content-wrapper {
    pointer-events: none;
  }

  @media (max-width: 720px) {
    padding: 100px 1rem 130px;

    .content-wrapper {
      min-height: calc(100vh - 230px);
    }
  }
}

@keyframes zoomIn {
  from {
    transform: scale(1.1);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translate3d(0, 15px, 0);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translate3d(0, -15px, 0);
}

/* 优化移动端性能 */
@media (max-width: 768px) {
  .fade-transform-enter-active,
  .fade-transform-leave-active {
    transition-duration: 0.2s;
  }
}

// 滑动提示样式
.swipe-hint {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: swipeHintIn 0.5s ease;

  .swipe-hint-content {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.85rem;
    white-space: nowrap;

    svg {
      width: 18px;
      height: 18px;
      animation: swipeArrow 1.5s ease-in-out infinite;

      &:first-child {
        animation-delay: 0s;
      }

      &:last-child {
        animation-delay: 0.75s;
      }
    }
  }

  &.fade-out {
    animation: swipeHintOut 0.5s ease forwards;
  }
}

@keyframes swipeHintIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes swipeHintOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

@keyframes swipeArrow {
  0%, 100% {
    opacity: 0.5;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(3px);
  }
}

// 移动端滑动时的视觉反馈
.main-content.is-swiping {
  cursor: grab;
  user-select: none;

  .content-wrapper {
    pointer-events: none;
  }
}

// 只在移动端显示滑动提示
@media (min-width: 769px) {
  .swipe-hint {
    display: none;
  }
}
</style>
