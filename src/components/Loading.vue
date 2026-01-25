<template>
  <div id="loader-wrapper" :class="store.imgLoadStatus ? 'loaded' : null">
    <div class="loader">
      <div class="loader-circle" />
      <div class="loader-text">
        <span class="name">
          {{ siteName }}
        </span>
        <span class="tip">加载中</span>
      </div>
    </div>
    <div class="loader-section section-left" />
    <div class="loader-section section-right" />
  </div>
</template>

<script setup>
import { useMainStore } from '@/stores/counter'

const store = useMainStore()

// 网站名称配置
const siteName = import.meta.env.VITE_SITE_NAME || 'Jianyue'
</script>

<style lang="scss" scoped>
#loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  overflow: hidden;

  .loader {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .loader-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #fff;
      animation: spin 1.8s linear infinite;
      z-index: 2;
      position: relative;

      &:before {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: rgba(255, 255, 255, 0.6);
        animation: spin-reverse 0.6s linear infinite;
      }

      &:after {
        content: '';
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: rgba(255, 255, 255, 0.4);
        animation: spin 1s linear infinite;
      }
    }

    .loader-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
      z-index: 2;
      margin-top: 40px;

      .name {
        font-size: 28px;
        font-weight: 600;
        font-family: 'Pacifico-Regular', cursive;
        background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .tip {
        margin-top: 12px;
        font-size: 16px;
        opacity: 0.7;
        letter-spacing: 2px;
      }
    }
  }

  .loader-section {
    position: fixed;
    top: 0;
    width: 51%;
    height: 100%;
    background: #000;
    z-index: 1;

    &.section-left {
      left: 0;
    }

    &.section-right {
      right: 0;
    }
  }

  &.loaded {
    visibility: hidden;
    transform: translateY(-100%);
    transition:
      transform 0.3s 1s ease-out,
      visibility 0.3s 1s ease-out;

    .loader {
      .loader-circle,
      .loader-text {
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
    }

    .loader-section {
      &.section-left {
        transform: translateX(-100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }

      &.section-right {
        transform: translateX(100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }
  }

  @media (max-width: 720px) {
    .loader {
      .loader-circle {
        width: 120px;
        height: 120px;
      }

      .loader-text {
        margin-top: 30px;

        .name {
          font-size: 24px;
        }

        .tip {
          font-size: 14px;
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
