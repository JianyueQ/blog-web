<template>
  <div class="mobile-visitor-blacklist">
    <!-- 搜索栏 -->
    <div class="mobile-search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索IP或地区"
        clearable
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
      />
      <el-button
        type="primary"
        :icon="Search"
        @click="handleSearch"
      />
    </div>

    <!-- 统计卡片 -->
    <div class="mobile-stats-card danger">
      <div class="stats-item">
        <el-icon class="stats-icon">
          <Warning />
        </el-icon>
        <div class="stats-content">
          <span class="stats-label">黑名单总数</span>
          <span class="stats-value">{{ total }}</span>
        </div>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="mobile-list">
      <div
        v-for="item in tableData"
        :key="item.visitorRecordId"
        class="mobile-list-item danger"
        @click="handleViewDetail(item)"
      >
        <div class="item-header">
          <div class="ip-badge">
            <el-icon><CircleClose /></el-icon>
            <span>{{ item.ipaddr }}</span>
          </div>
          <el-tag
            type="danger"
            size="small"
          >
            已拉黑
          </el-tag>
        </div>
        <div class="item-body">
          <div class="info-row">
            <el-icon><MapLocation /></el-icon>
            <span class="info-text">{{ item.location || '未知位置' }}</span>
          </div>
          <div class="info-row">
            <el-icon><Clock /></el-icon>
            <span class="info-text">{{ item.visitTime }}</span>
          </div>
          <div
            v-if="item.reason"
            class="info-row reason-row"
          >
            <el-icon><Warning /></el-icon>
            <span class="info-text reason">{{ item.reason }}</span>
          </div>
        </div>
        <div class="item-footer">
          <el-button
            type="primary"
            link
            size="small"
            :icon="View"
            @click.stop="handleViewDetail(item)"
          >
            详情
          </el-button>
          <el-button
            type="success"
            link
            size="small"
            :icon="CircleCheck"
            @click.stop="handleRemoveFromBlacklist(item)"
          >
            移除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more">
      <el-button
        v-if="hasMore"
        type="primary"
        plain
        :loading="loading"
        @click="loadMore"
      >
        加载更多
      </el-button>
      <span
        v-else
        class="no-more"
      >没有更多了</span>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="黑名单详情"
      size="90%"
      direction="btt"
      destroy-on-close
    >
      <div
        v-if="currentDetail"
        class="detail-content"
      >
        <div class="detail-section">
          <div class="detail-item">
            <span class="detail-label">IP地址</span>
            <span class="detail-value ip-text danger">{{ currentDetail.ipaddr }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">地区位置</span>
            <span class="detail-value">{{ currentDetail.location || '未知' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">浏览器</span>
            <span class="detail-value">{{ currentDetail.browser || '未知' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作系统</span>
            <span class="detail-value">{{ currentDetail.os || '未知' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">拉黑时间</span>
            <span class="detail-value">{{ currentDetail.visitTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">拉黑原因</span>
            <el-tag
              type="danger"
              effect="dark"
            >
              {{ currentDetail.reason || '未填写' }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">异常状态</span>
            <el-tag :type="currentDetail.abnormalFlag === 0 ? 'success' : 'danger'">
              {{ currentDetail.abnormalFlag === 0 ? '正常' : '异常' }}
            </el-tag>
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-label">
            用户代理
          </div>
          <div class="user-agent-box">
            {{ currentDetail.userAgent }}
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getVisitorList, getVisitorDetail, updateBlacklist } from '@/api/backstage/visitor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Warning, MapLocation, Clock, View, CircleCheck, CircleClose } from '@element-plus/icons-vue'

const props = defineProps({
  initialData: {
    type: Array,
    default: () => []
  },
  initialTotal: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['refresh'])

const searchQuery = ref('')
const loading = ref(false)
const tableData = ref(props.initialData)
const total = ref(props.initialTotal)
const hasMore = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  location: '',
  blacklist: 'Y'
})

const detailDrawerVisible = ref(false)
const currentDetail = ref(null)

// 获取数据
const fetchData = async (isLoadMore = false) => {
  loading.value = true
  try {
    const params = { ...queryParams }
    const res = await getVisitorList(params)
    const rows = res.rows || []
    total.value = res.total || 0
    
    if (isLoadMore) {
      tableData.value.push(...rows)
    } else {
      tableData.value = rows
    }
    
    hasMore.value = tableData.value.length < total.value
  } catch (error) {
    console.error('获取黑名单列表失败:', error)
    ElMessage.error('获取黑名单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.ipaddr = searchQuery.value
  queryParams.location = searchQuery.value
  queryParams.pageNum = 1
  fetchData()
}

// 加载更多
const loadMore = () => {
  queryParams.pageNum++
  fetchData(true)
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const res = await getVisitorDetail(row.visitorRecordId)
    currentDetail.value = res.data
    detailDrawerVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 从黑名单移除
const handleRemoveFromBlacklist = (row) => {
  ElMessageBox.confirm(
    `确认将IP "${row.ipaddr}" 从黑名单中移除吗？`,
    '移除黑名单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await updateBlacklist(row.visitorRecordId, 'N', null)
      ElMessage.success('已从黑名单移除')
      emit('refresh')
      fetchData()
    } catch (error) {
      console.error('移除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  if (tableData.value.length === 0) {
    fetchData()
  }
})

defineExpose({
  fetchData
})
</script>

<style lang="scss" scoped>
.mobile-visitor-blacklist {
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

    &.danger {
      background: linear-gradient(135deg, rgba(255, 77, 79, 0.1) 0%, rgba(250, 173, 20, 0.1) 100%);
      border: 1px solid rgba(255, 77, 79, 0.2);
    }

    .stats-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .stats-icon {
        font-size: 24px;
        color: var(--backstage-danger);
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
          color: var(--backstage-danger);
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

      &.danger {
        border-left: 4px solid var(--backstage-danger);
      }

      &:active {
        transform: scale(0.98);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .ip-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Consolas', monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--backstage-danger);

          .el-icon {
            font-size: 16px;
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

          &.reason-row {
            .info-text.reason {
              color: var(--backstage-danger);
              font-weight: 500;
            }
          }

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
        gap: 16px;
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

  .detail-content {
    .detail-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--backstage-border-color);

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-size: 14px;
        color: var(--backstage-text-secondary);
      }

      .detail-value {
        font-size: 14px;
        color: var(--backstage-text-primary);

        &.ip-text {
          font-family: 'Consolas', monospace;

          &.danger {
            color: var(--backstage-danger);
          }
        }
      }
    }

    .user-agent-box {
      margin-top: 8px;
      padding: 12px;
      background: var(--backstage-border-lighter);
      border-radius: var(--backstage-radius-md);
      font-size: 12px;
      color: var(--backstage-text-secondary);
      word-break: break-all;
      line-height: 1.6;
    }
  }
}
</style>
