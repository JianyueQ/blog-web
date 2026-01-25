<template>
  <div class="links-view">
    <div class="links-header">
      <h1 class="page-title">友链</h1>
      <p class="page-subtitle">志同道合的朋友们</p>
    </div>

    <div class="links-grid">
      <div
        v-for="link in friendLinks"
        :key="link.id"
        class="link-card"
        @click="visitLink(link.url)"
      >
        <div class="link-avatar">
          <img :src="link.avatar" :alt="link.name" />
        </div>
        <div class="link-info">
          <h3 class="link-name">{{ link.name }}</h3>
          <p class="link-desc">{{ link.description }}</p>
          <div class="link-url">{{ link.url }}</div>
        </div>
      </div>

      <div class="link-card add-link">
        <div class="add-icon">+</div>
        <div class="add-text">申请友链</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const friendLinks = ref([])

const visitLink = (url) => {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.links-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;

  .links-header {
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

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;

    .link-card {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 1.8rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 20px;
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
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .link-avatar {
        flex-shrink: 0;

        img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      }

      .link-info {
        flex: 1;
        min-width: 0;

        .link-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 0.5rem;
        }

        .link-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
          margin-bottom: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .link-url {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &.add-link {
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.03);

        &:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .add-icon {
          font-size: 3rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
        }

        .add-text {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  @media (max-width: 720px) {
    padding: 1rem 0;

    .links-header {
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
