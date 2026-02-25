<template>
  <div class="comment-manage">
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">评论互动管理</span>
          <span class="subtitle">管理全站读者的留言与反馈</span>
        </div>
        <div class="header-right">
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
        <el-table
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            label="评论者"
            width="180"
          >
            <template #default="scope">
              <div class="user-info">
                <el-avatar
                  :size="32"
                  :src="scope.row.avatar"
                />
                <div class="details">
                  <span class="name">{{ scope.row.nickname }}</span>
                  <span class="ip">{{ scope.row.ip }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="评论内容"
            min-width="300"
          >
            <template #default="scope">
              <div class="comment-content">
                <div class="text">
                  {{ scope.row.content }}
                </div>
                <div class="target">
                  源自文章：<el-link
                    type="primary"
                    :underline="false"
                  >
                    《{{ scope.row.articleTitle }}》
                  </el-link>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="100"
          >
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'approved' ? 'success' : 'warning'"
                size="small"
              >
                {{ scope.row.status === 'approved' ? '已通过' : '待审核' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="时间"
            width="180"
          />
          <el-table-column
            label="操作"
            width="220"
            fixed="right"
          >
            <template #default="scope">
              <div class="button-row">
                <el-button
                  v-if="scope.row.status === 'pending'"
                  link
                  type="primary"
                  :icon="Check"
                  @click="handleApprove(scope.row)"
                >
                  通过
                </el-button>
                <el-button
                  link
                  type="primary"
                  :icon="ChatLineRound"
                  @click="handleReply(scope.row)"
                >
                  回复
                </el-button>
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Check, ChatLineRound, Delete } from '@element-plus/icons-vue'

const total = ref(256)
const currentPage = ref(1)
const pageSize = ref(10)

const tableData = ref([
  {
    id: 1,
    nickname: '技术爱好者',
    avatar: 'https://placeholder.com/32',
    ip: '192.168.1.1 (上海)',
    content: '这篇文章写得太棒了，对我很有启发！希望能看到更多关于 Vue3 的深入探讨。',
    articleTitle: 'Vue3 开发实战：从零构建高性能后台',
    status: 'approved',
    createTime: '2026-01-29 11:20:00'
  },
  {
    id: 2,
    nickname: '路人甲',
    avatar: '',
    ip: '110.12.33.45 (北京)',
    content: '博主大大，这个 UI 样式是怎么实现的？能分享一下源码吗？',
    articleTitle: 'PRO MAX 2.0 视觉更新说明',
    status: 'pending',
    createTime: '2026-01-29 09:45:00'
  }
])

const handleApprove = () => {
  // TODO: 调用后端接口通过审核
}

const handleReply = () => {
  // TODO: 弹出对话框输入回复内容
}

const handleDelete = () => {
  // TODO: 使用 ElMessageBox.confirm 确认删除
}

const handleBatchDelete = () => {
  // TODO: 使用 ElMessageBox.confirm 批量删除
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped lang="scss">
.comment-manage {
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
    
    .card-body {
      padding: 24px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    .details {
      display: flex;
      flex-direction: column;
      .name {
        font-size: 13px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
      .ip {
        font-size: 11px;
        color: var(--backstage-text-placeholder);
      }
    }
  }

  .comment-content {
    .text {
      font-size: 13px;
      color: var(--backstage-text-regular);
      line-height: 1.6;
      margin-bottom: 6px;
    }
    .target {
      font-size: 11px;
      color: var(--backstage-text-placeholder);
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
