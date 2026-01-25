<template>
  <footer class="footer" :class="{ 'collapsed': isCollapsed }">
    <div class="footer-content">
      <div class="footer-info">
        <p class="copyright">
          © {{ currentYear }} <span class="brand" @click="handleBrandClick">{{ siteConfig.brandName }}</span>
        </p>
        <p class="site-stats" v-if="siteConfig.siteStartDate">
          {{ siteDateStatistics(new Date(siteConfig.siteStartDate)) }}
        </p>
      </div>

      <div class="footer-links">
        <div
            v-for="(link, index) in socialLinks"
            :key="link.name"
            class="social-link-item"
            :class="{ 'active': hoveredIndex === index }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
            @click="handleLinkClick(link)"
        >
          <img :src="link.icon" :alt="link.name" class="social-icon"/>

          <transition name="slide-fade">
            <div v-if="hoveredIndex === index" class="social-tooltip">
              {{ link.tip }}
            </div>
          </transition>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {siteDateStatistics} from '@/utils/getTime'
import {getSiteConfig, getSocialLinks} from '@/api'

const route = useRoute()
const currentYear = computed(() => new Date().getFullYear())

// 社交链接和网站配置
const socialLinks = ref([])
const siteConfig = ref({
  brandName: 'jianyue.cloud',
  siteStartDate: '2024-01-01'
})

// 悬停索引
const hoveredIndex = ref(null)

// 是否收起（非首页收起）
const isCollapsed = computed(() => route.path !== '/')

// 加载数据
onMounted(async () => {
  try {
    socialLinks.value = await getSocialLinks()
    siteConfig.value = await getSiteConfig()
  } catch (error) {
    console.error('Failed to load footer data:', error)
  }
})

// 点击社交链接
const handleLinkClick = (link) => {
  if (link.url) {
    window.open(link.url, '_blank')
  }
}

// 隐藏式登录入口：连续点击 5 次 brand 文字，在新窗口打开后台
let clickCount = 0
let clickTimer = null

const handleBrandClick = () => {
  clickCount++
  
  // 清除之前的定时器
  if (clickTimer) {
    clearTimeout(clickTimer)
  }
  
  // 2 秒内点击 5 次触发
  if (clickCount >= 5) {
    clickCount = 0
    // 在新窗口打开后台登录页面
    window.open('/backstage/login', '_blank')
    return
  }
  
  // 2 秒后重置计数
  clickTimer = setTimeout(() => {
    clickCount = 0
  }, 2000)
}
</script>

<style lang="scss" scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 1.5rem 2rem;
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &.collapsed {
    transform: translateY(calc(100% - 20px));

    &:hover {
      transform: translateY(0);
    }
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .brand {
      font-family: 'Pacifico-Regular', cursive;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      user-select: none;
      
      &:hover {
        color: #fff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }

    .site-stats {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .footer-links {
    display: flex;
    gap: 1rem;
    align-items: center;

    .social-link-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-3px);
      }

      &.active {
        background: rgba(255, 255, 255, 0.2);
      }

      .social-icon {
        width: 20px;
        height: 20px;
        filter: brightness(0) invert(1);
        opacity: 0.8;
        transition: all 0.3s;
      }

      &:hover .social-icon {
        opacity: 1;
        transform: scale(1.1);
      }

      .social-tooltip {
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.5rem 1rem;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 0.85rem;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        pointer-events: none;

        &::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(0, 0, 0, 0.8);
        }
      }
    }
  }

  @media (max-width: 720px) {
    padding: 1rem;

    &.collapsed {
      transform: translateY(calc(100% - 15px));
    }

    .footer-content {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 1.5rem;
      text-align: center;
    }

    .footer-info {
      align-items: center;

      p {
        font-size: 0.75rem;
      }
    }

    .footer-links {
      gap: 0.8rem;

      .social-link-item {
        width: 32px;
        height: 32px;

        .social-icon {
          width: 18px;
          height: 18px;
        }

        .social-tooltip {
          bottom: 45px;
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
