<template>
  <el-container class="backstage-layout" :data-theme="currentTheme">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-container">
      <div class="logo-container">
        <transition name="fade">
          <div v-if="!isCollapse" class="logo-content">
            <img src="/images/icon/logo.png" alt="Logo" class="logo-image"/>
            <span class="logo-text">博客后台</span>
          </div>
          <img v-else src="/images/icon/logo.png" alt="Logo" class="logo-image-collapsed"/>
        </transition>
      </div>

      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          class="sidebar-menu"
          :popper-append-to-body="false"
          unique-opened
      >
        <el-menu-item index="/backstage/home">
          <el-icon>
            <HomeFilled/>
          </el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-sub-menu index="content">
          <template #title>
            <el-icon>
              <Document/>
            </el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/backstage/article">文章管理</el-menu-item>
          <el-menu-item index="/backstage/category">分类管理</el-menu-item>
          <el-menu-item index="/backstage/tag">标签管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="media">
          <template #title>
            <el-icon>
              <Picture/>
            </el-icon>
            <span>媒体管理</span>
          </template>
          <el-menu-item index="/backstage/gallery">图库管理</el-menu-item>
          <el-menu-item index="/backstage/upload">文件上传</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/backstage/comment">
          <el-icon>
            <ChatDotRound/>
          </el-icon>
          <template #title>评论管理</template>
        </el-menu-item>

        <el-menu-item index="/backstage/links">
          <el-icon>
            <Link/>
          </el-icon>
          <template #title>友链管理</template>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/backstage/user">用户管理</el-menu-item>
          <el-menu-item index="/backstage/config">系统配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主体区域 -->
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header class="header-container">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Expand v-if="isCollapse"/>
            <Fold v-else/>
          </el-icon>

          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/backstage/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName">{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 主题切换 -->
          <el-icon class="header-icon theme-toggle-icon" @click="toggleTheme">
            <Sunny v-if="currentTheme === 'dark'"/>
            <Moon v-else/>
          </el-icon>

          <el-icon class="header-icon" @click="refreshPage">
            <Refresh/>
          </el-icon>

          <el-icon class="header-icon" @click="toggleFullscreen">
            <FullScreen/>
          </el-icon>

          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" src="/images/icon/logo.png"/>
              <span class="username">管理员</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" >
                  <el-icon>
                    <User/>
                  </el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon>
                    <SwitchButton/>
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component"/>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  ChatDotRound,
  Document,
  Expand,
  Fold,
  FullScreen,
  HomeFilled,
  Link,
  Moon,
  Picture,
  Refresh,
  Setting,
  Sunny,
  SwitchButton,
  User
} from '@element-plus/icons-vue'
import {removeToken} from '@/utils/auth'

const router = useRouter()
const route = useRoute()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 主题状态
const currentTheme = ref('light')

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前路由名称
const currentRouteName = computed(() => {
  const routeNameMap = {
    '/backstage/home': '首页',
    '/backstage/article': '文章管理',
    '/backstage/category': '分类管理',
    '/backstage/tag': '标签管理',
    '/backstage/gallery': '图库管理',
    '/backstage/upload': '文件上传',
    '/backstage/comment': '评论管理',
    '/backstage/links': '友链管理',
    '/backstage/user': '用户管理',
    '/backstage/config': '系统配置'
  }
  return routeNameMap[route.path] || ''
})

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('sidebar-collapse', isCollapse.value)
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 处理用户下拉菜单命令
const handleCommand = (command) => {
  if (command === 'profile') {
    ElMessage.info('个人中心功能开发中...')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      removeToken()
      router.push('/backstage/login')
      ElMessage.success('退出登录成功')
    })
  }
}

// 切换主题
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('backstage-theme', currentTheme.value)
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

