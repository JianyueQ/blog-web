<template>
  <div class="message-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        留言板
      </h1>
      <p class="page-subtitle">
        欢迎留下你的足迹，分享你的想法~
      </p>
    </div>

    <div class="message-container">
      <!-- 留言列表头部 + 触发按钮 -->
      <div class="list-header-section">
        <h3 class="list-title">
          <svg
            class="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          留言列表
        </h3>
        <div class="header-actions">
          <button
            class="message-trigger-btn"
            @click="openMessageModal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>想要留言？点我来写下你的想法吧！</span>
          </button>
          <span class="message-count">共 {{ totalMessages }} 条留言</span>
        </div>
      </div>

      <!-- 留言弹窗 -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="isMessageModalOpen"
            class="message-modal-overlay"
            @click="closeMessageModal"
          >
            <div
              class="message-modal"
              @click.stop
            >
              <div class="modal-header">
                <h3 class="modal-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  写下你的留言
                </h3>
                <button
                  class="modal-close"
                  @click="closeMessageModal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                    />
                  </svg>
                </button>
              </div>

              <div class="modal-body">
                <form
                  class="message-form"
                  @submit.prevent="submitMessage"
                >
                  <!-- 头像选择区域 -->
                  <div class="form-group avatar-group">
                    <div class="avatar-section">
                      <!-- 当前头像显示 -->
                      <div class="avatar-current-wrapper">
                        <div
                          class="avatar-upload-area"
                          :class="{ 'has-image': messageForm.avatar, 'uploading': avatarUploading }"
                          @click="!avatarUploading && toggleAvatarPicker()"
                        >
                          <!-- 头像预览 -->
                          <img
                            v-if="messageForm.avatar && !avatarUploading"
                            :src="messageForm.avatar"
                            class="avatar-preview"
                          >

                          <!-- 上传中状态 -->
                          <div
                            v-else-if="avatarUploading"
                            class="avatar-uploading"
                          >
                            <div class="avatar-spinner">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke-opacity="0.25"
                                />
                                <path
                                  d="M12 2a10 10 0 0 1 10 10"
                                  stroke-linecap="round"
                                />
                              </svg>
                            </div>
                            <span class="upload-text">上传中...</span>
                          </div>

                          <!-- 默认状态 -->
                          <div
                            v-else
                            class="avatar-placeholder"
                          >
                            <div class="avatar-icon">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle
                                  cx="12"
                                  cy="7"
                                  r="4"
                                />
                              </svg>
                            </div>
                            <span class="upload-hint">选择头像</span>
                          </div>

                          <!-- 删除头像按钮 -->
                          <button
                            v-if="messageForm.avatar && !avatarUploading"
                            type="button"
                            class="avatar-remove-btn"
                            title="删除头像"
                            @click.stop="removeAvatar"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2.5"
                            >
                              <line
                                x1="18"
                                y1="6"
                                x2="6"
                                y2="18"
                              />
                              <line
                                x1="6"
                                y1="6"
                                x2="18"
                                y2="18"
                              />
                            </svg>
                          </button>
                        </div>
                        <span class="avatar-tip">点击选择或上传头像</span>
                        
                        <!-- 清除信息按钮 -->
                        <button 
                          v-if="hasSavedInfo" 
                          type="button"
                          class="clear-info-btn" 
                          @click.stop="clearUserInfo"
                          title="清除已保存的昵称、邮箱和头像"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          清除记录
                        </button>
                      </div>

                      <!-- 头像选择器 -->
                      <div
                        v-if="showAvatarPicker"
                        class="avatar-picker"
                      >
                        <div class="avatar-picker-header">
                          <span class="avatar-picker-title">选择头像</span>
                          <button
                            type="button"
                            class="avatar-close-btn"
                            @click="toggleAvatarPicker"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <line
                                x1="18"
                                y1="6"
                                x2="6"
                                y2="18"
                              />
                              <line
                                x1="6"
                                y1="6"
                                x2="18"
                                y2="18"
                              />
                            </svg>
                          </button>
                        </div>

                        <!-- 风格选择标签 -->
                        <div class="avatar-style-tabs">
                          <button
                            v-for="(config, key) in avatarStyles"
                            :key="key"
                            type="button"
                            class="style-tab"
                            :class="{ 'active': currentStyle === key }"
                            @click="switchAvatarStyle(key)"
                          >
                            {{ config.name }}
                          </button>
                        </div>

                        <!-- 预设头像网格 -->
                        <div class="preset-avatars">
                          <div
                            v-for="(avatar, index) in presetAvatars"
                            :key="`${currentStyle}-${index}`"
                            class="preset-avatar-item"
                            :class="{ 'selected': messageForm.avatar === avatar }"
                            @click="selectPresetAvatar(avatar)"
                          >
                            <img
                              :src="avatar"
                              :alt="`预设头像 ${index + 1}`"
                            >
                          </div>
                        </div>

                        <!-- 自定义上传区域 -->
                        <div class="custom-upload-section">
                          <div
                            class="custom-upload-area"
                            :class="{ 'dragging': isDragging }"
                            @click="triggerFileInput"
                            @dragenter.prevent="isDragging = true"
                            @dragleave.prevent="isDragging = false"
                            @dragover.prevent
                            @drop.prevent="handleDrop($event)"
                          >
                            <input
                              ref="fileInput"
                              type="file"
                              accept="image/*"
                              style="display: none"
                              @change="handleFileChange"
                            >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line
                                x1="12"
                                y1="3"
                                x2="12"
                                y2="15"
                              />
                            </svg>
                            <span>上传自定义头像</span>
                            <small>支持 JPG、PNG，最大 10MB</small>
                          </div>
                        </div>
                      </div>
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
                      >
                      <span
                        v-if="formErrors.nickname"
                        class="error-msg"
                      >{{ formErrors.nickname }}</span>
                    </div>
                    <div class="form-group">
                      <input
                        v-model="messageForm.email"
                        type="email"
                        class="form-input"
                        placeholder="你的邮箱（选填）"
                        maxlength="50"
                      >
                      <span
                        v-if="formErrors.email"
                        class="error-msg"
                      >{{ formErrors.email }}</span>
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
                      />
                      <!-- Emoji 按钮 -->
                      <button
                        type="button"
                        class="emoji-trigger-btn"
                        @click="toggleEmojiPicker"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                          />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line
                            x1="9"
                            y1="9"
                            x2="9.01"
                            y2="9"
                          />
                          <line
                            x1="15"
                            y1="9"
                            x2="15.01"
                            y2="9"
                          />
                        </svg>
                      </button>
                    </div>

                    <!-- Emoji 选择器 -->
                    <div
                      v-if="showEmojiPicker"
                      class="emoji-picker"
                    >
                      <div class="emoji-picker-header">
                        <span class="emoji-picker-title">选择表情</span>
                        <button
                          type="button"
                          class="emoji-close-btn"
                          @click="toggleEmojiPicker"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <line
                              x1="18"
                              y1="6"
                              x2="6"
                              y2="18"
                            />
                            <line
                              x1="6"
                              y1="6"
                              x2="18"
                              y2="18"
                            />
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
                      <span
                        v-if="formErrors.content"
                        class="error-msg"
                      >{{ formErrors.content }}</span>
                      <span class="char-count">{{ messageForm.content.length }}/500</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="submit-btn"
                    :disabled="submitting"
                  >
                    <span
                      v-if="submitting"
                      class="btn-spinner"
                    />
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
          <div
            v-if="isReplyModalOpen"
            class="reply-modal-overlay"
            @click="closeReplyModal"
          >
            <div
              class="reply-modal"
              @click.stop
            >
              <div class="modal-header">
                <h3 class="modal-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {{ replyTarget.isRoot === 1 ? '回复留言' : `回复 @${replyTarget.nickname}` }}
                </h3>
                <button
                  class="modal-close"
                  @click="closeReplyModal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                    />
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
                  <p class="quote-content">
                    {{ replyTarget.content }}
                  </p>
                </div>

                <form
                  class="reply-form"
                  @submit.prevent="submitReply"
                >
                  <!-- 头像选择区域 -->
                  <div class="form-group avatar-group">
                    <div class="avatar-section">
                      <!-- 当前头像显示 -->
                      <div class="avatar-current-wrapper">
                        <div
                          class="avatar-upload-area"
                          :class="{ 'has-image': replyForm.avatar, 'uploading': replyAvatarUploading }"
                          @click="!replyAvatarUploading && toggleReplyAvatarPicker()"
                        >
                          <!-- 头像预览 -->
                          <img
                            v-if="replyForm.avatar && !replyAvatarUploading"
                            :src="replyForm.avatar"
                            class="avatar-preview"
                          >

                          <!-- 上传中状态 -->
                          <div
                            v-else-if="replyAvatarUploading"
                            class="avatar-uploading"
                          >
                            <div class="avatar-spinner">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke-opacity="0.25"
                                />
                                <path
                                  d="M12 2a10 10 0 0 1 10 10"
                                  stroke-linecap="round"
                                />
                              </svg>
                            </div>
                            <span class="upload-text">上传中...</span>
                          </div>

                          <!-- 默认状态 -->
                          <div
                            v-else
                            class="avatar-placeholder"
                          >
                            <div class="avatar-icon">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle
                                  cx="12"
                                  cy="7"
                                  r="4"
                                />
                              </svg>
                            </div>
                            <span class="upload-hint">选择头像</span>
                          </div>

                          <!-- 删除头像按钮 -->
                          <button
                            v-if="replyForm.avatar && !replyAvatarUploading"
                            type="button"
                            class="avatar-remove-btn"
                            title="删除头像"
                            @click.stop="removeReplyAvatar"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2.5"
                            >
                              <line
                                x1="18"
                                y1="6"
                                x2="6"
                                y2="18"
                              />
                              <line
                                x1="6"
                                y1="6"
                                x2="18"
                                y2="18"
                              />
                            </svg>
                          </button>
                        </div>
                        <span class="avatar-tip">点击选择或上传头像</span>
                        
                        <!-- 清除信息按钮 -->
                        <button 
                          v-if="hasSavedInfo" 
                          type="button"
                          class="clear-info-btn" 
                          @click.stop="clearUserInfo"
                          title="清除已保存的昵称、邮箱和头像"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          清除记录
                        </button>
                      </div>

                      <!-- 头像选择器 -->
                      <div
                        v-if="showReplyAvatarPicker"
                        class="avatar-picker"
                      >
                        <div class="avatar-picker-header">
                          <span class="avatar-picker-title">选择头像</span>
                          <button
                            type="button"
                            class="avatar-close-btn"
                            @click="toggleReplyAvatarPicker"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <line
                                x1="18"
                                y1="6"
                                x2="6"
                                y2="18"
                              />
                              <line
                                x1="6"
                                y1="6"
                                x2="18"
                                y2="18"
                              />
                            </svg>
                          </button>
                        </div>

                        <!-- 风格选择标签 -->
                        <div class="avatar-style-tabs">
                          <button
                            v-for="(config, key) in avatarStyles"
                            :key="key"
                            type="button"
                            class="style-tab"
                            :class="{ 'active': currentStyle === key }"
                            @click="switchAvatarStyle(key)"
                          >
                            {{ config.name }}
                          </button>
                        </div>

                        <!-- 预设头像网格 -->
                        <div class="preset-avatars">
                          <div
                            v-for="(avatar, index) in presetAvatars"
                            :key="`${currentStyle}-${index}`"
                            class="preset-avatar-item"
                            :class="{ 'selected': replyForm.avatar === avatar }"
                            @click="selectReplyPresetAvatar(avatar)"
                          >
                            <img
                              :src="avatar"
                              :alt="`预设头像 ${index + 1}`"
                            >
                          </div>
                        </div>

                        <!-- 自定义上传区域 -->
                        <div class="custom-upload-section">
                          <div
                            class="custom-upload-area"
                            :class="{ 'dragging': isReplyDragging }"
                            @click="triggerReplyFileInput"
                            @dragenter.prevent="isReplyDragging = true"
                            @dragleave.prevent="isReplyDragging = false"
                            @dragover.prevent
                            @drop.prevent="handleReplyDrop($event)"
                          >
                            <input
                              ref="replyFileInput"
                              type="file"
                              accept="image/*"
                              style="display: none"
                              @change="handleReplyFileChange"
                            >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line
                                x1="12"
                                y1="3"
                                x2="12"
                                y2="15"
                              />
                            </svg>
                            <span>上传自定义头像</span>
                            <small>支持 JPG、PNG，最大 10MB</small>
                          </div>
                        </div>
                      </div>
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
                      >
                    </div>
                    <div class="form-group">
                      <input
                        v-model="replyForm.email"
                        type="email"
                        class="form-input"
                        placeholder="你的邮箱（选填）"
                        maxlength="50"
                      >
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
                      />
                      <!-- Emoji 按钮 -->
                      <button
                        type="button"
                        class="emoji-trigger-btn"
                        @click="toggleReplyEmojiPicker"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                          />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line
                            x1="9"
                            y1="9"
                            x2="9.01"
                            y2="9"
                          />
                          <line
                            x1="15"
                            y1="9"
                            x2="15.01"
                            y2="9"
                          />
                        </svg>
                      </button>
                    </div>

                    <!-- Emoji 选择器 -->
                    <div
                      v-if="showReplyEmojiPicker"
                      class="emoji-picker"
                    >
                      <div class="emoji-picker-header">
                        <span class="emoji-picker-title">选择表情</span>
                        <button
                          type="button"
                          class="emoji-close-btn"
                          @click="toggleReplyEmojiPicker"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <line
                              x1="18"
                              y1="6"
                              x2="6"
                              y2="18"
                            />
                            <line
                              x1="6"
                              y1="6"
                              x2="18"
                              y2="18"
                            />
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
                    <span
                      v-if="replySubmitting"
                      class="btn-spinner"
                    />
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
        <div
          v-if="loading"
          class="loading-state"
        >
          <div class="loading-spinner" />
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="messages.length === 0"
          class="empty-state"
        >
          <svg
            class="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>还没有留言，来做第一个留言的人吧~</p>
        </div>

        <!-- 留言列表 -->
        <div
          v-else
          class="messages"
        >
          <div
            v-for="(item, index) in messages"
            :key="item.guestbookId"
            class="message-item"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <!-- 根留言 -->
            <div class="root-message">
              <div class="user-avatar">
                <img
                  v-if="item.avatar"
                  :src="item.avatar"
                  :alt="item.nickname"
                  @error="handleAvatarError"
                >
                <span v-else>{{ item.nickname.charAt(0).toUpperCase() }}</span>
              </div>

              <div class="message-content-wrapper">
                <div class="user-info">
                  <div class="user-details">
                    <div class="user-name-row">
                      <span class="nickname">{{ item.nickname }}</span>
                      <span
                        v-if="item.email"
                        class="email"
                      >{{ item.email }}</span>
                      <span
                        v-if="item.location"
                        class="location-tag"
                      >
                        {{ item.location }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="message-content">
                  {{ item.content }}
                </div>

                <div class="message-actions">
                  <span class="time">{{ formatTime(item.messageTime) }}</span>
                  <button
                    class="action-btn reply-btn"
                    @click="openReplyModal(item)"
                  >
                    回复
                  </button>
                  <!-- 展开回复按钮 (仅在收起时显示) -->
                  <button
                    v-if="(item.replyCount || 0) > 0 && !expandedReplies.includes(item.guestbookId)"
                    class="action-btn expand-btn"
                    @click="toggleReplies(item)"
                  >
                    {{ `共${item.replyCount}条回复，点击查看` }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 回复列表（可展开） -->
            <div
              v-if="expandedReplies.includes(item.guestbookId)"
              class="reply-list expanded"
            >
              <!-- 加载中 -->
              <div v-if="item.loadingReplies && (!item.replyList || item.replyList.length === 0)" class="reply-loading">
                <div class="reply-loading-spinner"></div>
                <span>加载中...</span>
              </div>

              <div
                v-else
                v-for="reply in item.replyList"
                :key="reply.guestbookId"
                class="reply-item"
              >
                <div class="reply-avatar">
                  <img
                    v-if="reply.avatar"
                    :src="reply.avatar"
                    :alt="reply.nickname"
                    @error="handleAvatarError"
                  >
                  <span v-else>{{ reply.nickname.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="reply-content-wrapper">
                  <div class="reply-header">
                    <div class="reply-name-row">
                      <span class="nickname">{{ reply.nickname }}</span>
                      <span
                        v-if="reply.email"
                        class="email"
                      >{{ reply.email }}</span>
                    </div>
                    <span class="time">{{ formatTime(reply.messageTime) }}</span>
                    <span
                      v-if="reply.location"
                      class="location"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle
                          cx="12"
                          cy="10"
                          r="3"
                        />
                      </svg>
                      {{ reply.location }}
                    </span>
                  </div>
                  <div class="reply-content">
                    <!-- 显示回复对象 -->
                    <span
                      v-if="reply.parentId !== 0 && reply.parentId !== item.guestbookId"
                      class="reply-to"
                    >
                      回复 <span class="reply-to-nickname">@{{ getReplyToNickname(item.replyList, reply.parentId, item, reply) }}</span>:
                    </span>
                    {{ reply.content }}
                  </div>
                  <div class="reply-actions">
                    <button
                      class="action-btn reply-btn"
                      @click="openReplyModal(reply, item)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      回复
                    </button>
                  </div>
                </div>
              </div>

              <!-- 分页与操作栏 -->
              <div class="reply-pagination-bar">
                <!-- 分页组件 (仅当超过1页时显示) -->
                <div v-if="item.replyTotal > 5" class="pagination-wrapper">
                  <span class="total-pages">共{{ Math.ceil(item.replyTotal / 5) }}页</span>

                  <button
                    class="prev-page-btn"
                    :disabled="(item.replyPageNum || 1) <= 1"
                    @click="loadChildReplies(item, (item.replyPageNum || 1) - 1)"
                  >
                    上一页
                  </button>

                  <div class="page-numbers">
                    <button
                      v-for="page in getPageRange(item.replyTotal, item.replyPageNum || 1)"
                      :key="page"
                      class="page-num-btn"
                      :class="{ active: (item.replyPageNum || 1) === page }"
                      @click="loadChildReplies(item, page)"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button
                    class="next-page-btn"
                    :disabled="(item.replyPageNum || 1) >= Math.ceil(item.replyTotal / 5)"
                    @click="loadChildReplies(item, (item.replyPageNum || 1) + 1)"
                  >
                    下一页
                  </button>
                </div>

                <button
                  class="collapse-reply-btn"
                  @click="toggleReplies(item)"
                >
                  收起
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多提示 -->
        <div
          v-if="messages.length > 0"
          class="load-more-section"
        >
          <div
            v-if="loadingMore"
            class="loading-more"
          >
            <div class="loading-spinner">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke-opacity="0.25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <span>加载中...</span>
          </div>
          <div
            v-else-if="!pageParams.hasMore"
            class="no-more"
          >
            <span>—— 已经到底啦 ——</span>
          </div>
          <div
            v-else
            class="scroll-hint"
          >
            <span>继续滚动加载更多</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <Transition name="fade">
      <button
        v-show="showBackToTop"
        class="back-to-top"
        title="回到顶部"
        @click="scrollToTop"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { getGuestbookList, addGuestbookMessage, getChildGuestbookList } from '@/api/front/guestbook.js'
import { uploadImage } from '@/api/front/file.js'
import { ElMessage } from 'element-plus'

// 导入 DiceBear 头像库
import { createAvatar } from '@dicebear/core'
import * as identicon from '@dicebear/identicon'
import * as avataaars from '@dicebear/avataaars'
import * as bottts from '@dicebear/bottts'
import * as funEmoji from '@dicebear/fun-emoji'
import * as pixelArt from '@dicebear/pixel-art'
import * as notionists from '@dicebear/notionists'
import * as adventurer from '@dicebear/adventurer'

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
const showAvatarPicker = ref(false)
const showReplyAvatarPicker = ref(false)
const expandedReplies = ref([])
const isDragging = ref(false)
const avatarUploading = ref(false)
const fileInput = ref(null)
const isReplyDragging = ref(false)
const replyAvatarUploading = ref(false)
const replyFileInput = ref(null)

// 用户信息存储相关
const STORAGE_KEY = 'guestbook_user_info'
const hasSavedInfo = ref(false)

// 加载保存的用户信息
const loadUserInfo = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const { nickname, email, avatar } = JSON.parse(saved)
      if (nickname) {
        messageForm.nickname = nickname
        replyForm.nickname = nickname
      }
      if (email) {
        messageForm.email = email
        replyForm.email = email
      }
      if (avatar) {
        messageForm.avatar = avatar
        replyForm.avatar = avatar
      }
      hasSavedInfo.value = true
    }
  } catch (e) {
    console.error('Failed to load user info:', e)
  }
}

// 保存用户信息
const saveUserInfo = (nickname, email, avatar) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nickname, email, avatar }))
    hasSavedInfo.value = true
  } catch (e) {
    console.error('Failed to save user info:', e)
  }
}

