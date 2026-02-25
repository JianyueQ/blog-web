<template>
  <MobileOnlineUser
    v-if="isMobile"
    ref="mobileRef"
  />
  <div
    v-else
    class="online-user-manage"
  >
    <!-- 搜索区域 -->
    <div class="pro-card search-card">
      <el-form
        :model="queryParams"
        inline
        label-width="auto"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="登录IP">
          <el-input
            v-model="queryParams.ipaddr"
            placeholder="请输入登录IP"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleQuery"
          >
            搜索
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleReset"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工具栏 -->
    <div class="pro-card toolbar-card">
      <div class="toolbar-left">
        <div class="stats-info">
          <el-icon class="stats-icon">
            <User />
          </el-icon>
          <span class="stats-text">在线用户总数：<span class="stats-number">{{ total }}</span></span>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button
          circle
          :icon="Refresh"
          title="刷新"
          :loading="loading"
          @click="fetchData"
        />
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="pro-card table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="序号"
          width="90"
          align="center"
        />
        <el-table-column
          prop="userName"
          label="用户名"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="user-cell">
              <el-icon class="user-icon">
                <Avatar />
              </el-icon>
              <span class="user-name">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="ipaddr"
          label="登录IP"
          width="130"
          align="center"
        >
          <template #default="{ row }">
            <span class="ip-text">{{ row.ipaddr }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="loginLocation"
          label="登录地点"
          width="160"
          align="center"
        />
        <el-table-column
          prop="browser"
          label="浏览器"
          width="140"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              type="success"
              effect="plain"
              size="small"
            >
              {{ row.browser }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="os"
          label="操作系统"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              type="warning"
              effect="plain"
              size="small"
            >
              {{ row.os }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="loginTime"
          label="登录时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon style="margin-right: 4px; color: var(--backstage-text-secondary);">
                <Clock />
              </el-icon>
              <span>{{ formatLoginTime(row.loginTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              :icon="SwitchButton"
              @click="handleForceLogout(row)"
            >
              强退
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import {getOnlineUserList, forceLogout} from '@/api/backstage/onlineUser'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  Search,
  Refresh,
  User,
  Avatar,
  Clock,
  SwitchButton
} from '@element-plus/icons-vue'
import MobileOnlineUser from './MobileOnlineUser.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  ipaddr: ''
})

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 获取在线用户列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOnlineUserList(queryParams)
    tableData.value = res.rows || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.userName = ''
  queryParams.ipaddr = ''
  fetchData()
}

// 强制下线
const handleForceLogout = (row) => {
  ElMessageBox.confirm(
      `确认要强制用户 "${row.userName}" 下线吗？`,
      '强制下线',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await forceLogout(row.tokenId)
      ElMessage.success('强制下线成功')
      fetchData()
    } catch (error) {
      console.error('强制下线失败:', error)
    }
  }).catch(() => {
  })
}

// 格式化登录时间
const formatLoginTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}



onMounted(() => {
  if (!isMobile.value) {
    fetchData()
  }
})
</script>

<style lang="scss" scoped>
.online-user-manage {
  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    margin-bottom: 20px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: var(--backstage-shadow-base);
    }

    &.search-card {
      padding: 20px 30px;

      .el-form {
        :deep(.el-form-item) {
          margin-bottom: 0;
        }
      }
    }

    &.toolbar-card {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        .stats-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--backstage-primary-lighter) 0%, var(--backstage-accent-lighter) 100%);
          border-radius: var(--backstage-radius-lg);
          border: 1px solid var(--backstage-primary-light);

          .stats-icon {
            font-size: 20px;
            color: var(--backstage-primary);
          }

          .stats-text {
            font-size: 14px;
            color: var(--backstage-text-regular);
            font-weight: 500;

            .stats-number {
              font-size: 18px;
              font-weight: 700;
              color: var(--backstage-primary);
              margin-left: 4px;
            }
          }
        }
      }

      .toolbar-right {
        display: flex;
        gap: 12px;
      }
    }

    &.table-card {
      padding: 0;
      overflow: hidden;

      .el-table {
        border-radius: var(--backstage-radius-xl) var(--backstage-radius-xl) 0 0;

        .user-cell {
          display: flex;
          align-items: center;
          gap: 8px;

          .user-icon {
            font-size: 18px;
            color: var(--backstage-primary);
          }

          .user-name {
            font-weight: 500;
            color: var(--backstage-text-primary);
          }
        }

        .ip-text {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
          font-weight: 500;
          color: var(--backstage-primary);
        }

        .time-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: var(--backstage-text-regular);
        }
      }

      .pagination-container {
        padding: 20px;
        display: flex;
        justify-content: flex-end;
        background: var(--backstage-border-lighter);
        border-top: 1px solid var(--backstage-border-color);
      }
    }
  }

  // 按钮悬停效果
  :deep(.el-button) {
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // 标签优化
  :deep(.el-tag) {
    cursor: default;
    border-radius: var(--backstage-radius-md);
    padding: 4px 10px;
    font-weight: 500;
  }
}

// 暗黑模式适配
[data-theme='dark'] {
  .online-user-manage {
    .pro-card.toolbar-card .toolbar-left .stats-info {
      background: linear-gradient(135deg, rgba(22, 119, 255, 0.15) 0%, rgba(19, 194, 194, 0.15) 100%);
      border-color: rgba(22, 119, 255, 0.3);
    }
  }
}
</style>