// 响应式侧边栏
const handleResize = () => {
  const width = window.innerWidth
  if (width < 768) {
    isCollapse.value = true
  } else {
    // 恢复用户上次的选择
    const savedCollapse = localStorage.getItem('sidebar-collapse')
    if (savedCollapse !== null) {
      isCollapse.value = savedCollapse === 'true'
    }
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  // 恢复侧边栏状态
  const savedCollapse = localStorage.getItem('sidebar-collapse')
  if (savedCollapse !== null && window.innerWidth >= 768) {
    isCollapse.value = savedCollapse === 'true'
  }

  // 恢复主题设置
  const savedTheme = localStorage.getItem('backstage-theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss">
// 引入后台专用样式
@import '@/style/backstage.scss';
</style>

<style lang="scss" scoped>
.backstage-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--backstage-bg-color);
  transition: background-color 0.3s ease;
}

// 侧边栏
.aside-container {
  background: var(--backstage-gradient-primary);
  transition: width 0.3s ease-in-out;
  overflow-x: hidden;
  box-shadow: var(--backstage-shadow-sidebar);
  position: relative;
  border-radius: 0 16px 16px 0;
  margin: 16px 0 16px 16px;
  height: calc(100vh - 32px);

  .logo-container {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.05);

    .logo-content {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 0 16px;
    }

    .logo-image {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .logo-image-collapsed {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .logo-text {
      letter-spacing: 2px;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      transition: all 0.3s ease;
    }
  }

  .sidebar-menu {
    border-right: none;
    height: calc(100% - 72px);
    overflow-y: auto;
    background-color: transparent;

    &:not(.el-menu--collapse) {
      width: 200px;
    }

    // 滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }

    // 菜单项样式 - 使用CSS变量
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: var(--backstage-sidebar-text);
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      margin: 4px 8px;
      border-radius: 8px;
      height: 48px;
      line-height: 48px;

      &:hover {
        background-color: var(--backstage-sidebar-bg-hover) !important;
        color: var(--backstage-sidebar-text-hover) !important;
        transform: translateX(4px);
      }

      .el-icon {
        color: var(--backstage-sidebar-text);
        font-size: 18px;
        margin-right: 12px;
        transition: all 0.3s ease;
      }

      &:hover .el-icon {
        color: var(--backstage-sidebar-text-hover);
        transform: scale(1.1);
      }
    }

    // 解决侧边栏收纳时的居中问题
    :deep(.el-menu--collapse) {
      .el-menu-item,
      .el-sub-menu__title {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 !important;

        &:hover {
          transform: translateX(0);
        }

        .el-icon {
          margin-right: 0;
        }
      }
    }

    // 激活状态
    :deep(.el-menu-item.is-active) {
      background-color: var(--backstage-sidebar-bg-active) !important;
      color: var(--backstage-sidebar-text-active) !important;
      border-left-color: var(--backstage-sidebar-border-active);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      .el-icon {
        color: var(--backstage-sidebar-text-active);
      }
    }

    // 子菜单样式
    :deep(.el-menu--inline) {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin: 0 8px;

      .el-menu-item {
        padding-left: 50px !important;
        margin: 2px 0;

        &:hover {
          background-color: var(--backstage-sidebar-bg-hover) !important;
        }
      }
    }

    // 修复折叠菜单时的悬停提示样式
    :deep(.el-menu--collapse) {
      .el-menu-item,
      .el-sub-menu__title {
        position: relative;

        // 确保提示框在明亮模式下可见
        &:hover {
          .el-tooltip {
            .el-tooltip__popper {
              background-color: var(--backstage-sidebar-bg) !important;
              color: var(--backstage-sidebar-text) !important;
              border: 1px solid var(--backstage-sidebar-border-active) !important;
            }
          }
        }
      }
    }

    // 修复提示框样式
    :deep(.el-tooltip__popper) {
      // 确保在明亮模式下使用深色背景和浅色文字
      background-color: #1E293B !important;
      color: rgba(255, 255, 255, 0.85) !important;
      border: 1px solid #3B82F6 !important;
      box-shadow: var(--backstage-shadow-sidebar) !important;

      .el-popper__arrow::before {
        background-color: #1E293B !important;
        border: 1px solid #3B82F6 !important;
      }
    }

    // 确保is-dark类的tooltip也使用正确的样式
    :deep(.el-tooltip__popper.is-dark) {
      background-color: #1E293B !important;
      color: rgba(255, 255, 255, 0.85) !important;
      border: 1px solid #3B82F6 !important;

      .el-popper__arrow::before {
        background-color: #1E293B !important;
        border: 1px solid #3B82F6 !important;
      }
    }

    // 确保is-light类的tooltip也使用正确的样式
    :deep(.el-tooltip__popper.is-light) {
      background-color: #1E293B !important;
      color: rgba(255, 255, 255, 0.85) !important;
      border: 1px solid #3B82F6 !important;

      .el-popper__arrow::before {
        background-color: #1E293B !important;
        border: 1px solid #3B82F6 !important;
      }
    }

    // 隐藏菜单tooltip，彻底解决显示问题
    :deep(.el-tooltip__popper) {
      display: none !important;
    }

    // 确保菜单在折叠状态下仍然可以点击
    :deep(.el-menu--collapse) {
      .el-menu-item,
      .el-sub-menu__title {
        position: relative;

        // 移除tooltip相关的事件或样式
        &:hover {
          // 保持悬停效果但隐藏tooltip
        }
      }
    }
  }
}

// 主容器
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--backstage-bg-color);
  transition: all 0.3s ease;
  border-radius: 16px;
  margin: 16px;
  overflow: hidden;
}

