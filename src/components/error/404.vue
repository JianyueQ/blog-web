<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <img
          class="pic-404__parent"
          src="@/assets/404_images/404.png"
          alt="404"
        >
        <img
          class="pic-404__child left"
          src="@/assets/404_images/404_cloud.png"
          alt="404"
        >
        <img
          class="pic-404__child mid"
          src="@/assets/404_images/404_cloud.png"
          alt="404"
        >
        <img
          class="pic-404__child right"
          src="@/assets/404_images/404_cloud.png"
          alt="404"
        >
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">
          404错误!
        </div>
        <div class="bullshit__headline">
          {{ message }}
        </div>
        <div class="bullshit__info">
          对不起，您正在寻找的页面不存在。尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。
        </div>
        <p style="color: #999;">
          您访问的路径是：<strong>{{ currentPath }}</strong>
        </p>
        <router-link
          to="/"
          class="bullshit__return-home"
        >
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from "vue";
import { useRoute } from 'vue-router';
const route = useRoute();

let message = computed(() => {
  return '找不到网页！'
})
const currentPath = computed(() => {
  return route.path;
});
</script>

<style lang="scss" scoped>
.wscn-http404-container{
  transform: translate(-50%,-50%);
  position: absolute;
  top: 40%;
  left: 50%;
}
.wscn-http404 {
  position: relative;
  width: 1200px;
  padding: 0 50px;
  overflow: hidden;
  .pic-404 {
    position: relative;
    float: left;
    width: 600px;
    overflow: hidden;
    &__parent {
      width: 100%;
    }
    &__child {
      position: absolute;
      &.left {
        width: 80px;
        top: 17px;
        left: 220px;
        opacity: 0;
        animation-name: cloudLeft;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1s;
      }
      &.mid {
        width: 46px;
        top: 10px;
        left: 420px;
        opacity: 0;
        animation-name: cloudMid;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1.2s;
      }
      &.right {
        width: 62px;
        top: 100px;
        left: 500px;
        opacity: 0;
        animation-name: cloudRight;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1s;
      }
      @keyframes cloudLeft {
        0% {
          top: 17px;
          left: 220px;
          opacity: 0;
        }
        20% {
          top: 33px;
          left: 188px;
          opacity: 1;
        }
        80% {
          top: 81px;
          left: 92px;
          opacity: 1;
        }
        100% {
          top: 97px;
          left: 60px;
          opacity: 0;
        }
      }
      @keyframes cloudMid {
        0% {
          top: 10px;
          left: 420px;
          opacity: 0;
        }
        20% {
          top: 40px;
          left: 360px;
          opacity: 1;
        }
        70% {
          top: 130px;
          left: 180px;
          opacity: 1;
        }
        100% {
          top: 160px;
          left: 120px;
          opacity: 0;
        }
      }
      @keyframes cloudRight {
        0% {
          top: 100px;
          left: 500px;
          opacity: 0;
        }
        20% {
          top: 120px;
          left: 460px;
          opacity: 1;
        }
        80% {
          top: 180px;
          left: 340px;
          opacity: 1;
        }
        100% {
          top: 200px;
          left: 300px;
          opacity: 0;
        }
      }
    }
  }
  .bullshit {
    position: relative;
    float: left;
    width: 300px;
    padding: 30px 0;
    overflow: hidden;
    &__oops {
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
      color: #1482f0;
      opacity: 0;
      margin-bottom: 20px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }
    &__headline {
      font-size: 20px;
      line-height: 24px;
      color: #222;
      font-weight: bold;
      opacity: 0;
      margin-bottom: 10px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }
    &__info {
      font-size: 13px;
      line-height: 21px;
      color: grey;
      opacity: 0;
      margin-bottom: 30px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }
    &__return-home {
      display: block;
      float: left;
      width: 110px;
      height: 36px;
      background: #1482f0;
      border-radius: 100px;
      text-align: center;
      color: #ffffff;
      opacity: 0;
      font-size: 14px;
      line-height: 36px;
      cursor: pointer;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
      text-decoration: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: all 0.3s ease;

      &:hover {
        background: #0d6efd;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(20, 130, 240, 0.3);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(20, 130, 240, 0.2);
      }
    }
    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
}

// 移动端响应式适配
@media (max-width: 992px) {
  .wscn-http404-container {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .wscn-http404 {
    width: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .pic-404 {
      float: none;
      width: 100%;
      max-width: 400px;
      margin-bottom: 30px;

      &__child {
        &.left {
          width: 60px;
          left: 150px;
        }
        &.mid {
          width: 35px;
          left: 280px;
        }
        &.right {
          width: 48px;
          left: 350px;
        }
      }
    }

    .bullshit {
      float: none;
      width: 100%;
      max-width: 400px;
      padding: 20px 0;
      text-align: center;

      &__oops {
        font-size: 28px;
        line-height: 36px;
      }

      &__headline {
        font-size: 18px;
        line-height: 22px;
      }

      &__info {
        font-size: 12px;
        line-height: 20px;
        margin-bottom: 20px;
      }

      &__return-home {
        float: none;
        margin: 20px auto 0;
        width: 130px;
        height: 42px;
        line-height: 42px;
        font-size: 15px;
      }

      p {
        font-size: 12px;
        margin-bottom: 10px;
      }
    }
  }
}

@media (max-width: 576px) {
  .wscn-http404-container {
    top: 45%;
    padding: 0 15px;
  }

  .wscn-http404 {
    .pic-404 {
      max-width: 300px;

      &__child {
        &.left {
          width: 45px;
          left: 110px;
        }
        &.mid {
          width: 28px;
          left: 210px;
        }
        &.right {
          width: 38px;
          left: 260px;
        }
      }
    }

    .bullshit {
      max-width: 300px;

      &__oops {
        font-size: 24px;
        line-height: 32px;
        margin-bottom: 15px;
      }

      &__headline {
        font-size: 16px;
        line-height: 20px;
      }

      &__info {
        font-size: 11px;
        line-height: 18px;
      }

      &__return-home {
        width: 120px;
        height: 38px;
        line-height: 38px;
        font-size: 14px;
      }
    }
  }
}
</style>
