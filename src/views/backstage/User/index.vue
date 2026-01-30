<template>
  <div class="user-manage">
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">账户安全管理</span>
          <span class="subtitle">管理系统访问权限与用户信息</span>
        </div>
        <div class="header-right">
          <el-button type="primary" round :icon="Plus" @click="handleAdd">添加用户</el-button>
        </div>
      </div>
      <div class="card-body">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column label="用户" min-width="200">
            <template #default="scope">
              <div class="user-cell">
                <el-avatar :size="32" :src="scope.row.avatar" />
                <div class="details">
                  <span class="username">{{ scope.row.username }}</span>
                  <span class="email">{{ scope.row.email }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'" size="small">
                {{ scope.row.role === 'admin' ? '管理员' : '协作者' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-value="active" inactive-value="disabled" @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="lastLogin" label="最后登录" width="180" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <div class="button-row">
                <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">资料</el-button>
                <el-button link type="primary" :icon="Lock" @click="handleResetPwd(scope.row)">密码</el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">移除</el-button>
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
import { Plus, Edit, Lock, Delete } from '@element-plus/icons-vue'

const tableData = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@qoder.io',
    avatar: 'https://placeholder.com/32',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-01-29 10:30:00'
  },
  {
    id: 2,
    username: 'editor_zhang',
    email: 'zhang@qoder.io',
    avatar: '',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-01-28 15:20:00'
  }
])

const handleAdd = () => {
  // TODO: 使用 ElDialog 弹出添加用户表单
}

const handleEdit = (row) => {
  // TODO: 使用 ElDialog 弹出编辑用户资料表单
}

const handleResetPwd = (row) => {
  // TODO: 使用 ElMessageBox.prompt 重置密码
}

const handleStatusChange = (row) => {
  // TODO: 调用后端接口更新状态
}

const handleDelete = (row) => {
  // TODO: 使用 ElMessageBox.confirm 确认删除
}
</script>

<style scoped lang="scss">
.user-manage {
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

  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    .details {
      display: flex;
      flex-direction: column;
      .username {
        font-size: 13px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
      .email {
        font-size: 11px;
        color: var(--backstage-text-placeholder);
      }
    }
  }
}
</style>