// 清除用户信息
const clearUserInfo = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    
    // 重置表单
    messageForm.nickname = ''
    messageForm.email = ''
    messageForm.avatar = ''
    
    replyForm.nickname = ''
    replyForm.email = ''
    replyForm.avatar = ''
    
    hasSavedInfo.value = false
    ElMessage.success('已清除保存的信息')
  } catch (e) {
    console.error('Failed to clear user info:', e)
  }
}

// DOM 渲染完成标志 - 用于防止在 DOM 未渲染完成时触发下一次加载
const isDomReady = ref(true)

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

// 头像风格配置 - 适配 DiceBear v9 的导出结构
const avatarStyles = {
  identicon: { name: '几何图案', style: identicon },
  avataaars: { name: '卡通人物', style: avataaars },
  bottts: { name: '机器人', style: bottts },
  funEmoji: { name: '表情符号', style: funEmoji },
  pixelArt: { name: '像素艺术', style: pixelArt },
  notionists: { name: '极简线条', style: notionists },
  adventurer: { name: '冒险家', style: adventurer }
}

// 当前选中的风格
const currentStyle = ref('identicon')

// 生成头像列表
const generateAvatars = (styleKey, count = 12) => {
  const style = avatarStyles[styleKey]?.style
  if (!style) {
    console.warn('未找到风格:', styleKey)
    return []
  }

  const seeds = ['Felix', 'Aneka', 'Zack', 'Bella', 'Leo', 'Molly', 'Max', 'Luna', 'Charlie', 'Lucy', 'Jack', 'Daisy', 'Milo', 'Ruby', 'Oliver', 'Emma']

  return seeds.slice(0, count).map(seed => {
    try {
      // DiceBear v9: createAvatar 返回 Avatar 对象，需要调用 toDataUri() 获取 data URI
      const avatar = createAvatar(style, {
        seed,
        size: 128,
        backgroundColor: ['transparent']
      })

      // 调用 toDataUri() 方法获取 data URI
      return avatar.toDataUri()
    } catch (err) {
      console.error('生成头像失败:', err)
      return ''
    }
  }).filter(Boolean)
}

