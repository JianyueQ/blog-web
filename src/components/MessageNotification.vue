<template>
  <div class="message-notification">
    <el-dropdown
      trigger="click"
      placement="bottom-end"
      :hide-on-click="false"
      @visible-change="handleDropdownVisible"
    >
      <div class="message-icon-wrapper" :class="{ 'has-unread': unreadCount > 0 }">
        <el-icon :size="20">
          <Bell />
        </el-icon>
        <el-badge
          v-if="unreadCount > 0"
          :value="unreadCount > 99 ? '99+' : unreadCount"
          :max="99"
          class="message-badge"
        />
      </div>
      <template #dropdown>
        <div class="message-dropdown">
          <div class="message-header">
            <div class="header-tabs">
              <span
                class="tab-item"
                :class="{ active: activeTab === 'unread' }"
                @click="handleTabChange('unread')"
              >
                未读消息
                <el-tag v-if="unreadCount > 0" size="small" type="danger" class="tab-badge">
                  {{ unreadCount }}
                </el-tag>
              </span>
              <span
                class="tab-item"
                :class="{ active: activeTab === 'all' }"
                @click="handleTabChange('all')"
              >
                全部消息
              </span>
            </div>
            <div class="header-actions">
              <el-button
                v-if="activeTab === 'unread' && unreadCount > 0"
                link
                type="primary"
                size="small"
                @click="markAllAsRead"
              >
                全部已读
              </el-button>
              <el-button
                v-if="messageList.length > 0"
                link
                type="danger"
                size="small"
                @click="clearAllMessages"
              >
                清空
              </el-button>
            </div>
          </div>
          <div class="message-list" v-loading="loading">
            <template v-if="messageList.length > 0">
              <div
                v-for="msg in messageList"
                :key="msg.messageId"
                class="message-item"
                :class="{ unread: msg.isRead === 0 }"
                @click="handleMessageClick(msg)"
              >
                <div class="message-icon">
                  <el-icon :size="16" :color="getMessageTypeColor(msg.messageType)">
                    <component :is="getMessageTypeIcon(msg.messageType)" />
                  </el-icon>
                </div>
                <div class="message-content">
                  <div class="message-title">
                    {{ msg.messageTitle }}
                    <el-tag size="small" :type="getMessageTypeTag(msg.messageType)" class="type-tag">
                      {{ getMessageTypeText(msg.messageType) }}
                    </el-tag>
                  </div>
                  <div class="message-desc">{{ msg.messageContent }}</div>
                  <div class="message-time">{{ msg.createTime }}</div>
                </div>
                <div class="message-actions">
                  <el-button
                    v-if="msg.isRead === 0"
                    link
                    type="primary"
                    size="small"
                    @click.stop="markAsRead(msg)"
                  >
                    标为已读
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click.stop="deleteMsg(msg)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无消息" :image-size="60" />
          </div>
          <div class="message-footer">
            <el-button link type="primary" @click="goToMessagePage">
              查看全部
            </el-button>
          </div>
        </div>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user.js'
import {
  Bell,
  ChatDotRound,
  Link,
  InfoFilled,
  Message
} from '@element-plus/icons-vue'
import WebSocketManager from '@/utils/websocket.js'
import {
  getMessageList,
  getUnreadMessageList,
  updateMessageReadStatus,
  deleteMessage,
  cleanMessage
} from '@/api/backstage/messageRecord.js'

const router = useRouter()
const userStore = useUserStore()
const { messageRefreshTrigger } = storeToRefs(userStore)

// 状态
const activeTab = ref('unread')
const messageList = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const wsManager = ref(null)
// WebSocket待处理请求队列
const wsPendingRequests = ref(new Map())
// 是否已经加载过数据（用于控制首次打开时才请求）
const hasLoaded = ref(false)

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

// 下拉菜单显示状态变化
const handleDropdownVisible = (visible) => {
  if (visible && !hasLoaded.value) {
    hasLoaded.value = true
    fetchMessageList()
  }
}

// 切换Tab
const handleTabChange = (tab) => {
  activeTab.value = tab
  // 切换Tab时强制刷新数据
  fetchMessageList()
}

