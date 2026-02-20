<template>
  <div class="mobile-user-manage">
    <!-- 新增按钮 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加协作者</el-button>
    </div>

    <!-- 用户列表 -->
    <div class="user-list" v-loading="loading">
      <div
        v-for="user in tableData"
        :key="user.adminId"
        class="user-item"
      >
        <div class="user-header">
          <div class="user-info">
            <el-avatar :size="40" :src="user.avatar" />
            <div class="user-meta">
              <span class="user-name">{{ user.nickname || user.username }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
          </div>
          <el-tag :type="user.userType === 'admin' ? 'danger' : 'success'" size="small">
            {{ user.userType === 'admin' ? '管理员' : '协作者' }}
          </el-tag>
        </div>
        <div class="user-body">
          <div class="info-row">
            <span class="info-label">登录账号</span>
            <span class="info-value">{{ user.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">最后登录</span>
            <span class="info-value">{{ user.lastLoginTime || '从未登录' }}</span>
          </div>
          <div class="info-row" v-if="user.lastLoginIp">
            <span class="info-label">登录IP</span>
            <span class="info-value ip-text">{{ user.lastLoginIp }}</span>
          </div>
        </div>
        <div class="user-footer">
          <el-button 
            type="primary" 
            link 
            size="small" 
            :icon="Edit" 
            @click="handleUpdate(user)"
            :disabled="user.adminId === 1 || user.adminId === '1'"
          >
            资料
          </el-button>
          <el-button 
            type="primary" 
            link 
            size="small" 
            :icon="Lock" 
            @click="handleResetPwd(user)"
            :disabled="user.adminId === 1 || user.adminId === '1'"
          >
            密码
          </el-button>
          <el-button 
            type="danger" 
            link 
            size="small" 
            :icon="Delete" 
            @click="handleDelete(user)"
            :disabled="user.adminId === 1 || user.adminId === '1'"
          >
            移除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <el-icon class="empty-icon"><User /></el-icon>
        <p class="empty-text">暂无用户数据</p>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="tableData.length > 0">
      <el-button v-if="hasMore" type="primary" plain @click="loadMore" :loading="loading">
        加载更多
      </el-button>
      <span v-else class="no-more">没有更多了</span>
    </div>

    <!-- 添加/编辑用户抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="title"
      size="90%"
      direction="btt"
      destroy-on-close
    >
      <el-form ref="userRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" :disabled="form.adminId !== undefined" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password" v-if="form.adminId === undefined && title === '添加协作者'">
          <el-input v-model="form.password" placeholder="请输入登录密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="备注描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRefs } from 'vue'
import { Plus, Edit, Lock, Delete, User } from '@element-plus/icons-vue'
import { getAdminList, addUser, updateUser, delUser, getUser, resetUserPwd } from '@/api/backstage/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const tableData = ref([])
const total = ref(0)
const drawerVisible = ref(false)
const title = ref('')
const userRef = ref(null)
const submitting = ref(false)
const hasMore = ref(true)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    username: [
      { required: true, message: '登录账号不能为空', trigger: 'blur' }
    ],
    nickname: [
      { required: true, message: '用户昵称不能为空', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
    password: [
      { required: true, message: '登录密码不能为空', trigger: 'blur' },
      { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList(isLoadMore = false) {
  loading.value = true
  getAdminList(queryParams.value).then(response => {
    const rows = response.rows || []
    total.value = response.total || 0
    
    if (isLoadMore) {
      tableData.value.push(...rows)
    } else {
      tableData.value = rows
    }
    
    hasMore.value = tableData.value.length < total.value
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 加载更多
const loadMore = () => {
  queryParams.value.pageNum++
  getList(true)
}

// 表单重置
function reset() {
  form.value = {
    adminId: undefined,
    username: undefined,
    nickname: undefined,
    email: undefined,
    password: undefined,
    description: undefined
  }
  if (userRef.value) {
    userRef.value.resetFields()
  }
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  title.value = '添加协作者'
  drawerVisible.value = true
}

/** 修改按钮操作 */
function handleUpdate(row) {
  if (row.adminId === 1 || row.adminId === '1') {
    ElMessage.warning('系统内置管理员账号，不允许在列表页修改')
    return
  }
  reset()
  const adminId = row.adminId
  getUser(adminId).then(response => {
    form.value = response.data
    title.value = '修改协作者'
    drawerVisible.value = true
  })
}

/** 提交按钮 */
function submitForm() {
  userRef.value.validate(valid => {
    if (valid) {
      submitting.value = true
      if (form.value.adminId !== undefined) {
        updateUser(form.value).then(response => {
          ElMessage.success(response.msg || '修改成功')
          drawerVisible.value = false
          getList()
          submitting.value = false
        }).catch(() => {
          submitting.value = false
        })
      } else {
        addUser(form.value).then(response => {
          ElMessage.success(response.msg || '新增成功')
          drawerVisible.value = false
          getList()
          submitting.value = false
        }).catch(() => {
          submitting.value = false
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  if (row.adminId === 1 || row.adminId === '1') {
    ElMessage.warning('系统内置管理员账号，不允许删除')
    return
  }
  const adminId = row.adminId
  const username = row.username
  ElMessageBox.confirm('是否确认删除用户名为"' + username + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delUser(adminId)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  if (row.adminId === 1 || row.adminId === '1') {
    ElMessage.warning('系统内置管理员账号，不允许在此重置密码')
    return
  }
  ElMessageBox.prompt('请输入"' + row.username + '"的新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '密码长度必须介于 5 和 20 之间'
  }).then(({ value }) => {
    resetUserPwd(row.adminId, value).then(response => {
      ElMessage.success('修改成功，新密码是：' + value)
    })
  }).catch(() => {})
}

onMounted(() => {
  getList()
})

defineExpose({
  getList
})
</script>

<style lang="scss" scoped>
.mobile-user-manage {
  padding: 12px;
  background: var(--backstage-bg-color);
  min-height: 100vh;

  .action-bar {
    margin-bottom: 16px;

    .el-button {
      width: 100%;
    }
  }

  .user-list {
    .user-item {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);

      .user-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--backstage-border-color);

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .user-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .user-name {
              font-size: 15px;
              font-weight: 600;
              color: var(--backstage-text-primary);
            }

            .user-email {
              font-size: 12px;
              color: var(--backstage-text-secondary);
            }
          }
        }
      }

      .user-body {
        margin-bottom: 12px;

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--backstage-border-color);

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            font-size: 13px;
            color: var(--backstage-text-secondary);
          }

          .info-value {
            font-size: 13px;
            color: var(--backstage-text-primary);

            &.ip-text {
              font-family: 'Consolas', monospace;
              color: var(--backstage-primary);
            }
          }
        }
      }

      .user-footer {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--backstage-border-color);
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--backstage-text-placeholder);

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 16px;
    }
  }

  .load-more {
    text-align: center;
    padding: 20px;

    .no-more {
      color: var(--backstage-text-secondary);
      font-size: 13px;
    }
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
</style>
