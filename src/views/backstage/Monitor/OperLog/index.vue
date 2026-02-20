<template>
  <MobileOperLog v-if="isMobile" ref="mobileRef" />
  <div v-else class="operlog-manage">
    <!-- 搜索区域 -->
    <div class="pro-card search-card">
      <el-form :model="queryParams" inline label-width="auto">
        <el-form-item label="操作标题">
          <el-input v-model="queryParams.title" placeholder="请输入操作标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="操作人员">
          <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="queryParams.businessType" placeholder="请选择业务类型" clearable style="width: 200px">
            <el-option label="其他" :value="0" />
            <el-option label="新增" :value="1" />
            <el-option label="修改" :value="2" />
            <el-option label="删除" :value="3" />
            <el-option label="授权" :value="4" />
            <el-option label="导出" :value="5" />
            <el-option label="导入" :value="6" />
            <el-option label="强退" :value="7" />
            <el-option label="清空" :value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
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

    <!-- 操作按钮 -->
    <div class="pro-card toolbar-card">
      <div class="toolbar-left">
        <el-button type="danger" @click="handleDelete" :disabled="selectedIds.length === 0" :icon="Delete">
          删除
        </el-button>
        <el-button type="danger" plain @click="handleClean" :icon="Delete">清空</el-button>
      </div>
      <div class="toolbar-right">
        <el-button circle @click="fetchData" :icon="Refresh" title="刷新" />
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="pro-card table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="operId" label="编号" width="80" align="center" />
        <el-table-column prop="title" label="操作标题" min-width="120" show-overflow-tooltip />
        <el-table-column prop="businessType" label="业务类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getBusinessTypeTag(row.businessType)">
              {{ getBusinessTypeText(row.businessType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestMethod" label="请求方式" width="126" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTag(row.requestMethod)" size="small">
              {{ row.requestMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operName" label="操作人员" width="180" show-overflow-tooltip />
        <el-table-column prop="operIp" label="操作IP" width="120" align="center" />
        <el-table-column prop="operLocation" label="操作地点" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="耗时" width="80" align="center" />
        <el-table-column prop="operTime" label="操作时间" width="180" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <div class="button-row">
              <el-button type="primary" link @click="handleDetail(row)" :icon="View">详情</el-button>
              <el-button type="danger" link @click="handleDeleteSingle(row)" :icon="Delete">删除</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="操作日志详情"
      width="900px"
      append-to-body
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="日志编号">{{ detailData.operId }}</el-descriptions-item>
        <el-descriptions-item label="操作标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">
          <el-tag :type="getBusinessTypeTag(detailData.businessType)">
            {{ getBusinessTypeText(detailData.businessType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求方式">
          <el-tag :type="getMethodTag(detailData.requestMethod)" size="small">
            {{ detailData.requestMethod }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ detailData.operName }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detailData.operIp }}</el-descriptions-item>
        <el-descriptions-item label="操作地点" :span="2">{{ detailData.operLocation }}</el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">{{ detailData.operTime }}</el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ detailData.operUrl }}</el-descriptions-item>
        <el-descriptions-item label="调用方法" :span="2">
          <div class="code-text">{{ detailData.method }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <el-input
            type="textarea"
            :value="formatJson(detailData.operParam)"
            :rows="6"
            readonly
            class="json-input"
          />
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <el-input
            type="textarea"
            :value="formatJson(detailData.jsonResult)"
            :rows="6"
            readonly
            class="json-input"
          />
        </el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">
            {{ detailData.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行耗时">{{ detailData.costTime }} ms</el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detailData.errorMsg">
          <div class="error-msg">{{ detailData.errorMsg }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getOperlogList, getOperlogDetail, deleteOperlog, cleanOperlog } from '@/api/backstage/log'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, View } from '@element-plus/icons-vue'
import MobileOperLog from './MobileOperLog.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  operName: '',
  businessType: undefined,
  status: undefined,
  operIp: ''
})

const dateRange = ref([])
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])

// 详情对话框
const detailVisible = ref(false)
const detailData = ref(null)

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = { ...queryParams }

    // 处理时间范围
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    const res = await getOperlogList(params)
    // 注意: axios响应拦截器已经解包了res.data
    tableData.value = res.rows || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取操作日志失败:', error)
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
  queryParams.title = ''
  queryParams.operName = ''
  queryParams.businessType = undefined
  queryParams.status = undefined
  queryParams.operIp = ''
  dateRange.value = []
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.operId)
}

// 查看详情
const handleDetail = async (row) => {
  try {
    const res = await getOperlogDetail(row.operId)
    detailData.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 删除单个
const handleDeleteSingle = (row) => {
  ElMessageBox.confirm(`确认删除日志编号为 ${row.operId} 的操作日志吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 后端期望数组格式: Long[]
      await deleteOperlog([row.operId])
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 批量删除
const handleDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条操作日志吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 后端期望数组格式: Long[]
      await deleteOperlog(selectedIds.value)
      ElMessage.success('删除成功')
      selectedIds.value = []
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 清空日志
const handleClean = () => {
  ElMessageBox.confirm('确认清空所有操作日志吗? 此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      await cleanOperlog()
      ElMessage.success('清空成功')
      fetchData()
    } catch (error) {
      console.error('清空失败:', error)
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
    7: ''
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
  if (!isMobile.value) {
    fetchData()
  }
})
</script>

<style lang="scss" scoped>
.operlog-manage {
  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    margin-bottom: 20px;

    &.search-card {
      padding: 20px 30px;
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
      }

      .pagination-container {
        padding: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .code-text {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    color: var(--backstage-text-primary);
    word-break: break-all;
  }

  .error-msg {
    color: var(--el-color-danger);
    font-size: 13px;
    word-break: break-all;
  }
}

// 修复暗色模式下表格样式
.operlog-manage :deep(.el-table) {
  [data-theme='dark'] & {
    // 修复暗色模式下表格单元格布局问题
    .el-table__cell {
      // 确保单元格内容不换行
      white-space: nowrap;
      // 防止内容溢出
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // 操作列特殊处理 - 允许按钮并排显示
    .el-table-column--selection,
    .el-table__fixed-right {
      .el-table__cell {
        overflow: visible;
      }
    }
  }
}

// 修夏详情对话框暗色模式(组件作用域)
:deep(.el-dialog) {
  [data-theme='dark'] & {
    background: var(--backstage-card-bg) !important;

    .el-dialog__header {
      background: var(--backstage-card-bg) !important;
      border-bottom-color: var(--backstage-border-color) !important;
    }

    .el-dialog__body {
      background: var(--backstage-card-bg) !important;
    }
  }
}

// 修夏 Descriptions 组件暗色模式 - 增强优先级
:deep(.el-descriptions) {
  [data-theme='dark'] & {
    .el-descriptions__header {
      background: transparent !important;
    }

    // 标签列(左侧)
    .el-descriptions__label {
      background: rgba(255, 255, 255, 0.03) !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-secondary) !important;
    }

    // 内容列(右侧)
    .el-descriptions__content {
      background: transparent !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-primary) !important;
    }

    // 覆盖所有单元格的默认背景
    .el-descriptions__cell {
      background: transparent !important;
    }

    // 确保 table布局模式也生效
    .el-descriptions__table {
      background: transparent !important;
    }

    .el-descriptions__body {
      background: transparent !important;
    }
  }
}

// 修夏详情对话框中的 textarea 组件
:deep(.json-input) {
  [data-theme='dark'] & {
    // textarea 容器
    .el-textarea {
      --el-fill-color-blank: rgba(255, 255, 255, 0.03) !important;
    }

    // textarea 输入框
    .el-textarea__inner {
      background: rgba(255, 255, 255, 0.03) !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-primary) !important;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.6;

      // 覆盖 readonly 状态样式
      &[readonly] {
        background: rgba(255, 255, 255, 0.02) !important;
        cursor: default !important;
      }

      // 滚动条样式
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }
  }
}

// 修夏时间选择器暗色模式
[data-theme='dark'] {
  // DatePicker 下拉面板
  .el-picker__popper {
    background: var(--backstage-card-bg) !important;
    border-color: var(--backstage-border-color) !important;

    .el-picker-panel {
      background: var(--backstage-card-bg) !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-primary) !important;
    }

    .el-date-picker__header {
      color: var(--backstage-text-primary) !important;
    }

    .el-picker-panel__icon-btn {
      color: var(--backstage-text-primary) !important;
    }

    .el-date-table th,
    .el-date-table td {
      color: var(--backstage-text-primary) !important;
    }

    .el-date-table td.disabled {
      color: var(--backstage-text-secondary) !important;
    }

    .el-date-table td.today span {
      color: var(--el-color-primary) !important;
    }

    .el-date-table td.current:not(.disabled) span {
      background-color: var(--el-color-primary) !important;
      color: #fff !important;
    }

    .el-picker-panel__footer {
      background: var(--backstage-card-bg) !important;
      border-top-color: var(--backstage-border-color) !important;
    }

    // 时间选择器
    .el-time-panel {
      background: var(--backstage-card-bg) !important;
      border-color: var(--backstage-border-color) !important;

      .el-time-spinner__item {
        color: var(--backstage-text-primary) !important;

        &:hover:not(.is-disabled):not(.is-active) {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        &.is-active:not(.is-disabled) {
          color: var(--backstage-text-primary) !important;
          font-weight: 700;
        }
      }
    }

    .el-input__inner {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-primary) !important;
    }
  }
}
</style>

<!-- 全局样式(不带 scoped) - 专门用于暗色模式的 append-to-body 元素 -->
<style lang="scss">
// 修复详情对话框暗色模式(全局作用域 - 应对 append-to-body)
[data-theme='dark'] {
  // 对话框容器
  .el-dialog {
    background: var(--backstage-card-bg) !important;

    .el-dialog__header {
      background: var(--backstage-card-bg) !important;
      border-bottom-color: var(--backstage-border-color) !important;
    }

    .el-dialog__body {
      background: var(--backstage-card-bg) !important;
    }
  }

  // Descriptions 组件 - 关键修复!
  .el-descriptions {
    .el-descriptions__header {
      background: transparent !important;
    }

    // 标签列(左侧) - 轻微背景色区分
    .el-descriptions__label {
      background: rgba(255, 255, 255, 0.03) !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-secondary) !important;
    }

    // 内容列(右侧) - 透明背景
    .el-descriptions__content {
      background: transparent !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-primary) !important;
    }

    // 覆盖所有容器元素
    .el-descriptions__cell,
    .el-descriptions__table,
    .el-descriptions__body {
      background: transparent !important;
    }
  }

  // Textarea 组件
  .el-textarea {
    --el-fill-color-blank: rgba(255, 255, 255, 0.03) !important;

    .el-textarea__inner {
      background: rgba(255, 255, 255, 0.03) !important;
      border-color: var(--backstage-border-color) !important;
      color: var(--backstage-text-primary) !important;

      &[readonly] {
        background: rgba(255, 255, 255, 0.02) !important;
        cursor: default !important;
      }
    }
  }
}
</style>
