<template>
  <div class="mobile-message-page">
    <!-- 内容区域 -->
    <div class="mobile-content">
      <!-- 页面头部 -->
      <div class="mobile-page-header">
        <h1 class="page-title">留言板</h1>
        <p class="page-subtitle">共 {{ totalMessages }} 条留言</p>
      </div>

      <!-- 留言列表 -->
      <div class="message-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner" />
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="messages.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>还没有留言，来做第一个留言的人吧~</p>
        </div>

        <!-- 留言列表 -->
        <div v-else class="messages">
          <div
            v-for="(item, index) in messages"
            :key="item.guestbookId"
            class="message-card"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="card-header">
              <div class="user-avatar">
                <img
                  v-if="item.avatar"
                  :src="item.avatar"
                  :alt="item.nickname"
                  @error="handleAvatarError"
                >
                <span v-else>{{ item.nickname.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-info">
                <span class="nickname">{{ item.nickname }}</span>
                <span class="time">{{ formatTime(item.messageTime) }}</span>
              </div>
              <button class="reply-icon-btn" @click="openReplyModal(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>

            <div class="card-content">
              {{ item.content }}
            </div>

            <div class="card-footer">
              <div v-if="item.location" class="location-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {{ item.location }}
              </div>
              
              <!-- 展开回复按钮 -->
              <button
                v-if="(item.replyCount || 0) > 0"
                class="expand-replies-btn"
                @click="toggleReplies(item)"
              >
                {{ expandedReplies.includes(item.guestbookId) ? '收起回复' : `查看 ${item.replyCount} 条回复` }}
                <svg :class="{ rotated: expandedReplies.includes(item.guestbookId) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <!-- 回复列表 -->
            <div v-if="expandedReplies.includes(item.guestbookId)" class="mobile-reply-list">
               <!-- 加载中 -->
               <div v-if="item.loadingReplies && (!item.replyList || item.replyList.length === 0)" class="reply-loading">
                <div class="reply-loading-spinner"></div>
                <span>加载中...</span>
              </div>

              <div v-else v-for="reply in item.replyList" :key="reply.guestbookId" class="mobile-reply-item">
                <div class="reply-avatar-small">
                  <img
                    v-if="reply.avatar"
                    :src="reply.avatar"
                    :alt="reply.nickname"
                    @error="handleAvatarError"
                  >
                  <span v-else>{{ reply.nickname.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="reply-content-wrapper">
                  <div class="reply-header-row">
                    <span class="reply-nickname">{{ reply.nickname }}</span>
                    <span class="reply-time">{{ formatTime(reply.messageTime) }}</span>
                  </div>
                  <div class="reply-text">
                    <span v-if="reply.parentId !== 0 && reply.parentId !== item.guestbookId" class="reply-to">
                      回复 <span class="reply-to-name">@{{ getReplyToNickname(item.replyList, reply.parentId, item, reply) }}</span>
                    </span>
                    {{ reply.content }}
                  </div>
                  <button class="mobile-reply-action" @click="openReplyModal(reply, item)">
                    回复
                  </button>
                </div>
              </div>

              <!-- 分页加载更多回复 -->
              <div v-if="item.replyTotal > 5" class="reply-pagination">
                 <button
                    class="pagination-btn"
                    :disabled="(item.replyPageNum || 1) <= 1"
                    @click="loadChildReplies(item, (item.replyPageNum || 1) - 1)"
                  >
                    上一页
                  </button>
                  <span class="page-indicator">{{ item.replyPageNum || 1 }} / {{ Math.ceil(item.replyTotal / 5) }}</span>
                  <button
                    class="pagination-btn"
                    :disabled="(item.replyPageNum || 1) >= Math.ceil(item.replyTotal / 5)"
                    @click="loadChildReplies(item, (item.replyPageNum || 1) + 1)"
                  >
                    下一页
                  </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多提示 -->
        <div v-if="messages.length > 0" class="load-more-section">
          <div v-if="loadingMore" class="loading-more">
            <div class="loading-spinner" />
            <span>加载中...</span>
          </div>
          <div v-else-if="!pageParams.hasMore" class="no-more">
            <span>—— 到底啦 ——</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮按钮 FAB -->
    <button class="fab-btn" @click="openMessageModal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>

    <!-- 留言底部弹窗 (Bottom Sheet) -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isMessageModalOpen" class="mobile-modal-overlay" @click="closeMessageModal">
          <div class="mobile-modal" @click.stop>
            <div class="mobile-modal-header">
              <h3>写留言</h3>
              <button class="close-btn" @click="closeMessageModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="mobile-modal-body">
              <form class="mobile-form" @submit.prevent="submitMessage">
                <!-- 头像选择 (简化版) -->
                <div class="avatar-selector" @click="toggleAvatarPicker">
                  <div class="avatar-preview-wrapper">
                    <img v-if="messageForm.avatar" :src="messageForm.avatar" class="avatar-img">
                    <div v-else class="avatar-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                  <span class="avatar-hint">点击设置头像</span>
                </div>

                <!-- 头像选择器 (嵌套在Modal内或再次弹窗，这里简化为内嵌) -->
                <div v-if="showAvatarPicker" class="mobile-avatar-picker">
                   <div class="style-tabs">
                      <span v-for="(config, key) in avatarStyles" :key="key" 
                        class="style-tag" :class="{active: currentStyle === key}"
                        @click="switchAvatarStyle(key)">
                        {{ config.name }}
                      </span>
                   </div>
                   <div class="preset-grid">
                      <div v-for="(avatar, index) in presetAvatars" :key="index" 
                        class="preset-item" @click="selectPresetAvatar(avatar)">
                        <img :src="avatar">
                      </div>
                   </div>
                   <div class="custom-upload" @click="triggerFileInput">
                      <span>上传自定义头像</span>
                      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFileChange">
                   </div>
                </div>

                <div class="input-group">
                  <input v-model="messageForm.nickname" type="text" placeholder="昵称 *" required>
                </div>
                <div class="input-group">
                  <input v-model="messageForm.email" type="email" placeholder="邮箱 (选填)">
                </div>
                <div class="input-group textarea-group">
                  <textarea v-model="messageForm.content" placeholder="写下你的想法..." rows="4" maxlength="500" required></textarea>
                  <div class="textarea-tools">
                    <span class="char-count">{{ messageForm.content.length }}/500</span>
                  </div>
                </div>

                <button type="submit" class="mobile-submit-btn" :disabled="submitting">
                  {{ submitting ? '提交中...' : '发表留言' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 回复底部弹窗 -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isReplyModalOpen" class="mobile-modal-overlay" @click="closeReplyModal">
          <div class="mobile-modal" @click.stop>
            <div class="mobile-modal-header">
              <h3>回复 {{ replyTarget.nickname }}</h3>
              <button class="close-btn" @click="closeReplyModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="mobile-modal-body">
              <div class="mobile-reply-quote">
                {{ replyTarget.content }}
              </div>
              <form class="mobile-form" @submit.prevent="submitReply">
                 <!-- 简化的回复表单，复用逻辑但简化UI -->
                 <div class="input-group" v-if="!hasSavedInfo">
                    <input v-model="replyForm.nickname" type="text" placeholder="昵称 *" required>
                 </div>
                 <div class="input-group textarea-group">
                    <textarea v-model="replyForm.content" :placeholder="`回复 @${replyTarget.nickname}...`" rows="3" required></textarea>
                 </div>
                 <button type="submit" class="mobile-submit-btn" :disabled="replySubmitting">
                    {{ replySubmitting ? '提交中...' : '发送' }}
                 </button>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { useGuestbook } from './useGuestbook.js'

// 使用相同的逻辑 hook
const {
  messageForm,
  replyForm,
  messages,
  loading,
  submitting,
  replySubmitting,
  isMessageModalOpen,
  isReplyModalOpen,
  replyTarget,
  expandedReplies,
  loadingMore,
  pageParams,
  totalMessages,
  openMessageModal,
  closeMessageModal,
  toggleAvatarPicker,
  selectPresetAvatar,
  switchAvatarStyle,
  avatarStyles,
  currentStyle,
  presetAvatars,
  triggerFileInput,
  handleFileChange,
  handleAvatarError,
  openReplyModal,
  closeReplyModal,
  submitMessage,
  submitReply,
  toggleReplies,
  loadChildReplies,
  formatTime,
  getReplyToNickname,
  hasSavedInfo,
  fileInput
} = useGuestbook()
</script>

<style lang="scss" scoped>
// 移动端专用样式
$primary-color: #2563eb;
$dark-bg: #18181b;
$card-bg: rgba(39, 39, 42, 0.6);

.mobile-message-page {
  // padding-top: 60px; // 已由 MainBox 统一处理 padding
  min-height: 100vh;
  background-color: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

// 页面头部
.mobile-page-header {
  text-align: center;
  margin-bottom: 2rem;
  animation: slideInUp 0.6s ease;

  .page-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }
}

// 留言列表
.mobile-content {
  padding: 0 1rem;
}

.message-card {
  background: $card-bg;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: fadeIn 0.5s ease;

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;

    .user-avatar {
      width: 40px;
      height: 40px;
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
      flex: 1;
      display: flex;
      flex-direction: column;

      .nickname {
        font-weight: 600;
        color: #fff;
        font-size: 0.95rem;
      }

      .time {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .reply-icon-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      padding: 0.5rem;
      
      svg { width: 20px; height: 20px; }
    }
  }

  .card-content {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
    word-break: break-word;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;

    .location-tag {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: rgba(255, 255, 255, 0.4);
      
      svg { width: 14px; height: 14px; }
    }

    .expand-replies-btn {
      background: transparent;
      border: none;
      color: $primary-color;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      
      svg { 
        width: 14px; 
        height: 14px; 
        transition: transform 0.3s;
        &.rotated { transform: rotate(180deg); }
      }
    }
  }
}

// 移动端回复列表
.mobile-reply-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .mobile-reply-item {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;

    .reply-avatar-small {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      overflow: hidden;
      background: rgba($primary-color, 0.5);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.8rem;
      
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .reply-content-wrapper {
      flex: 1;

      .reply-header-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.2rem;

        .reply-nickname {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ddd;
        }
        
        .reply-time {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
        }
      }

      .reply-text {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.5;
        margin-bottom: 0.4rem;

        .reply-to {
          color: rgba(255, 255, 255, 0.4);
          margin-right: 0.2rem;
          
          .reply-to-name {
            color: $primary-color;
          }
        }
      }

      .mobile-reply-action {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.8rem;
        padding: 0;
      }
    }
  }
}

// 悬浮按钮
.fab-btn {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $primary-color;
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba($primary-color, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  
  svg { width: 24px; height: 24px; }
  
  &:active {
    transform: scale(0.95);
  }
}

// 底部抽屉样式 (Bottom Sheet)
.mobile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end; // 底部对齐
}

.mobile-modal {
  width: 100%;
  background: #1f1f22;
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  
  .mobile-modal-header {
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    
    h3 {
      margin: 0;
      color: #fff;
      font-size: 1.1rem;
    }
    
    .close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      padding: 0.5rem;
      
      svg { width: 24px; height: 24px; }
    }
  }
  
  .mobile-modal-body {
    padding: 1.25rem;
    overflow-y: auto;
  }
}

// 移动端表单
.mobile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .input-group {
    input, textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.8rem 1rem;
      color: #fff;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
    
    textarea {
      resize: none;
    }
  }
  
  .mobile-submit-btn {
    background: $primary-color;
    color: #fff;
    border: none;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 0.5rem;
    
    &:disabled {
      opacity: 0.7;
    }
  }
}

// 头像选择
.avatar-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  
  .avatar-preview-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    
    .avatar-placeholder {
      color: rgba(255, 255, 255, 0.3);
      svg { width: 24px; height: 24px; }
    }
  }
  
  .avatar-hint {
    color: $primary-color;
    font-size: 0.9rem;
  }
}

.mobile-avatar-picker {
  background: rgba(0,0,0,0.2);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  
  .style-tabs {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
    
    .style-tag {
      white-space: nowrap;
      padding: 0.3rem 0.8rem;
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      font-size: 0.8rem;
      color: #aaa;
      
      &.active {
        background: $primary-color;
        color: #fff;
      }
    }
  }
  
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    
    .preset-item {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      
      img { width: 100%; height: 100%; }
    }
  }
  
  .custom-upload {
    text-align: center;
    padding: 0.8rem;
    border: 1px dashed rgba(255,255,255,0.2);
    border-radius: 8px;
    color: #aaa;
    font-size: 0.9rem;
  }
}

// 动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease;
  
  .mobile-modal {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  
  .mobile-modal {
    transform: translateY(100%);
  }
}

// 分页按钮
.reply-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  
  .pagination-btn {
    background: rgba(255,255,255,0.05);
    border: none;
    color: #fff;
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
    
    &:disabled { opacity: 0.3; }
  }
  
  .page-indicator {
    color: rgba(255,255,255,0.5);
    font-size: 0.8rem;
  }
}

.loading-state, .empty-state, .load-more-section {
  text-align: center;
  padding: 2rem;
  color: rgba(255,255,255,0.5);
  
  .empty-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
