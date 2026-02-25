<template>
  <MobileUser
    v-if="isMobile"
    ref="mobileRef"
  />
  <div
    v-else
    class="user-manage"
  >
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">账户安全管理</span>
          <span class="subtitle">管理系统访问权限与用户信息</span>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            round
            :icon="Plus"
            @click="handleAdd"
          >
            添加协作者
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <el-table
          v-loading="loading"
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            label="用户"
            min-width="200"
          >
            <template #default="scope">
              <div class="user-cell">
                <el-avatar
                  :size="32"
                  :src="scope.row.avatar"
                />
                <div class="details">
                  <span class="username">{{ scope.row.nickname || scope.row.username }}</span>
                  <span class="email">{{ scope.row.email }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="username"
            label="登录账号"
            width="180"
          />
          <el-table-column
            prop="userType"
            label="角色"
            width="120"
          >
            <template #default="scope">
              <el-tag
                :type="scope.row.userType === 'admin' ? 'danger' : 'success'"
                size="small"
              >
                {{ scope.row.userType === 'admin' ? '管理员' : '协作者' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastLoginTime"
            label="最后登录"
            width="180"
          >
            <template #default="scope">
              {{ scope.row.lastLoginTime || '从未登录' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="lastLoginIp"
            label="登录IP"
            width="140"
          />
          <el-table-column
            label="操作"
            width="220"
            fixed="right"
          >
            <template #default="scope">
              <div class="button-row">
                <el-button
                  link
                  type="primary"
                  :icon="Edit"
                  :disabled="scope.row.adminId === 1 || scope.row.adminId === '1'"
                  @click="handleUpdate(scope.row)"
                >
                  资料
                </el-button>
                <el-button
                  link
                  type="primary"
                  :icon="Lock"
                  :disabled="scope.row.adminId === 1 || scope.row.adminId === '1'"
                  @click="handleResetPwd(scope.row)"
                >
                  密码
                </el-button>
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  :disabled="scope.row.adminId === 1 || scope.row.adminId === '1'"
                  @click="handleDelete(scope.row)"
                >
                  移除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-show="total > 0"
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getList"
            @current-change="getList"
          />
        </div>
      </div>
    </div>

    <!-- 添加或修改用户对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="500px"
      append-to-body
    >
      <el-form
        ref="userRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item
          label="登录账号"
          prop="username"
        >
          <el-input
            v-model="form.username"
            placeholder="请输入登录账号"
            :disabled="form.adminId !== undefined"
          />
        </el-form-item>
        <el-form-item
          v-if="form.adminId === undefined && title === '添加协作者'"
          label="登录密码"
          prop="password"
        >
          <el-input
            v-model="form.password"
            placeholder="请输入登录密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item
          label="用户昵称"
          prop="nickname"
        >
          <el-input
            v-model="form.nickname"
            placeholder="请输入用户昵称"
          />
        </el-form-item>
        <el-form-item
          label="用户邮箱"
          prop="email"
        >
          <el-input
            v-model="form.email"
            placeholder="请输入用户邮箱"
          />
        </el-form-item>
        <el-form-item
          label="备注描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="submitForm"
          >
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs, computed } from 'vue'
import { Plus, Edit, Lock, Delete } from '@element-plus/icons-vue'
import { getAdminList, addUser, updateUser, delUser, getUser, resetUserPwd } from '@/api/backstage/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import MobileUser from './MobileUser.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

const loading = ref(true)
const tableData = ref([])
const total = ref(0)
const open = ref(false)
const title = ref("")
const userRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderByColumn: "createTime",
    isAsc: "desc"
  },
  rules: {
    username: [
      { required: true, message: "登录账号不能为空", trigger: "blur" }
    ],
    nickname: [
      { required: true, message: "用户昵称不能为空", trigger: "blur" }
    ],
    email: [
      { required: true, message: "邮箱地址不能为空", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
    ],
    password: [
      { required: true, message: "登录密码不能为空", trigger: "blur" },
      { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList() {
  loading.value = true
  getAdminList(queryParams.value).then(response => {
    tableData.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
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
  open.value = true
  title.value = "添加协作者"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  if (row.adminId === 1 || row.adminId === '1') {
    ElMessage.warning("系统内置管理员账号，不允许在列表页修改，请前往个人中心修改资料")
    return
  }
  reset()
  const adminId = row.adminId
  getUser(adminId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改协作者"
  })
}

/** 提交按钮 */
function submitForm() {
  userRef.value.validate(valid => {
    if (valid) {
      if (form.value.adminId !== undefined) {
        updateUser(form.value).then(response => {
          ElMessage.success(response.msg || "修改成功")
          open.value = false
          getList()
        })
      } else {
        addUser(form.value).then(response => {
          ElMessage.success(response.msg || "新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  if (row.adminId === 1 || row.adminId === '1') {
    ElMessage.warning("系统内置管理员账号，不允许删除")
    return
  }
  const adminId = row.adminId
  const username = row.username
  ElMessageBox.confirm('是否确认删除用户名为"' + username + '"的数据项？', "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return delUser(adminId)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  if (row.adminId === 1 || row.adminId === '1') {
    ElMessage.warning("系统内置管理员账号，不允许在此重置密码")
    return
  }
  ElMessageBox.prompt('请输入"' + row.username + '"的新密码', "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "密码长度必须介于 5 和 20 之间"
  }).then(({ value }) => {
    resetUserPwd(row.adminId, value).then(() => {
      ElMessage.success("修改成功，新密码是：" + value)
    })
  }).catch(() => {})
}

onMounted(() => {
  if (!isMobile.value) {
    getList()
  }
})
</script>

<style scoped lang="scss">
.user-manage {
  padding: 20px;

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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .button-row {
    display: flex;
    gap: 12px;
  }
}
</style>
