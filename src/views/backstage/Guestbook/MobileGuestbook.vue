<template>
  <div class="mobile-guestbook-manage">
    <!-- 搜索区域 -->
    <div class="mobile-search-card">
      <div class="time-filter">
        <span class="filter-label">时间筛选</span>
        <el-select v-model="selectedTimeRange" placeholder="选择时间范围" size="small" @change="handleTimeRangeChange">
          <el-option label="全部" value="" />
          <el-option label="今天" value="today" />
          <el-option label="昨天" value="yesterday" />
          <el-option label="近三天" value="last3days" />
          <el-option label="近七天" value="last7days" />
          <el-option label="近三十天" value="last30days" />
        </el-select>
      </div>
      <div class="search-actions">
        <el-button type="primary" size="small" @click="handleQuery" :icon="Search">搜索</el-button>
        <el-button size="small" @click="handleReset" :icon="Refresh">重置</el-button>
      </div>
    </div>

    <!-- 留言列表 -->
    <div class="mobile-message-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-for="item in tableData" :key="item.guestbookId" class="mobile-message-item">
            <!-- 根留言 -->
            <div class="mobile-root-message">
              <div class="message-header">
                <van-image
                  round
                  width="40"
                  height="40"
                  :src="item.avatar"
                >
                  <template #error><van-icon name="user-circle-o" size="40" /></template>
                </van-image>
                <div class="user-meta">
                  <div class="nickname-row">
                    <span class="nickname">{{ item.nickname }}</span>
                    <van-tag v-if="item.status === 0" type="danger" size="small">隐藏</van-tag>
                    <van-tag v-else-if="item.status === 2" type="warning" size="small">审核中</van-tag>
                    <van-tag v-else type="success" size="small">显示</van-tag>
                  </div>
                  <div class="meta-info">
                    <span v-if="item.location" class="location">{{ item.location }}</span>
                    <span class="time">{{ item.messageTime }}</span>
                  </div>
                </div>
              </div>
              <div class="message-content">
                {{ item.content }}
              </div>
              <div class="message-actions">
                <van-button size="small" type="primary" plain @click="handleReply(item)" icon="chat-o">
                  回复
                </van-button>
                <van-button size="small" type="warning" plain @click="showStatusAction(item)" icon="setting-o">
                  状态
                </van-button>
                <van-button size="small" type="danger" plain @click="handleDelete(item)" icon="delete-o">
                  删除
                </van-button>
              </div>
              
              <!-- 展开回复按钮 -->
              <div v-if="item.replyList && item.replyList.length > 0" class="reply-toggle">
                <van-button 
                  size="small" 
                  type="primary" 
                  plain 
                  hairline
                  @click="toggleReplies(item.guestbookId)"
                  :icon="expandedRows.includes(item.guestbookId) ? 'arrow-up' : 'arrow-down'"
                >
                  {{ expandedRows.includes(item.guestbookId) ? '收起回复' : `展开 ${item.replyList.length} 条回复` }}
                </van-button>
              </div>
            </div>
            
            <!-- 回复列表 -->
            <div v-if="item.replyList && item.replyList.length > 0 && expandedRows.includes(item.guestbookId)" class="mobile-reply-list">
              <div v-for="reply in item.replyList" :key="reply.guestbookId" class="mobile-reply-item">
                <van-image
                  round
                  width="32"
                  height="32"
                  :src="reply.avatar"
                >
                  <template #error><van-icon name="user-circle-o" size="32" /></template>
                </van-image>
                <div class="reply-content-wrapper">
                  <div class="reply-header">
                    <span class="reply-nickname">{{ reply.nickname }}</span>
                    <van-tag v-if="reply.status === 0" type="danger" size="small">隐藏</van-tag>
                    <van-tag v-else-if="reply.status === 1" type="success" size="small">显示</van-tag>
                    <span v-if="reply.location" class="reply-location">{{ reply.location }}</span>
                    <span class="reply-time">{{ reply.messageTime }}</span>
                  </div>
                  <!-- 显示回复对象 -->
                  <div v-if="reply.parentId !== 0 && reply.parentId !== item.guestbookId" class="reply-to">
                    <span class="reply-to-text">回复</span>
                    <span class="reply-to-nickname">{{ getReplyToNickname(item.replyList, reply.parentId) }}</span>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                  <div class="reply-actions">
                    <van-button size="mini" type="warning" plain @click="showStatusAction(reply)">状态</van-button>
                    <van-button size="mini" type="primary" plain @click="handleReply(reply)">回复</van-button>
                    <van-button size="mini" type="danger" plain @click="handleDelete(reply)">删除</van-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 回复弹窗 -->
    <van-popup v-model:show="replyPopupVisible" position="bottom" round :style="{ height: '50%' }">
      <div class="reply-popup">
        <div class="popup-header">
          <span class="title">回复留言</span>
          <van-icon name="cross" @click="replyPopupVisible = false" />
        </div>
        <div class="popup-content">
          <div class="original-message">
            <div class="original-header">
              <van-image round width="32" height="32" :src="currentReplyItem?.avatar">
                <template #error><van-icon name="user-circle-o" size="32" /></template>
              </van-image>
              <span class="original-nickname">{{ currentReplyItem?.nickname }}</span>
            </div>
            <div class="original-text">{{ currentReplyItem?.content }}</div>
          </div>
          <van-field
            v-model="replyForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入回复内容..."
            maxlength="500"
            show-word-limit
          />
        </div>
        <div class="popup-footer">
          <van-button type="default" block @click="replyPopupVisible = false">取消</van-button>
          <van-button type="primary" block @click="submitReply" :loading="replyLoading">确认回复</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 状态选择弹窗 -->
    <van-action-sheet
      v-model:show="statusActionVisible"
      :actions="statusActions"
      cancel-text="取消"
      close-on-click-action
      @select="onStatusSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showDialog, showLoadingToast, closeToast } from 'vant'
