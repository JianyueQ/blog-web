<template>
  <div class="time-capsule">
    <div class="capsule-header-main">
      <h3 class="capsule-title">时光胶囊</h3>
      <div class="capsule-subtitle">Time is the most valuable thing a man can spend.</div>
    </div>

    <div class="capsule-grid">
      <div
        v-for="(item, key) in timeCapsule"
        :key="key"
        class="capsule-item"
      >
        <div class="capsule-header">
          <span class="capsule-name">{{ item.name }}</span>
          <span class="capsule-percentage">{{ item.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${item.percentage}%` }"></div>
        </div>
        <div class="capsule-info">
          <span>已过 <b>{{ item.passed }}</b> / 共 {{ item.total }}</span>
        </div>
      </div>
    </div>
    <!-- todo: 启用时光胶囊详细数据分析弹窗 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTimeCapsule } from '@/utils/getTime.js'

const timeCapsule = ref({})

onMounted(() => {
  timeCapsule.value = getTimeCapsule()

  // 每分钟更新一次
  setInterval(() => {
    timeCapsule.value = getTimeCapsule()
  }, 60000)
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

.time-capsule {
  font-family: 'Space Grotesk', sans-serif;
  padding: 3rem;
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: 0.4s;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(24, 24, 27, 0.5);
    border-color: rgba(37, 99, 235, 0.2);
  }

  .capsule-header-main {
    text-align: left;
    margin-bottom: 2.5rem;

    .capsule-title {
      font-family: 'Archivo', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .capsule-subtitle {
      font-size: 0.9rem;
      color: #71717a;
      font-weight: 400;
    }
  }

  .capsule-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .capsule-item {
    padding: 1.8rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.1);

      .progress-fill {
        background: #2563eb;
        box-shadow: 0 0 15px rgba(37, 99, 235, 0.5);
      }
    }

    .capsule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .capsule-name {
        font-size: 1rem;
        font-weight: 600;
        color: #e4e4e7;
      }

      .capsule-percentage {
        font-family: 'Archivo', sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
      }
    }

    .progress-bar {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 1rem;

      .progress-fill {
        height: 100%;
        background: #3f3f46;
        border-radius: 20px;
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .capsule-info {
      font-size: 0.8rem;
      color: #71717a;
      text-align: left;

      b {
        color: #d4d4d8;
        font-weight: 500;
      }
    }
  }

  @media (max-width: 720px) {
    padding: 2rem;

    .capsule-header-main .capsule-title {
      font-size: 1.5rem;
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
