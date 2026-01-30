<template>
  <div class="links-manage">
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">友链伙伴管理</span>
          <span class="subtitle">管理您的博客朋友圈</span>
        </div>
        <div class="header-right">
          <el-button type="primary" round :icon="Plus" @click="handleAdd">新增友链</el-button>
        </div>
      </div>
      <div class="card-body">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column label="站点" min-width="200">
            <template #default="scope">
              <div class="site-info">
                <el-avatar :size="32" :src="scope.row.logo" />
                <div class="details">
                  <span class="name">{{ scope.row.name }}</span>
                  <el-link :href="scope.row.url" target="_blank" type="info" :underline="false">{{ scope.row.url }}</el-link>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="站点描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
                {{ scope.row.status === 'active' ? '展示中' : '已下线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="加入时间" width="180" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <div class="button-row">
                <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const tableData = ref([
  {
    id: 1,
    name: 'Qoder 官方博客',
    url: 'https://qoder.io',
    logo: 'https://placeholder.com/32',
    description: '一个专注于 AI 驱动开发的开发者社区',
    status: 'active',
    createTime: '2026-01-20 10:00:00'
  },
  {
    id: 2,
    name: 'Vue.js 官网',
    url: 'https://vuejs.org',
    logo: 'https://placeholder.com/32',
    description: '渐进式 JavaScript 框架',
    status: 'active',
    createTime: '2026-01-21 14:20:00'
  }
])

const handleAdd = () => {
  // TODO: 使用 ElDialog 弹出新增友链表单
}

const handleEdit = (row) => {
  // TODO: 使用 ElDialog 弹出编辑友链表单
}

const handleDelete = (row) => {
  // TODO: 使用 ElMessageBox.confirm 确认删除
}
</script>

<style scoped lang="scss">
.links-manage {
  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    
    .card-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--backstage-border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
      .subtitle {
        font-size: 12px;
        color: var(--backstage-text-secondary);
        margin-left: 12px;
      }
    }
    
    .card-body {
      padding: 24px;
    }
  }

  .site-info {
    display: flex;
    align-items: center;
    gap: 12px;
    .details {
      display: flex;
      flex-direction: column;
      .name {
        font-size: 13px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
      .el-link {
        font-size: 11px;
        line-height: 1.2;
      }
    }
  }
}
</style>