// 预设头像列表（根据当前风格动态生成）
const presetAvatars = computed(() => generateAvatars(currentStyle.value))

// 计算总留言数
// 总留言数（优先使用 guestbookAllCount，否则使用 total）
const totalMessages = computed(() => pageParams.guestbookAllCount || pageParams.total)

// 打开留言弹窗
const openMessageModal = () => {
  // 如果头像为空但有保存的信息，尝试重新加载
  if (!messageForm.avatar && hasSavedInfo.value) {
    loadUserInfo()
  }
  isMessageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭留言弹窗
const closeMessageModal = () => {
  isMessageModalOpen.value = false
  document.body.style.overflow = ''
  showEmojiPicker.value = false
  showAvatarPicker.value = false
  // 重置表单错误
  formErrors.nickname = ''
  formErrors.email = ''
  formErrors.content = ''
}

// 切换头像选择器
const toggleAvatarPicker = () => {
  showAvatarPicker.value = !showAvatarPicker.value
}

// 选择预设头像
const selectPresetAvatar = (avatar) => {
  messageForm.avatar = avatar
  showAvatarPicker.value = false
}

// 切换头像风格
const switchAvatarStyle = (styleKey) => {
  currentStyle.value = styleKey
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
const toggleReplies = async (item) => {
  if (expandedReplies.value.includes(item.guestbookId)) {
    const index = expandedReplies.value.indexOf(item.guestbookId)
    expandedReplies.value.splice(index, 1)
  } else {
    expandedReplies.value.push(item.guestbookId)
    // 如果没有回复列表或者列表为空，尝试加载
    if (!item.replyList || item.replyList.length === 0) {
      await loadChildReplies(item)
    }
  }
}

// 加载子留言
const loadChildReplies = async (rootMessage, pageNum = 1) => {
  rootMessage.loadingReplies = true
  try {
    const res = await getChildGuestbookList({
      guestbookId: rootMessage.guestbookId,
      pageNum: pageNum,
      pageSize: 5 // 默认每页5条
    })
    if (res.code === 200) {
      // 分页加载模式：直接覆盖当前页数据
      rootMessage.replyList = res.data || res.rows || []

      // 使用 Math.max 确保如果前端已经增加了总数，不会被后端旧数据覆盖（解决Redis异步更新延迟问题）
      rootMessage.replyTotal = Math.max(rootMessage.replyTotal || 0, res.total || 0)
      
      rootMessage.replyPageNum = pageNum
      rootMessage.replyHasMore = (rootMessage.replyList.length < rootMessage.replyTotal)
    }
  } catch (error) {
    console.error('加载子留言失败:', error)
  } finally {
    rootMessage.loadingReplies = false
  }
}

// 获取分页页码范围
const getPageRange = (total, current) => {
  const pageSize = 5
  const totalPages = Math.ceil(total / pageSize)
  const range = []

  // 简单实现：显示所有页码，如果太多可以后续优化
  for (let i = 1; i <= totalPages; i++) {
    range.push(i)
  }
  return range
}

// 打开回复弹窗
const openReplyModal = (target, rootMessage = null) => {
  // 如果头像为空但有保存的信息，尝试重新加载
  if (!replyForm.avatar && hasSavedInfo.value) {
    loadUserInfo()
  }
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
  showReplyAvatarPicker.value = false
  replyTarget.value = {}
  currentRootMessage.value = null
  replyForm.nickname = ''
  replyForm.email = ''
  replyForm.content = ''
  replyForm.avatar = ''
}

// 切换回复头像选择器
const toggleReplyAvatarPicker = () => {
  showReplyAvatarPicker.value = !showReplyAvatarPicker.value
}

// 选择回复预设头像
const selectReplyPresetAvatar = (avatar) => {
  replyForm.avatar = avatar
  showReplyAvatarPicker.value = false
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
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
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
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
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

// 将 data URI 转换为 Blob
const dataURItoBlob = (dataURI) => {
  // 分离 MIME 类型和 base64/utf8 数据
  const parts = dataURI.split(',')
  const header = parts[0]
  let data = parts[1]

  // 获取 MIME 类型
  const mimeMatch = header.match(/:(.*?);/)
  const mimeString = mimeMatch ? mimeMatch[1] : 'image/svg+xml'

  // 检查是否是 base64 编码
  const isBase64 = header.includes('base64')

  let byteString
  if (isBase64) {
    // base64 编码，直接使用 atob
    byteString = atob(data)
  } else {
    // URL 编码（如 %3Csvg%3E），先 decodeURIComponent
    byteString = decodeURIComponent(data)
  }

  // 转换为 Uint8Array
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }

  return new Blob([bytes], { type: mimeString })
}

// 将 SVG data URI 转换为 PNG Blob
const svgToPngBlob = async (svgDataUri) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 128, 128)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/png')
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = svgDataUri
  })
}

