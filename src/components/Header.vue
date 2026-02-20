<template>
  <header class="header" :class="{ 'mobile-open': mobileMenuOpen }">
    <div class="container">
      <div class="logo" @click="router.push('/home')">
        <img src="/images/icon/logo.png" alt="Logo"/>
<!--        <span class="logo-text">blog</span>-->
      </div>

      <!-- PC端导航 -->
      <nav class="nav xs-hidden">
        <a
            v-for="item in navItems"
            :key="item.path"
            href="javascript:void(0)"
            class="nav-item"
            :class="{ active: router.currentRoute.value.path === item.path, 'is-navigating': isNavigating }"
            @click="handleNavClick(item.path)"
        >
          <span class="nav-text">{{ item.name }}</span>
        </a>
      </nav>

      <!-- 移动端菜单按钮 -->
      <div class="menu-btn" @click="toggleMobileMenu">
        <span class="menu-icon"></span>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <transition name="slide-down">
      <div 
        v-if="mobileMenuOpen" 
        ref="mobileNavRef"
        class="mobile-nav" 
        @click="handleMobileNavClick"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <a
            v-for="item in navItems"
            :key="item.path"
            href="javascript:void(0)"
            class="mobile-nav-item"
            :class="{ active: router.currentRoute.value.path === item.path, 'is-navigating': isNavigating }"
            @click="handleNavClick(item.path)"
        >
          {{ item.name }}
        </a>
      </div>
    </transition>
  </header>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)
const mobileNavRef = ref(null)
const isNavigating = ref(false)

// 触摸滑动相关状态
const touchState = ref({
  startX: 0,
  startY: 0,
  scrollLeft: 0,
  isScrolling: false
})

const navItems = [
  {name: '首页', path: '/home'},
  {name: '归档', path: '/archive'},
  {name: '相册', path: '/gallery'},
  {name: '关于', path: '/about'},
  {name: '其他', path: '/more'},
  {name: '留言', path: '/message'},
  {name: '友链', path: '/links'}
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 处理导航点击 - 添加防重复点击和立即反馈
const handleNavClick = (path) => {
  // 如果正在导航中或点击的是当前页面，不执行
  if (isNavigating.value || path === router.currentRoute.value.path) {
    return
  }

  isNavigating.value = true

  // 立即关闭移动端菜单（如果有）
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }

  // 使用 setTimeout 让 UI 有时间更新（显示点击反馈）
  setTimeout(() => {
    router.push(path).finally(() => {
      isNavigating.value = false
    })
  }, 50)
}

// 处理移动端菜单点击 - 阻止事件冒泡避免关闭菜单时跳转
const handleMobileNavClick = (e) => {
  if (e.target.classList.contains('mobile-nav')) {
    toggleMobileMenu()
  }
}

// 触摸开始
const handleTouchStart = (e) => {
  const touch = e.touches[0]
  touchState.value.startX = touch.pageX
  touchState.value.startY = touch.pageY
  touchState.value.scrollLeft = mobileNavRef.value.scrollLeft
  touchState.value.isScrolling = false
}

// 触摸移动
const handleTouchMove = (e) => {
  const touch = e.touches[0]
  const deltaX = touch.pageX - touchState.value.startX
  const deltaY = touch.pageY - touchState.value.startY

  // 判断是否为水平滚动
  if (!touchState.value.isScrolling) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      touchState.value.isScrolling = true
    }
  }

  if (touchState.value.isScrolling) {
    e.preventDefault()
    mobileNavRef.value.scrollLeft = touchState.value.scrollLeft - deltaX
  }
}

// 触摸结束
const handleTouchEnd = () => {
  touchState.value.isScrolling = false
}

// 点击外部关闭菜单
const handleClickOutside = (e) => {
  if (mobileMenuOpen.value && !e.target.closest('.header')) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 1rem 2rem;
  animation: slideInDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  .container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .logo-text {
      font-family: 'Pacifico-Regular', cursive;
      font-size: 1.5rem;
      font-weight: 600;
      background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .nav {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: calc(100% - 100px); /* 为 logo 留空间 */

    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */

    &::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .nav-item {
      position: relative;
      flex-shrink: 0; /* 防止按钮被压缩 */
      padding: 0.6rem 1.2rem;
      border-radius: 25px;
      font-size: 0.95rem;
      transition: all 0.3s;
      color: rgba(255, 255, 255, 0.8);
      white-space: nowrap; /* 防止文字换行 */

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 25px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        color: #fff;
        transform: translateY(-2px);

        &::before {
          opacity: 1;
        }
      }

      &.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.15);
        font-weight: 500;
      }

      // 导航中状态 - 提供视觉反馈
      &.is-navigating {
        opacity: 0.7;
        cursor: wait;
      }

      // 点击反馈
      &:active:not(.is-navigating) {
        transform: scale(0.95);
      }
    }
  }

  .menu-btn {
    display: none;
    width: 40px;
    height: 40px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .menu-icon {
      position: relative;
      width: 24px;
      height: 2px;
      background: #fff;
      border-radius: 2px;
      transition: all 0.3s;

      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
        transition: all 0.3s;
      }

      &::before {
        top: -8px;
      }

      &::after {
        top: 8px;
      }
    }
  }

  &.mobile-open .menu-icon {
    background: transparent;

    &::before {
      top: 0;
      transform: rotate(45deg);
    }

    &::after {
      top: 0;
      transform: rotate(-45deg);
    }
  }

  .mobile-nav {
    position: fixed;
    top: 90px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 4rem);
    max-width: 500px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    /* 默认横向滚动布局 */
    display: flex;
    flex-direction: row;
    padding: 1rem 0.8rem;
    gap: 0.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    
    /* 启用硬件加速和触摸滑动 */
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    will-change: scroll-position;
    touch-action: pan-x;
    user-select: none;
    -webkit-user-select: none;

    /* 横向滚动条样式 */
    &::-webkit-scrollbar {
      height: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.4);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    .mobile-nav-item {
      /* 横向排列的胶囊按钮 */
      flex-shrink: 0;
      display: block;
      padding: 0.8rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.95rem;
      transition: all 0.3s;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      white-space: nowrap;
      background: rgba(255, 255, 255, 0.05);
      
      /* 优化触摸体验 */
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
      }

      &.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.35);
        font-weight: 500;
      }

      // 导航中状态
      &.is-navigating {
        opacity: 0.7;
        cursor: wait;
      }

      &:active:not(.is-navigating) {
        transform: scale(0.95);
      }
    }
  }

  @media (max-width: 720px) {
    padding: 1rem;

    .container {
      padding: 0.6rem 1rem;
    }

    .logo {
      .logo-text {
        font-size: 1.2rem;
      }
    }

    .menu-btn {
      display: flex;
    }
  }

  /* 小屏幕优化 */
  @media (max-width: 480px) {
    .mobile-nav {
      width: calc(100% - 2rem);
      border-radius: 15px;
      padding: 0.8rem 0.6rem;
      gap: 0.4rem;

      .mobile-nav-item {
        padding: 0.7rem 1.2rem;
        font-size: 0.9rem;
      }
    }
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
