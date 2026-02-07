<template>
  <div class="accesslog-manage">
    <!-- 搜索区域 -->
    <div class="pro-card search-card">
      <el-form :model="queryParams" inline label-width="auto">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="登录状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option label="成功" value="0" />
            <el-option label="失败" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录IP">
          <el-input v-model="queryParams.ipaddr" placeholder="请输入登录IP" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="登录时间">
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
        <el-table-column prop="infoId" label="访问编号" width="100" align="center" />
        <el-table-column prop="userName" label="用户名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="ipaddr" label="登录IP" width="140" align="center" />
        <el-table-column prop="loginLocation" label="登录地点" width="140" align="center" />
        <el-table-column prop="browser" label="浏览器" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="os" label="操作系统" width="120" align="center" />
        <el-table-column prop="status" label="登录状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="提示信息" min-width="120" show-overflow-tooltip />
        <el-table-column prop="loginTime" label="登录时间" width="180" align="center" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDeleteSingle(row)" :icon="Delete">删除</el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { getList, deleteAccess, cleanAccess } from '@/api/backstage/accessLog'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: undefined,
  ipaddr: ''
})

const dateRange = ref([])
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])

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

    const res = await getList(params)
    tableData.value = res.rows || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取访问记录失败:', error)
    ElMessage.error('获取访问记录失败')
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
  queryParams.status = undefined
  queryParams.ipaddr = ''
  dateRange.value = []
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.infoId)
}

// 删除单个
const handleDeleteSingle = (row) => {
  ElMessageBox.confirm(`确认删除编号为 ${row.infoId} 的访问记录吗?`, '警告', {
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

// 批量删除
const handleDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条访问记录吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAccess(selectedIds.value)
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
  ElMessageBox.confirm('确认清空所有访问记录吗? 此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      await cleanAccess()
      ElMessage.success('清空成功')
      fetchData()
    } catch (error) {
      console.error('清空失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.accesslog-manage {
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
}
</style>
