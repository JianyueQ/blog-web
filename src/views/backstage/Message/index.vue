<template>
  <div class="message-manage">
    <div class="pro-card table-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">消息通知管理</span>
          <span class="subtitle">管理系统消息与实时通知</span>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            round
            :icon="Check"
            plain
            :disabled="unreadCount === 0"
            @click="handleMarkAllRead"
          >
            全部已读
          </el-button>
          <el-button
            type="danger"
            round
            :icon="Delete"
            plain
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterStatus" @change="handleFilterChange">
            <el-radio-button value="all">全部消息</el-radio-button>
            <el-radio-button value="unread">
              未读消息
              <el-badge v-if="unreadCount > 0" :value="unreadCount" class="filter-badge" />
            </el-radio-button>
            <el-radio-button value="read">已读消息</el-radio-button>
          </el-radio-group>
          <el-button type="danger" link :icon="DeleteFilled" @click="handleCleanAll">
            清空全部
          </el-button>
        </div>

        <!-- 消息列表 -->
        <el-table
          :data="tableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="消息类型" width="120">
            <template #default="scope">
              <div class="message-type">
                <el-icon :size="16" :color="getMessageTypeColor(scope.row.messageType)">
                  <component :is="getMessageTypeIcon(scope.row.messageType)" />
                </el-icon>
                <el-tag :type="getMessageTypeTag(scope.row.messageType)" size="small">
                  {{ getMessageTypeText(scope.row.messageType) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="消息标题" min-width="200">
            <template #default="scope">
              <div class="message-title" :class="{ unread: scope.row.isRead === 0 }">
                {{ scope.row.messageTitle }}
                <el-tag v-if="scope.row.isRead === 0" type="danger" size="small" effect="dark">
                  未读
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="消息内容" min-width="300">
            <template #default="scope">
              <div class="message-content">{{ scope.row.messageContent }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.isRead === 1 ? 'success' : 'warning'" size="small">
                {{ scope.row.isRead === 1 ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="阅读时间" width="180">
            <template #default="scope">
              <span v-if="scope.row.readTime">{{ scope.row.readTime }}</span>
              <span v-else class="text-placeholder">--</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <div class="button-row">
                <el-button
                  v-if="scope.row.isRead === 0"
                  link
                  type="primary"
                  :icon="Check"
                  @click="handleMarkRead(scope.row)"
                >
                  标为已读
                </el-button>
                <el-button
                  link
                  type="primary"
                  :icon="View"
                  @click="handleViewDetail(scope.row)"
                >
                  查看
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

        <!-- 分页 -->
        <div class="pagination-container mt-20">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="消息详情"
      width="500px"
      destroy-on-close
    >
      <div class="message-detail" v-if="currentMessage">
        <div class="detail-header">
          <el-icon :size="24" :color="getMessageTypeColor(currentMessage.messageType)">
            <component :is="getMessageTypeIcon(currentMessage.messageType)" />
          </el-icon>
          <div class="detail-title">
            <h3>{{ currentMessage.messageTitle }}</h3>
            <el-tag :type="getMessageTypeTag(currentMessage.messageType)" size="small">
              {{ getMessageTypeText(currentMessage.messageType) }}
            </el-tag>
          </div>
        </div>
        <div class="detail-content">
          <p>{{ currentMessage.messageContent }}</p>
        </div>
        <div class="detail-footer">
          <div class="detail-time">
            <span>创建时间：{{ currentMessage.createTime }}</span>
            <span v-if="currentMessage.readTime">阅读时间：{{ currentMessage.readTime }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentMessage && currentMessage.isRead === 0"
            type="primary"
            @click="handleMarkReadAndClose"
          >
            标为已读
          </el-button>
          <el-button
            type="primary"
            @click="handleGoToPage"
          >
            前往处理
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  Delete,
  DeleteFilled,
  View,
  InfoFilled,
  ChatDotRound,
  Link,
  Message
} from '@element-plus/icons-vue'
import WebSocketManager from '@/utils/websocket.js'
import {
  getMessageList,
  getUnreadMessageList,
  getReadMessageList,
  updateMessageReadStatus,
  deleteMessage,
  cleanMessage
} from '@/api/backstage/messageRecord.js'

const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filterStatus = ref('all')
const selectedIds = ref([])
const unreadCount = ref(0)
const detailDialogVisible = ref(false)
const currentMessage = ref(null)
const wsManager = ref(null)
// WebSocket待处理请求队列
const wsPendingRequests = ref(new Map())

// 消息类型映射
const messageTypeMap = {
  'SYSTEM': { icon: 'InfoFilled', text: '系统', tag: 'info', color: '#909399', route: '/backstage/config' },
  'COMMENT': { icon: 'ChatDotRound', text: '评论', tag: 'success', color: '#67C23A', route: '/backstage/comment' },
  'GUESTBOOK': { icon: 'Message', text: '留言', tag: 'warning', color: '#E6A23C', route: '/backstage/guestbook' },
  'FRIEND_LINK': { icon: 'Link', text: '友链', tag: 'primary', color: '#409EFF', route: '/backstage/links' },
  'FRIEND_LINKS': { icon: 'Link', text: '友链', tag: 'primary', color: '#409EFF', route: '/backstage/links' },
  'OTHER': { icon: 'InfoFilled', text: '其他', tag: 'info', color: '#909399', route: '/backstage/home' }
}

// 获取消息类型图标
const getMessageTypeIcon = (type) => {
  return messageTypeMap[type]?.icon || 'InfoFilled'
}

// 获取消息类型文本
const getMessageTypeText = (type) => {
  return messageTypeMap[type]?.text || '其他'
}

// 获取消息类型标签样式
const getMessageTypeTag = (type) => {
  return messageTypeMap[type]?.tag || 'info'
}

// 获取消息类型颜色
const getMessageTypeColor = (type) => {
  return messageTypeMap[type]?.color || '#909399'
}

// 获取消息类型对应的路由
const getMessageTypeRoute = (type) => {
  return messageTypeMap[type]?.route || '/backstage/home'
}

// 检查WebSocket是否连接
const isWsConnected = () => {
  return wsManager.value && wsManager.value.isConnected()
}

// 通过WebSocket发送消息状态更新
const sendWsMessageStatusUpdate = (messageId, isRead) => {
  return new Promise((resolve, reject) => {
    if (!isWsConnected()) {
      reject(new Error('WebSocket未连接'))
      return
    }
    
    const requestId = `${messageId}_${Date.now()}`
    const requestData = { messageId, isRead }
    
    // 存储请求回调
    wsPendingRequests.value.set(requestId, { resolve, reject, messageId })
    
    // 发送请求
    wsManager.value.send(requestData)
    
    // 设置超时
    setTimeout(() => {
      if (wsPendingRequests.value.has(requestId)) {
        wsPendingRequests.value.delete(requestId)
        reject(new Error('请求超时'))
      }
    }, 5000)
  })
}

// 处理WebSocket响应
const handleWsResponse = (data) => {
  // 处理消息状态更新响应
  if (data.code !== undefined && data.data && data.data.messageId) {
    const { messageId } = data.data
    const requestKey = Array.from(wsPendingRequests.value.keys()).find(key => {
      const req = wsPendingRequests.value.get(key)
      return req && req.messageId === messageId
    })
    
    if (requestKey) {
      const request = wsPendingRequests.value.get(requestKey)
      if (data.code === 200) {
        request.resolve(data)
      } else {
        request.reject(new Error(data.msg || '操作失败'))
      }
      wsPendingRequests.value.delete(requestKey)
      return true
    }
  }
  return false
}

// 初始化WebSocket连接
const initWebSocket = () => {
  const hostname = window.location.hostname
  const isDev = import.meta.env.DEV
  const wsBaseUrl = isDev
    ? `${hostname}:8998/ws/system/messageRecord`
    : `${window.location.host}/ws/system/messageRecord`

  wsManager.value = new WebSocketManager(wsBaseUrl, {
    heartbeatInterval: 10000,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    enableHeartbeat: true
  })

  // 注册回调
  wsManager.value.on('open', () => {
    console.log('[消息管理] WebSocket连接成功')
  })

  wsManager.value.on('message', (data) => {
    // 先处理WebSocket响应（消息状态更新响应）
    if (handleWsResponse(data)) {
      return
    }
    
    // 处理服务端错误消息
    if (data.code !== undefined && data.code !== 200) {
      ElMessage.error(data.msg || '操作失败')
      return
    }
    
    // 处理新消息推送
    if (data.messageId && data.messageTitle) {
      unreadCount.value++
      fetchMessageList()
      // 消息管理页面不显示提示，避免重复
      if (router.currentRoute.value.path !== '/backstage/message') {
        ElMessage({
          message: `新消息: ${data.messageTitle}`,
          type: 'info',
          duration: 3000
        })
      }
    }
    // 处理认证过期
    if (data.type === 'error' && data.message === '认证已过期') {
      ElMessage.error('认证已过期，请重新登录')
    }
  })

  wsManager.value.on('close', () => {
    console.log('[消息管理] WebSocket连接关闭')
  })

  wsManager.value.on('error', (error) => {
    console.error('[消息管理] WebSocket错误:', error)
  })

  // 连接WebSocket
  wsManager.value.connect()
}

// 获取消息列表
const fetchMessageList = async () => {
  loading.value = true
  try {
    let api = getMessageList
    if (filterStatus.value === 'unread') {
      api = getUnreadMessageList
    } else if (filterStatus.value === 'read') {
      api = getReadMessageList
    }

    const res = await api({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (res.code === 200) {
      tableData.value = res.rows || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    // 错误由WebSocket监听处理，这里不显示弹窗
  } finally {
    loading.value = false
  }
}

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadMessageList({ pageNum: 1, pageSize: 1 })
    if (res.code === 200) {
      unreadCount.value = res.total || 0
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchMessageList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.messageId)
}

// 标记单条已读
const handleMarkRead = async (row) => {
  try {
    let res
    // 优先使用WebSocket
    if (isWsConnected()) {
      res = await sendWsMessageStatusUpdate(row.messageId, 1)
    } else {
      // WebSocket未连接时使用HTTP
      res = await updateMessageReadStatus(row.messageId, 1)
    }
    
    if (res.code === 200) {
      row.isRead = 1
      row.readTime = res.data?.readTime
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      // 触发全局刷新，通知头部组件
      userStore.triggerMessageRefresh()
      ElMessage.success('已标记为已读')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    // 错误由WebSocket监听处理，这里不显示弹窗
  }
}

// 标记全部已读
const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有未读消息标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 获取所有未读消息
    const res = await getUnreadMessageList({ pageNum: 1, pageSize: 999 })
    if (res.code === 200 && res.rows) {
      for (const msg of res.rows) {
        try {
          if (isWsConnected()) {
            await sendWsMessageStatusUpdate(msg.messageId, 1)
          } else {
            await updateMessageReadStatus(msg.messageId, 1)
          }
        } catch (error) {
          console.error(`标记消息 ${msg.messageId} 失败:`, error)
        }
      }
      unreadCount.value = 0
      fetchMessageList()
      // 触发全局刷新，通知头部组件
      userStore.triggerMessageRefresh()
      ElMessage.success('已全部标记为已读')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记全部已读失败:', error)
    }
  }
}

// 查看详情
const handleViewDetail = (row) => {
  currentMessage.value = row
  detailDialogVisible.value = true
  // 如果是未读消息，自动标记为已读
  if (row.isRead === 0) {
    handleMarkRead(row)
  }
}

// 标记已读并关闭对话框
const handleMarkReadAndClose = async () => {
  if (currentMessage.value) {
    await handleMarkRead(currentMessage.value)
    detailDialogVisible.value = false
  }
}

// 前往处理页面
const handleGoToPage = () => {
  if (currentMessage.value) {
    const route = getMessageTypeRoute(currentMessage.value.messageType)
    router.push(route)
    detailDialogVisible.value = false
  }
}

// 删除消息
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteMessage(row.messageId)
    if (res.code === 200) {
      fetchMessageList()
      if (row.isRead === 0) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      // 触发全局刷新，通知头部组件
      userStore.triggerMessageRefresh()
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      // 错误由WebSocket监听处理，这里不显示弹窗
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的消息')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条消息吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteMessage(selectedIds.value.join(','))
    if (res.code === 200) {
      fetchMessageList()
      fetchUnreadCount()
      selectedIds.value = []
      // 触发全局刷新，通知头部组件
      userStore.triggerMessageRefresh()
      ElMessage.success('批量删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      // 错误由WebSocket监听处理，这里不显示弹窗
    }
  }
}

// 清空全部
const handleCleanAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有消息吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })
    const res = await cleanMessage()
    if (res.code === 200) {
      fetchMessageList()
      unreadCount.value = 0
      // 触发全局刷新，通知头部组件
      userStore.triggerMessageRefresh()
      ElMessage.success('已清空所有消息')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空消息失败:', error)
      // 错误由WebSocket监听处理，这里不显示弹窗
    }
  }
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchMessageList()
}

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchMessageList()
}

// 组件挂载
onMounted(() => {
  fetchMessageList()
  fetchUnreadCount()
  initWebSocket()
})

// 组件卸载
onUnmounted(() => {
  if (wsManager.value) {
    wsManager.value.close()
    wsManager.value = null
  }
})
</script>

<style scoped lang="scss">
.message-manage {
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

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .filter-badge {
      margin-left: 4px;

      :deep(.el-badge__content) {
        font-size: 10px;
        height: 14px;
        line-height: 14px;
        padding: 0 4px;
      }
    }
  }

  .message-type {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .message-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--backstage-text-regular);

    &.unread {
      font-weight: 600;
      color: var(--backstage-text-primary);
    }
  }

  .message-content {
    font-size: 13px;
    color: var(--backstage-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .text-placeholder {
    color: var(--backstage-text-placeholder);
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
  }

  .button-row {
    display: flex;
    gap: 8px;
  }

  // 消息详情样式
  .message-detail {
    .detail-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--backstage-border-color);

      .detail-title {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: var(--backstage-text-primary);
        }
      }
    }

    .detail-content {
      margin-bottom: 20px;

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        color: var(--backstage-text-regular);
      }
    }

    .detail-footer {
      .detail-time {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 13px;
        color: var(--backstage-text-placeholder);
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
