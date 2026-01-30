<template>
  <div class="home-view">
    <div class="home-grid">
      <!-- 左侧个人资料 -->
      <div class="left-section">
        <ProfileCard />
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-section">
        <!-- 时光与天气卡片 -->
        <div class="info-cards">
          <!-- 时钟卡片 -->
          <div class="info-card clock-card">
            <div class="card-icon">
              <span class="icon">🕒</span>
            </div>
            <div class="card-content">
              <div class="time-display">{{ currentTime.hour }}:{{ currentTime.minute }}:{{ currentTime.second }}</div>
              <div class="date-display">{{ currentTime.year }}年{{ currentTime.month }}月{{ currentTime.day }}日 {{ currentTime.weekday }}</div>
            </div>
            <!-- todo: 启用时钟详细信息弹窗 -->
          </div>

          <!-- 天气卡片 (占位) -->
          <div class="info-card weather-card">
            <div class="card-icon">
              <span class="icon">⛅</span>
            </div>
            <div class="card-content">
              <div class="weather-temp">24°C</div>
              <div class="weather-desc">晴间多云 · 优质</div>
            </div>
            <!-- todo: 启用天气预报详细弹窗 -->
          </div>
        </div>

        <!-- 时光胶囊 -->
        <TimeCapsule />

        <!-- 欢迎语/其他内容 -->
        <div class="welcome-section">
          <h2 class="welcome-title">欢迎来到我的技术角</h2>
          <p class="welcome-text">
            在这里，我分享关于全栈开发、系统架构以及生活中的点滴思考。
            希望你能在这里找到灵感或解决问题的方案。
          </p>
          <div class="quick-links">
            <button class="link-btn" @click="$router.push('/archive')">
              探索文章
            </button>
            <button class="link-btn secondary" @click="$router.push('/about')">
              关于我
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ProfileCard from './ProfileCard.vue'
import TimeCapsule from './TimeCapsule.vue'
import { getCurrentTime } from '@/utils/getTime.js'

const currentTime = ref({
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
  second: '',
  weekday: ''
})

let timeInterval = null

const updateTime = () => {
  currentTime.value = getCurrentTime()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

.home-view {
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  .home-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 3rem;
    align-items: start;

    .left-section {
      position: sticky;
      top: 100px;
      z-index: 10;
    }

    .right-section {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;

      .info-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;

        .info-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(24, 24, 27, 0.4);
          backdrop-filter: blur(24px) saturate(180%);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;

          &:hover {
            transform: translateY(-5px);
            background: rgba(24, 24, 27, 0.6);
            border-color: rgba(37, 99, 235, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          &.clock-card { animation-delay: 0.2s; }
          &.weather-card { animation-delay: 0.3s; }

          .card-icon {
            font-size: 2.5rem;
            background: rgba(255, 255, 255, 0.03);
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .card-content {
            .time-display, .weather-temp {
              font-family: 'Archivo', sans-serif;
              font-size: 1.8rem;
              font-weight: 700;
              color: #fff;
              margin-bottom: 0.2rem;
            }

            .date-display, .weather-desc {
              font-size: 0.85rem;
              color: #71717a;
              letter-spacing: 0.02em;
            }
          }
        }
      }

      .welcome-section {
        padding: 3rem;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(24, 24, 27, 0.4) 100%);
        backdrop-filter: blur(24px);
        border-radius: 32px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        animation-delay: 0.5s;

        .welcome-title {
          font-family: 'Archivo', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .welcome-text {
          font-size: 1.1rem;
          color: #a1a1aa;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          max-width: 700px;
        }

        .quick-links {
          display: flex;
          gap: 1.2rem;

          .link-btn {
            padding: 0.9rem 2rem;
            border-radius: 14px;
            border: none;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Archivo', sans-serif;

            &:not(.secondary) {
              background: #2563eb;
              color: #fff;
              &:hover {
                background: #1d4ed8;
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
              }
            }

            &.secondary {
              background: rgba(255, 255, 255, 0.05);
              color: #e4e4e7;
              border: 1px solid rgba(255, 255, 255, 0.1);
              &:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 1100px) {
    .home-grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;

      .left-section {
        position: relative;
        top: 0;
        max-width: 500px;
        margin: 0 auto;
        width: 100%;
      }
    }
  }

  @media (max-width: 720px) {
    padding: 2rem 1rem;

    .home-grid .right-section {
      .info-cards {
        grid-template-columns: 1fr;
        gap: 1.2rem;
      }

      .welcome-section {
        padding: 2rem;
        
        .welcome-title {
          font-size: 1.8rem;
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
</style>

