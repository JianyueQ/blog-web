<template>
  <div class="links-manage">
    <!-- Tab 切换 -->
    <el-tabs
      v-model="activeTab"
      class="links-tabs"
      type="border-card"
    >
      <!-- 友链管理 Tab -->
      <el-tab-pane
        label="友链管理"
        name="manage"
      >
        <div class="pro-card table-card">
          <div class="card-header">
            <div class="header-left">
              <span class="title">友链伙伴管理</span>
              <span class="subtitle">管理您的博客朋友圈</span>
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                round
                :icon="Plus"
                @click="handleAdd"
              >
                新增友链
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
                label="站点"
                min-width="180"
              >
                <template #default="scope">
                  <div class="site-info">
                    <el-avatar
                      :size="40"
                      :src="scope.row.logo"
                      class="site-logo"
                    >
                      <el-icon><Picture /></el-icon>
                    </el-avatar>
                    <div class="details">
                      <span class="name">{{ scope.row.name }}</span>
                      <el-link
                        :href="scope.row.url"
                        target="_blank"
                        type="info"
                        :underline="false"
                        class="site-url"
                      >
                        <el-icon><Link /></el-icon>
                        {{ scope.row.url }}
                      </el-link>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="description"
                label="站点描述"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column
                prop="email"
                label="联系邮箱"
                width="190"
                show-overflow-tooltip
              />
              <el-table-column
                label="状态"
                width="140"
              >
                <template #default="scope">
                  <el-dropdown
                    trigger="click"
                    @command="(cmd) => handleStatusChange(scope.row, cmd)"
                  >
                    <el-tag
                      :type="getStatusType(scope.row.status)"
                      size="small"
                      effect="light"
                      class="status-tag"
                      :class="{ 'is-active': scope.row.status === 1 }"
                    >
                      <div class="status-content">
                        <el-icon v-if="scope.row.status === 1">
                          <View />
                        </el-icon>
                        <el-icon v-else>
                          <Hide />
                        </el-icon>
                        <span>{{ getStatusText(scope.row.status) }}</span>
                        <el-icon class="dropdown-icon">
                          <ArrowDown />
                        </el-icon>
                      </div>
                    </el-tag>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          command="1"
                          :disabled="scope.row.status === 1"
                        >
                          <el-icon><View /></el-icon>
                          <span>显示</span>
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="0"
                          :disabled="scope.row.status === 0"
                        >
                          <el-icon><Hide /></el-icon>
                          <span>隐藏</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
              <el-table-column
                prop="joinTime"
                label="加入时间"
                width="160"
              />
              <el-table-column
                label="操作"
                width="120"
                fixed="right"
              >
                <template #default="scope">
                  <div class="button-row">
                    <el-button
                      link
                      type="primary"
                      :icon="Edit"
                      @click="handleEdit(scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      :icon="Delete"
                      @click="handleDelete(scope.row)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="queryParams.pageNum"
                v-model:page-size="queryParams.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 申请审核 Tab -->
      <el-tab-pane name="pending">
        <template #label>
          <span>申请审核</span>
          <el-badge
            :value="pendingCount"
            :hidden="pendingCount === 0"
            class="tab-badge"
          />
        </template>
        <div class="pro-card table-card">
          <div class="card-header">
            <div class="header-left">
              <span class="title">友链申请审核</span>
              <span class="subtitle">处理前台用户提交的友链申请</span>
            </div>
          </div>
          <div class="card-body">
            <el-table
              v-loading="pendingLoading"
              :data="pendingData"
              style="width: 100%"
            >
              <el-table-column
                label="站点"
                min-width="220"
              >
                <template #default="scope">
                  <div class="site-info">
                    <el-avatar
                      :size="40"
                      :src="scope.row.logo"
                      class="site-logo"
                    >
                      <el-icon><Picture /></el-icon>
                    </el-avatar>
                    <div class="details">
                      <span class="name">{{ scope.row.name }}</span>
                      <el-link
                        :href="scope.row.url"
                        target="_blank"
                        type="info"
                        :underline="false"
                        class="site-url"
                      >
                        <el-icon><Link /></el-icon>
                        {{ scope.row.url }}
                      </el-link>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="description"
                label="站点描述"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column
                prop="email"
                label="联系邮箱"
                width="160"
                show-overflow-tooltip
              />
              <el-table-column
                prop="joinTime"
                label="申请时间"
                width="160"
              />
              <el-table-column
                label="操作"
                width="180"
                fixed="right"
              >
                <template #default="scope">
                  <div class="button-row">
                    <el-button
                      link
                      type="success"
                      :icon="CircleCheck"
                      @click="handleApprove(scope.row)"
                    >
                      通过
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      :icon="Delete"
                      @click="handleReject(scope.row)"
                    >
                      拒绝
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pendingQuery.pageNum"
                v-model:page-size="pendingQuery.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="pendingTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handlePendingSizeChange"
                @current-change="handlePendingCurrentChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑友链弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
        class="friend-link-form"
      >
        <el-form-item
          label="站点Logo"
          prop="logo"
        >
          <div class="logo-upload-wrapper">
            <el-upload
              class="logo-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleLogoChange"
              accept="image/*"
              :disabled="logoUploading"
            >
              <div
                v-loading="logoUploading"
                class="upload-content"
                element-loading-text="上传中..."
              >
                <el-avatar
                  v-if="formData.logo && !logoUploading"
                  :size="80"
                  :src="formData.logo"
                  class="uploaded-logo"
                />
                <div
                  v-else-if="!logoUploading"
                  class="upload-placeholder"
                >
                  <el-icon :size="24">
                    <Plus />
                  </el-icon>
                  <span>点击上传</span>
                </div>
              </div>
            </el-upload>
            <div class="upload-tips">
              <p>建议尺寸: 80x80px</p>
              <p>支持 JPG、PNG 格式</p>
              <el-button
                v-if="formData.logo"
                link
                type="danger"
                size="small"
                @click="formData.logo = ''"
              >
                删除图片
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          label="站点名称"
          prop="name"
        >
          <el-input
            v-model="formData.name"
            placeholder="请输入站点名称"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          label="站点地址"
          prop="url"
        >
          <el-input
            v-model="formData.url"
            placeholder="请输入站点地址，如 https://example.com"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          label="联系邮箱"
          prop="email"
        >
          <el-input
            v-model="formData.email"
            placeholder="请输入联系邮箱"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item
          label="站点描述"
          prop="description"
        >
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入站点描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Plus, Edit, Delete, View, Hide, Link, Picture, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getFriendLinksList,
  getApprovedFriendLinksList,
  addFriendLinks,
  updateFriendLinks,
  updateFriendLinksStatus,
  deleteFriendLinks
} from '@/api/backstage/friendLinks'
import { uploadImage } from '@/api/backstage/file'

