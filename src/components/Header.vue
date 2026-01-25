<template>
  <header class="header" :class="{ 'mobile-open': mobileMenuOpen }">
    <div class="container">
      <div class="logo" @click="router.push('/home')">
        <img src="/images/icon/logo.png" alt="Logo" />
        <span class="logo-text">jianyue</span>
      </div>

      <!-- PC端导航 -->
      <nav class="nav xs-hidden">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          exact-active-class="active"
        >
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- 移动端菜单按钮 -->
      <div class="menu-btn" @click="toggleMobileMenu">
        <span class="menu-icon"></span>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="mobile-nav" @click="toggleMobileMenu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          active-class="active"
        >
          {{ item.name }}
        </router-link>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)

const navItems = [
  { name: '首页', path: '/home' },
  { name: '归档', path: '/archive' },
  { name: '友链', path: '/links' },
  { name: '相册', path: '/gallery' },
  { name: '关于', path: '/about' },
  { name: '其他', path: '/more' }
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
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
