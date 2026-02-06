<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// App.vue 不再包含任何布局组件，由路由决定使用前台还是后台布局
</script>

<style lang="scss">
@import '@/style/style.scss';
</style>