// Tab 切换
const activeTab = ref('manage')

// 友链列表数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 待审核列表数据
const pendingLoading = ref(false)
const pendingData = ref([])
const pendingTotal = ref(0)
const pendingQuery = reactive({
  pageNum: 1,
  pageSize: 10
})
const pendingCount = ref(0)

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增友链')
const submitLoading = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const currentId = ref(null)
const logoUploading = ref(false)

const formData = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  email: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入站点名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入站点地址', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入正确的URL地址，以http://或https://开头', trigger: 'blur' }
  ],
  email: [
    { pattern: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 状态映射
const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 0: '已隐藏', 1: '展示中', 2: '待同意' }
  return map[status] || '未知'
}

// 获取友链列表
const fetchFriendLinksList = async () => {
  loading.value = true
  try {
    const res = await getFriendLinksList(queryParams)
    if (res.code === 200) {
      tableData.value = res.rows || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取待审核列表
const fetchPendingList = async () => {
  pendingLoading.value = true
  try {
    const res = await getApprovedFriendLinksList(pendingQuery)
    if (res.code === 200) {
      pendingData.value = res.rows || []
      pendingTotal.value = res.total || 0
      pendingCount.value = res.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    pendingLoading.value = false
  }
}

// 分页事件
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  fetchFriendLinksList()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  fetchFriendLinksList()
}

const handlePendingSizeChange = (val) => {
  pendingQuery.pageSize = val
  fetchPendingList()
}

const handlePendingCurrentChange = (val) => {
  pendingQuery.pageNum = val
  fetchPendingList()
}

// 新增友链
const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  dialogTitle.value = '新增友链'
  Object.assign(formData, {
    name: '',
    url: '',
    logo: '',
    description: '',
    email: ''
  })
  dialogVisible.value = true
}

// 编辑友链
const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.friendLinksId
  dialogTitle.value = '编辑友链'
  Object.assign(formData, {
    name: row.name,
    url: row.url,
    logo: row.logo || '',
    description: row.description || '',
    email: row.email || ''
  })
  dialogVisible.value = true
}

// Logo上传
const handleLogoChange = async (file) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  logoUploading.value = true
  const formDataUpload = new FormData()
  formDataUpload.append('image', file.raw)

  const res = await uploadImage(formDataUpload)
  if (res.code === 200) {
    formData.logo = res.imgUrl
    ElMessage.success(res.msg)
  }
  logoUploading.value = false
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  const api = isEdit.value ? updateFriendLinks : addFriendLinks
  const params = isEdit.value
    ? { ...formData, friendLinksId: currentId.value }
    : formData

  const res = await api(params)
  if (res.code === 200) {
    ElMessage.success(res.msg)
    dialogVisible.value = false
    fetchFriendLinksList()
  }
  submitLoading.value = false
}

