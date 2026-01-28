<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card slide-in delay-100">
          <div class="stats-content">
            <div class="stats-icon" style="background: var(--backstage-gradient-primary);">
              <el-icon :size="30"><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">文章总数</div>
              <div class="stats-value count-up">128</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card slide-in delay-200">
          <div class="stats-content">
            <div class="stats-icon" style="background: var(--backstage-gradient-success);">
              <el-icon :size="30"><View /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">总访问量</div>
              <div class="stats-value count-up">5,268</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card slide-in delay-300">
          <div class="stats-content">
            <div class="stats-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
              <el-icon :size="30"><ChatDotRound /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">评论总数</div>
              <div class="stats-value count-up">342</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card slide-in delay-400">
          <div class="stats-content">
            <div class="stats-icon" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);">
              <el-icon :size="30"><Link /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">友链数量</div>
              <div class="stats-value count-up">18</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :xs="24" :lg="16">
        <el-card class="slide-in delay-300">
          <template #header>
            <div class="card-header">
              <span>最近文章</span>
            </div>
          </template>
          <el-table :data="recentArticles" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="date" label="发布时间" width="180" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="slide-in delay-400">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" :icon="Edit" @click="handleAction('写文章')" class="btn-hover">写文章</el-button>
            <el-button type="success" :icon="Upload" @click="handleAction('上传图片')" class="btn-hover">上传图片</el-button>
            <el-button type="warning" :icon="Setting" @click="handleAction('系统设置')" class="btn-hover">系统设置</el-button>
            <el-button type="info" :icon="View" @click="handleAction('查看网站')" class="btn-hover">查看网站</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, View, ChatDotRound, Link, Edit, Upload, Setting } from '@element-plus/icons-vue'

const recentArticles = ref([
  { title: '欢迎使用简悦博客后台管理系统', category: '公告', date: '2026-01-28 10:00:00' },
  { title: 'Vue3 开发实战技巧分享', category: '技术', date: '2026-01-27 15:30:00' },
  { title: 'Element Plus 组件使用指南', category: '教程', date: '2026-01-26 09:20:00' },
  { title: '博客系统性能优化实践', category: '技术', date: '2026-01-25 14:15:00' },
  { title: '前端工程化最佳实践', category: '技术', date: '2026-01-24 11:45:00' }
])

const handleAction = (action) => {
  ElMessage.info(`${action}功能开发中...`)
}
</script>

<style scoped lang="scss">
.dashboard-container {
  .stats-card {
    margin-bottom: 24px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--backstage-border-light);

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: var(--backstage-shadow-hover);
      border-color: var(--backstage-primary-light);
    }

    :deep(.el-card__body) {
      background-color: var(--backstage-card-bg) !important;
      padding: 28px !important;
      position: relative;
      overflow: hidden;
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 2;

      .stats-icon {
        width: 72px;
        height: 72px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: var(--backstage-shadow-base);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        &:hover::before {
          left: 100%;
        }

        :deep(.el-icon) {
          font-size: 32px;
          transition: transform 0.3s ease;
        }

        &:hover :deep(.el-icon) {
          transform: scale(1.1);
        }
      }

      .stats-info {
        flex: 1;

        .stats-label {
          font-size: 14px;
          color: var(--backstage-text-secondary);
          margin-bottom: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-value {
          font-size: 32px;
          font-weight: bold;
          color: var(--backstage-text-primary);
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          transition: color 0.3s ease;
        }

        &:hover .stats-value {
          color: var(--backstage-primary);
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: var(--backstage-text-primary);
    font-size: 18px;
    padding: 0 8px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 8px;
      width: 40px;
      height: 3px;
      background: var(--backstage-primary);
      border-radius: 2px;
    }
  }

  :deep(.el-card) {
    border-radius: 16px;
    box-shadow: var(--backstage-shadow-base);
    transition: all 0.3s ease;
    border: 1px solid var(--backstage-border-light);

    &:hover {
      box-shadow: var(--backstage-shadow-hover);
      border-color: var(--backstage-primary-light);
    }

    .el-card__header {
      background-color: var(--backstage-card-bg);
      border-bottom: 1px solid var(--backstage-border-light);
      padding: 20px 24px;
      border-radius: 16px 16px 0 0;
    }

    .el-card__body {
      padding: 24px;
      border-radius: 0 0 16px 16px;
    }
  }

  :deep(.el-table) {
    background-color: transparent;
    border-radius: 12px;
    overflow: hidden;

    th {
      background-color: var(--backstage-card-bg);
      color: var(--backstage-text-primary);
      font-weight: 600;
      font-size: 14px;
      padding: 16px;
      border-bottom: 1px solid var(--backstage-border-light);
    }

    td {
      color: var(--backstage-text-regular);
      font-size: 14px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--backstage-border-lighter);
      transition: all 0.3s ease;
    }

    tr {
      transition: all 0.3s ease;
    }

    tr:hover > td {
      background-color: var(--backstage-card-hover-bg) !important;
      transform: translateX(4px);
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .el-button {
      width: 100%;
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid transparent;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
      }

      &:hover::before {
        left: 100%;
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--backstage-shadow-hover);
      }

      &:active {
        transform: translateY(0);
      }

      &.el-button--primary {
        background: var(--backstage-gradient-primary);
        border-color: transparent;

        &:hover {
          background: var(--backstage-gradient-primary);
          opacity: 0.95;
        }
      }

      &.el-button--success {
        background: var(--backstage-gradient-success);
        border-color: transparent;

        &:hover {
          background: var(--backstage-gradient-success);
          opacity: 0.95;
        }
      }

      &.el-button--warning {
        background: var(--backstage-warning);
        border-color: transparent;

        &:hover {
          background: var(--backstage-warning-light);
        }
      }

      &.el-button--info {
        background: var(--backstage-info);
        border-color: transparent;

        &:hover {
          background: var(--backstage-info-light);
        }
      }
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  .dashboard-container {
    .stats-card {
      .stats-content {
        .stats-icon {
          width: 56px;
          height: 56px;
        }

        .stats-info {
          .stats-value {
            font-size: 24px;
          }
        }
      }
    }
  }
}
</style>
