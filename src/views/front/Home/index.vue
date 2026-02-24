<template>
  <div class="home-view">
    <div class="home-grid">
      <!-- 左侧个人资料 -->
      <div class="left-section">
        <ProfileCard/>
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-section">
        <!-- 公告计划板 -->
        <AnnouncementBoard />

        <!-- 信息卡片区域：时钟 + 统计 -->
        <div class="info-cards">
          <!-- 时钟卡片 -->
          <div class="info-card clock-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="time-display">{{ currentTime.hour }}:{{ currentTime.minute }}:{{ currentTime.second }}</div>
              <div class="date-display">{{ currentTime.year }}年{{ currentTime.month }}月{{ currentTime.day }}日
                {{ currentTime.weekday }}
              </div>
            </div>
          </div>

          <!-- 文章统计卡片 -->
          <div class="info-card stats-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="stats-value">{{ articleCount }}</div>
              <div class="stats-label">文章总数</div>
            </div>
          </div>
        </div>

        <!-- 时光胶囊 -->
        <TimeCapsule/>

        <!-- 欢迎语/快速入口 -->
        <div class="welcome-section">
          <h2 class="welcome-title">欢迎来到我的技术角</h2>
          <p class="welcome-text">
            在这里，我分享关于全栈开发、系统架构以及生活中的点滴思考。
            希望你能在这里找到灵感或解决问题的方案。
          </p>
          <div class="quick-links">
            <button class="link-btn" @click="$router.push('/archive')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              探索文章
            </button>
            <button class="link-btn secondary" @click="$router.push('/about')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              关于我
            </button>
            <button class="link-btn secondary" @click="$router.push('/message')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              留言板
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import ProfileCard from './ProfileCard.vue'
import TimeCapsule from './TimeCapsule.vue'
import AnnouncementBoard from './AnnouncementBoard.vue'
import BackToTop from '@/components/BackToTop.vue'
import {getCurrentTime} from '@/utils/getTime.js'
import {listBlog} from '@/api/front/blog.js'


const currentTime = ref({
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
  second: '',
  weekday: ''
})

const articleCount = ref(0)

let timeInterval = null

const updateTime = () => {
  currentTime.value = getCurrentTime()
}

// 获取文章统计
const fetchArticleStats = async () => {

}


onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchArticleStats()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
.home-view {
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
  padding: 2rem; // 减小顶部内边距，使内容更靠近导航栏
  max-width: 1400px;
  margin: 0 auto;

  .home-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 3rem;
    align-items: start;

    .left-section {
      // 解决 PC 端下滑时分开移动的问题：
      // 由于个人资料卡片内容较多，使用 sticky 会在到达底部前产生分离感。
      // 将其改为 relative 布局，使其随右侧内容同步滚动。
      position: relative;
      z-index: 1;
    }

    .right-section {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;

      .info-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;

        .info-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          background: rgba(24, 24, 27, 0.4);
          backdrop-filter: blur(24px) saturate(180%);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;

          &:hover {
            transform: translateY(-4px);
            background: rgba(24, 24, 27, 0.6);
            border-color: rgba(37, 99, 235, 0.3);
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
          }

          &.clock-card {
            animation-delay: 0.3s;
          }

          &.stats-card {
            animation-delay: 0.4s;
          }

          .card-icon {
            background: rgba(255, 255, 255, 0.03);
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            flex-shrink: 0;

            svg {
              width: 28px;
              height: 28px;
              color: #60a5fa;
            }
          }

          .card-content {
            min-width: 0;

            .time-display {
              font-family: 'Archivo', sans-serif;
              font-size: 1.6rem;
              font-weight: 700;
              color: #fff;
              margin-bottom: 0.2rem;
              letter-spacing: 0.02em;
            }

            .date-display {
              font-size: 0.8rem;
              color: #71717a;
              letter-spacing: 0.02em;
            }

            .stats-value {
              font-family: 'Archivo', sans-serif;
              font-size: 1.6rem;
              font-weight: 700;
              color: #fff;
              margin-bottom: 0.2rem;
            }

            .stats-label {
              font-size: 0.8rem;
              color: #71717a;
              letter-spacing: 0.02em;
            }
          }
        }
      }

      .welcome-section {
        padding: 2.5rem;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(24, 24, 27, 0.4) 100%);
        backdrop-filter: blur(24px);
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        animation-delay: 0.5s;

        .welcome-title {
          font-family: 'Archivo', sans-serif;
          font-size: 1.9rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
        }

        .welcome-text {
          font-size: 1rem;
          color: #a1a1aa;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 700px;
        }

        .quick-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;

          .link-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            border: none;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Archivo', sans-serif;

            svg {
              width: 18px;
              height: 18px;
            }

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
    padding: 1.5rem 1rem;

    .home-grid .right-section {
      gap: 1.5rem;

      .info-cards {
        grid-template-columns: 1fr;
        gap: 1rem;

        .info-card {
          padding: 1.25rem;

          .card-icon {
            width: 48px;
            height: 48px;

            svg {
              width: 24px;
              height: 24px;
            }
          }

          .card-content {
            .time-display, .stats-value {
              font-size: 1.4rem;
            }
          }
        }
      }

      .welcome-section {
        padding: 1.5rem;

        .welcome-title {
          font-size: 1.5rem;
        }

        .welcome-text {
          font-size: 0.9rem;
        }

        .quick-links {
          .link-btn {
            padding: 0.65rem 1.25rem;
            font-size: 0.9rem;
          }
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

