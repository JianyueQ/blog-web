<template>
  <div class="mobile-access-log">
    <!-- 搜索栏 -->
    <div class="mobile-search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名或IP"
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

    <!-- 筛选标签 -->
    <div class="filter-tags">
      <el-tag 
        :type="statusFilter === '' ? 'primary' : 'info'" 
        class="filter-tag"
        @click="statusFilter = ''; handleSearch()"
      >
        全部
      </el-tag>
      <el-tag 
        :type="statusFilter === '0' ? 'success' : 'info'" 
        class="filter-tag"
        @click="statusFilter = '0'; handleSearch()"
      >
        成功
      </el-tag>
      <el-tag 
        :type="statusFilter === '1' ? 'danger' : 'info'" 
        class="filter-tag"
        @click="statusFilter = '1'; handleSearch()"
      >
        失败
      </el-tag>
    </div>

    <!-- 数据列表 -->
    <div class="mobile-list">
      <div
        v-for="item in tableData"
        :key="item.infoId"
        class="mobile-list-item"
        :class="{ 'login-fail': item.status === '1' }"
      >
        <div class="item-header">
          <div class="user-info">
            <el-avatar
              :size="32"
              :icon="UserFilled"
            />
            <span class="username">{{ item.userName }}</span>
          </div>
          <el-tag
            :type="item.status === '0' ? 'success' : 'danger'"
            size="small"
          >
            {{ item.status === '0' ? '成功' : '失败' }}
          </el-tag>
        </div>
        <div class="item-body">
          <div class="info-row">
            <el-icon><Location /></el-icon>
            <span class="info-text">{{ item.ipaddr }} {{ item.loginLocation ? `· ${item.loginLocation}` : '' }}</span>
          </div>
          <div class="info-row">
            <el-icon><Monitor /></el-icon>
            <span class="info-text">{{ item.browser }}</span>
          </div>
          <div class="info-row">
            <el-icon><Platform /></el-icon>
            <span class="info-text">{{ item.os }}</span>
          </div>
          <div class="info-row">
            <el-icon><Clock /></el-icon>
            <span class="info-text">{{ item.loginTime }}</span>
          </div>
        </div>
        <div class="item-footer">
          <el-button
            type="danger"
            link
            size="small"
            :icon="Delete"
            @click="handleDelete(item)"
          >
            删除
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
        v-else-if="tableData.length > 0"
        class="no-more"
      >没有更多了</span>
      <span
        v-else
        class="no-more"
      >暂无数据</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getList, deleteAccess } from '@/api/backstage/accessLog'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, UserFilled, Location, Monitor, Platform, Clock, Delete } from '@element-plus/icons-vue'

const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const hasMore = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: undefined,
  ipaddr: ''
})

// 获取数据
const fetchData = async (isLoadMore = false) => {
  loading.value = true
  try {
    const params = { ...queryParams }
    const res = await getList(params)
    const rows = res.rows || []
    total.value = res.total || 0
    
    if (isLoadMore) {
      tableData.value.push(...rows)
    } else {
      tableData.value = rows
    }
    
    hasMore.value = tableData.value.length < total.value
  } catch (error) {
    console.error('获取访问记录失败:', error)
    ElMessage.error('获取访问记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.userName = searchQuery.value
  queryParams.ipaddr = searchQuery.value
  queryParams.status = statusFilter.value || undefined
  queryParams.pageNum = 1
  fetchData()
}

// 加载更多
const loadMore = () => {
  queryParams.pageNum++
  fetchData(true)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除该访问记录吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAccess([row.infoId])
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})

defineExpose({
  fetchData
})
</script>

<style lang="scss" scoped>
.mobile-access-log {
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

  .filter-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    .filter-tag {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
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

      &.login-fail {
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

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;

          .username {
            font-size: 15px;
            font-weight: 600;
            color: var(--backstage-text-primary);
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
</style>
