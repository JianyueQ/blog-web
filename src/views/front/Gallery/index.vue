<template>
  <div class="gallery-view">
    <div class="gallery-header">
      <h1 class="page-title">相册</h1>
      <p class="page-subtitle">记录生活中的美好瞬间</p>
    </div>

    <div class="gallery-grid">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="gallery-item"
        :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
        @click="viewImage(image)"
      >
        <img :src="image.url" :alt="image.title" />
        <div class="image-overlay">
          <div class="image-title">{{ image.title }}</div>
          <div class="image-date">{{ image.date }}</div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackToTop from '@/components/BackToTop.vue'

const images = ref([])

const viewImage = (image) => {
  console.log('View image:', image)
  // 实际项目中可以打开图片预览弹窗
}
</script>

<style lang="scss" scoped>
.gallery-view {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;

  .gallery-header {
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

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;

    .gallery-item {
      position: relative;
      aspect-ratio: 4 / 3;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-fill-mode: both;
      border: 1px solid rgba(255, 255, 255, 0.1);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s;
      }

      .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
        transform: translateY(100%);
        transition: transform 0.3s;

        .image-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.3rem;
        }

        .image-date {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }
      }

      &:hover {
        img {
          transform: scale(1.1);
        }

        .image-overlay {
          transform: translateY(0);
        }
      }
    }

    @media (max-width: 720px) {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
  }

  @media (max-width: 720px) {
    padding: 1rem 0;

    .gallery-header {
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