// 上传预设头像（将 SVG 转为 PNG 后上传）
const uploadPresetAvatar = async (dataUri) => {
  if (!dataUri || !dataUri.startsWith('data:')) return dataUri

  try {
    let blob
    let filename
    let mimeType

    if (dataUri.includes('image/svg+xml')) {
      // SVG 格式，需要转换为 PNG
      blob = await svgToPngBlob(dataUri)
      filename = 'avatar.png'
      mimeType = 'image/png'
    } else {
      // 其他格式，直接转换
      blob = dataURItoBlob(dataUri)
      filename = 'avatar.png'
      mimeType = 'image/png'
    }

    const file = new File([blob], filename, { type: mimeType })
    const formData = new FormData()
    formData.append('image', file)

    const res = await uploadImage(formData)
    if (res.code === 200) {
      return res.imgUrl
    }
    throw new Error(res.msg || '上传失败')
  } catch (error) {
    console.error('头像上传失败:', error)
    // 如果上传失败，返回空字符串（使用默认头像）
    return ''
  }
}

// 获取回复对象的昵称
const getReplyToNickname = (replyList, parentId, rootMessage, currentReply) => {
  // 优先使用后端返回的 parentNickname
  if (currentReply && currentReply.parentNickname) {
    return currentReply.parentNickname
  }

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
    } else if (form.nickname.trim().length < 1) {
      formErrors.nickname = '昵称至少1个字符'
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
    } else if (form.content.trim().length < 1) {
      formErrors.content = '内容至少1个字符'
      isValid = false
    }
  }

  return isValid
}

