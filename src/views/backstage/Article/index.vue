<template>
  <MobileArticle v-if="isMobile" ref="mobileRef" />
  <div v-else class="article-manage">
    <div class="pro-card filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="文章标题">
          <el-input v-model="filterForm.title" placeholder="模糊搜索标题" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="请选择分类" clearable style="width: 160px">
            <el-option label="技术" value="tech" />
            <el-option label="生活" value="life" />
            <el-option label="教程" value="tutorial" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="文章状态" clearable style="width: 120px">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="button-row">
            <el-button type="primary" round :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button round :icon="Refresh" @click="resetFilter">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="pro-card table-card mt-20">
      <div class="card-header">
        <div class="header-left">
          <span class="title">内容列表</span>
          <span class="subtitle">共 {{ total }} 篇文章</span>
        </div>
        <div class="header-right button-row">
          <el-button type="primary" round :icon="Plus" @click="handleAdd">创作新文章</el-button>
          <el-button type="danger" round :icon="Delete" plain @click="handleBatchDelete">批量删除</el-button>
        </div>
      </div>
      <div class="card-body">
        <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="封面" width="100">
            <template #default="scope">
              <el-image :src="scope.row.cover" class="article-cover" fit="cover">
                <template #error>
                  <div class="image-slot"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="文章标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="category" label="分类" width="120">
            <template #default="scope">
              <el-tag size="small" effect="plain">{{ scope.row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标签" width="180">
            <template #default="scope">
              <div class="tag-group">
                <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" type="info" class="mr-5">{{ tag }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'published' ? 'success' : 'warning'" size="small">
                {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <div class="button-row">
                <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button link type="primary" :icon="View" @click="handlePreview(scope.row)">预览</el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search, Refresh, Plus, Delete, Edit, View, Picture } from '@element-plus/icons-vue'
import MobileArticle from './MobileArticle.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

const filterForm = reactive({
  title: '',
  category: '',
  status: ''
})

const total = ref(128)
const currentPage = ref(1)
const pageSize = ref(10)

const tableData = ref([
  {
    id: 1,
    title: 'PRO MAX 2.0 视觉更新说明',
    cover: 'https://placeholder.com/100',
    category: '公告',
    tags: ['更新', 'UI'],
    status: 'published',
    createTime: '2026-01-29 10:00:00'
  },
  {
    id: 2,
    title: 'Vue3 开发实战：从零构建高性能后台',
    cover: '',
    category: '技术',
    tags: ['Vue3', '前端'],
    status: 'published',
    createTime: '2026-01-28 15:30:00'
  }
])

const handleSearch = () => {
  // TODO: 调用后端接口查询数据
}

const resetFilter = () => {
  filterForm.title = ''
  filterForm.category = ''
  filterForm.status = ''
}

const handleAdd = () => {
  // TODO: 跳转到文章发布页面或打开对话框
}

const handleEdit = (row) => {
  // TODO: 跳转到文章编辑页面
}

const handlePreview = (row) => {
  // TODO: 跳转到前台文章详情页
}

const handleDelete = (row) => {
  // TODO: 使用 ElMessageBox.confirm 确认删除
}

const handleBatchDelete = () => {
  // TODO: 使用 ElMessageBox.confirm 批量删除
}

const handleSelectionChange = (val) => {
  // TODO: 记录选中的行
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped lang="scss">
.article-manage {
  .mt-20 { margin-top: 20px; }
  .mr-5 { margin-right: 5px; }

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

  .filter-form {
    padding: 20px 24px;
    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }

  .article-cover {
    width: 60px;
    height: 40px;
    border-radius: 4px;
    background: var(--backstage-border-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--backstage-text-placeholder);
  }

  .tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
