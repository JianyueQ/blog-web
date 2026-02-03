<template>
  <div class="about-view">
    <div class="about-header">
      <h1 class="page-title">关于我</h1>
      <p class="page-subtitle">Hello, World!</p>
    </div>

    <div class="about-content">
      <div class="about-section intro-section">
        <h2 class="section-title">自我介绍</h2>
        <p class="section-text">
          我是一名热爱编程的开发者，专注于前端技术栈。喜欢研究新技术，热衷于分享和记录学习过程。
          通过这个博客，我希望能够记录自己的成长轨迹，同时也能帮助到有需要的人。
        </p>
      </div>

      <div class="about-section contact-section">
        <h2 class="section-title">联系方式</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="contact-grid">
          <div
            v-for="contact in contacts"
            :key="contact.type"
            class="contact-item"
            @click="visitLink(contact.url)"
          >
            <img :src="contact.icon" :alt="contact.type" class="contact-icon" />
            <div class="contact-info">
              <div class="contact-type">{{ contact.type }}</div>
              <div class="contact-value">{{ contact.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBlogOwnerSocialInfo } from '@/api/front/links'

const skills = ref([])
const contacts = ref([])
const loading = ref(false)

// 获取博主社交联系信息
const fetchSocialInfo = async () => {
  loading.value = true
  try {
    const res = await getBlogOwnerSocialInfo()
    if (res.code === 200) {
      // 处理API返回的数据，转换为组件需要的格式
      contacts.value = res.data.map(item => ({
        type: item.name,
        value: item.tip,
        icon: item.icon,
        url: item.url,
        sortOrder: parseInt(item.sortOrder) || 0
      })).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  } catch (error) {
    console.error('获取社交信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 访问链接
const visitLink = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  fetchSocialInfo()
})
</script>

<style lang="scss" scoped>
.about-view {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;

  .loading {
    text-align: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
  }

  .about-header {
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
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.7);
      font-family: 'Pacifico-Regular', cursive;
    }
  }

  .about-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;

    .about-section {
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-fill-mode: both;

      &.intro-section { animation-delay: 0.1s; }
      &.skills-section { animation-delay: 0.2s; }
      &.contact-section { animation-delay: 0.3s; }

      .section-title {
        font-size: 1.8rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .section-text {
        font-size: 1rem;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .skills-grid {
      display: grid;
      gap: 1.5rem;

      .skill-item {
        .skill-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;

          .skill-name {
            font-size: 1rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
          }

          .skill-level {
            font-family: 'UnidreamLED', monospace;
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.8);
          }
        }

        .skill-bar {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;

          .skill-progress {
            height: 100%;
            background: linear-gradient(90deg,
              rgba(255, 255, 255, 0.6) 0%,
              rgba(255, 255, 255, 0.9) 100%
            );
            border-radius: 10px;
            transition: width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
        }
      }
    }

    .contact-grid {
      display: grid;
      gap: 1.5rem;

      .contact-item {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .contact-icon {
          width: 48px;
          height: 48px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }

        .contact-info {
          flex: 1;

          .contact-type {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.3rem;
          }

          .contact-value {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.9);
          }
        }
      }
    }
  }

  @media (max-width: 720px) {
    padding: 1rem 0;

    .about-header {
      margin-bottom: 3rem;

      .page-title {
        font-size: 2.2rem;
      }

      .page-subtitle {
        font-size: 1rem;
      }
    }

    .about-content {
      gap: 1.5rem;

      .about-section {
        padding: 1.8rem;

        .section-title {
          font-size: 1.5rem;
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