// 静默刷新 - 保留展开状态，只更新数据
const silentRefresh = async () => {
  try {
    const res = await getGuestbookList({
      pageNum: 1,
      pageSize: pageParams.pageNum * pageParams.pageSize
    })
    if (res.code === 200) {
      // 兼容后端可能返回 rows 或 data
      const newRows = res.data || res.rows || []

      // 合并新数据，保留已加载的回复列表
      const mergedMessages = newRows.map(newItem => {
        const existingItem = messages.value.find(m => m.guestbookId === newItem.guestbookId)
        if (existingItem) {
          return {
            ...newItem,
            loadingReplies: existingItem.loadingReplies || false,
            replyList: existingItem.replyList || [],
            replyTotal: newItem.replyCount || existingItem.replyTotal || 0,
            replyPageNum: existingItem.replyPageNum || 1,
            replyHasMore: existingItem.replyHasMore
          }
        } else {
          return {
            ...newItem,
            loadingReplies: false,
            replyList: [],
            replyTotal: newItem.replyCount || 0,
            replyPageNum: 1,
            replyHasMore: (newItem.replyCount || 0) > 0
          }
        }
      })

      messages.value = mergedMessages
      pageParams.total = res.total || 0
    }
  } catch (error) {
    console.error('静默刷新失败:', error)
  }
}

