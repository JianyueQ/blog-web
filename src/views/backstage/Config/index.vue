<template>
  <div class="config-manage">
    <el-tabs
      v-model="activeTab"
      class="pro-tabs"
      @tab-change="handleTabChange"
    >
      <el-tab-pane
        label="社交链接"
        name="social"
      >
        <div class="mt-10">
          <SocialLinks />
        </div>
      </el-tab-pane>

      <el-tab-pane
        label="评论设置"
        name="comment"
      >
        <div class="mt-10">
          <CommentSettings />
        </div>
      </el-tab-pane>

      <el-tab-pane
        label="关于我"
        name="about"
      >
        <div class="mt-10">
          <AboutMe ref="aboutMeRef" />
        </div>
      </el-tab-pane>

      <el-tab-pane
        label="系统设置"
        name="system"
      >
        <div class="mt-10">
          <SystemSettings />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SocialLinks from './SocialLinks.vue'
import CommentSettings from './CommentSettings.vue'
import AboutMe from './AboutMe.vue'
import SystemSettings from './SystemSettings.vue'

const activeTab = ref('social')
const aboutMeRef = ref(null)

// 监听标签切换
const handleTabChange = (tab) => {
  // 当切换到关于我标签时，调用子组件的加载方法
  if (tab === 'about' && aboutMeRef.value) {
    aboutMeRef.value.fetchAboutMe()
  }
}
</script>

<style scoped lang="scss">
.config-manage {
  .mt-10 { 
    margin-top: 10px; 
  }

  .pro-tabs {
    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
      padding: 0 24px;
      height: 48px;
      line-height: 48px;
    }
    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px;
    }
  }
}
</style>
