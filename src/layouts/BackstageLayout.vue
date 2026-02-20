<template>
  <el-container class="backstage-layout" :data-theme="currentTheme">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="aside-container">
      <div class="logo-container">
        <transition name="fade">
          <div v-if="!isCollapse" class="logo-content">
            <img src="/images/icon/logo.png" alt="Logo" class="logo-image"/>
            <span class="logo-text"> 站点后台</span>
          </div>
          <div v-else class="logo-content-collapsed">
            <img src="/images/icon/logo.png" alt="Logo" class="logo-image-collapsed"/>
          </div>
        </transition>
      </div>

      <el-menu
          class="sidebar-menu"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activeMenu"
          router
          unique-opened
      >
        <el-menu-item index="/backstage/home">
          <el-icon>
            <HomeFilled/>
          </el-icon>
          <template #title>工作台</template>
        </el-menu-item>

        <el-sub-menu index="content">
          <template #title>
            <el-icon>
              <Document/>
            </el-icon>
            <span>内容发布</span>
          </template>
          <el-menu-item index="/backstage/article">文章创作</el-menu-item>
          <el-menu-item index="/backstage/category">分类配置</el-menu-item>
          <el-menu-item index="/backstage/tag">标签索引</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="media">
          <template #title>
            <el-icon>
              <Picture/>
            </el-icon>
            <span>资源中心</span>
          </template>
          <el-menu-item index="/backstage/gallery">视觉素材</el-menu-item>
          <el-menu-item index="/backstage/upload">文件托管</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/backstage/comment">
          <el-icon>
            <ChatDotRound/>
          </el-icon>
          <template #title>互动管理</template>
        </el-menu-item>

        <el-menu-item index="/backstage/links">
          <el-icon>
            <Link/>
          </el-icon>
          <template #title>友链中心</template>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            <span>系统控制</span>
          </template>
          <el-menu-item index="/backstage/user">成员准入</el-menu-item>
          <el-menu-item index="/backstage/config">核心配置</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="monitor">
          <template #title>
            <el-icon>
              <Monitor/>
            </el-icon>
            <span>监控管理</span>
          </template>
          <el-menu-item index="/backstage/operlog">操作日志</el-menu-item>
          <el-menu-item index="/backstage/accesslog">系统登录记录</el-menu-item>
          <el-menu-item index="/backstage/online">在线用户</el-menu-item>
          <el-menu-item index="/backstage/server">服务器监控</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="visitor">
          <template #title>
            <el-icon>
              <User/>
            </el-icon>
            <span>访客管理</span>
          </template>
          <el-menu-item index="/backstage/visitor/record">访客记录</el-menu-item>
          <el-menu-item index="/backstage/visitor/blacklist">访客黑名单</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="sidebar-footer" v-if="!isCollapse">
        <div class="version">{{ version }}</div>
      </div>
    </el-aside>

    <!-- 主体区域 -->
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header class="header-container">
        <div class="header-left">
          <div class="collapse-trigger" @click="toggleCollapse">
            <el-icon v-if="isCollapse">
              <Expand/>
            </el-icon>
            <el-icon v-else>
              <Fold/>
            </el-icon>
          </div>

          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/backstage/home' }">
              <el-icon class="breadcrumb-home">
                <HomeFilled/>
              </el-icon>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName">{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <div class="action-item" @click="toggleTheme" :title="currentTheme === 'dark' ? '切换浅色' : '切换深色'">
              <el-icon v-if="currentTheme === 'dark'">
                <Sunny/>
              </el-icon>
              <el-icon v-else>
                <Moon/>
              </el-icon>
            </div>
            <div class="action-item" @click="refreshPage" title="刷新">
              <el-icon>
                <Refresh/>
              </el-icon>
            </div>
            <div class="action-item" @click="toggleFullscreen" title="全屏">
              <el-icon>
                <FullScreen/>
              </el-icon>
            </div>
          </div>

          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-profile">
              <el-avatar :size="32" :src="userStore.avatar || '/images/icon/logo.png'"/>
              <span class="user-name">{{ userStore.nickname }}</span>
              <el-icon>
                <ArrowDown/>
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="pro-dropdown-menu">
                <el-dropdown-item command="profile">
                  <el-icon>
                    <User/>
                  </el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided class="logout-item">
                  <el-icon>
                    <SwitchButton/>
                  </el-icon>
                  退出系统
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <div class="page-wrapper">
              <component :is="Component"/>
            </div>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  ArrowDown,
  ChatDotRound,
  Document,
  Expand,
  Fold,
  FullScreen,
  HomeFilled,
  Link,
  Monitor,
  Moon,
  Picture,
  Refresh,
  Setting,
  Sunny,
  SwitchButton,
  User
} from '@element-plus/icons-vue'
import {removeToken} from '@/utils/auth'
import {ElMessageBox} from "element-plus";
import {logout} from "@/api/backstage/login.js";
import {useUserStore} from "@/stores/user.js";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 版本号
const version = ref("")


// 侧边栏折叠状态
const isCollapse = ref(false)