// 状态栏直接切换状态
const handleStatusChange = async (row, cmd) => {
  const newStatus = parseInt(cmd)
  if (newStatus === row.status) return

  const res = await updateFriendLinksStatus({
    friendLinksId: row.friendLinksId,
    status: newStatus
  })

  if (res.code === 200) {
    ElMessage.success(res.msg)
    await fetchFriendLinksList()
  }
}

// 删除友链
const handleDelete = async (row) => {
  const res = await deleteFriendLinks(row.friendLinksId)
  if (res.code === 200) {
    ElMessage.success(res.msg)
    await fetchFriendLinksList()
  }
}

// 通过申请
const handleApprove = async (row) => {
  const res = await updateFriendLinksStatus({
    friendLinksId: row.friendLinksId,
    status: 1
  })

  if (res.code === 200) {
    ElMessage.success(res.msg)
    await fetchPendingList()
    await fetchFriendLinksList()
  }
}

// 拒绝申请(删除)
const handleReject = async (row) => {
  const res = await deleteFriendLinks(row.friendLinksId)
  if (res.code === 200) {
    ElMessage.success(res.msg)
    await fetchPendingList()
  }
}

// 监听Tab切换
watch(activeTab, (val) => {
  if (val === 'manage') {
    fetchFriendLinksList()
  } else if (val === 'pending') {
    fetchPendingList()
  }
})

onMounted(() => {
  fetchFriendLinksList()
  fetchPendingList()
})
</script>

<style scoped lang="scss">
.links-manage {
  padding: 0;

  .pending-badge {
    display: block;
    margin-bottom: 16px;

    :deep(.el-badge__content) {
      top: 8px;
      right: 8px;
    }
  }

  .pending-alert {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }


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

    .site-logo {
      flex-shrink: 0;
      border: 1px solid var(--backstage-border-color);
    }

    .details {
      display: flex;
      flex-direction: column;
      min-width: 0;

      .name {
        font-size: 14px;
        font-weight: 600;
        color: var(--backstage-text-primary);
        margin-bottom: 4px;
      }

      .site-url {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          font-size: 12px;
        }
      }
    }
  }

  .button-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  // 状态标签样式
  .status-tag {
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
      opacity: 0.85;
      transform: scale(1.02);
    }

    &.is-active {
      font-weight: 500;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 4px;

      .dropdown-icon {
        font-size: 10px;
        margin-left: 2px;
        opacity: 0.7;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--backstage-border-color);
  }

  // 弹窗样式
  .friend-link-form {
    .logo-upload-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .logo-uploader {
        :deep(.el-upload) {
          border: 1px dashed var(--el-border-color);
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: var(--el-transition-duration-fast);

          &:hover {
            border-color: var(--el-color-primary);
          }

          &.is-disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }
        }

        .upload-content {
          width: 80px;
          height: 80px;
          border-radius: 8px;

          :deep(.el-loading-mask) {
            border-radius: 8px;
          }
        }

        .uploaded-logo {
          display: block;
          border-radius: 8px;
        }

        .upload-placeholder {
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--el-text-color-secondary);

          span {
            font-size: 12px;
            margin-top: 4px;
          }
        }
      }

      .upload-tips {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 1.6;

        p {
          margin: 0 0 4px 0;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