import {
  Search,
  Refresh
} from '@element-plus/icons-vue'
import {
  getGuestbookList,
  adminReplyMessage,
  updateGuestbookStatus,
  deleteGuestbook
} from '@/api/backstage/guestbook'

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
const refreshing = ref(false)
const finished = ref(false)
const tableData = ref([])
const total = ref(0)
const expandedRows = ref([])

// 回复弹窗
const replyPopupVisible = ref(false)
const replyLoading = ref(false)
const currentReplyItem = ref(null)
const replyForm = reactive({
  content: ''
})

// 状态选择
const statusActionVisible = ref(false)
const currentStatusItem = ref(null)
const statusActions = [
  { name: '显示', value: '1', icon: 'success' },
  { name: '隐藏', value: '0', icon: 'close' },
  { name: '审核中', value: '2', icon: 'warning' }
]

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
    const rows = res.rows || []
    total.value = res.total || 0
    
    if (queryParams.pageNum === 1) {
      tableData.value = rows
    } else {
      tableData.value.push(...rows)
    }
    
    finished.value = rows.length < queryParams.pageSize || tableData.value.length >= total.value
  } catch (error) {
    console.error('获取留言列表失败:', error)
    showToast('获取数据失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
function onRefresh() {
  queryParams.pageNum = 1
  finished.value = false
  fetchData()
}

// 加载更多
function onLoad() {
  queryParams.pageNum++
  fetchData()
}

// 搜索
function handleQuery() {
  queryParams.pageNum = 1
  finished.value = false
  tableData.value = []
  fetchData()
}

// 重置
function handleReset() {
  selectedTimeRange.value = ''
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  delete queryParams.startTime
  delete queryParams.endTime
  finished.value = false
  tableData.value = []
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

// 显示状态选择
function showStatusAction(item) {
  currentStatusItem.value = item
  statusActionVisible.value = true
}

// 状态选择
async function onStatusSelect(action) {
  if (!currentStatusItem.value) return
  
  showLoadingToast({ message: '修改中...', forbidClick: true })
  try {
    await updateGuestbookStatus({
      guestbookId: currentStatusItem.value.guestbookId,
      status: parseInt(action.value)
    })
    closeToast()
    showToast('状态修改成功')
    fetchData()
  } catch (error) {
    closeToast()
    console.error('修改状态失败:', error)
    showToast('修改失败')
  }
}

// 回复留言
function handleReply(item) {
  currentReplyItem.value = item
  replyForm.content = ''
  replyPopupVisible.value = true
}

// 提交回复
async function submitReply() {
  if (!replyForm.content.trim()) {
    showToast('请输入回复内容')
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
    showToast('回复成功')
    replyPopupVisible.value = false
    fetchData()
  } catch (error) {
    console.error('回复失败:', error)
    showToast('回复失败')
  } finally {
    replyLoading.value = false
  }
}

// 删除留言
function handleDelete(item) {
  showDialog({
    title: '提示',
    message: `确定要删除该留言吗？${item.replyList && item.replyList.length > 0 ? '该留言下的所有回复也将被删除。' : ''}`,
    showCancelButton: true
  }).then(async () => {
    showLoadingToast({ message: '删除中...', forbidClick: true })
    try {
      await deleteGuestbook(item.guestbookId)
      closeToast()
      showToast('删除成功')
      fetchData()
    } catch (error) {
      closeToast()
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }).catch(() => {})
}

// 获取回复对象的昵称
function getReplyToNickname(replyList, parentId) {
  const parent = replyList.find(r => r.guestbookId === parentId)
  return parent ? parent.nickname : '未知用户'
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.mobile-guestbook-manage {
  min-height: 100vh;
  background-color: var(--backstage-bg-color);
  padding: 12px;

  .mobile-search-card {
    background: var(--backstage-card-bg);
    border-radius: var(--backstage-radius-lg);
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: var(--backstage-shadow-light);

    .time-filter {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .filter-label {
        font-size: 14px;
        color: var(--backstage-text-regular);
        white-space: nowrap;
      }

      :deep(.el-select) {
        flex: 1;
      }
    }

    .search-actions {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
      }
    }
  }

  .mobile-message-list {
    .mobile-message-item {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);
      overflow: hidden;
    }
  }

  .mobile-root-message {
    padding: 16px;

    .message-header {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;

      .user-meta {
        flex: 1;
        min-width: 0;

        .nickname-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .nickname {
            font-size: 15px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }
        }

        .meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12px;
          color: var(--backstage-text-secondary);

          .location {
            color: var(--backstage-primary);
          }
        }
      }
    }

    .message-content {
      font-size: 14px;
      line-height: 1.7;
      color: var(--backstage-text-regular);
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .message-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;

      .van-button {
        flex: 1;
      }
    }

    .reply-toggle {
      display: flex;
      justify-content: center;

      .van-button {
        width: 100%;
      }
    }
  }

  .mobile-reply-list {
    background-color: var(--backstage-bg-color);
    padding: 12px 16px;
    border-top: 1px dashed var(--backstage-border-color);

    .mobile-reply-item {
      display: flex;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid var(--backstage-border-light);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      &:first-child {
        padding-top: 0;
      }

      .reply-content-wrapper {
        flex: 1;
        min-width: 0;

        .reply-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          flex-wrap: wrap;

          .reply-nickname {
            font-size: 13px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }

          .reply-location {
            font-size: 11px;
            color: var(--backstage-primary);
          }

          .reply-time {
            font-size: 11px;
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
          line-height: 1.6;
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

  .reply-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--backstage-border-color);

      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
    }

    .popup-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;

      .original-message {
        background-color: var(--backstage-bg-color);
        padding: 12px;
        border-radius: var(--backstage-radius-md);
        margin-bottom: 16px;

        .original-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .original-nickname {
            font-size: 14px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }
        }

        .original-text {
          font-size: 13px;
          color: var(--backstage-text-regular);
          line-height: 1.5;
          padding-left: 40px;
        }
      }
    }

    .popup-footer {
      padding: 16px;
      border-top: 1px solid var(--backstage-border-color);
      display: flex;
      gap: 12px;

      .van-button {
        flex: 1;
      }
    }
  }
}
</style>