// 主题状态
const currentTheme = ref('light')

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前路由名称
const currentRouteName = computed(() => {
  const routeNameMap = {
    '/backstage/home': '控制台首页',
    '/backstage/article': '文章发布管理',
    '/backstage/category': '分类体系配置',
    '/backstage/tag': '标签云管理',
    '/backstage/gallery': '视觉素材库',
    '/backstage/upload': '附件上传中心',
    '/backstage/comment': '访客互动管理',
    '/backstage/links': '友情链接维护',
    '/backstage/user': '系统成员管理',
    '/backstage/profile': '个人中心',
    '/backstage/config': '全局核心配置'
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
    router.push('/backstage/profile')
  } else if (command === 'logout') {
    // TODO: 退出登录确认交互，由用户决定是否启用
    ElMessageBox.confirm('确定要退出系统吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      logout().then(() => {
        userStore.clearUser()
        removeToken()
        router.push('/backstage/login')
      }).catch((error) => {
        userStore.clearUser()
        removeToken()
        router.push('/backstage/login')
      })
    }).catch(() => {
      // 取消退出
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
  if (width < 992) {
    isCollapse.value = true
  } else {
    const savedCollapse = localStorage.getItem('sidebar-collapse')
    if (savedCollapse !== null) {
      isCollapse.value = savedCollapse === 'true'
    }
  }
}

//获取版本号
const getVersion = () => {
  //.env文件获取
  version.value = import.meta.env.VITE_APP_VERSION
}

getVersion();

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

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
@import '@/style/backstage.scss';
</style>

<style lang="scss" scoped>
.backstage-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--backstage-bg-color);
  display: flex;
}

// 侧边栏
.aside-container {
  background-color: var(--backstage-sidebar-bg);
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  overflow: hidden;
  box-shadow: var(--backstage-shadow-sidebar);
  position: relative;
  z-index: 100;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: #fff;
    overflow: hidden;
    white-space: nowrap;
    flex-shrink: 0;

    .logo-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-content-collapsed {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .logo-image {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #fff;
      padding: 2px;
    }

    .logo-image-collapsed {
      width: 32px;
      height: 32px;
      border-radius: 6px;
    }

    .logo-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--backstage-text-primary);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  }

  .sidebar-menu {
    border-right: 1px solid var(--backstage-border-color);
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: transparent;
    padding: 8px 0;

    &::-webkit-scrollbar {
      width: 0;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 44px;
      line-height: 44px;
      color: var(--backstage-sidebar-text) !important;
      margin: 4px 12px;
      border-radius: 6px;
      transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      font-size: 14px;

      .el-icon {
        color: inherit !important;
        font-size: 18px;
        margin-right: 10px;
        transition: transform 0.2s;
      }

      &:hover {
        color: var(--backstage-sidebar-text-hover) !important;
        background-color: var(--backstage-sidebar-bg-hover) !important;

        .el-icon {
          transform: scale(1.1);
        }
      }
    }

    :deep(.el-menu-item.is-active) {
      color: #ffffff !important;
      background-color: var(--backstage-primary) !important;
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
      font-weight: 500;
    }

    :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
      color: var(--backstage-primary) !important;
    }

    :deep(.el-menu--inline) {
      background: rgba(0, 0, 0, 0.2);
      margin: 4px 12px;
      border-radius: 6px;

      .el-menu-item {
        margin: 2px 0;
        padding-left: 45px !important;
        height: 38px;
        line-height: 38px;
        font-size: 13px;
      }
    }
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--backstage-border-color);

    .version {
      font-size: 11px;
      color: var(--backstage-text-placeholder);
      text-align: center;
    }
  }
}

// 主容器
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

// 头部
.header-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--backstage-header-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--backstage-border-color);
  z-index: 99;

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-trigger {
      font-size: 20px;
      cursor: pointer;
      color: var(--backstage-text-primary);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--backstage-border-light);
        color: var(--backstage-primary);
      }
    }

    .breadcrumb {
      :deep(.el-breadcrumb__inner) {
        font-weight: 400;
        color: var(--backstage-text-secondary);
      }

      .breadcrumb-home {
        font-size: 16px;
        vertical-align: -2px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .action-icons {
      display: flex;
      gap: 4px;

      .action-item {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: var(--backstage-text-regular);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          background-color: var(--backstage-border-light);
          color: var(--backstage-primary);
          transform: translateY(-1px);
        }
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--backstage-border-light);
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--backstage-text-primary);
      }

      .el-icon {
        font-size: 12px;
        color: var(--backstage-text-placeholder);
      }
    }
  }
}

// 主内容区
.content-container {
  flex: 1;
  padding: 0; // 内容区内部控制 padding
  background-color: var(--backstage-bg-color);
  overflow-y: auto;

  .page-wrapper {
    padding: 24px;
    min-height: 100%;
  }
}

// 动画
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pro-dropdown-menu {
  padding: 4px;

  .el-dropdown-menu__item {
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 13px;

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    &.logout-item {
      color: var(--backstage-danger);

      &:hover {
        background-color: var(--backstage-danger-lighter);
      }
    }
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;

    .breadcrumb {
      display: none;
    }

    .action-icons {
      display: none !important;
    }
  }
}
</style>
