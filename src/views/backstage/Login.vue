<template>
  <div class="login-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- 主题切换按钮 -->
    <div class="theme-toggle" @click="toggleTheme">
      <el-icon :size="24">
        <Sunny v-if="isDarkMode" />
        <Moon v-else />
      </el-icon>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 左侧装饰区域 -->
      <div class="login-left">
        <div class="left-content">
          <h1 class="welcome-title">欢迎回来</h1>
          <p class="welcome-subtitle">登录后台管理系统</p>
          <div class="decoration-img">
            <el-icon :size="180" color="rgba(255, 255, 255, 0.15)">
              <User />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>后台登录</h2>
            <p>博客管理系统</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <!-- 用户名 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                clearable
                :prefix-icon="User"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                clearable
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item prop="code" class="code-form-item">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                size="large"
                clearable
                maxlength="4"
                :prefix-icon="Key"
                @keyup.enter="handleLogin"
              />
              <div class="code-img-wrapper" @click="refreshCode">
                <img v-if="codeUrl" :src="codeUrl" class="code-img" alt="验证码" />
                <el-icon v-else class="loading-icon"><Loading /></el-icon>
              </div>
            </el-form-item>

            <!-- 记住密码 -->
            <el-form-item class="remember-item">
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            </el-form-item>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                size="large"
                class="login-btn"
                @click="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Loading, Sunny, Moon } from '@element-plus/icons-vue'
import { getCode, login } from '@/api/backstage/login'
import { setToken } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const loginFormRef = ref(null)
const loading = ref(false)
const codeUrl = ref('')
const isDarkMode = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
  userType: 'admin'
})

// 表单验证规则
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 50, message: '密码长度在 5 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 1, max: 10, message: '验证码长度在 1 到 10 个字符', trigger: 'blur' }
  ]
})

// 获取验证码
const getCodeImage = async () => {
  try {
    const res = await getCode()
    if (res.code === 200) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      loginForm.uuid = res.uuid
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 刷新验证码
const refreshCode = () => {
  getCodeImage()
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login({
          username: loginForm.username,
          password: loginForm.password,
          code: loginForm.code,
          uuid: loginForm.uuid,
          userType: loginForm.userType
        })

        if (res.code === 200) {
          // 保存token
          setToken(res.token)

          ElMessage.success('登录成功！')

          // 获取重定向地址，如果没有则跳转到后台首页
          const redirect = route.query.redirect || '/backstage/home'
          
          // 跳转到目标页面
          setTimeout(() => {
            router.push(redirect)
          }, 500)
        } else {
          ElMessage.error(res.msg || '登录失败')
          // 刷新验证码
          refreshCode()
        }
      } catch (error) {
        ElMessage.error(res.msg || '登录失败，请检查网络连接')
        // 刷新验证码
        refreshCode()
      } finally {
        loading.value = false
      }
    }
  })
}

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // 保存用户主题偏好到 localStorage
  localStorage.setItem('login-theme', isDarkMode.value ? 'dark' : 'light')
}

