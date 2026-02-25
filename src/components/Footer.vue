<template>
  <footer
    class="footer"
    :class="{ 'collapsed': isCollapsed }"
  >
    <div class="footer-content">
      <div class="footer-info">
        <p class="copyright">
          © {{ currentYear }} <span
            class="brand"
            @click="handleBrandClick"
          >{{ siteConfig.brandName }}</span>
        </p>
        <p
          v-if="systemUptime"
          class="site-stats"
        >
          本站苟活了 {{ systemUptime }}
        </p>
        <p
          v-else-if="siteConfig.siteStartDate"
          class="site-stats"
        >
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
          <img
            :src="link.icon"
            :alt="link.name"
            class="social-icon"
          >

          <transition name="slide-fade">
            <div
              v-if="hoveredIndex === index"
              class="social-tooltip"
            >
              {{ link.tip }}
            </div>
          </transition>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {siteDateStatistics} from '@/utils/getTime'
import {getBlogOwnerSocialInfo} from '@/api/front/links'
import {getSystemUptimeFormatted} from '@/api/front/system'

const route = useRoute()
const currentYear = computed(() => new Date().getFullYear())

//社交链接和网站配置
const socialLinks = ref([])
const siteConfig = ref({
  brandName: 'jianyue.cloud',
  siteStartDate: '2024-01-01'
})

//系统运行时间
const systemUptime = ref('')

//定时器引用
const localTimer = ref(null)

//本地运行时间计数器
const localUptimeSeconds = ref(0)

//悬停索引
const hoveredIndex = ref(null)

// 是否收起（非首页收起）
const isCollapsed = computed(() => route.path !== '/home')

//将格式化的时间字符串转换为总秒数
const parseUptimeToSeconds = (timeString) => {
  if (!timeString) return 0
  
  let totalSeconds = 0
  
  //匹配天、小时、分钟、秒
  const daysMatch = timeString.match(/(\d+)天/)
  const hoursMatch = timeString.match(/(\d+)小时/)
  const minutesMatch = timeString.match(/(\d+)分钟/)
  const secondsMatch = timeString.match(/(\d+)秒/)
  
  if (daysMatch) totalSeconds += parseInt(daysMatch[1]) * 24 * 60 * 60
  if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 60 * 60
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60
  if (secondsMatch) totalSeconds += parseInt(secondsMatch[1])
  
  return totalSeconds
}

//将秒数格式化为中文时间字符串
const formatSecondsToChinese = (seconds) => {
  if (seconds <= 0) return '0秒'
  
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  const secs = seconds % 60
  
  let result = ''
  if (days > 0) result += `${days}天`
  if (hours > 0) result += `${hours}小时`
  if (minutes > 0) result += `${minutes}分钟`
  if (secs > 0 || result === '') result += `${secs}秒`
  
  return result
}

//加载数据
const loadUptimeData = async () => {
  try {
    const uptimeRes = await getSystemUptimeFormatted()
    if (uptimeRes.code === 200) {
      //获取服务器返回的运行时间（秒数）
      const serverSeconds = parseUptimeToSeconds(uptimeRes.data)
      localUptimeSeconds.value = serverSeconds
      systemUptime.value = uptimeRes.data
      
      //启动本地计时器，每秒更新一次显示
      if (localTimer.value) {
        clearInterval(localTimer.value)
      }
      localTimer.value = setInterval(() => {
        localUptimeSeconds.value++
        systemUptime.value = formatSecondsToChinese(localUptimeSeconds.value)
      }, 1000)
    }
  } catch (error) {
    console.error('获取系统运行时间失败:', error)
  }
}

onMounted(async () => {
  try {
    //并行获取社交链接和系统运行时间
    const [socialRes] = await Promise.all([
      getBlogOwnerSocialInfo(),
      loadUptimeData()
    ])
    
    //处理社交链接
    if (socialRes.code === 200) {
      //容错处理：如果 status 或 sortOrder 为 null，则给定默认值
      //这里的逻辑是：只要 url存在，就认为是有效的社交链接
      socialLinks.value = (socialRes.data || [])
        .filter(item => item.url) //只要有跳转链接就显示
        .map(item => ({
          ...item,
          status: item.status === null ? '1' : String(item.status),
          sortOrder: item.sortOrder === null ? 0 : Number(item.sortOrder)
        }))
        .filter(item => item.status === '1') //过滤掉明确禁用的
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
    
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})

//组件卸载时清理所有定时器
onUnmounted(() => {
  if (localTimer.value) {
    clearInterval(localTimer.value)
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
      //右边距
      margin-right: 1.0rem;

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
