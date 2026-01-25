<template>
  <div class="home-view">
    <div class="home-grid">
      <div class="left-section">
        <ProfileCard />
      </div>

      <div class="right-section">
        <TimeCapsule />
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
.home-view {
  width: 100%;
  padding: 2rem 0;

  .home-grid {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 2rem;
    align-items: start;

    .left-section {
      position: sticky;
      top: 120px;
    }

    .right-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;

      .info-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;

        .info-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.8rem 2rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s;
          animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
          animation-fill-mode: forwards;

          &:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.12);
          }

          &.clock-card {
            animation-delay: 0.5s;
          }

          &.weather-card {
            animation-delay: 0.6s;
          }

          .clock-icon,
          .weather-icon {
            font-size: 3rem;
            line-height: 1;
          }

          .clock-content,
          .weather-content {
            flex: 1;

            .clock-time,
            .weather-temp {
              font-family: 'UnidreamLED', monospace;
              font-size: 1.8rem;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.95);
              margin-bottom: 0.3rem;
            }

            .clock-date,
            .weather-desc {
              font-size: 0.85rem;
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }

        @media (max-width: 992px) {
          grid-template-columns: 1fr;
        }
      }
    }

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
      gap: 2rem;

      .left-section {
        position: relative;
        top: 0;
      }
    }

    @media (max-width: 720px) {
      gap: 1.5rem;

      .right-section {
        gap: 1.5rem;

        .info-cards {
          gap: 1rem;
        }
      }
    }
  }

  @media (max-width: 720px) {
    padding: 1rem 0;
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
