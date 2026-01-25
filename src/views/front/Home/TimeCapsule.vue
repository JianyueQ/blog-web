<template>
  <div class="time-capsule">
    <h3 class="capsule-title">时光胶囊</h3>

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
          <span>已过 {{ item.passed }} / 共 {{ item.total }}</span>
        </div>
      </div>
    </div>
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
.time-capsule {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-delay: 0.4s;
  opacity: 0;
  animation-fill-mode: forwards;

  .capsule-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: rgba(255, 255, 255, 0.95);
    text-align: center;
  }

  .capsule-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .capsule-item {
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-3px);
    }

    .capsule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;

      .capsule-name {
        font-size: 1rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .capsule-percentage {
        font-family: 'UnidreamLED', monospace;
        font-size: 1.1rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
      }
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 0.8rem;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg,
          rgba(255, 255, 255, 0.6) 0%,
          rgba(255, 255, 255, 0.9) 100%
        );
        border-radius: 10px;
        transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      }
    }

    .capsule-info {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      text-align: right;
    }
  }

  @media (max-width: 720px) {
    padding: 1.5rem;

    .capsule-title {
      font-size: 1.3rem;
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
