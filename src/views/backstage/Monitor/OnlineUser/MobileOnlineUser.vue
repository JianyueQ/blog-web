<template>
  <div class="mobile-online-user">
    <!-- 搜索栏 -->
    <div class="mobile-search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名或IP"
        clearable
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch" />
    </div>

    <!-- 统计卡片 -->
    <div class="mobile-stats-card">
      <div class="stats-item">
        <el-icon class="stats-icon"><User /></el-icon>
        <div class="stats-content">
          <span class="stats-label">在线用户</span>
          <span class="stats-value">{{ total }}</span>
        </div>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="mobile-list">
      <div
        v-for="item in tableData"
        :key="item.tokenId"
        class="mobile-list-item"
      >
        <div class="item-header">
          <div class="user-info">
            <div class="avatar-wrapper">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="user-meta">
              <span class="username">{{ item.userName }}</span>
              <span class="login-time">{{ formatLoginTime(item.loginTime) }}</span>
            </div>
          </div>
          <div class="online-indicator">
            <span class="dot"></span>
            <span class="text">在线</span>
          </div>
        </div>
        <div class="item-body">
          <div class="info-row">
            <el-icon><Location /></el-icon>
            <span class="info-text">{{ item.ipaddr }} {{ item.loginLocation ? `· ${item.loginLocation}` : '' }}</span>
          </div>
          <div class="info-row">
            <el-icon><Monitor /></el-icon>
            <el-tag type="success" effect="plain" size="small">{{ item.browser }}</el-tag>
          </div>
          <div class="info-row">
            <el-icon><Platform /></el-icon>
            <el-tag type="warning" effect="plain" size="small">{{ item.os }}</el-tag>
          </div>
        </div>
        <div class="item-footer">
          <el-button type="danger" plain size="small" :icon="SwitchButton" @click="handleForceLogout(item)">
            强制下线
          </el-button>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more">
      <el-button v-if="hasMore" type="primary" plain @click="loadMore" :loading="loading">
        加载更多
      </el-button>
      <span v-else-if="tableData.length > 0" class="no-more">没有更多了</span>
      <span v-else class="no-more">暂无在线用户</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOnlineUserList, forceLogout } from '@/api/backstage/onlineUser'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, Avatar, Location, Monitor, Platform, SwitchButton } from '@element-plus/icons-vue'

const searchQuery = ref('')
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const hasMore = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  ipaddr: ''
})

// 获取数据
const fetchData = async (isLoadMore = false) => {
  loading.value = true
  try {
    const res = await getOnlineUserList(queryParams)
    const rows = res.rows || []
    total.value = res.total || 0
    
    if (isLoadMore) {
      tableData.value.push(...rows)
    } else {
      tableData.value = rows
    }
    
    hasMore.value = tableData.value.length < total.value
  } catch (error) {
    console.error('获取在线用户失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.userName = searchQuery.value
  queryParams.ipaddr = searchQuery.value
  queryParams.pageNum = 1
  fetchData()
}

// 加载更多
const loadMore = () => {
  queryParams.pageNum++
  fetchData(true)
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
  }).catch(() => {})
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
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  fetchData()
})

defineExpose({
  fetchData
})
</script>

<style lang="scss" scoped>
.mobile-online-user {
  padding: 12px;
  background: var(--backstage-bg-color);
  min-height: 100vh;

  .mobile-search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .el-input {
      flex: 1;
    }
  }

  .mobile-stats-card {
    background: var(--backstage-card-bg);
    border-radius: var(--backstage-radius-lg);
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: var(--backstage-shadow-light);

    .stats-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .stats-icon {
        font-size: 24px;
        color: var(--backstage-success);
      }

      .stats-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .stats-label {
          font-size: 13px;
          color: var(--backstage-text-secondary);
        }

        .stats-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--backstage-success);
        }
      }
    }
  }

  .mobile-list {
    .mobile-list-item {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .avatar-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--backstage-primary) 0%, var(--backstage-accent) 100%);
            display: flex;
            align-items: center;
            justify-content: center;

            .el-icon {
              font-size: 20px;
              color: #fff;
            }
          }

          .user-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .username {
              font-size: 15px;
              font-weight: 600;
              color: var(--backstage-text-primary);
            }

            .login-time {
              font-size: 12px;
              color: var(--backstage-text-secondary);
            }
          }
        }

        .online-indicator {
          display: flex;
          align-items: center;
          gap: 6px;

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--backstage-success);
            animation: pulse 2s infinite;
          }

          .text {
            font-size: 12px;
            color: var(--backstage-success);
            font-weight: 500;
          }
        }
      }

      .item-body {
        margin-bottom: 12px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--backstage-text-regular);

          .el-icon {
            font-size: 14px;
            color: var(--backstage-text-secondary);
          }

          .info-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .item-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 12px;
        border-top: 1px solid var(--backstage-border-color);
      }
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
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