// 获取消息列表
const fetchMessageList = async () => {
  loading.value = true
  try {
    const api = activeTab.value === 'unread' ? getUnreadMessageList : getMessageList
    const res = await api({ pageNum: 1, pageSize: 10 })
    if (res.code === 200) {
      messageList.value = res.rows || []
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
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

// 标记单条消息为已读
const markAsRead = async (msg) => {
  try {
    const res = await updateMessageReadStatus(msg.messageId, 1)
    if (res.code === 200) {
      msg.isRead = 1
      msg.readTime = res.data?.readTime
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      // 触发全局刷新，通知消息管理页面
      userStore.triggerMessageRefresh()
      ElMessage.success('已标记为已读')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('操作失败')
  }
}

// 标记全部已读
const markAllAsRead = async () => {
  try {
    // 批量标记未读消息为已读
    const unreadMsgs = messageList.value.filter(msg => msg.isRead === 0)
    for (const msg of unreadMsgs) {
      await updateMessageReadStatus(msg.messageId, 1)
    }
    messageList.value.forEach(msg => {
      msg.isRead = 1
    })
    unreadCount.value = 0
    // 触发全局刷新，通知消息管理页面
    userStore.triggerMessageRefresh()
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除消息
const deleteMsg = async (msg) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteMessage(msg.messageId)
    if (res.code === 200) {
      messageList.value = messageList.value.filter(item => item.messageId !== msg.messageId)
      if (msg.isRead === 0) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      // 触发全局刷新，通知消息管理页面
      userStore.triggerMessageRefresh()
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 清空所有消息
const clearAllMessages = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有消息吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })
    const res = await cleanMessage()
    if (res.code === 200) {
      messageList.value = []
      unreadCount.value = 0
      // 触发全局刷新，通知消息管理页面
      userStore.triggerMessageRefresh()
      ElMessage.success('已清空所有消息')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空消息失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 点击消息
const handleMessageClick = async (msg) => {
  // 关闭下拉菜单
  const dropdown = document.querySelector('.message-notification .el-dropdown')
  if (dropdown) {
    const trigger = dropdown.querySelector('.message-icon-wrapper')
    if (trigger) {
      trigger.click()
    }
  }
  // 如果是未读消息，先标记为已读
  if (msg.isRead === 0) {
    await markAsRead(msg)
  }
  // 根据消息类型跳转到对应页面
  const route = getMessageTypeRoute(msg.messageType)
  router.push(route)
}

// 跳转到消息管理页面
const goToMessagePage = () => {
  // 关闭下拉菜单
  const dropdown = document.querySelector('.message-notification .el-dropdown')
  if (dropdown) {
    const trigger = dropdown.querySelector('.message-icon-wrapper')
    if (trigger) {
      trigger.click()
    }
  }
  router.push('/backstage/message')
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
    console.log('[消息通知] WebSocket连接成功')
  })

  wsManager.value.on('message', (data) => {
    // 处理新消息推送
    if (data.messageId && data.messageTitle) {
      // 新消息通知
      unreadCount.value++
      // 如果下拉菜单打开，刷新列表
      if (activeTab.value === 'unread') {
        fetchMessageList()
      }
      // 显示通知
      ElMessage({
        message: `新消息: ${data.messageTitle}`,
        type: 'info',
        duration: 3000
      })
    }
    // 处理认证过期
    if (data.type === 'error' && data.message === '认证已过期') {
      ElMessage.error('认证已过期，请重新登录')
    }
  })

  wsManager.value.on('close', () => {
    console.log('[消息通知] WebSocket连接关闭')
  })

  wsManager.value.on('error', (error) => {
    console.error('[消息通知] WebSocket错误:', error)
  })

  // 连接WebSocket
  wsManager.value.connect()
}

// 监听标签变化
const watchTab = () => {
  fetchMessageList()
}

// 监听消息刷新触发器 - 当消息管理页面操作后同步刷新
watch(messageRefreshTrigger, () => {
  fetchUnreadCount()
  fetchMessageList()
})

// 组件挂载
onMounted(() => {
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

<style lang="scss" scoped>
.message-notification {
  display: flex;
  align-items: center;
}

.message-icon-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--backstage-text-regular);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--backstage-border-light);
    color: var(--backstage-primary);
    transform: translateY(-1px);
  }

  &.has-unread {
    color: var(--backstage-primary);
  }
}

.message-badge {
  position: absolute;
  top: 2px;
  right: 2px;

  :deep(.el-badge__content) {
    font-size: 10px;
    height: 16px;
    line-height: 16px;
    padding: 0 4px;
    border: none;
  }
}

.message-dropdown {
  width: 360px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  background: var(--backstage-bg-color);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--backstage-border-color);

  .header-tabs {
    display: flex;
    gap: 16px;

    .tab-item {
      font-size: 14px;
      color: var(--backstage-text-secondary);
      cursor: pointer;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover {
        color: var(--backstage-primary);
      }

      &.active {
        color: var(--backstage-primary);
        font-weight: 500;
      }

      .tab-badge {
        height: 18px;
        line-height: 16px;
        padding: 0 6px;
        font-size: 11px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  max-height: 320px;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--backstage-border-color);
    border-radius: 2px;
  }
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--backstage-border-light);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--backstage-border-light);

    .message-actions {
      opacity: 1;
    }
  }

  &.unread {
    background-color: var(--backstage-primary-lighter, rgba(64, 158, 255, 0.05));

    .message-title {
      font-weight: 500;
    }
  }

  .message-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--backstage-border-light);
    border-radius: 50%;
  }

  .message-content {
    flex: 1;
    min-width: 0;

    .message-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--backstage-text-primary);
      margin-bottom: 4px;

      .type-tag {
        height: 18px;
        line-height: 16px;
        padding: 0 6px;
        font-size: 11px;
      }
    }

    .message-desc {
      font-size: 12px;
      color: var(--backstage-text-secondary);
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 4px;
    }

    .message-time {
      font-size: 11px;
      color: var(--backstage-text-placeholder);
    }
  }

  .message-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .el-button {
      padding: 2px 0;
    }
  }
}

.message-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--backstage-border-color);
  text-align: center;
}

// 响应式适配
@media (max-width: 768px) {
  .message-dropdown {
    width: 320px;
  }
}

@media (max-width: 480px) {
  .message-dropdown {
    width: 280px;

    .message-item {
      .message-actions {
        opacity: 1;
        flex-direction: row;
      }
    }
  }
}
</style>
