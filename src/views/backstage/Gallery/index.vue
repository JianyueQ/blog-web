<template>
  <div class="gallery-manage">
    <div class="pro-card toolbar-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">视觉素材库</span>
          <span class="subtitle">共检索到 {{ total }} 项媒体资源</span>
        </div>
        <div class="header-right button-row">
          <el-button
            type="primary"
            round
            :icon="Upload"
            @click="handleUpload"
          >
            上传资源
          </el-button>
          <el-button
            type="danger"
            round
            :icon="Delete"
            plain
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <el-form
          :inline="true"
          :model="filterForm"
          class="filter-form"
        >
          <el-form-item label="资源名称">
            <el-input
              v-model="filterForm.name"
              placeholder="搜索资源"
              clearable
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="filterForm.type"
              placeholder="全部类型"
              clearable
              style="width: 120px"
            >
              <el-option
                label="图片"
                value="image"
              />
              <el-option
                label="视频"
                value="video"
              />
              <el-option
                label="文档"
                value="doc"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              round
              :icon="Search"
              @click="handleSearch"
            >
              检索
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="media-grid mt-20">
      <el-row :gutter="20">
        <el-col
          v-for="item in mediaList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <div class="media-item slide-in">
            <div class="media-preview">
              <el-image
                :src="item.url"
                fit="cover"
                lazy
              >
                <template #placeholder>
                  <div class="image-slot">
                    加载中...
                  </div>
                </template>
              </el-image>
              <div class="media-overlay">
                <div class="actions">
                  <el-icon @click="handlePreview(item)">
                    <ZoomIn />
                  </el-icon>
                  <el-icon @click="handleCopyUrl(item)">
                    <CopyDocument />
                  </el-icon>
                  <el-icon @click="handleDelete(item)">
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </div>
            <div class="media-info">
              <div
                class="name"
                :title="item.name"
              >
                {{ item.name }}
              </div>
              <div class="meta">
                <span>{{ item.size }}</span>
                <span>{{ item.date }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="pagination-container mt-20">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Upload, Delete, ZoomIn, CopyDocument } from '@element-plus/icons-vue'

const filterForm = reactive({
  name: '',
  type: ''
})

const total = ref(48)
const currentPage = ref(1)
const pageSize = ref(12)

const mediaList = ref([
  { id: 1, name: 'banner-01.jpg', url: 'https://placeholder.com/300x200', size: '1.2MB', date: '2026-01-28' },
  { id: 2, name: 'avatar-admin.png', url: 'https://placeholder.com/300x200', size: '450KB', date: '2026-01-27' },
  { id: 3, name: 'post-cover-05.webp', url: 'https://placeholder.com/300x200', size: '890KB', date: '2026-01-26' },
  { id: 4, name: 'logo-vector.svg', url: 'https://placeholder.com/300x200', size: '12KB', date: '2026-01-25' },
  { id: 5, name: 'landscape-winter.jpg', url: 'https://placeholder.com/300x200', size: '3.5MB', date: '2026-01-24' },
  { id: 6, name: 'code-snippet.png', url: 'https://placeholder.com/300x200', size: '1.1MB', date: '2026-01-23' }
])

const handleSearch = () => {
  // TODO: 调用后端接口搜索资源
}

const handleUpload = () => {
  // TODO: 跳转到上传页面或打开上传对话框
}

const handleBatchDelete = () => {
  // TODO: 使用 ElMessageBox.confirm 批量删除
}

const handlePreview = () => {
  // TODO: 使用 ElImageViewer 预览大图
}

const handleCopyUrl = () => {
  // TODO: 复制 URL 到剪贴板，使用 ElMessage 反馈
}

const handleDelete = () => {
  // TODO: 使用 ElMessageBox.confirm 确认删除
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped lang="scss">
.gallery-manage {
  .mt-20 { margin-top: 20px; }

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
  }

  .filter-form {
    padding: 16px 24px;
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .media-item {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-lg);
    overflow: hidden;
    transition: all 0.3s;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-5px);
      box-shadow: var(--backstage-shadow-base);
      
      .media-overlay {
        opacity: 1;
      }
    }

    .media-preview {
      position: relative;
      height: 160px;
      background: var(--backstage-border-lighter);
      
      .el-image {
        width: 100%;
        height: 100%;
      }

      .media-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        .actions {
          display: flex;
          gap: 20px;
          .el-icon {
            font-size: 20px;
            color: #fff;
            cursor: pointer;
            &:hover {
              color: var(--backstage-primary);
              transform: scale(1.2);
            }
          }
        }
      }
    }

    .media-info {
      padding: 12px;
      .name {
        font-size: 13px;
        font-weight: 500;
        color: var(--backstage-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }
      .meta {
        font-size: 11px;
        color: var(--backstage-text-placeholder);
        display: flex;
        justify-content: space-between;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
  }
}
</style>
