<template>
  <div class="profile-card">
    <!-- 头像区域 -->
    <div class="avatar-container">
      <img :src="profile.avatar || '/images/icon/logo.png'" alt="Avatar" class="avatar"/>
      <div class="avatar-ring"></div>
      <!--todo 添加状态点添加头像-->
      <!--      <div class="status-dot"></div>-->
    </div>

    <!-- 基本信息 -->
    <h1 class="name">{{ profile.nickname || '加载中...' }}</h1>
    <p class="description">{{ profile.description || '这家伙很懒，什么都没写...' }}</p>

    <!-- 登录信息/统计 -->
    <div class="info-stats">
      <div class="info-item">
        <span class="label">最后在线</span>
        <span class="value">{{ profile.lastLoginTime || '未知' }}</span>
      </div>
      <div class="info-item">
        <span class="label">所在地</span>
        <span class="value">{{ profile.lastLoginIp === '内网IP' ? '未知' : (profile.lastLoginIp || '未知') }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {getBlogOwnerProfile} from '@/api/front/user.js'

const profile = ref({
  nickname: '',
  avatar: '',
  description: '',
  lastLoginTime: '',
  lastLoginIp: '',
  uuid:''
})

const fetchProfile = async () => {
  try {
    const res = await getBlogOwnerProfile()
    if (res.code === 200) {
      profile.value = res.data
    }
  } catch (error) {
    console.error('获取博客主资料失败:', error)
  }
}

const handleContact = () => {
  // todo: 启用 Element Plus 弹窗进行反馈或查看更多联系方式
  console.log('联系我按钮被点击')
}

onMounted(() => {
  fetchProfile()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

.profile-card {
  font-family: 'Space Grotesk', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background: rgba(24, 24, 27, 0.4); // #18181B with opacity
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(37, 99, 235, 0.4); // CTA color accent
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);

    &::before {
      left: 100%;
    }

    .avatar-ring {
      border-color: #2563eb;
      transform: scale(1.1);
    }
  }

  .avatar-container {
    position: relative;
    margin-bottom: 2rem;
    cursor: pointer;

    .avatar {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 6px solid rgba(255, 255, 255, 0.05);
      object-fit: cover;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2;
      position: relative;

      &:hover {
        transform: rotate(5deg) scale(1.05);
      }
    }

    .avatar-ring {
      position: absolute;
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: all 0.5s ease;
      animation: rotate 10s linear infinite;
    }

    .status-dot {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: #10b981;
      border: 4px solid #18181b;
      border-radius: 50%;
      z-index: 3;
    }
  }

  .name {
    font-family: 'Archivo', sans-serif;
    font-size: 2.4rem;
    font-weight: 800;
    margin-bottom: 0.8rem;
    letter-spacing: -0.02em;
    background: linear-gradient(to bottom, #fff, #a1a1aa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .description {
    font-size: 1rem;
    color: #a1a1aa;
    text-align: center;
    line-height: 1.6;
    max-width: 320px;
    margin-bottom: 2.5rem;
  }

  .info-stats {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 1.5rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;

      .label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #71717a;
      }

      .value {
        font-size: 0.9rem;
        color: #e4e4e7;
        font-weight: 500;
      }
    }
  }

  .social-links {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 2.5rem;

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: #2563eb;
        transform: translateY(-5px) scale(1.1);
        border-color: #3b82f6;
        box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);

        img {
          filter: brightness(0) invert(1);
        }
      }

      img {
        width: 24px;
        height: 24px;
        opacity: 0.7;
        transition: all 0.3s;
      }
    }
  }

  .actions {
    width: 100%;

    .btn {
      width: 100%;
      padding: 1rem;
      border-radius: 16px;
      border: none;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Archivo', sans-serif;

      &-primary {
        background: #2563eb;
        color: white;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);

        &:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  @media (max-width: 720px) {
    padding: 2.5rem 1.5rem;

    .avatar-container .avatar {
      width: 110px;
      height: 110px;
    }

    .name {
      font-size: 1.8rem;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

