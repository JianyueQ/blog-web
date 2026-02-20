<template>
  <div class="mobile-oper-log">
    <!-- 搜索栏 -->
    <div class="mobile-search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索操作标题或人员"
        clearable
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch" />
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tags">
      <el-tag 
        :type="statusFilter === '' ? 'primary' : 'info'" 
        @click="statusFilter = ''; handleSearch()"
        class="filter-tag"
      >
        全部
      </el-tag>
      <el-tag 
        :type="statusFilter === '0' ? 'success' : 'info'" 
        @click="statusFilter = '0'; handleSearch()"
        class="filter-tag"
      >
        成功
      </el-tag>
      <el-tag 
        :type="statusFilter === '1' ? 'danger' : 'info'" 
        @click="statusFilter = '1'; handleSearch()"
        class="filter-tag"
      >
        失败
      </el-tag>
    </div>

    <!-- 数据列表 -->
    <div class="mobile-list">
      <div
        v-for="item in tableData"
        :key="item.operId"
        class="mobile-list-item"
        :class="{ 'oper-fail': item.status === 1 }"
        @click="handleDetail(item)"
      >
        <div class="item-header">
          <div class="oper-title">
            <el-tag :type="getBusinessTypeTag(item.businessType)" size="small">
              {{ getBusinessTypeText(item.businessType) }}
            </el-tag>
            <span class="title-text">{{ item.title }}</span>
          </div>
          <el-tag :type="item.status === 0 ? 'success' : 'danger'" size="small">
            {{ item.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </div>
        <div class="item-body">
          <div class="info-row">
            <el-icon><User /></el-icon>
            <span class="info-text">{{ item.operName }}</span>
          </div>
          <div class="info-row">
            <el-icon><Location /></el-icon>
            <span class="info-text">{{ item.operIp }} {{ item.operLocation ? `· ${item.operLocation}` : '' }}</span>
          </div>
          <div class="info-row">
            <el-tag :type="getMethodTag(item.requestMethod)" size="small" effect="plain">
              {{ item.requestMethod }}
            </el-tag>
            <span class="cost-time">{{ item.costTime }}ms</span>
          </div>
          <div class="info-row">
            <el-icon><Clock /></el-icon>
            <span class="info-text">{{ item.operTime }}</span>
          </div>
        </div>
        <div class="item-footer">
          <el-button type="primary" link size="small" :icon="View" @click.stop="handleDetail(item)">
            详情
          </el-button>
          <el-button type="danger" link size="small" :icon="Delete" @click.stop="handleDelete(item)">
            删除
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
      <span v-else class="no-more">暂无数据</span>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="操作日志详情"
      size="95%"
      direction="btt"
      destroy-on-close
    >
      <div v-if="detailData" class="detail-content">
        <div class="detail-section">
          <div class="detail-item">
            <span class="detail-label">日志编号</span>
            <span class="detail-value">{{ detailData.operId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作标题</span>
            <span class="detail-value">{{ detailData.title }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">业务类型</span>
            <el-tag :type="getBusinessTypeTag(detailData.businessType)">
              {{ getBusinessTypeText(detailData.businessType) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">请求方式</span>
            <el-tag :type="getMethodTag(detailData.requestMethod)" size="small">
              {{ detailData.requestMethod }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作人员</span>
            <span class="detail-value">{{ detailData.operName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作IP</span>
            <span class="detail-value">{{ detailData.operIp }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作地点</span>
            <span class="detail-value">{{ detailData.operLocation }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作时间</span>
            <span class="detail-value">{{ detailData.operTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">请求URL</span>
            <span class="detail-value url-text">{{ detailData.operUrl }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">执行耗时</span>
            <span class="detail-value">{{ detailData.costTime }} ms</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">操作状态</span>
            <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">
              {{ detailData.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </div>
        </div>
        
        <div class="detail-section" v-if="detailData.errorMsg">
          <div class="detail-label" style="color: var(--backstage-danger); margin-bottom: 8px;">错误信息</div>
          <div class="error-box">{{ detailData.errorMsg }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">请求参数</div>
          <div class="code-box">{{ formatJson(detailData.operParam) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">返回结果</div>
          <div class="code-box">{{ formatJson(detailData.jsonResult) }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOperlogList, getOperlogDetail, deleteOperlog } from '@/api/backstage/log'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, Location, Clock, View, Delete } from '@element-plus/icons-vue'

const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const hasMore = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  operName: '',
  status: undefined
})

const detailDrawerVisible = ref(false)
const detailData = ref(null)

// 获取数据
const fetchData = async (isLoadMore = false) => {
  loading.value = true
  try {
    const params = { ...queryParams }
    const res = await getOperlogList(params)
    const rows = res.rows || []
    total.value = res.total || 0
    
    if (isLoadMore) {
      tableData.value.push(...rows)
    } else {
      tableData.value = rows
    }
    
    hasMore.value = tableData.value.length < total.value
  } catch (error) {
    console.error('获取操作日志失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.title = searchQuery.value
  queryParams.operName = searchQuery.value
  queryParams.status = statusFilter.value === '' ? undefined : parseInt(statusFilter.value)
  queryParams.pageNum = 1
  fetchData()
}

// 加载更多
const loadMore = () => {
  queryParams.pageNum++
  fetchData(true)
}

// 查看详情
const handleDetail = async (row) => {
  try {
    const res = await getOperlogDetail(row.operId)
    detailData.value = res.data
    detailDrawerVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除该操作日志吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOperlog([row.operId])
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 业务类型文本
const getBusinessTypeText = (type) => {
  const typeMap = {
    0: '其他',
    1: '新增',
    2: '修改',
    3: '删除',
    4: '授权',
    5: '导出',
    6: '导入',
    7: '强退',
    8: '清空'
  }
  return typeMap[type] || '未知'
}

// 业务类型标签
const getBusinessTypeTag = (type) => {
  const tagMap = {
    0: 'success',
    1: 'primary',
    2: 'danger',
    3: 'warning',
    4: 'info',
    5: 'info',
    6: 'danger',
    7: '',
    8: ''
  }
  return tagMap[type] || ''
}

// 请求方式标签
const getMethodTag = (method) => {
  const tagMap = {
    'GET': '',
    'POST': 'success',
    'PUT': 'warning',
    'DELETE': 'danger'
  }
  return tagMap[method] || 'info'
}

// 格式化JSON
const formatJson = (jsonStr) => {
  if (!jsonStr) return ''
  try {
    const obj = JSON.parse(jsonStr)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}

onMounted(() => {
  fetchData()
})

defineExpose({
  fetchData
})
</script>

<style lang="scss" scoped>
.mobile-oper-log {
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

      &.oper-fail {
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

        .oper-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;

          .title-text {
            font-size: 14px;
            font-weight: 500;
            color: var(--backstage-text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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

          .cost-time {
            font-size: 12px;
            color: var(--backstage-text-secondary);
            font-family: 'Consolas', monospace;
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

        &.url-text {
          font-size: 12px;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .detail-label {
      font-size: 14px;
      color: var(--backstage-text-secondary);
      margin-bottom: 8px;
    }

    .code-box, .error-box {
      padding: 12px;
      background: var(--backstage-border-lighter);
      border-radius: var(--backstage-radius-md);
      font-family: 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
    }

    .error-box {
      color: var(--backstage-danger);
      background: rgba(255, 77, 79, 0.05);
    }
  }
}
</style>