// 提交留言
const submitMessage = async () => {
  if (!validateForm(messageForm)) return

  submitting.value = true
  try {
    // 如果头像是 data URI，先上传到对象存储
    let avatarUrl = messageForm.avatar
    if (avatarUrl && avatarUrl.startsWith('data:')) {
      avatarUrl = await uploadPresetAvatar(avatarUrl)
      // 更新表单中的头像为远程地址，以便保存
      messageForm.avatar = avatarUrl
    }

    const data = {
      nickname: messageForm.nickname.trim(),
      email: messageForm.email.trim(),
      content: messageForm.content.trim(),
      avatar: avatarUrl,
      rootId: 0,
      parentId: 0
    }

    const res = await addGuestbookMessage(data)
    if (res.code === 200) {
      // 保存用户信息
      saveUserInfo(messageForm.nickname, messageForm.email, messageForm.avatar)

      messageForm.content = ''
      // messageForm.avatar = '' // 不再清空头像
      closeMessageModal()
      
      // 手动更新总数
      pageParams.guestbookAllCount = (pageParams.guestbookAllCount || 0) + 1
      pageParams.total = (pageParams.total || 0) + 1
      
      // 静默刷新获取真实ID
      await silentRefresh()
    } else {
      ElMessage.error(res.msg || '发表失败')
    }
  } catch (error) {
    console.error('提交留言失败:', error)
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
    // 如果头像是 data URI，先上传到对象存储
    let avatarUrl = replyForm.avatar
    if (avatarUrl && avatarUrl.startsWith('data:')) {
      avatarUrl = await uploadPresetAvatar(avatarUrl)
      // 更新表单中的头像为远程地址，以便保存
      replyForm.avatar = avatarUrl
    }

    const isRoot = replyTarget.value.isRoot === 1
    const rootId = isRoot ? replyTarget.value.guestbookId : replyTarget.value.rootId
    const data = {
      nickname: replyForm.nickname.trim(),
      email: replyForm.email.trim(),
      content: replyForm.content.trim(),
      avatar: avatarUrl,
      rootId: rootId,
      parentId: replyTarget.value.guestbookId
    }

    const res = await addGuestbookMessage(data)
    if (res.code === 200) {
      // ElMessage.success('回复发表成功！')
      
      // 保存用户信息
      saveUserInfo(replyForm.nickname, replyForm.email, replyForm.avatar)
      
      // 保存昵称和邮箱到主表单
      messageForm.nickname = replyForm.nickname
      messageForm.email = replyForm.email
      
      // 保存当前操作的根留言引用，因为 closeReplyModal 会将其重置为 null
      const targetRootMessage = currentRootMessage.value

      closeReplyModal()

      // 手动更新总数
      pageParams.guestbookAllCount = (pageParams.guestbookAllCount || 0) + 1

      // 刷新子留言列表
      if (targetRootMessage) {
        // 手动增加子评论总数
        targetRootMessage.replyTotal = (targetRootMessage.replyTotal || 0) + 1
        
        // 确保展开
        if (!expandedReplies.value.includes(targetRootMessage.guestbookId)) {
          expandedReplies.value.push(targetRootMessage.guestbookId)
        }
        
        // 计算目标页码：跳转到最后一页以显示新评论
        const pageSize = 5
        const targetPage = Math.ceil(targetRootMessage.replyTotal / pageSize) || 1
        
        await loadChildReplies(targetRootMessage, targetPage)
      } else {
        await silentRefresh()
      }
    } else {
      ElMessage.error(res.msg || '回复失败')
    }
  } catch (error) {
    console.error('提交回复失败:', error)
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

// 分页参数
const pageParams = reactive({
  pageNum: 1,
  pageSize: 20,  // 每页20条记录
  total: 0,
  guestbookAllCount: 0,
  hasMore: true
})

// 回到顶部按钮显示状态
const showBackToTop = ref(false)
const loadingMore = ref(false)

// 加载留言列表（首次加载）
const loadMessages = async () => {
  loading.value = true
  isDomReady.value = false  // 标记 DOM 未就绪
  pageParams.pageNum = 1
  pageParams.hasMore = true
  messages.value = [] // 清空数据
  try {
    const res = await getGuestbookList({
      pageNum: 1,
      pageSize: pageParams.pageSize
    })
    if (res.code === 200) {
      // 兼容后端可能返回 rows 或 data
      const rows = res.data || res.rows || []
      messages.value = rows.map(item => ({
        ...item,
        loadingReplies: false,
        replyList: item.replyList || [],
        replyTotal: item.replyCount || 0,
        replyPageNum: 1,
        replyHasMore: (item.replyCount || 0) > (item.replyList?.length || 0)
      }))
      // 保存后端返回的总数
      pageParams.total = res.total || 0
      pageParams.guestbookAllCount = res.guestbookAllCount || 0

      // 根据总页数判断是否还有更多
      const totalPages = Math.ceil(pageParams.total / pageParams.pageSize)
      pageParams.hasMore = pageParams.pageNum < totalPages

      // 等待 DOM 更新完成
      await nextTick()

      // 使用 requestAnimationFrame 确保浏览器已完成渲染
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollContainer = getScrollContainer()
          let scrollHeight, clientHeight

          if (scrollContainer === window) {
            scrollHeight = document.documentElement.scrollHeight
            clientHeight = window.innerHeight
          } else {
            scrollHeight = scrollContainer.scrollHeight
            clientHeight = scrollContainer.clientHeight
          }

          // 标记 DOM 已就绪
          loading.value = false
          isDomReady.value = true

          // 首次加载后，如果内容不足一屏且还有更多数据，自动加载更多
          if (scrollHeight <= clientHeight + 100 && pageParams.hasMore) {
            loadMoreMessages()
          }
        })
      })
    } else {
      loading.value = false
      isDomReady.value = true
    }
  } catch (error) {
    console.error('加载留言失败:', error)
    loading.value = false
    isDomReady.value = true
  }
}

