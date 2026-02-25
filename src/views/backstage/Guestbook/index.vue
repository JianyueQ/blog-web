<template>
  <MobileGuestbook
    v-if="isMobile"
    ref="mobileRef"
  />
  <div
    v-else
    class="guestbook-manage"
  >
    <!-- 搜索区域 -->
    <div class="pro-card search-card">
      <div class="search-row">
        <div class="time-filter">
          <span class="filter-label">时间筛选：</span>
          <el-radio-group
            v-model="selectedTimeRange"
            size="small"
            @change="handleTimeRangeChange"
          >
            <el-radio-button value="">
              全部
            </el-radio-button>
            <el-radio-button value="today">
              今天
            </el-radio-button>
            <el-radio-button value="yesterday">
              昨天
            </el-radio-button>
            <el-radio-button value="last3days">
              近三天
            </el-radio-button>
            <el-radio-button value="last7days">
              近七天
            </el-radio-button>
            <el-radio-button value="last30days">
              近三十天
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="search-actions">
          <el-button
            type="primary"
            :icon="Search"
            @click="handleQuery"
          >
            搜索
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleReset"
          >
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="pro-card toolbar-card">
      <div class="toolbar-left">
        <!--        <el-button type="danger" plain @click="handleBatchDelete" :icon="Delete" :disabled="selectedIds.length === 0">-->
        <!--          批量删除-->
        <!--        </el-button>-->
      </div>
      <div class="toolbar-right">
        <el-button
          circle
          :icon="Refresh"
          title="刷新"
          :loading="loading"
          @click="fetchData"
        />
      </div>
    </div>

    <!-- 留言列表 -->
    <div class="pro-card message-list-card">
      <div
        v-loading="loading"
        class="message-list"
      >
        <div
          v-for="item in tableData"
          :key="item.guestbookId"
          class="message-item"
        >
          <!-- 根留言 -->
          <div class="root-message">
            <div class="message-header">
              <div class="user-info">
                <el-avatar
                  :size="40"
                  :src="item.avatar"
                  class="user-avatar"
                >
                  {{ item.nickname ? item.nickname.charAt(0).toUpperCase() : '?' }}
                </el-avatar>
                <div class="user-meta">
                  <div class="nickname-row">
                    <span class="nickname">{{ item.nickname }}</span>
                    <el-tag
                      v-if="item.status === 0"
                      type="danger"
                      size="small"
                      effect="light"
                    >
                      隐藏
                    </el-tag>
                    <!--                    <el-tag v-else-if="item.status === 2" type="warning" size="small" effect="light">审核中</el-tag>-->
                    <el-tag
                      v-else
                      type="success"
                      size="small"
                      effect="light"
                    >
                      显示
                    </el-tag>
                  </div>
                  <div class="meta-info">
                    <span
                      v-if="item.location"
                      class="location"
                    >
                      <el-icon><Location /></el-icon>
                      {{ item.location }}
                    </span>
                    <span class="time">
                      <el-icon><Clock /></el-icon>
                      {{ item.messageTime }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="message-actions">
                <el-dropdown
                  trigger="click"
                  @command="(cmd) => handleStatusChange(item, cmd)"
                >
                  <el-button
                    link
                    type="primary"
                    :icon="Switch"
                  >
                    状态
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="1"
                        :disabled="item.status === 1"
                      >
                        <el-icon><Check /></el-icon> 显示
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="0"
                        :disabled="item.status === 0"
                      >
                        <el-icon><Hide /></el-icon> 隐藏
                      </el-dropdown-item>
                      <!--                      <el-dropdown-item command="2" :disabled="item.status === 2">-->
                      <!--                        <el-icon><Warning /></el-icon> 审核中-->
                      <!--                      </el-dropdown-item>-->
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button
                  link
                  type="primary"
                  :icon="ChatLineRound"
                  @click="handleReply(item)"
                >
                  回复
                </el-button>
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  @click="handleDelete(item)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div class="message-content">
              {{ item.content }}
            </div>
            <!-- 展开回复按钮 -->
            <div
              v-if="item.replyList && item.replyList.length > 0"
              class="reply-toggle"
            >
              <el-button
                link
                type="primary"
                :icon="expandedRows.includes(item.guestbookId) ? ArrowUp : ArrowDown"
                @click="toggleReplies(item.guestbookId)"
              >
                {{ expandedRows.includes(item.guestbookId) ? '收起回复' : `展开 ${item.replyList.length} 条回复` }}
              </el-button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div
            v-if="item.replyList && item.replyList.length > 0 && expandedRows.includes(item.guestbookId)"
            class="reply-list"
          >
            <div
              v-for="reply in item.replyList"
              :key="reply.guestbookId"
              class="reply-item"
            >
              <div class="reply-avatar">
                <el-avatar
                  :size="32"
                  :src="reply.avatar"
                >
                  {{ reply.nickname ? reply.nickname.charAt(0).toUpperCase() : '?' }}
                </el-avatar>
              </div>
              <div class="reply-content-wrapper">
                <div class="reply-header">
                  <span class="reply-nickname">{{ reply.nickname }}</span>
                  <el-tag
                    v-if="reply.status === 0"
                    type="danger"
                    size="small"
                    effect="plain"
                  >
                    隐藏
                  </el-tag>
                  <el-tag
                    v-else-if="reply.status === 1"
                    type="success"
                    size="small"
                    effect="plain"
                  >
                    显示
                  </el-tag>
                  <span
                    v-if="reply.location"
                    class="reply-location"
                  >
                    <el-icon><Location /></el-icon>
                    {{ reply.location }}
                  </span>
                  <span class="reply-time">{{ reply.messageTime }}</span>
                </div>
                <!-- 显示回复对象 -->
                <div
                  v-if="reply.parentId !== 0 && reply.parentId !== item.guestbookId"
                  class="reply-to"
                >
                  <span class="reply-to-text">回复</span>
                  <span class="reply-to-nickname">{{ getReplyToNickname(item.replyList, reply.parentId) }}</span>
                </div>
                <div class="reply-content">
                  {{ reply.content }}
                </div>
                <div class="reply-actions">
                  <el-dropdown
                    trigger="click"
                    @command="(cmd) => handleStatusChange(reply, cmd)"
                  >
                    <el-button
                      link
                      type="primary"
                      size="small"
                    >
                      状态
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          command="1"
                          :disabled="reply.status === 1"
                        >
                          显示
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="0"
                          :disabled="reply.status === 0"
                        >
                          隐藏
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="handleReply(reply)"
                  >
                    回复
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="handleDelete(reply)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && tableData.length === 0"
          description="暂无留言数据"
        />
      </div>

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

    <!-- 回复弹窗 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复留言"
      width="600px"
      destroy-on-close
    >
      <div class="reply-dialog-content">
        <div class="original-message">
          <div class="original-header">
            <el-avatar
              :size="32"
              :src="currentReplyItem?.avatar"
            >
              {{ currentReplyItem?.nickname ? currentReplyItem.nickname.charAt(0).toUpperCase() : '?' }}
            </el-avatar>
            <span class="original-nickname">{{ currentReplyItem?.nickname }}</span>
          </div>
          <div class="original-text">
            {{ currentReplyItem?.content }}
          </div>
        </div>
        <el-divider />
        <el-form
          :model="replyForm"
          label-position="top"
        >
          <el-form-item
            label="回复内容"
            :rules="[{ required: true, message: '请输入回复内容', trigger: 'blur' }]"
          >
            <el-input
              v-model="replyForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入回复内容..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="replyDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="replyLoading"
          @click="submitReply"
        >
          确认回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete,
  ChatLineRound,
  Check,
  Hide,
  Switch,
  Clock,
  Location,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import {
  getGuestbookList,
  adminReplyMessage,
  updateGuestbookStatus,
  deleteGuestbook
} from '@/api/backstage/guestbook'
import MobileGuestbook from './MobileGuestbook.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'create_time',
  isAsc: 'desc'
})

