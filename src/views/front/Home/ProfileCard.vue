<template>
  <div class="profile-card">
    <div class="avatar-container">
      <img src="/images/icon/logo.png" alt="Avatar" class="avatar" />
      <div class="avatar-ring"></div>
    </div>

    <h1 class="name">{{ name }}</h1>
    <p class="title">{{ title }}</p>
    <p class="description">{{ description }}</p>

<!--    <div class="social-links">-->
<!--      <a-->
<!--        v-for="social in socialLinks"-->
<!--        :key="social.name"-->
<!--        :href="social.url"-->
<!--        target="_blank"-->
<!--        rel="noopener noreferrer"-->
<!--        class="social-link"-->
<!--        :title="social.name"-->
<!--      >-->
<!--        <img :src="social.icon" :alt="social.name" />-->
<!--      </a>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'


const name = ref()
const title = ref()
const description = ref()
// const socialLinks = ref([])

// 加载数据
onMounted(async () => {
  try {
    // const userInfo = await getUserInfo()
    // name.value = userInfo.name
    // title.value = userInfo.title
    // description.value = userInfo.description

  } catch (error) {
    console.error('Failed to load profile data:', error)
  }
})
</script>

<style lang="scss" scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;

  .avatar-container {
    position: relative;
    margin-bottom: 1.5rem;

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }

    .avatar-ring {
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  .name {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .title {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .description {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    line-height: 1.6;
    max-width: 400px;
    margin-bottom: 2rem;
  }

  .social-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      transition: all 0.3s;
      border: 1px solid rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }

      img {
        width: 24px;
        height: 24px;
        filter: brightness(0) invert(1);
        opacity: 0.9;
      }
    }
  }

  @media (max-width: 720px) {
    padding: 2rem 1.5rem;

    .avatar-container .avatar {
      width: 100px;
      height: 100px;
    }

    .name {
      font-size: 1.6rem;
    }

    .title {
      font-size: 1rem;
    }

    .description {
      font-size: 0.9rem;
    }

    .social-links .social-link {
      width: 44px;
      height: 44px;

      img {
        width: 22px;
        height: 22px;
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

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}
</style>