// 加载更多留言
const loadMoreMessages = async () => {
  if (loadingMore.value || !pageParams.hasMore || !isDomReady.value) return

  // 计算总页数，防止因后端分页合理化导致重复加载最后一页
  const totalPages = Math.ceil(pageParams.total / pageParams.pageSize)
  const nextPage = pageParams.pageNum + 1

  if (nextPage > totalPages) {
    pageParams.hasMore = false
    return
  }

  loadingMore.value = true
  isDomReady.value = false  // 标记 DOM 未就绪，防止重复触发

  try {
    const res = await getGuestbookList({
      pageNum: nextPage,
      pageSize: pageParams.pageSize
    })

    if (res.code === 200) {
      // 兼容后端可能返回 rows 或 data
      const newMessages = res.data || res.rows || []
      if (newMessages.length > 0) {
        const processedMessages = newMessages.map(item => ({
          ...item,
          loadingReplies: false,
          replyList: item.replyList || [],
          replyTotal: item.replyCount || 0,
          replyPageNum: 1,
          replyHasMore: (item.replyCount || 0) > (item.replyList?.length || 0)
        }))
        messages.value.push(...processedMessages)
        pageParams.pageNum = nextPage
      }
      // 更新总数并根据总页数判断是否还有更多
      pageParams.total = res.total || 0
      pageParams.guestbookAllCount = res.guestbookAllCount || 0

      const currentTotalPages = Math.ceil(pageParams.total / pageParams.pageSize)
      pageParams.hasMore = pageParams.pageNum < currentTotalPages

      // 等待 DOM 更新完成
      await nextTick()

      // 使用 requestAnimationFrame 确保浏览器已完成渲染
      requestAnimationFrame(() => {
        // 再等待一帧，确保内容已完全渲染
        requestAnimationFrame(() => {
          const scrollContainer = getScrollContainer()
          let scrollHeight, clientHeight

          if (scrollContainer === window) {
            scrollHeight = document.documentElement.scrollHeight
            clientHeight = window.innerHeight
          } else {
            scrollHeight = scrollContainer.scrollHeight
            clientHeight = scrollContainer.clientHeight
          }

          // 标记 DOM 已就绪
          loadingMore.value = false
          isDomReady.value = true

          // 只有当内容确实不足一屏时才继续加载
          if (scrollHeight <= clientHeight + 100 && pageParams.hasMore) {
            loadMoreMessages()
          }
        })
      })
    } else {
      pageParams.hasMore = false
      loadingMore.value = false
      isDomReady.value = true
    }
  } catch (error) {
    console.error('加载更多留言失败:', error)
    loadingMore.value = false
    isDomReady.value = true
  }
}

// 获取滚动容器
const getScrollContainer = () => {
  // 查找 .main-content 元素（FrontLayout 中的滚动容器）
  return document.querySelector('.main-content') || window
}

// 上次触发加载的时间戳
let lastLoadTime = 0
// 最小触发间隔（毫秒）
const MIN_LOAD_INTERVAL = 300

// 滚动监听 - 懒加载
const handleScroll = () => {
  const scrollContainer = getScrollContainer()

  let scrollTop, scrollHeight, clientHeight

  if (scrollContainer === window) {
    scrollTop = window.scrollY || document.documentElement.scrollTop
    scrollHeight = document.documentElement.scrollHeight
    clientHeight = window.innerHeight
  } else {
    scrollTop = scrollContainer.scrollTop
    scrollHeight = scrollContainer.scrollHeight
    clientHeight = scrollContainer.clientHeight
  }

  // 显示/隐藏回到顶部按钮
  showBackToTop.value = scrollTop > 300

  // 提前加载：距离底部 800px 时就开始加载下一页（约2-3屏的数据）
  // 这样用户滚动时感觉不到加载延迟，实现无缝体验
  const scrollBottom = scrollTop + clientHeight
  const threshold = scrollHeight - 2000

  // 检查是否需要加载更多
  const now = Date.now()
  const shouldLoad = messages.value.length > 0 &&
                     pageParams.hasMore &&
                     !loadingMore.value &&
                     isDomReady.value &&  // DOM 必须已就绪
                     scrollBottom >= threshold &&
                     (now - lastLoadTime) >= MIN_LOAD_INTERVAL

  if (shouldLoad) {
    lastLoadTime = now
    loadMoreMessages()
  }
}



