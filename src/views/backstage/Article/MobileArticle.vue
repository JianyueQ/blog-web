<template>
  <div class="mobile-article-manage">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="filterForm.title"
        placeholder="搜索文章标题"
        clearable
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
      />
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tags">
      <el-tag 
        :type="filterForm.status === '' ? 'primary' : 'info'" 
        @click="filterForm.status = ''; handleSearch()"
        class="filter-tag"
      >
        全部
      </el-tag>
      <el-tag 
        :type="filterForm.status === 'published' ? 'success' : 'info'" 
        @click="filterForm.status = 'published'; handleSearch()"
        class="filter-tag"
      >
        已发布
      </el-tag>
      <el-tag 
        :type="filterForm.status === 'draft' ? 'warning' : 'info'" 
        @click="filterForm.status = 'draft'; handleSearch()"
        class="filter-tag"
      >
        草稿
      </el-tag>
    </div>

    <!-- 新增按钮 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Plus" @click="handleAdd">创作新文章</el-button>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div
        v-for="article in tableData"
        :key="article.id"
        class="article-item"
        @click="handleEdit(article)"
      >
        <div class="article-cover">
          <el-image :src="article.cover" fit="cover" class="cover-img">
            <template #error>
              <div class="cover-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <div class="article-content">
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <el-tag :type="article.status === 'published' ? 'success' : 'warning'" size="small">
              {{ article.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </div>
          <div class="article-meta">
            <span class="meta-item">
              <el-icon><Folder /></el-icon>
              {{ article.category }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ article.createTime }}
            </span>
          </div>
          <div class="article-tags" v-if="article.tags && article.tags.length > 0">
            <el-tag v-for="tag in article.tags" :key="tag" size="small" type="info" effect="plain">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="article-actions">
          <el-button type="primary" link :icon="Edit" @click.stop="handleEdit(article)">编辑</el-button>
          <el-button type="primary" link :icon="View" @click.stop="handlePreview(article)">预览</el-button>
          <el-button type="danger" link :icon="Delete" @click.stop="handleDelete(article)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more">
      <el-button v-if="hasMore" type="primary" plain @click="loadMore" :loading="loading">
        加载更多
      </el-button>
      <span v-else-if="tableData.length > 0" class="no-more">没有更多了</span>
      <span v-else class="no-more">暂无文章</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Plus, Delete, Edit, View, Picture, Folder, Clock } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const filterForm = reactive({
  title: '',
  category: '',
  status: ''
})

const loading = ref(false)
const total = ref(128)
const currentPage = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

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
  currentPage.value = 1
  // TODO: 调用后端接口查询数据
}

const loadMore = () => {
  currentPage.value++
  // TODO: 加载更多数据
}

const handleAdd = () => {
  // TODO: 跳转到文章发布页面或打开对话框
  ElMessage.info('跳转到文章发布页面')
}

const handleEdit = (row) => {
  // TODO: 跳转到文章编辑页面
  ElMessage.info('跳转到文章编辑页面')
}

const handlePreview = (row) => {
  // TODO: 跳转到前台文章详情页
  ElMessage.info('跳转到文章预览页面')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除文章 "${row.title}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    // TODO: 调用删除接口
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.mobile-article-manage {
  padding: 12px;
  background: var(--backstage-bg-color);
  min-height: 100vh;

  .search-bar {
    margin-bottom: 12px;
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

  .action-bar {
    margin-bottom: 16px;

    .el-button {
      width: 100%;
    }
  }

  .article-list {
    .article-item {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .article-cover {
        margin-bottom: 12px;

        .cover-img {
          width: 100%;
          height: 140px;
          border-radius: var(--backstage-radius-md);
          overflow: hidden;
        }

        .cover-placeholder {
          width: 100%;
          height: 140px;
          border-radius: var(--backstage-radius-md);
          background: var(--backstage-border-lighter);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--backstage-text-placeholder);

          .el-icon {
            font-size: 32px;
          }
        }
      }

      .article-content {
        margin-bottom: 12px;

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;

          .article-title {
            flex: 1;
            font-size: 15px;
            font-weight: 600;
            color: var(--backstage-text-primary);
            line-height: 1.4;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }

        .article-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 10px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--backstage-text-secondary);

            .el-icon {
              font-size: 13px;
            }
          }
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
      }

      .article-actions {
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
}
</style>
