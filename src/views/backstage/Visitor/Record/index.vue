<template>
  <MobileRecord v-if="isMobile" ref="mobileRef" />
  <div v-else class="visitor-record-manage">
    <!-- 搜索区域 -->
    <div class="pro-card search-card">
      <el-form :model="queryParams" inline label-width="auto">
        <el-form-item label="IP地址">
          <el-input
              v-model="queryParams.ipaddr"
              placeholder="请输入IP地址"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="地区位置">
          <el-input
              v-model="queryParams.location"
              placeholder="请输入地区位置"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="访问时间">
          <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :icon="Search">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工具栏 -->
    <div class="pro-card toolbar-card">
      <div class="toolbar-left">
        <el-button type="danger" plain @click="handleClean" :icon="Delete">清空记录</el-button>
      </div>
      <div class="toolbar-right">
        <el-button circle @click="fetchData" :icon="Refresh" title="刷新" :loading="loading"/>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="pro-card table-card">
      <el-table
          v-loading="loading"
          :data="tableData"
          style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="100" align="center"/>
        <el-table-column prop="ipaddr" label="IP地址" width="150" align="center">
          <template #default="{ row }">
            <span class="ip-text">{{ row.ipaddr }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地区位置" min-width="180" show-overflow-tooltip/>
        <el-table-column prop="visitTime" label="访问时间" width="180" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon style="margin-right: 4px; color: var(--backstage-text-secondary);">
                <Clock/>
              </el-icon>
              <span>{{ row.visitTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button type="primary" link @click="handleViewDetail(row)" :icon="View">详情</el-button>
              <el-button type="danger" link @click="handleAddToBlacklist(row)" :icon="CircleClose">拉黑</el-button>
            </div>
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

    <!-- 详情弹窗 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="访客详情"
        width="600px"
        destroy-on-close
    >
      <el-descriptions :column="1" border v-if="currentDetail">
        <el-descriptions-item label="IP地址">
          <span class="ip-text">{{ currentDetail.ipaddr }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="地区位置">{{ currentDetail.location }}</el-descriptions-item>
        <el-descriptions-item label="浏览器">{{ currentDetail.browser }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ currentDetail.os }}</el-descriptions-item>
        <el-descriptions-item label="访问时间">{{ currentDetail.visitTime }}</el-descriptions-item>
        <el-descriptions-item label="用户代理">
          <div class="user-agent-text">{{ currentDetail.userAgent }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="异常状态">
          <el-tag :type="currentDetail.abnormalFlag === 0 ? 'success' : 'danger'">
            {{ currentDetail.abnormalFlag === 0 ? '正常' : '异常' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref, computed} from 'vue'
import {cleanVisitorRecords, getVisitorDetail, getVisitorList, updateBlacklist} from '@/api/backstage/visitor'
import {ElMessage, ElMessageBox} from 'element-plus'
import {CircleClose, Clock, Delete, Refresh, Search, View} from '@element-plus/icons-vue'
import MobileRecord from './MobileRecord.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  location: '',
  blacklist: 'N'
})

const dateRange = ref([])
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 获取访客记录列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {...queryParams}

    // 处理时间范围
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    // 添加排序参数
    params.orderByColumn = 'visitTime'
    params.isAsc = 'desc'

    const res = await getVisitorList(params)
    tableData.value = res.rows || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取访客记录失败:', error)
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
  queryParams.ipaddr = ''
  queryParams.location = ''
  dateRange.value = []
  fetchData()
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const res = await getVisitorDetail(row.visitorRecordId)
    currentDetail.value = res.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取访客详情失败:', error)
  }
}

// 加入黑名单
const handleAddToBlacklist = (row) => {
  ElMessageBox.prompt(
      `确认将IP "${row.ipaddr}" 加入黑名单吗？请输入拉黑原因：`,
      '加入黑名单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '请输入拉黑原因'
          }
          return true
        }
      }
  ).then(async ({value}) => {
    try {
      await updateBlacklist(row.visitorRecordId, 'Y', value.trim())
      ElMessage.success('已加入黑名单')
      fetchData()
    } catch (error) {
      console.error('加入黑名单失败:', error)
    }
  }).catch(() => {
  })
}

// 清空访客记录
const handleClean = () => {
  ElMessageBox.confirm('确认清空所有访客记录吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      await cleanVisitorRecords()
      ElMessage.success('清空成功')
      fetchData()
    } catch (error) {
      console.error('清空失败:', error)
    }
  }).catch(() => {
  })
}

onMounted(() => {
  if (!isMobile.value) {
    fetchData()
  }
})
</script>

<style lang="scss" scoped>
.visitor-record-manage {
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
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        :deep(.el-form-item) {
          margin-bottom: 0;
          margin-right: 0;
        }
      }
    }

    &.toolbar-card {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left,
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

        .action-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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

  :deep(.el-button) {
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  :deep(.el-tag) {
    cursor: default;
    border-radius: var(--backstage-radius-md);
    padding: 4px 10px;
    font-weight: 500;
  }

  // 详情弹窗样式
  :deep(.el-dialog) {
    .ip-text {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      font-weight: 500;
      color: var(--backstage-primary);
    }

    .user-agent-text {
      font-size: 12px;
      word-break: break-all;
      color: var(--backstage-text-secondary);
      line-height: 1.5;
    }
  }
}
</style>
