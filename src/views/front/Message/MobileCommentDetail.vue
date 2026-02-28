<template>
  <div class="mobile-comment-detail">
    <!-- 头部：留言详情 + 关闭按钮 -->
    <div class="detail-header">
      <h2 class="detail-title">留言详情</h2>
      <button class="close-btn" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- 中间内容区域 -->
    <div class="detail-content" @scroll="handleScroll">
      <!-- 根评论区域 -->
      <div class="root-comment-section">
        <div class="user-row">
          <div class="user-avatar">
            <img
              v-if="rootMessage.avatar"
              :src="rootMessage.avatar"
              :alt="rootMessage.nickname"
              @error="handleAvatarError"
            >
            <span v-else>{{ rootMessage.nickname?.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="user-info">
            <span class="nickname">{{ rootMessage.nickname }}</span>
            <span class="time">{{ formatTime(rootMessage.messageTime) }}</span>
          </div>
        </div>
        <div class="comment-content">
          {{ rootMessage.content }}
        </div>
        <div class="comment-footer" v-if="rootMessage.location">
          <div class="location-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {{ rootMessage.location }}
          </div>
        </div>
      </div>

      <!-- 子评论区域 -->
      <div class="child-comments-section">
        <h3 class="section-title" v-if="(rootMessage.replyCount || 0) > 0">
          全部回复 ({{ rootMessage.replyCount }})
        </h3>
        <div class="empty-replies" v-else>
          暂无回复，快来抢沙发吧~
        </div>

        <div class="reply-list">
          <div 
            v-for="reply in rootMessage.replyList" 
            :key="reply.guestbookId" 
            class="reply-item"
            @click="handleReplyClick(reply)"
          >
            <div class="reply-avatar">
              <img
                v-if="reply.avatar"
                :src="reply.avatar"
                :alt="reply.nickname"
                @error="handleAvatarError"
              >
              <span v-else>{{ reply.nickname?.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="reply-content-wrapper">
              <div class="reply-header">
                <span class="reply-nickname">{{ reply.nickname }}</span>
                <span class="reply-time">{{ formatTime(reply.messageTime) }}</span>
              </div>
              <div class="reply-text">
                <span v-if="reply.parentId !== 0 && reply.parentId !== rootMessage.guestbookId" class="reply-to">
                  回复 <span class="reply-to-name">@{{ getReplyToNickname(rootMessage.replyList, reply.parentId, rootMessage, reply) }}</span>
                </span>
                {{ reply.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingReplies" class="loading-more">
          <div class="loading-spinner" />
          <span>加载中...</span>
        </div>
        <div v-else-if="!hasMoreReplies && (rootMessage.replyCount || 0) > 0" class="no-more">
          <span>—— 到底啦 ——</span>
        </div>
      </div>
    </div>

    <!-- 底部回复框 -->
    <div class="detail-footer">
      <div class="reply-input-bar" @click="openReplyModal">
        <span class="placeholder">
          {{ currentReplyTarget ? `回复 @${currentReplyTarget.nickname}...` : '说点什么...' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getChildGuestbookList } from '@/api/front/guestbook.js'

const props = defineProps({
  rootMessage: {
    type: Object,
    required: true
  },
  formatTime: Function,
  handleAvatarError: Function,
  getReplyToNickname: Function
})

const emit = defineEmits(['close', 'open-reply'])

const loadingReplies = ref(false)
const hasMoreReplies = ref(true)
const currentReplyTarget = ref(null) // 当前点击想要回复的对象，如果为null则回复根评论

// 加载子评论逻辑
const loadChildReplies = async () => {
  if (loadingReplies.value || !hasMoreReplies.value) return

  // 这里的翻页逻辑需要根据现有数据计算
  // 假设每页5条（与PC端保持一致），计算下一页
  const currentCount = props.rootMessage.replyList?.length || 0
  const pageSize = 5
  const nextPage = Math.ceil(currentCount / pageSize) + 1
  const total = props.rootMessage.replyTotal || props.rootMessage.replyCount || 0
  
  if (currentCount >= total) {
    hasMoreReplies.value = false
    return
  }

  loadingReplies.value = true
  try {
    const res = await getChildGuestbookList({
      guestbookId: props.rootMessage.guestbookId,
      pageNum: nextPage,
      pageSize: pageSize
    })

    if (res.code === 200) {
      const newRows = res.data || res.rows || []
      
      // 合并数据去重
      const existingIds = new Set(props.rootMessage.replyList.map(r => r.guestbookId))
      const uniqueNewRows = newRows.filter(r => !existingIds.has(r.guestbookId))
      
      if (uniqueNewRows.length > 0) {
        props.rootMessage.replyList.push(...uniqueNewRows)
      } else {
        hasMoreReplies.value = false
      }

      // 更新总数信息
      props.rootMessage.replyTotal = Math.max(props.rootMessage.replyTotal || 0, res.total || 0)
      
      if ((props.rootMessage.replyList.length) >= (props.rootMessage.replyTotal)) {
        hasMoreReplies.value = false
      }
    }
  } catch (error) {
    console.error('加载子评论失败:', error)
  } finally {
    loadingReplies.value = false
  }
}

// 滚动加载
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadChildReplies()
  }
}

// 点击某条回复
const handleReplyClick = (reply) => {
  currentReplyTarget.value = reply
  openReplyModal()
}

// 打开回复弹窗
const openReplyModal = () => {
  // 如果 currentReplyTarget 为空，则表示回复根评论
  const target = currentReplyTarget.value || props.rootMessage
  emit('open-reply', target)
}

// 初始化时，如果子评论为空但有总数，尝试加载
onMounted(() => {
  const currentCount = props.rootMessage.replyList?.length || 0
  const total = props.rootMessage.replyTotal || props.rootMessage.replyCount || 0
  
  hasMoreReplies.value = currentCount < total
  
  if (currentCount === 0 && total > 0) {
    loadChildReplies()
  }
})
</script>

<style lang="scss" scoped>
$primary-color: #2563eb;

.mobile-comment-detail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  color: #374151;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.detail-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);

  .detail-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #6b7280;
    padding: 0.5rem;
    
    svg { width: 24px; height: 24px; }
  }
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; // 底部留出回复框空间
}

.root-comment-section {
  padding: 1.5rem 1rem;
  border-bottom: 8px solid #f3f4f6; // 分隔条

  .user-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      overflow: hidden;
      background: $primary-color;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      
      .nickname {
        color: #111827;
        font-weight: 600;
        font-size: 1rem;
      }
      
      .time {
        font-size: 0.75rem;
        color: #9ca3af;
      }
    }
  }

  .comment-content {
    color: #374151;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 0.8rem;
    word-break: break-word;
  }

  .comment-footer {
    .location-tag {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: #9ca3af;
      font-size: 0.8rem;
      
      svg { width: 14px; height: 14px; }
    }
  }
}

.child-comments-section {
  padding: 1rem;

  .section-title {
    font-size: 0.95rem;
    color: #4b5563;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  .empty-replies {
    text-align: center;
    padding: 2rem 0;
    color: #9ca3af;
    font-size: 0.9rem;
  }

  .reply-item {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 1.5rem;

    .reply-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      background: rgba($primary-color, 0.1);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary-color;
      font-size: 0.8rem;
      font-weight: 600;
      
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .reply-content-wrapper {
      flex: 1;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 1rem;

      .reply-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.3rem;

        .reply-nickname {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .reply-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }
      }

      .reply-text {
        font-size: 0.95rem;
        color: #4b5563;
        line-height: 1.5;

        .reply-to {
          color: #6b7280;
          margin-right: 0.3rem;
          
          .reply-to-name {
            color: $primary-color;
          }
        }
      }
    }
  }
}

.loading-more, .no-more {
  text-align: center;
  padding: 1rem 0;
  color: #9ca3af;
  font-size: 0.85rem;
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f3f4f6;
  padding: 0.8rem 1rem;
  z-index: 2001;

  // 适配底部安全区域
  padding-bottom: calc(0.8rem + env(safe-area-inset-bottom));

  .reply-input-bar {
    background: #f3f4f6;
    border-radius: 20px;
    padding: 0.6rem 1rem;
    color: #6b7280;
    font-size: 0.9rem;
    cursor: text;
  }
}
</style>