// 回到顶部
const scrollToTop = () => {
  const scrollContainer = getScrollContainer()
  if (scrollContainer === window) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } else {
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 页面加载
onMounted(() => {
  loadUserInfo()
  loadMessages()
  // 延迟绑定滚动事件，确保 DOM 已渲染
  setTimeout(() => {
    const scrollContainer = getScrollContainer()
    if (scrollContainer && scrollContainer !== window) {
      scrollContainer.addEventListener('scroll', handleScroll)
    } else {
      window.addEventListener('scroll', handleScroll)
    }
  }, 200)
})

// 页面卸载时移除监听
onUnmounted(() => {
  const scrollContainer = getScrollContainer()
  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
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
.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avatar-current-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4px; // 为删除按钮留出空间
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
  overflow: visible; // 改为 visible，让删除按钮可以超出边界
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

.clear-info-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
  padding: 0.3rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }
}

// 头像选择器
.avatar-picker {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  animation: slideInUp 0.2s ease;

  // 风格选择标签
  .avatar-style-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .style-tab {
      padding: 0.4rem 0.8rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: rgba($primary-color, 0.1);
        border-color: rgba($primary-color, 0.3);
        color: $primary-light;
      }

      &.active {
        background: rgba($primary-color, 0.2);
        border-color: $primary-color;
        color: #fff;
      }
    }
  }

  .avatar-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;

    .avatar-picker-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }

    .avatar-close-btn {
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
}

// 预设头像网格
.preset-avatars {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.6rem;
  margin-bottom: 1rem;

  .preset-avatar-item {
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.05);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      border-color: rgba($primary-color, 0.5);
      transform: scale(1.05);
    }

    &.selected {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
    }
  }
}

// 自定义上传区域
.custom-upload-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;

  .custom-upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    svg {
      width: 24px;
      height: 24px;
      color: rgba(255, 255, 255, 0.5);
    }

    span {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }

    small {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
    }

    &:hover {
      border-color: rgba($primary-color, 0.5);
      background: rgba($primary-color, 0.05);

      svg {
        color: $primary-light;
      }
    }

    &.dragging {
      border-color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
  }
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
  background: rgba(24, 24, 27, 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(138, 135, 135, 0.08);
  overflow: hidden;
  animation: slideInUp 0.5s ease backwards;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba($primary-color, 0.2);
  }
}

// 根留言
.root-message {
  padding: 1rem 1rem 1.5rem; // 减小左右 padding，增加内容宽度
  display: flex;
  gap: 1rem;

  .message-header {
    margin-bottom: 0.5rem;
    flex: 1;
  }
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba($primary-color, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  .user-name-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;

    .nickname {
      font-size: 1rem;
      font-weight: 700;
      color: #eea4b9; // Bilibili 风格粉色昵称
      font-family: 'Archivo', sans-serif;
    }

    .email {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    .location-tag {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;

      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        margin-right: 0.5rem;
      }
    }
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    .time {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .location {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.3);

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }
}

.message-content {
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  white-space: pre-wrap;
  word-break: break-word;
  padding: 0.2rem 0;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.8rem;

  .time {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .action-btn {
    padding: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);

    &:hover {
      color: $primary-light;
      background: transparent;
    }
  }
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

// 回复列表 - Bilibili风格
.reply-list {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  margin-left: calc(1rem + 1.5rem); // 对齐主评论内容
  margin-right: 1.5rem;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.expanded {
    max-height: 5000px;
    opacity: 1;
    padding: 0.8rem 1rem;
    overflow: visible;
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

.reply-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.5);
  gap: 0.5rem;
  font-size: 0.9rem;

  .reply-loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

.reply-pagination-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.8rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;

  .pagination-wrapper {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    .total-pages {
      margin-right: 0.2rem;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .page-num-btn {
        min-width: 24px;
        height: 24px;
        padding: 0 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.6);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.8rem;

        &:hover {
          color: $primary-light;
          border-color: rgba($primary-color, 0.3);
          background: rgba($primary-color, 0.1);
        }

        &.active {
          color: #fff;
          background: $primary-color;
          border-color: $primary-color;
        }
      }
    }

    .prev-page-btn,
    .next-page-btn {
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      padding: 0 0.2rem;

      &:hover:not(:disabled) {
        color: $primary-light;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }

  .collapse-reply-btn {
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: $primary-light;
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
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
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

  // 头像选择器移动端适配
  .preset-avatars {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;

    .preset-avatar-item {
      border-radius: 10px;
    }
  }

  .avatar-picker {
    padding: 0.8rem;
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

// 加载更多区域
.load-more-section {
  padding: 2rem 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    .loading-spinner {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  .no-more {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.85rem;
  }

  .scroll-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;

    svg {
      width: 20px;
      height: 20px;
      animation: bounce 1.5s infinite;
    }
  }
}

// 回到顶部按钮 - 右下角往上移动
.back-to-top {
  position: fixed;
  right: 2rem;
  bottom: 8rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  transition: all 0.3s ease;
  z-index: 100;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
  }

  &:active {
    transform: translateY(-1px);
  }
}

// 按钮淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// 弹跳动画
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

// 移动端适配回到顶部按钮
@media (max-width: 768px) {
  .back-to-top {
    right: 1rem;
    bottom: 8rem;
    width: 44px;
    height: 44px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .load-more-section {
    padding: 1.5rem 0;
  }
}
</style>
