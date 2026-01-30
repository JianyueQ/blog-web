<template>
  <div class="upload-manage">
    <div class="pro-card upload-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">媒体资源上传</span>
          <span class="subtitle">支持图片、文档、压缩包等多种格式</span>
        </div>
      </div>
      <div class="card-body">
        <el-upload
          class="pro-upload-dragger"
          drag
          action="https://run.mocky.io/v3/9d059008-91bb-4d27-8c75-76e3c0ea956c"
          multiple
          :on-success="handleSuccess"
          :on-error="handleError"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              单个文件不超过 50MB，支持拖拽批量上传
            </div>
          </template>
        </el-upload>

        <div class="upload-options mt-30">
          <el-form label-position="top">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="默认分类">
                  <el-select v-model="uploadConfig.category" placeholder="请选择资源分类" style="width: 100%">
                    <el-option label="默认库" value="default" />
                    <el-option label="文章配图" value="article" />
                    <el-option label="系统资源" value="system" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="水印设置">
                  <el-switch v-model="uploadConfig.watermark" active-text="自动添加文字水印" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 最近上传记录 -->
    <div class="pro-card mt-20">
      <div class="card-header">
        <span class="title">本次上传记录</span>
      </div>
      <div class="card-body">
        <el-table :data="recentUploads" style="width: 100%">
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column prop="size" label="大小" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'success' ? 'success' : 'info'" size="small">
                {{ scope.row.status === 'success' ? '已完成' : '等待中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default>
              <div class="button-row">
                <el-button link type="primary">复制链接</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const uploadConfig = reactive({
  category: 'default',
  watermark: false
})

const recentUploads = ref([
  { name: 'config-backup-2026.json', size: '12KB', status: 'success' },
  { name: 'hero-image-new.jpg', size: '2.4MB', status: 'success' }
])

const handleSuccess = (res, file) => {
  // TODO: 使用 ElMessage.success('文件上传成功')
}

const handleError = (err) => {
  // TODO: 使用 ElMessage.error('上传失败，请重试')
}
</script>

<style scoped lang="scss">
.upload-manage {
  .mt-20 { margin-top: 20px; }
  .mt-30 { margin-top: 30px; }

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

  .pro-upload-dragger {
    :deep(.el-upload-dragger) {
      background-color: var(--backstage-border-lighter);
      border: 2px dashed var(--backstage-border-color);
      border-radius: var(--backstage-radius-lg);
      padding: 40px;
      transition: all 0.3s;

      &:hover {
        border-color: var(--backstage-primary);
        background-color: var(--backstage-primary-lighter);
      }

      .el-icon--upload {
        color: var(--backstage-text-placeholder);
        font-size: 64px;
        margin-bottom: 16px;
      }

      .el-upload__text {
        color: var(--backstage-text-regular);
        em {
          color: var(--backstage-primary);
          font-weight: 600;
          font-style: normal;
        }
      }
    }
  }

  .upload-options {
    padding: 20px;
    background: var(--backstage-border-lighter);
    border-radius: var(--backstage-radius-lg);
  }
}
</style>