// 页面加载时获取验证码和主题偏好
onMounted(() => {
  getCodeImage()

  // 恢复用户上次选择的主题
  const savedTheme = localStorage.getItem('login-theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5e6eb 0%, #5a81e3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 0.5s ease;

  // 主题切换按钮
  .theme-toggle {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(63, 60, 60, 0.9);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1) rotate(180deg);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: scale(0.95);
    }

    .el-icon {
      color: #f6edf1;
      transition: color 0.3s ease;
    }

    @media (max-width: 768px) {
      width: 45px;
      height: 45px;
      top: 20px;
      right: 20px;

      .el-icon {
        font-size: 20px;
      }
    }
  }

  // 背景装饰
  .bg-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;
      transition: background 0.5s ease;

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        left: -100px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: -50px;
        right: 100px;
        animation-delay: 5s;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        right: -50px;
        animation-delay: 10s;
      }
    }
  }

  // 登录卡片
  .login-card {
    position: relative;
    z-index: 1;
    display: flex;
    width: 900px;
    max-width: 90%;
    height: 550px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideUp 0.6s ease-out;
    transition: background 0.5s ease, box-shadow 0.5s ease;

    @media (max-width: 768px) {
      flex-direction: column;
      height: auto;
      max-height: 90vh;
    }
  }

  // 左侧装饰区域
  .login-left {
    flex: 1;
    background: linear-gradient(135deg, #d4a5b8 0%, #b8899a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: white;

    @media (max-width: 768px) {
      padding: 30px 20px;
    }

    .left-content {
      text-align: center;

      .welcome-title {
        font-size: 42px;
        font-weight: 700;
        margin-bottom: 15px;
        animation: fadeInDown 0.8s ease-out;

        @media (max-width: 768px) {
          font-size: 32px;
        }
      }

      .welcome-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 40px;
        animation: fadeInDown 0.8s ease-out 0.2s both;

        @media (max-width: 768px) {
          font-size: 16px;
          margin-bottom: 20px;
        }
      }

      .decoration-img {
        animation: fadeInUp 0.8s ease-out 0.4s both;

        @media (max-width: 768px) {
          display: none;
        }
      }
    }
  }

  // 右侧登录表单
  .login-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    //background: white;
    transition: background 0.5s ease;

    @media (max-width: 768px) {
      padding: 30px 20px;
    }

    .form-wrapper {
      width: 100%;
      max-width: 380px;

      .form-header {
        text-align: center;
        margin-bottom: 40px;
        animation: fadeIn 0.8s ease-out 0.3s both;

        @media (max-width: 768px) {
          margin-bottom: 30px;
        }

        h2 {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          transition: color 0.5s ease;

          @media (max-width: 768px) {
            font-size: 24px;
          }
        }

        p {
          font-size: 14px;
          color: #999;
          transition: color 0.5s ease;
        }
      }

      .login-form {
        animation: fadeIn 0.8s ease-out 0.5s both;

        :deep(.el-form-item) {
          margin-bottom: 24px;
        }

        :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #e4e7ed inset;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 0 0 1px #c0c4cc inset;
          }
        }

        :deep(.el-input__wrapper.is-focus) {
          box-shadow: 0 0 0 1px #d4a5b8 inset !important;
        }

        // 验证码表单项
        .code-form-item {
          :deep(.el-form-item__content) {
            display: flex;
            gap: 12px;
          }

          .code-img-wrapper {
            width: 120px;
            height: 40px;
            cursor: pointer;
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f7fa;
            transition: all 0.3s;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .code-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .loading-icon {
              font-size: 24px;
              color: #999;
              animation: rotate 1s linear infinite;
            }
          }
        }

        // 记住密码
        .remember-item {
          margin-bottom: 16px;

          :deep(.el-form-item__content) {
            justify-content: flex-start;
          }

          :deep(.el-checkbox__label) {
            color: #666;
            font-size: 14px;
            transition: color 0.5s ease;
          }
        }

        // 登录按钮
        .login-btn {
          width: 100%;
          height: 45px;
          font-size: 16px;
          font-weight: 500;
          background: linear-gradient(135deg, #d4a5b8 0%, #b8899a 100%);
          border: none;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(212, 165, 184, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-30px) translateX(30px);
  }
  66% {
    transform: translateY(30px) translateX(-30px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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

// 夜间模式样式
.login-container.dark-mode {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

  .theme-toggle {
    background: rgba(40, 40, 60, 0.9);

    .el-icon {
      color: #ffd700;
    }
  }

  .bg-decoration {
    .circle {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .login-card {
    background: #2d2d44;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  }

  .login-left {
    background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  }

  .login-right {
    background: #2d2d44;

    .form-header {
      h2 {
        color: #e8e8f0;
      }

      p {
        color: #a8a8b8;
      }
    }

    .login-form {
      :deep(.el-input__wrapper) {
        background: #3d3d54;
        box-shadow: 0 0 0 1px #4d4d64 inset;

        &:hover {
          box-shadow: 0 0 0 1px #6d6d84 inset;
        }

        input {
          color: #e8e8f0;

          &::placeholder {
            color: #8a8a9a;
          }
        }

        .el-input__prefix,
        .el-input__suffix {
          color: #a8a8b8;
        }
      }

      :deep(.el-input__wrapper.is-focus) {
        box-shadow: 0 0 0 1px #d4a5b8 inset !important;
      }

      .code-form-item {
        .code-img-wrapper {
          background: #3d3d54;
        }
      }

      .remember-item {
        :deep(.el-checkbox__inner) {
          background: #3d3d54;
          border-color: #4d4d64;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background: #d4a5b8;
          border-color: #d4a5b8;
        }

        :deep(.el-checkbox__label) {
          color: #a8a8b8;
        }
      }

      .login-btn {
        background: linear-gradient(135deg, #d4a5b8 0%, #b8899a 100%);

        &:hover {
          box-shadow: 0 8px 20px rgba(212, 165, 184, 0.3);
        }
      }
    }
  }
}
</style>