// 头部
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--backstage-header-bg);
  box-shadow: var(--backstage-shadow-light);
  z-index: 10;
  transition: all 0.3s ease;
  height: 72px;
  border-bottom: 1px solid var(--backstage-border-light);

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;

    .collapse-btn {
      font-size: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--backstage-text-primary);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;

      &:hover {
        color: var(--backstage-primary);
        background-color: var(--backstage-primary-lighter);
        transform: scale(1.05);
      }
    }

    .breadcrumb {
      font-size: 14px;
      font-weight: 500;

      :deep(.el-breadcrumb__inner) {
        color: var(--backstage-text-regular);
        transition: color 0.3s ease;

        &:hover {
          color: var(--backstage-primary);
        }
      }

      :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
        color: var(--backstage-primary);
        font-weight: 600;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-icon {
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--backstage-text-regular);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background-color: var(--backstage-card-bg);
      box-shadow: var(--backstage-shadow-light);

      &:hover {
        color: var(--backstage-primary);
        background-color: var(--backstage-primary-lighter);
        transform: translateY(-2px);
        box-shadow: var(--backstage-shadow-base);
      }

      &.theme-toggle-icon {
        &:hover {
          transform: translateY(-2px) rotate(180deg);
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.3s ease;
      background-color: var(--backstage-card-bg);
      box-shadow: var(--backstage-shadow-light);

      &:hover {
        background-color: var(--backstage-card-hover-bg);
        transform: translateY(-2px);
        box-shadow: var(--backstage-shadow-base);
      }

      .username {
        font-size: 14px;
        font-weight: 500;
        color: var(--backstage-text-primary);
      }

      :deep(.el-avatar) {
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
          box-shadow: var(--backstage-shadow-base);
        }
      }
    }
  }
}

// 主内容区
.content-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--backstage-bg-color);
  transition: all 0.3s ease;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: var(--backstage-border-light);
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--backstage-border-color);
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--backstage-text-secondary);
    }
  }
}

// 底部
.footer-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--backstage-header-bg);
  border-top: 1px solid var(--backstage-border-light);
  padding: 0 24px;
  transition: all 0.3s ease;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);

  .footer-content {
    font-size: 14px;
    color: var(--backstage-text-secondary);
    display: flex;
    align-items: center;
    gap: 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    .divider {
      color: var(--backstage-border-color);
      transition: color 0.3s ease;
    }
  }
}

// 动画系统
// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 页面过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

// 侧边栏动画
.sidebar-transition-enter-active,
.sidebar-transition-leave-active {
  transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

// 卡片动画
.card-hover {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: var(--backstage-shadow-hover);
}

// 按钮动画
.btn-hover {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--backstage-shadow-base);
}

.btn-hover:active {
  transform: translateY(0);
}

// 输入框动画
.input-focus-enter-active,
.input-focus-leave-active {
  transition: all 0.3s ease;
}

.input-focus-enter-from,
.input-focus-leave-to {
  border-color: var(--backstage-border-light);
  box-shadow: none;
}

.input-focus-enter-to,
.input-focus-leave-from {
  border-color: var(--backstage-primary);
  box-shadow: 0 0 0 3px var(--backstage-primary-lighter);
}

// 滚动动画
.scroll-smooth {
  scroll-behavior: smooth;
}

// 数字增长动画
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.count-up {
  animation: countUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pulse {
  animation: pulse 2s infinite;
}

// 呼吸动画
@keyframes breathe {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.breathe {
  animation: breathe 3s infinite;
}

// 加载动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

// 滑动动画
@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

// 淡入动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

// 延迟动画类
.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-500 {
  animation-delay: 0.5s;
}

// 响应式
@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;

    .header-left {
      gap: 10px;

      .breadcrumb {
        display: none;
      }
    }

    .header-right {
      gap: 10px;

      .username {
        display: none;
      }
    }
  }

  .content-container {
    padding: 10px;
  }

  .footer-container {
    font-size: 12px;

    .footer-content {
      flex-direction: column;
      gap: 5px;

      .divider {
        display: none;
      }
    }
  }
}
</style>
