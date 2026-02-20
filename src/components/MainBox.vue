<template>
  <div class="main-box">
    <div class="background-container">
      <div class="background-image" :style="{ backgroundImage: `url(${currentBackground})` }"></div>
      <div class="background-overlay"></div>
    </div>

    <Header />

    <main class="main-content">
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'

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

// 需要缓存的页面（静态页面可以缓存，动态数据页面不建议缓存）
const cachedViews = ref(['home', 'about', 'links', 'more'])

// 动画开始前 - 优化性能
const handleBeforeLeave = () => {
  // 在动画开始前强制重绘，避免掉帧
  document.body.style.pointerEvents = 'none'
}

// 动画结束后 - 恢复交互
const handleAfterEnter = () => {
  nextTick(() => {
    document.body.style.pointerEvents = ''
  })
}

onMounted(() => {
  // 随机选择一张背景图
  const randomIndex = Math.floor(Math.random() * backgrounds.length)
  currentBackground.value = backgrounds[randomIndex]
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
</style>
