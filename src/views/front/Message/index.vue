<template>
  <div class="message-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">留言板</h1>
      <p class="page-subtitle">欢迎留下你的足迹，分享你的想法~</p>
    </div>

    <div class="message-container">
      <!-- 留言列表头部 + 触发按钮 -->
      <div class="list-header-section">
        <h3 class="list-title">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          留言列表
        </h3>
        <div class="header-actions">
          <button class="message-trigger-btn" @click="openMessageModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>想要留言？点我来写下你的想法吧！</span>
          </button>
          <span class="message-count">共 {{ totalMessages }} 条留言</span>
        </div>
      </div>

      <!-- 留言弹窗 -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="isMessageModalOpen" class="message-modal-overlay" @click="closeMessageModal">
            <div class="message-modal" @click.stop>
              <div class="modal-header">
                <h3 class="modal-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  写下你的留言
                </h3>
                <button class="modal-close" @click="closeMessageModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="modal-body">
                <form class="message-form" @submit.prevent="submitMessage">
                  <!-- 头像上传 - TODO: 后续可以手动选择头像 -->
                  <div class="form-group avatar-group">
                    <div class="avatar-upload-wrapper">
                      <div
                        class="avatar-upload-area"
                        :class="{ 'has-image': messageForm.avatar, 'uploading': avatarUploading }"
                        @click="!avatarUploading && triggerFileInput()"
                        @dragenter.prevent="!avatarUploading && (isDragging = true)"
                        @dragleave.prevent="isDragging = false"
                        @dragover.prevent
                        @drop.prevent="!avatarUploading && handleDrop($event)"
                      >
                        <input
                          ref="fileInput"
                          type="file"
                          accept="image/*"
                          style="display: none"
                          @change="handleFileChange"
                          :disabled="avatarUploading"
                        />

                        <!-- 头像预览 -->
                        <img v-if="messageForm.avatar && !avatarUploading" :src="messageForm.avatar" class="avatar-preview" />

                        <!-- 上传中状态 -->
                        <div v-else-if="avatarUploading" class="avatar-uploading">
                          <div class="avatar-spinner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                            </svg>
                          </div>
                          <span class="upload-text">上传中...</span>
                        </div>

                        <!-- 默认状态 -->
                        <div v-else class="avatar-placeholder">
                          <div class="avatar-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <span class="upload-hint">点击上传</span>
                        </div>

                        <!-- 悬停遮罩 -->
                        <div v-if="messageForm.avatar && !avatarUploading" class="avatar-overlay">
                          <span>更换头像</span>
                        </div>
                      </div>
                      <span class="avatar-tip">支持 JPG、PNG，最大 10MB</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <input
                        v-model="messageForm.nickname"
                        type="text"
                        class="form-input"
                        placeholder="你的昵称 *"
                        maxlength="20"
                        required
                      />
                      <span v-if="formErrors.nickname" class="error-msg">{{ formErrors.nickname }}</span>
                    </div>
                    <div class="form-group">
                      <input
                        v-model="messageForm.email"
                        type="email"
                        class="form-input"
                        placeholder="你的邮箱（选填）"
                        maxlength="50"
                      />
                      <span v-if="formErrors.email" class="error-msg">{{ formErrors.email }}</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="textarea-wrapper">
                      <textarea
                        v-model="messageForm.content"
                        class="form-textarea"
                        placeholder="说点什么吧... *"
                        rows="4"
                        maxlength="500"
                        required
                      ></textarea>
                      <!-- Emoji 按钮 -->
                      <button type="button" class="emoji-trigger-btn" @click="toggleEmojiPicker">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                          <line x1="9" y1="9" x2="9.01" y2="9"/>
                          <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Emoji 选择器 -->
                    <div v-if="showEmojiPicker" class="emoji-picker">
                      <div class="emoji-picker-header">
                        <span class="emoji-picker-title">选择表情</span>
                        <button type="button" class="emoji-close-btn" @click="toggleEmojiPicker">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div class="emoji-list">
                        <!-- TODO: 未来从后台获取表情包 -->
                        <span
                          v-for="emoji in defaultEmojis"
                          :key="emoji"
                          class="emoji-item"
                          @click="insertEmoji(emoji)"
                        >
                          {{ emoji }}
                        </span>
                      </div>
                    </div>

                    <div class="textarea-footer">
                      <span v-if="formErrors.content" class="error-msg">{{ formErrors.content }}</span>
                      <span class="char-count">{{ messageForm.content.length }}/500</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="submit-btn"
                    :disabled="submitting"
                  >
                    <span v-if="submitting" class="btn-spinner"></span>
                    <span>{{ submitting ? '提交中...' : '发表留言' }}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- 回复弹窗 -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="isReplyModalOpen" class="reply-modal-overlay" @click="closeReplyModal">
            <div class="reply-modal" @click.stop>
              <div class="modal-header">
                <h3 class="modal-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {{ replyTarget.isRoot === 1 ? '回复留言' : `回复 @${replyTarget.nickname}` }}
                </h3>
                <button class="modal-close" @click="closeReplyModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="modal-body">
                <!-- 引用原内容 -->
                <div class="reply-quote">
                  <div class="quote-header">
                    <span class="quote-author">{{ replyTarget.nickname }}</span>
                    <span class="quote-time">{{ formatTime(replyTarget.messageTime) }}</span>
                  </div>
                  <p class="quote-content">{{ replyTarget.content }}</p>
                </div>

                <form class="reply-form" @submit.prevent="submitReply">
                  <!-- 头像上传 -->
                  <div class="form-group avatar-group">
                    <div class="avatar-upload-wrapper">
                      <div
                        class="avatar-upload-area"
                        :class="{ 'has-image': replyForm.avatar, 'uploading': replyAvatarUploading }"
                        @click="!replyAvatarUploading && triggerReplyFileInput()"
                        @dragenter.prevent="!replyAvatarUploading && (isReplyDragging = true)"
                        @dragleave.prevent="isReplyDragging = false"
                        @dragover.prevent
                        @drop.prevent="!replyAvatarUploading && handleReplyDrop($event)"
                      >
                        <input
                          ref="replyFileInput"
                          type="file"
                          accept="image/*"
                          style="display: none"
                          @change="handleReplyFileChange"
                          :disabled="replyAvatarUploading"
                        />

                        <!-- 头像预览 -->
                        <img v-if="replyForm.avatar && !replyAvatarUploading" :src="replyForm.avatar" class="avatar-preview" />

                        <!-- 上传中状态 -->
                        <div v-else-if="replyAvatarUploading" class="avatar-uploading">
                          <div class="avatar-spinner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                            </svg>
                          </div>
                          <span class="upload-text">上传中...</span>
                        </div>

                        <!-- 默认状态 -->
                        <div v-else class="avatar-placeholder">
                          <div class="avatar-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <span class="upload-hint">点击上传</span>
                        </div>

                        <!-- 悬停遮罩 -->
                        <div v-if="replyForm.avatar && !replyAvatarUploading" class="avatar-overlay">
                          <span>更换头像</span>
                        </div>
                      </div>
                      <span class="avatar-tip">支持 JPG、PNG，最大 10MB</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <input
                        v-model="replyForm.nickname"
                        type="text"
                        class="form-input"
                        placeholder="你的昵称 *"
                        maxlength="20"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <input
                        v-model="replyForm.email"
                        type="email"
                        class="form-input"
                        placeholder="你的邮箱（选填）"
                        maxlength="50"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="textarea-wrapper">
                      <textarea
                        v-model="replyForm.content"
                        class="form-textarea"
                        :placeholder="`回复 @${replyTarget.nickname}...`"
                        rows="4"
                        maxlength="500"
                        required
                      ></textarea>
                      <!-- Emoji 按钮 -->
                      <button type="button" class="emoji-trigger-btn" @click="toggleReplyEmojiPicker">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                          <line x1="9" y1="9" x2="9.01" y2="9"/>
                          <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Emoji 选择器 -->
                    <div v-if="showReplyEmojiPicker" class="emoji-picker">
                      <div class="emoji-picker-header">
                        <span class="emoji-picker-title">选择表情</span>
                        <button type="button" class="emoji-close-btn" @click="toggleReplyEmojiPicker">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div class="emoji-list">
                        <!-- TODO: 未来从后台获取表情包 -->
                        <span
                          v-for="emoji in defaultEmojis"
                          :key="emoji"
                          class="emoji-item"
                          @click="insertReplyEmoji(emoji)"
                        >
                          {{ emoji }}
                        </span>
                      </div>
                    </div>

                    <div class="textarea-footer">
                      <span class="char-count">{{ replyForm.content.length }}/500</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="submit-btn"
                    :disabled="replySubmitting"
                  >
                    <span v-if="replySubmitting" class="btn-spinner"></span>
                    <span>{{ replySubmitting ? '提交中...' : '提交回复' }}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- 留言列表 -->
      <div class="message-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="messages.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>还没有留言，来做第一个留言的人吧~</p>
        </div>

        <!-- 留言列表 -->
        <div v-else class="messages">
          <div
            v-for="(item, index) in messages"
            :key="item.guestbookId"
            class="message-item"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <!-- 根留言 -->
            <div class="root-message">
              <div class="message-header">
                <div class="user-info">
                  <div class="user-avatar">
                    <img v-if="item.avatar" :src="item.avatar" :alt="item.nickname" @error="handleAvatarError" />
                    <span v-else>{{ item.nickname.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="user-details">
                    <div class="user-name-row">
                      <span class="nickname">{{ item.nickname }}</span>
                      <span v-if="item.email" class="email">{{ item.email }}</span>
                    </div>
                    <div class="meta-info">
                      <span class="time">{{ formatTime(item.messageTime) }}</span>
                      <span v-if="item.location" class="location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {{ item.location }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="message-content">{{ item.content }}</div>
              <div class="message-actions">
                <button class="action-btn reply-btn" @click="openReplyModal(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  回复
                </button>
                <!-- 展开/收起回复按钮 -->
                <button
                  v-if="item.replyList && item.replyList.length > 0"
                  class="action-btn expand-btn"
                  @click="toggleReplies(item.guestbookId)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="{ 'rotated': expandedReplies.includes(item.guestbookId) }"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  {{ item.replyList.length }}条回复
                </button>
              </div>
            </div>

            <!-- 回复列表（可展开） -->
            <div
              v-if="item.replyList && item.replyList.length > 0"
              class="reply-list"
              :class="{ 'expanded': expandedReplies.includes(item.guestbookId) }"
            >
              <div
                v-for="reply in item.replyList"
                :key="reply.guestbookId"
                class="reply-item"
              >
                <div class="reply-avatar">
                  <img v-if="reply.avatar" :src="reply.avatar" :alt="reply.nickname" @error="handleAvatarError" />
                  <span v-else>{{ reply.nickname.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="reply-content-wrapper">
                  <div class="reply-header">
                    <div class="reply-name-row">
                      <span class="nickname">{{ reply.nickname }}</span>
                      <span v-if="reply.email" class="email">{{ reply.email }}</span>
                    </div>
                    <span class="time">{{ formatTime(reply.messageTime) }}</span>
                    <span v-if="reply.location" class="location">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {{ reply.location }}
                    </span>
                  </div>
                  <div class="reply-content">
                    <!-- 显示回复对象 -->
                    <span v-if="reply.parentId !== 0 && reply.parentId !== item.guestbookId" class="reply-to">
                      回复 <span class="reply-to-nickname">@{{ getReplyToNickname(item.replyList, reply.parentId, item) }}</span>:
                    </span>
                    {{ reply.content }}
                  </div>
                  <div class="reply-actions">
                    <button class="action-btn reply-btn" @click="openReplyModal(reply, item)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      回复
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getGuestbookList, addGuestbookMessage } from '@/api/front/guestbook.js'
import { uploadImage } from '@/api/front/file.js'
import { ElMessage } from 'element-plus'

// 表单数据
const messageForm = reactive({
  nickname: '',
  email: '',
  content: ''
})

// 回复表单
const replyForm = reactive({
  nickname: '',
  email: '',
  content: '',
  avatar: ''
})

// 表单错误
const formErrors = reactive({
  nickname: '',
  email: '',
  content: ''
})

// 状态
const messages = ref([])
const loading = ref(false)
const submitting = ref(false)
const replySubmitting = ref(false)
const isMessageModalOpen = ref(false)
const isReplyModalOpen = ref(false)
const replyTarget = ref({})
const currentRootMessage = ref(null)
const showEmojiPicker = ref(false)
const showReplyEmojiPicker = ref(false)
const expandedReplies = ref([])
const isDragging = ref(false)
const avatarUploading = ref(false)
const fileInput = ref(null)
const isReplyDragging = ref(false)
const replyAvatarUploading = ref(false)
const replyFileInput = ref(null)

// 默认表情列表 - TODO: 未来从后台获取表情包
const defaultEmojis = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
  '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗',
  '🤪', '😜', '😝', '😛', '🤑', '😎', '🤓', '🧐',
  '🤠', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
  '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
  '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵',
  '👍', '👎', '👏', '🙌', '🤝', '👊', '✊', '🤞',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🔥', '⭐', '✨', '💫', '💯', '💢', '💥', '💦'
]

// 计算总留言数
const totalMessages = computed(() => {
  let count = messages.value.length
  messages.value.forEach(item => {
    if (item.replyList) {
      count += item.replyList.length
    }
  })
  return count
})

// 打开留言弹窗
const openMessageModal = () => {
  isMessageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭留言弹窗
const closeMessageModal = () => {
  isMessageModalOpen.value = false
  document.body.style.overflow = ''
  showEmojiPicker.value = false
  // 重置表单错误
  formErrors.nickname = ''
  formErrors.email = ''
  formErrors.content = ''
}

// 切换 Emoji 选择器
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 插入 Emoji
const insertEmoji = (emoji) => {
  if (messageForm.content.length < 500) {
    messageForm.content += emoji
  }
  // 不自动关闭，允许连续选择
}

// 切换回复弹窗的 Emoji 选择器
const toggleReplyEmojiPicker = () => {
  showReplyEmojiPicker.value = !showReplyEmojiPicker.value
}

// 插入回复 Emoji
const insertReplyEmoji = (emoji) => {
  if (replyForm.content.length < 500) {
    replyForm.content += emoji
  }
  // 不自动关闭，允许连续选择
}

// 切换回复展开/收起
const toggleReplies = (guestbookId) => {
  const index = expandedReplies.value.indexOf(guestbookId)
  if (index === -1) {
    expandedReplies.value.push(guestbookId)
  } else {
    expandedReplies.value.splice(index, 1)
  }
}

// 打开回复弹窗
const openReplyModal = (target, rootMessage = null) => {
  replyTarget.value = target
  currentRootMessage.value = rootMessage || target

  // 预填充昵称和邮箱
  replyForm.nickname = messageForm.nickname
  replyForm.email = messageForm.email
  replyForm.content = ''

  isReplyModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭回复弹窗
const closeReplyModal = () => {
  isReplyModalOpen.value = false
  document.body.style.overflow = ''
  showReplyEmojiPicker.value = false
  replyTarget.value = {}
  currentRootMessage.value = null
  replyForm.nickname = ''
  replyForm.email = ''
  replyForm.content = ''
  replyForm.avatar = ''
}

// 触发回复文件选择
const triggerReplyFileInput = () => {
  replyFileInput.value?.click()
}

// 处理回复文件选择
const handleReplyFileChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    await uploadReplyAvatar(file)
  }
}

// 处理回复拖拽上传
const handleReplyDrop = async (e) => {
  isReplyDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    await uploadReplyAvatar(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

// 上传回复头像
const uploadReplyAvatar = async (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  replyAvatarUploading.value = true
  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await uploadImage(formData)
    if (res.code === 200) {
      replyForm.avatar = res.imgUrl
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请稍后重试')
  } finally {
    replyAvatarUploading.value = false
  }
}

// 移除回复头像
const removeReplyAvatar = () => {
  replyForm.avatar = ''
  if (replyFileInput.value) {
    replyFileInput.value.value = ''
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    await uploadAvatar(file)
  }
}

// 处理拖拽上传
const handleDrop = async (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    await uploadAvatar(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

// 上传头像
const uploadAvatar = async (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  avatarUploading.value = true
  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await uploadImage(formData)
    if (res.code === 200) {
      messageForm.avatar = res.imgUrl
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请稍后重试')
  } finally {
    avatarUploading.value = false
  }
}

// 移除头像
const removeAvatar = () => {
  messageForm.avatar = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 获取回复对象的昵称
const getReplyToNickname = (replyList, parentId, rootMessage) => {
  // 先在回复列表中查找
  const parent = replyList.find(r => r.guestbookId === parentId)
  if (parent) return parent.nickname

  // 如果找不到且parentId等于根留言ID，返回根留言作者
  if (rootMessage && parentId === rootMessage.guestbookId) {
    return rootMessage.nickname
  }

  return '未知用户'
}

// 验证表单
const validateForm = (form, isReply = false) => {
  let isValid = true

  if (!isReply) {
    formErrors.nickname = ''
    formErrors.email = ''
    formErrors.content = ''

    if (!form.nickname.trim()) {
      formErrors.nickname = '请输入昵称'
      isValid = false
    } else if (form.nickname.trim().length < 2) {
      formErrors.nickname = '昵称至少2个字符'
      isValid = false
    }

    if (form.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(form.email.trim())) {
        formErrors.email = '邮箱格式不正确'
        isValid = false
      }
    }

    if (!form.content.trim()) {
      formErrors.content = '请输入留言内容'
      isValid = false
    } else if (form.content.trim().length < 2) {
      formErrors.content = '内容至少2个字符'
      isValid = false
    }
  }

  return isValid
}

// 提交留言
const submitMessage = async () => {
  if (!validateForm(messageForm)) return

  submitting.value = true
  try {
    const data = {
      nickname: messageForm.nickname.trim(),
      email: messageForm.email.trim(),
      content: messageForm.content.trim(),
      avatar: messageForm.avatar,
      rootId: 0,
      parentId: 0
    }

    const res = await addGuestbookMessage(data)
    if (res.code === 200) {
      ElMessage.success('留言发表成功！')
      messageForm.content = ''
      closeMessageModal()
      await loadMessages()
    } else {
      ElMessage.error(res.msg || '发表失败')
    }
  } catch (error) {
    console.error('提交留言失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyForm.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (!replyForm.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replySubmitting.value = true
  try {
    const isRoot = replyTarget.value.isRoot === 1
    const data = {
      nickname: replyForm.nickname.trim(),
      email: replyForm.email.trim(),
      content: replyForm.content.trim(),
      avatar: replyForm.avatar,
      rootId: isRoot ? replyTarget.value.guestbookId : replyTarget.value.rootId,
      parentId: replyTarget.value.guestbookId
    }

    const res = await addGuestbookMessage(data)
    if (res.code === 200) {
      ElMessage.success('回复发表成功！')
      // 保存昵称和邮箱到主表单
      messageForm.nickname = replyForm.nickname
      messageForm.email = replyForm.email
      closeReplyModal()
      await loadMessages()
    } else {
      ElMessage.error(res.msg || '回复失败')
    }
  } catch (error) {
    console.error('提交回复失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    replySubmitting.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const day = 24 * 60 * 60 * 1000

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < day) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`

  return time
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}

// 加载留言列表
const loadMessages = async () => {
  loading.value = true
  try {
    const res = await getGuestbookList()
    if (res.code === 200) {
      messages.value = res.rows || []
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  } catch (error) {
    console.error('加载留言失败:', error)
    ElMessage.error('加载留言失败')
  } finally {
    loading.value = false
  }
}

// 页面加载
onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.message-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Space Grotesk', 'Archivo', sans-serif;
  animation: fadeIn 0.6s ease;
}

// 页面头部
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: slideInUp 0.6s ease;

  .page-title {
    font-size: 2.8rem;
    font-weight: 800;
    margin-bottom: 0.8rem;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }
}

// 主容器
.message-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

// 主题色变量 - 统一使用蓝色主题
$primary-color: #2563eb;
$primary-light: #60a5fa;
$primary-hover: #3b82f6;

// 列表头部区域（类似友链页面）
.list-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  animation: slideInUp 0.6s ease 0.1s both;

  .list-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Archivo', sans-serif;

    .icon {
      width: 24px;
      height: 24px;
      color: $primary-color;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;

    .message-trigger-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: rgba($primary-color, 0.1);
      border: 1px solid rgba($primary-color, 0.3);
      border-radius: 20px;
      color: $primary-light;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba($primary-color, 0.2);
        border-color: rgba($primary-color, 0.5);
        color: #93c5fd;
        transform: translateY(-1px);
      }
    }

    .message-count {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
    }
  }
}

// 留言弹窗
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.message-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// 表单样式
.message-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

// 头像上传组件 - 优化设计
.avatar-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.avatar-upload-area {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    border-color: $primary-color;
    background: rgba($primary-color, 0.1);
  }

  &.has-image {
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.1);

    &:hover .avatar-overlay {
      opacity: 1;
    }
  }

  &.uploading {
    cursor: not-allowed;
    border-color: rgba($primary-color, 0.3);
  }

  // 头像预览
  .avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  // 上传中状态
  .avatar-uploading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    color: rgba(255, 255, 255, 0.7);

    .avatar-spinner {
      width: 28px;
      height: 28px;
      animation: spin 1s linear infinite;

      svg {
        width: 100%;
        height: 100%;
        color: $primary-color;
      }
    }

    .upload-text {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  // 默认状态
  .avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    color: rgba(255, 255, 255, 0.4);

    .avatar-icon {
      width: 32px;
      height: 32px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .upload-hint {
      font-size: 0.7rem;
    }
  }

  // 移除按钮
  .avatar-remove-btn {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.95);
    border: 2px solid rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(239, 68, 68, 1);
      transform: scale(1.15);
    }
  }

  // 悬停遮罩
  .avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    span {
      font-size: 0.75rem;
      color: #fff;
      font-weight: 500;
    }
  }
}

.avatar-tip {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba($primary-color, 0.5);
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

// 文本域包装器（用于定位 emoji 按钮）
.textarea-wrapper {
  position: relative;

  .form-textarea {
    padding-right: 3rem;
  }
}

// Emoji 触发按钮
.emoji-trigger-btn {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba($primary-color, 0.1);
    border-color: rgba($primary-color, 0.3);
    color: $primary-light;
  }
}

// Emoji 选择器
.emoji-picker {
  margin-top: 0.8rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  animation: slideInUp 0.2s ease;

  .emoji-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;

    .emoji-picker-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }

    .emoji-close-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: none;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
  }

  .emoji-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .emoji-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      font-size: 1.4rem;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(37, 99, 235, 0.2);
        transform: scale(1.1);
      }
    }
  }
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-msg {
  font-size: 0.8rem;
  color: #ef4444;
}

.char-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  align-self: flex-end;
}

// 提交按钮
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: $primary-color;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($primary-color, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

// 回复弹窗
.reply-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.reply-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .modal-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    font-family: 'Archivo', sans-serif;
    margin: 0;

    svg {
      width: 22px;
      height: 22px;
      color: #2563eb;
    }
  }

  .modal-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 20px;
      height: 20px;
      color: rgba(255, 255, 255, 0.6);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-body {
  padding: 1.5rem 1.8rem;
  overflow-y: auto;
}

// 引用原内容
.reply-quote {
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid $primary-color;
  border-radius: 0 12px 12px 0;
  padding: 1rem;
  margin-bottom: 1.5rem;

  .quote-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.5rem;

    .quote-author {
      font-weight: 600;
      color: #fff;
      font-size: 0.9rem;
    }

    .quote-time {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .quote-content {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// 弹窗动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .message-modal,
  .reply-modal {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;

  .message-modal,
  .reply-modal {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// 留言列表
.message-list {
  animation: slideInUp 0.6s ease 0.2s both;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: rgba(255, 255, 255, 0.6);

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    font-size: 0.95rem;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    font-size: 1rem;
  }
}

// 留言列表容器
.messages {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// 留言项
.message-item {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  animation: slideInUp 0.5s ease backwards;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba($primary-color, 0.2);
  }
}

// 根留言
.root-message {
  padding: 1.5rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba($primary-color, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 1.2rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .user-name-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;

    .nickname {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      font-family: 'Archivo', sans-serif;
    }

    .email {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
    }
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;

    .time {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .location {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.2rem 0.5rem;
      border-radius: 10px;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }
}

.message-index {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.2);
  font-family: 'Archivo', sans-serif;
}

.message-content {
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: calc(48px + 1rem);
}

.message-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-left: calc(48px + 1rem);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba($primary-color, 0.1);
    color: $primary-light;
  }
}

// 展开/收起按钮
.expand-btn {
  svg {
    transition: transform 0.3s ease;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

// 回复列表 - Bilibili风格可展开
.reply-list {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.expanded {
    max-height: 2000px;
    opacity: 1;
    padding: 1rem 1.5rem;
  }

  .reply-item {
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
  }

  &.expanded .reply-item {
    opacity: 1;
    transform: translateY(0);

    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        transition-delay: #{$i * 0.05}s;
      }
    }
  }
}

.reply-item {
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.reply-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba($primary-color, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}

.reply-content-wrapper {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;

  .reply-name-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;

    .nickname {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
    }

    .email {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.1rem 0.4rem;
      border-radius: 8px;
    }
  }

  .time {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.05);
    padding: 0.15rem 0.4rem;
    border-radius: 8px;

    svg {
      width: 10px;
      height: 10px;
    }
  }
}

.reply-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
  white-space: pre-wrap;
  word-break: break-word;

  .reply-to {
    color: rgba(255, 255, 255, 0.5);
    margin-right: 0.3rem;

    .reply-to-nickname {
      color: $primary-light;
      font-weight: 500;
    }
  }
}

.reply-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .message-page {
    padding: 1rem;
  }

  .page-header {
    margin-bottom: 2rem;

    .page-title {
      font-size: 2rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
    }
  }

  .list-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .message-content,
  .message-actions {
    padding-left: 0;
  }

  .root-message {
    padding: 1.2rem;
  }

  .reply-list {
    padding: 1rem;
  }

  .message-modal-overlay,
  .reply-modal-overlay {
    padding: 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1.2rem;
  }

  // Emoji 选择器移动端适配
  .emoji-picker {
    .emoji-list {
      grid-template-columns: repeat(6, 1fr);
      max-height: 160px;

      .emoji-item {
        font-size: 1.2rem;
        padding: 0.4rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .page-header .page-title {
    font-size: 1.8rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .message-content {
    font-size: 0.9rem;
  }

  .reply-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>
