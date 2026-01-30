<template>
  <div class="category-manage">
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">文章分类配置</span>
          <span class="subtitle">管理您的内容分类体系</span>
        </div>
        <div class="header-right">
          <el-button type="primary" round :icon="Plus" @click="handleAdd">新增分类</el-button>
        </div>
      </div>
      <div class="card-body">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="分类名称" min-width="150" />
          <el-table-column prop="slug" label="别名 (Slug)" width="150" />
          <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="count" label="文章数量" width="120" align="center">
            <template #default="scope">
              <el-tag size="small" type="info">{{ scope.row.count }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
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
    name: '技术',
    slug: 'tech',
    description: '关于前端、后端、架构等技术类文章',
    count: 45,
    createTime: '2026-01-20 10:00:00'
  },
  {
    id: 2,
    name: '生活',
    slug: 'life',
    description: '记录日常生活中的点滴感悟',
    count: 12,
    createTime: '2026-01-21 14:20:00'
  }
])

const handleAdd = () => {
  // TODO: 使用 ElDialog 打开新增分类表单
}

const handleEdit = (row) => {
  // TODO: 使用 ElDialog 打开编辑分类表单
}

const handleDelete = (row) => {
  // TODO: 使用 ElMessageBox.confirm 确认删除
}
</script>

<style scoped lang="scss">
.category-manage {
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
}
</style>
