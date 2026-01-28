<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ title }}</span>
        </div>
      </template>
      <el-empty :description="`${title}功能开发中...`">
        <el-button type="primary">返回首页</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '页面'
  }
})
</script>

<style scoped lang="scss">
.page-container {
  :deep(.el-card) {
    border-radius: 12px;
    box-shadow: var(--backstage-shadow-base);
    border: 1px solid var(--backstage-border-light);
  }

  .card-header {
    font-weight: 600;
    font-size: 16px;
    color: var(--backstage-text-primary);
  }

  :deep(.el-empty__description) {
    color: var(--backstage-text-secondary);
  }
}
</style>