// 时间筛选
const selectedTimeRange = ref('')

// 数据状态
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const expandedRows = ref([])

// 回复弹窗
const replyDialogVisible = ref(false)
const replyLoading = ref(false)
const currentReplyItem = ref(null)
const replyForm = reactive({
  content: ''
})

// 时间范围选项
const timeRangeOptions = {
  today: () => {
    const today = new Date()
    return {
      startTime: formatDateTime(getDayStart(today)),
      endTime: formatDateTime(getDayEnd(today))
    }
  },
  yesterday: () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      startTime: formatDateTime(getDayStart(yesterday)),
      endTime: formatDateTime(getDayEnd(yesterday))
    }
  },
  last3days: () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 2)
    return {
      startTime: formatDateTime(getDayStart(start)),
      endTime: formatDateTime(getDayEnd(end))
    }
  },
  last7days: () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6)
    return {
      startTime: formatDateTime(getDayStart(start)),
      endTime: formatDateTime(getDayEnd(end))
    }
  },
  last30days: () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 29)
    return {
      startTime: formatDateTime(getDayStart(start)),
      endTime: formatDateTime(getDayEnd(end))
    }
  }
}

// 获取一天的开始时间
function getDayStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// 获取一天的结束时间
function getDayEnd(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// 格式化日期时间
function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 时间范围变化
function handleTimeRangeChange(val) {
  if (val && timeRangeOptions[val]) {
    const range = timeRangeOptions[val]()
    queryParams.startTime = range.startTime
    queryParams.endTime = range.endTime
  } else {
    delete queryParams.startTime
    delete queryParams.endTime
  }
  handleQuery()
}

// 获取留言列表
async function fetchData() {
  loading.value = true
  try {
    const res = await getGuestbookList(queryParams)
    tableData.value = res.rows || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取留言列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
function handleQuery() {
  queryParams.pageNum = 1
  fetchData()
}

// 重置
function handleReset() {
  selectedTimeRange.value = ''
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  delete queryParams.startTime
  delete queryParams.endTime
  fetchData()
}

// 展开/收起回复
function toggleReplies(guestbookId) {
  const index = expandedRows.value.indexOf(guestbookId)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(guestbookId)
  }
}

// 修改状态
async function handleStatusChange(item, status) {
  try {
    await updateGuestbookStatus({
      guestbookId: item.guestbookId,
      status: parseInt(status)
    })
    ElMessage.success('状态修改成功')
    fetchData()
  } catch (error) {
    console.error('修改状态失败:', error)
  }
}

// 回复留言
function handleReply(item) {
  currentReplyItem.value = item
  replyForm.content = ''
  replyDialogVisible.value = true
}

// 提交回复
async function submitReply() {
  if (!replyForm.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replyLoading.value = true
  try {
    // 判断是回复根留言还是子评论
    const isRoot = currentReplyItem.value.isRoot === 1
    await adminReplyMessage({
      content: replyForm.content.trim(),
      rootId: isRoot ? currentReplyItem.value.guestbookId : currentReplyItem.value.rootId,
      parentId: currentReplyItem.value.guestbookId
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('回复失败:', error)
  } finally {
    replyLoading.value = false
  }
}

// 删除留言
function handleDelete(item) {
  ElMessageBox.confirm(`确定要删除该留言吗？${item.replyList && item.replyList.length > 0 ? '该留言下的所有回复也将被删除。' : ''}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteGuestbook(item.guestbookId)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}



// 获取回复对象的昵称
function getReplyToNickname(replyList, parentId) {
  const parent = replyList.find(r => r.guestbookId === parentId)
  return parent ? parent.nickname : '未知用户'
}

onMounted(() => {
  if (!isMobile.value) {
    fetchData()
  }
})
</script>

<style lang="scss" scoped>
.guestbook-manage {
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
      padding: 20px 24px;

      .search-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        .time-filter {
          display: flex;
          align-items: center;
          gap: 12px;

          .filter-label {
            font-size: 14px;
            color: var(--backstage-text-regular);
            font-weight: 500;
          }
        }

        .search-actions {
          display: flex;
          gap: 12px;
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

    &.message-list-card {
      padding: 0;
      overflow: hidden;

      .message-list {
        padding: 0;
      }
    }
  }

  // 留言项样式
  .message-item {
    border-bottom: 1px solid var(--backstage-border-color);
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--backstage-bg-color);
    }
  }

  // 根留言
  .root-message {
    padding: 20px 24px;

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .user-info {
        display: flex;
        gap: 12px;

        .user-avatar {
          flex-shrink: 0;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .nickname-row {
            display: flex;
            align-items: center;
            gap: 8px;

            .nickname {
              font-size: 15px;
              font-weight: 600;
              color: var(--backstage-text-primary);
            }
          }

          .meta-info {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: var(--backstage-text-secondary);

            .location,
            .time {
              display: flex;
              align-items: center;
              gap: 4px;

              .el-icon {
                font-size: 12px;
              }
            }
          }
        }
      }

      .message-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
    }

    .message-content {
      font-size: 14px;
      line-height: 1.8;
      color: var(--backstage-text-regular);
      padding-left: 52px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .reply-toggle {
      padding-left: 52px;
      margin-top: 12px;

      .el-button {
        font-size: 13px;
      }
    }
  }

  // 回复列表
  .reply-list {
    background-color: var(--backstage-bg-color);
    padding: 16px 24px 16px 76px;
    border-top: 1px dashed var(--backstage-border-color);

    .reply-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--backstage-border-light);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      &:first-child {
        padding-top: 0;
      }

      .reply-avatar {
        flex-shrink: 0;
      }

      .reply-content-wrapper {
        flex: 1;
        min-width: 0;

        .reply-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;

          .reply-nickname {
            font-size: 13px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }

          .reply-location {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--backstage-text-secondary);

            .el-icon {
              font-size: 12px;
            }
          }

          .reply-time {
            font-size: 12px;
            color: var(--backstage-text-secondary);
          }
        }

        .reply-to {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
          font-size: 12px;

          .reply-to-text {
            color: var(--backstage-text-secondary);
          }

          .reply-to-nickname {
            color: var(--backstage-primary);
            font-weight: 500;
          }
        }

        .reply-content {
          font-size: 13px;
          line-height: 1.7;
          color: var(--backstage-text-regular);
          margin-bottom: 8px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .reply-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  // 分页
  .pagination-container {
    padding: 20px;
    display: flex;
    justify-content: flex-end;
    background: var(--backstage-border-lighter);
    border-top: 1px solid var(--backstage-border-color);
  }

  // 回复弹窗
  .reply-dialog-content {
    .original-message {
      background-color: var(--backstage-bg-color);
      padding: 16px;
      border-radius: var(--backstage-radius-md);

      .original-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .original-nickname {
          font-size: 14px;
          font-weight: 600;
          color: var(--backstage-text-primary);
        }
      }

      .original-text {
        font-size: 14px;
        color: var(--backstage-text-regular);
        line-height: 1.6;
        padding-left: 42px;
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
}
</style>
