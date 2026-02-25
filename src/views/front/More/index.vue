<template>
  <div class="more-view">
    <div class="more-header">
      <h1 class="page-title">
        其他
      </h1>
      <p class="page-subtitle">
        实用的小工具
      </p>
    </div>

    <div class="tools-grid">
      <div
        v-for="tool in tools"
        :key="tool.id"
        class="tool-card"
        @click="useTool(tool)"
      >
        <div class="tool-icon">
          {{ tool.icon }}
        </div>
        <h3 class="tool-name">
          {{ tool.name }}
        </h3>
        <p class="tool-desc">
          {{ tool.description }}
        </p>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup>
import {ref} from 'vue'
import BackToTop from '@/components/BackToTop.vue'

const tools = ref([])

const useTool = (tool) => {
  console.log('Use tool:', tool)
  // 实际项目中跳转到工具页面或打开工具弹窗
}
</script>

<style lang="scss" scoped>
.more-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;

  .more-header {
    text-align: center;
    margin-bottom: 4rem;
    animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    .page-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;

    .tool-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2.5rem 2rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.3s;
      animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-fill-mode: both;

      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          animation-delay: #{0.1 + $i * 0.05}s;
        }
      }

      &:hover {
        transform: translateY(-8px);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
      }

      .tool-icon {
        font-size: 4rem;
        margin-bottom: 1.2rem;
        line-height: 1;
      }

      .tool-name {
        font-size: 1.3rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 0.8rem;
      }

      .tool-desc {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.5;
      }
    }

    @media (max-width: 720px) {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
  }

  @media (max-width: 720px) {
    padding: 1rem 0;

    .more-header {
      margin-bottom: 3rem;

      .page-title {
        font-size: 2.2rem;
      }

      .page-subtitle {
        font-size: 1rem;
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
