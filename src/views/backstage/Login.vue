<template>
  <div class="login-pro" :class="{ 'is-dark': isDarkMode }">
    <!-- 动态背景网格 -->
    <div class="bg-grid"></div>
    
    <!-- 背景光效 -->
    <div class="glow-effect glow-1"></div>
    <div class="glow-effect glow-2"></div>

    <!-- 顶部工具栏 -->
    <div class="top-bar">
      <div class="theme-switch" @click="toggleTheme">
        <el-icon><Sunny v-if="isDarkMode" /><Moon v-else /></el-icon>
      </div>
    </div>

    <!-- 登录容器 -->
    <div class="login-box slide-in">
      <div class="login-header">
        <div class="logo">
           <img src="/images/icon/logo.png" alt="Logo" />
        </div>
        <h1>PRO MAX 管理系统</h1>
        <p>每一篇博文，都是思想的火花</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-position="top"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="账号 / 用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="安全密码"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-row">
            <el-input
              v-model="loginForm.code"
              placeholder="图形验证码"
              size="large"
              maxlength="4"
              :prefix-icon="Key"
              @keyup.enter="handleLogin"
            />
            <div class="code-display" @click="refreshCode">
              <img v-if="codeUrl" :src="codeUrl" alt="CAPTCHA" />
              <el-icon v-else class="is-loading"><Loading /></el-icon>
            </div>
          </div>
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="loginForm.rememberMe">保持登录状态</el-checkbox>
          <el-button link type="primary" size="small">忘记密码？</el-button>
        </div>

        <el-button
          :loading="loading"
          type="primary"
          class="submit-btn"
          @click="handleLogin"
        >
          立即接入控制台
        </el-button>
      </el-form>

      <div class="login-footer">
        <span>&copy; 2026 PRO MAX BLOG ENGINE. ALL RIGHTS RESERVED.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Key, Loading, Sunny, Moon } from '@element-plus/icons-vue'
import { getCode, login } from '@/api/backstage/login'
import { setToken } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const loginFormRef = ref(null)
const loading = ref(false)
const codeUrl = ref('')
const isDarkMode = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
  userType: 'admin',
  rememberMe: false
})

const loginRules = {
  username: [{ required: true, message: '身份验证账号不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '安全密码不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const getCodeImage = async () => {
  try {
    const res = await getCode()
    if (res.code === 200) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      loginForm.uuid = res.uuid
    }
  } catch (error) {
    console.error('Code Fetch Error', error)
  }
}

const refreshCode = () => getCodeImage()

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        if (res.code === 200) {
          setToken(res.token)
          // TODO: 之后根据需要添加交互, 目前使用 ElMessage.success('身份验证通过，正在重定向...')
          const redirect = route.query.redirect || '/backstage/home'
          setTimeout(() => router.push(redirect), 800)
        } else {
          // TODO: 之后根据需要添加交互, 目前使用 ElMessage.error(res.msg || '认证失败')
          refreshCode()
        }
      } catch (error) {
        // TODO: 之后根据需要添加交互, 目前使用 ElMessage.error('系统连接异常')
        refreshCode()
      } finally {
        loading.value = false
      }
    }
  })
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('login-theme', isDarkMode.value ? 'dark' : 'light')
}

onMounted(() => {
  getCodeImage()
  isDarkMode.value = localStorage.getItem('login-theme') === 'dark'
})
</script>

<style lang="scss" scoped>
.login-pro {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.5s ease;
  
  &.is-dark {
    background-color: #000;
    
    .login-box {
      background: rgba(20, 20, 20, 0.8);
      border-color: #333;
      backdrop-filter: blur(20px);
      
      h1 { color: #fff; }
      .login-header p { color: #888; }
      .login-footer { color: #444; }
    }
    
    .top-bar .theme-switch {
      background: #111;
      color: #ffd700;
    }
  }
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 1;
}

.glow-effect {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 2;
  opacity: 0.4;
  
  &.glow-1 {
    top: -200px;
    right: -100px;
    background: radial-gradient(circle, #1677ff 0%, transparent 70%);
  }
  
  &.glow-2 {
    bottom: -200px;
    left: -100px;
    background: radial-gradient(circle, #722ed1 0%, transparent 70%);
  }
}

.top-bar {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  
  .theme-switch {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    font-size: 20px;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

.login-box {
  position: relative;
  z-index: 5;
  width: 420px;
  padding: 48px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 24px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.1);
  text-align: center;
  
  .login-header {
    margin-bottom: 40px;
    
    .logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      background: #1677ff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(22, 119, 255, 0.2);
      
      img {
        width: 32px;
        height: 32px;
        filter: brightness(0) invert(1);
      }
    }
    
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1f1f1f;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }
    
    p {
      font-size: 14px;
      color: #8c8c8c;
      margin: 0;
    }
  }
}

.login-form {
  :deep(.el-input__wrapper) {
    background-color: transparent;
    border-radius: 12px;
    padding: 4px 12px;
    box-shadow: 0 0 0 1px #d9d9d9 inset;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 0 0 1px #1677ff inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #1677ff inset, 0 0 0 4px rgba(22, 119, 255, 0.1) !important;
    }
  }
  
  .code-row {
    display: flex;
    gap: 12px;
    width: 100%;
    
    .code-display {
      flex-shrink: 0;
      width: 120px;
      height: 48px;
      border-radius: 12px;
      background: #f5f5f5;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #d9d9d9;
      
      img { width: 100%; height: 100%; object-fit: cover; }
      .el-icon { font-size: 24px; color: #bfbfbf; }
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -8px 0 24px;
    
    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: #8c8c8c;
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    background: #1677ff;
    box-shadow: 0 8px 16px rgba(22, 119, 255, 0.2);
    margin-bottom: 32px;
    border: none;
    
    &:hover {
      background: #4096ff;
      transform: translateY(-1px);
    }
  }
}

.login-footer {
  font-size: 11px;
  color: #bfbfbf;
  letter-spacing: 0.5px;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-in {
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 32px 24px;
  }
}
</style>
