<template>
  <div class="links-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">友链</h1>
      <p class="page-subtitle">志同道合的朋友们，一起交流成长</p>
    </div>

    <div class="links-container">
      <!-- 左侧：友链列表 -->
      <div class="links-section">
        <div class="section-header">
          <h2 class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            我的朋友们
          </h2>
          <div class="header-actions">
            <button class="apply-trigger-btn" @click="openApplyModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>想要交换友链？点我来申请吧！</span>
            </button>
            <span class="links-count">共 {{ friendLinks.length }} 个站点</span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="friendLinks.length === 0" class="empty-state">
          <p>暂无友链，快来申请成为第一个吧</p>
        </div>

        <!-- 友链网格 -->
        <div v-else class="links-grid">
          <div
            v-for="(link, index) in friendLinks"
            :key="link.friendLinksId"
            class="link-card"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="visitLink(link.url)"
          >
            <div class="link-avatar">
              <img
                :src="link.logo || defaultLogo"
                :alt="link.name"
                @error="handleImageError"
              />
            </div>
            <div class="link-info">
              <h3 class="link-name">{{ link.name }}</h3>
              <p class="link-desc">{{ link.description || '暂无描述' }}</p>
              <div class="link-meta">
                <span class="link-url">{{ formatUrl(link.url) }}</span>
                <span v-if="link.joinTime" class="join-time">{{ formatJoinTime(link.joinTime) }}</span>
              </div>
            </div>
            <div class="link-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：申请须知 -->
      <div class="info-section">
        <div class="info-card">
          <h3 class="info-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            申请须知
          </h3>
          <ul class="info-list">
            <li>站点内容需健康、积极，无违法违规信息</li>
            <li>申请前请先添加本站友链</li>
            <li>审核通过后将显示在友链列表中</li>
            <li>长时间无法访问的站点将被移除</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 申请友链弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isApplyModalOpen" class="apply-modal-overlay" @click="closeApplyModal">
          <div class="apply-modal" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                申请友链
              </h3>
              <button class="modal-close" @click="closeApplyModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <p class="modal-desc">填写信息申请加入友链，审核通过后将展示在列表中</p>

              <form class="apply-form" @submit.prevent="handleSubmit">
                <!-- 站点名称 -->
                <div class="form-group">
                  <label class="form-label">
                    站点名称
                    <span class="required">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="请输入站点名称"
                    maxlength="30"
                  />
                  <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
                </div>

                <!-- 站点地址 -->
                <div class="form-group">
                  <label class="form-label">
                    站点地址
                    <span class="required">*</span>
                  </label>
                  <input
                    v-model="form.url"
                    type="url"
                    class="form-input"
                    placeholder="https://example.com"
                  />
                  <span v-if="errors.url" class="error-msg">{{ errors.url }}</span>
                </div>

                <!-- 站点Logo -->
                <div class="form-group">
                  <label class="form-label">站点 Logo</label>
                  <div class="logo-upload">
                    <div
                      class="upload-area"
                      :class="{ 'has-image': form.logo, 'dragging': isDragging }"
                      @click="triggerFileInput"
                      @dragenter.prevent="isDragging = true"
                      @dragleave.prevent="isDragging = false"
                      @dragover.prevent
                      @drop.prevent="handleDrop"
                    >
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleFileChange"
                      />
                      <img v-if="form.logo" :src="form.logo" class="preview-image" />
                      <div v-else-if="logoUploading" class="upload-loading">
                        <div class="upload-spinner"></div>
                        <span>上传中...</span>
                      </div>
                      <div v-else class="upload-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>点击或拖拽上传</span>
                        <small>支持 JPG、PNG 格式</small>
                      </div>
                      <button
                        v-if="form.logo"
                        type="button"
                        class="remove-image"
                        @click.stop="removeImage"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <span v-if="errors.logo" class="error-msg">{{ errors.logo }}</span>
                </div>

                <!-- 站点描述 -->
                <div class="form-group">
                  <label class="form-label">站点描述</label>
                  <textarea
                    v-model="form.description"
                    class="form-textarea"
                    placeholder="简单介绍一下你的站点..."
                    rows="3"
                    maxlength="100"
                  ></textarea>
                  <span class="char-count">{{ form.description.length }}/100</span>
                </div>

                <!-- 联系邮箱 -->
                <div class="form-group">
                  <label class="form-label">联系邮箱</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    placeholder="your@email.com"
                  />
                  <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
                </div>

                <!-- 提交按钮 -->
                <button
                  type="submit"
                  class="submit-btn"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="btn-spinner"></span>
                  <span>{{ submitting ? '提交中...' : '提交申请' }}</span>
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
import { ref, reactive, onMounted } from 'vue'
import { getDisplayedFriendLinks, requestToAddFriendLink } from '@/api/front/friendLinks.js'
import { uploadImage } from '@/api/front/file.js'
import { ElMessage } from 'element-plus'

// 默认Logo
const defaultLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiMzRjNGNDYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+CjxwYXRoIGQ9Ik0yIDExMnYyMCIvPgo8cGF0aCBkPSJNMTIgMmEyMCAyMCAwIDAgMSAyMCAyMCIvPgo8L3N2Zz4KPC9zdmc+'

// 数据状态
const friendLinks = ref([])
const loading = ref(false)
const submitting = ref(false)
const isDragging = ref(false)
const fileInput = ref(null)
const logoUploading = ref(false)
const isApplyModalOpen = ref(false)

// 表单数据
const form = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  email: ''
})

// 表单错误
const errors = reactive({
  name: '',
  url: '',
  logo: '',
  email: ''
})

// 打开申请弹窗
const openApplyModal = () => {
  isApplyModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭申请弹窗
const closeApplyModal = () => {
  isApplyModalOpen.value = false
  document.body.style.overflow = ''
  // 重置表单
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.name = ''
  form.url = ''
  form.logo = ''
  form.description = ''
  form.email = ''
  errors.name = ''
  errors.url = ''
  errors.email = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 加载友链列表
const loadFriendLinks = async () => {
  loading.value = true
  try {
    const res = await getDisplayedFriendLinks({ pageNum: 1, pageSize: 100 })
    if (res.code === 200) {
      friendLinks.value = res.rows || []
    }
  } catch (error) {
    console.error('加载友链失败:', error)
  } finally {
    loading.value = false
  }
}

// 访问链接
const visitLink = (url) => {
  if (!url) return
  let finalUrl = url
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    finalUrl = 'https://' + url
  }
  window.open(finalUrl, '_blank')
}

// 格式化URL显示
const formatUrl = (url) => {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

// 格式化加入时间
const formatJoinTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = defaultLogo
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    await uploadLogo(file)
  }
}

// 处理拖拽上传
const handleDrop = async (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    await uploadLogo(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

// 上传Logo
const uploadLogo = async (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  logoUploading.value = true
  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await uploadImage(formData)
    if (res.code === 200) {
      form.logo = res.imgUrl
      ElMessage.success('Logo 上传成功')
    } else {
    }
  } catch (error) {
    console.error('上传失败:', error)
  } finally {
    logoUploading.value = false
  }
}

// 移除图片
const removeImage = () => {
  form.logo = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 表单验证
const validateForm = () => {
  let isValid = true

  errors.name = ''
  errors.url = ''
  errors.email = ''

  if (!form.name.trim()) {
    errors.name = '请输入站点名称'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = '站点名称至少 2 个字符'
    isValid = false
  }

  if (!form.url.trim()) {
    errors.url = '请输入站点地址'
    isValid = false
  } else {
    const urlPattern = /^https?:\/\/.+|^[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9]*)+/
    if (!urlPattern.test(form.url.trim())) {
      errors.url = '请输入正确的网址格式'
      isValid = false
    }
  }

  if (form.email.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email.trim())) {
      errors.email = '请输入正确的邮箱格式'
      isValid = false
    }
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    const data = {
      name: form.name.trim(),
      url: form.url.trim(),
      logo: form.logo,
      description: form.description.trim(),
      email: form.email.trim()
    }

    const res = await requestToAddFriendLink(data)
    if (res.code === 200) {
      ElMessage.success('申请提交成功，请等待审核')
      closeApplyModal()
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 页面加载
onMounted(() => {
  loadFriendLinks()
})
</script>

<style lang="scss" scoped>
.links-page {
  width: 100%;
  max-width: 1400px;
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

// 主容器布局
.links-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2.5rem;
  align-items: start;
}

// 左侧友链区域
.links-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      font-family: 'Archivo', sans-serif;

      .icon {
        width: 22px;
        height: 22px;
        color: #2563eb;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;

      .apply-trigger-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: rgba(37, 99, 235, 0.1);
        border: 1px solid rgba(37, 99, 235, 0.3);
        border-radius: 20px;
        color: #60a5fa;
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
          background: rgba(37, 99, 235, 0.2);
          border-color: rgba(37, 99, 235, 0.5);
          color: #93c5fd;
          transform: translateY(-1px);
        }
      }

      .links-count {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.05);
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
      }
    }
  }
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
    border-top-color: #2563eb;
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

// 友链网格
.links-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// 友链卡片
.link-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.5rem;
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: slideInUp 0.5s ease backwards;

  &:hover {
    transform: translateY(-3px);
    background: rgba(24, 24, 27, 0.6);
    border-color: rgba(37, 99, 235, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

    .link-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .link-avatar {
    flex-shrink: 0;

    img {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
  }

  &:hover .link-avatar img {
    border-color: rgba(37, 99, 235, 0.5);
    transform: scale(1.05);
  }

  .link-info {
    flex: 1;
    min-width: 0;

    .link-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.4rem;
      font-family: 'Archivo', sans-serif;
    }

    .link-desc {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.4;
      margin-bottom: 0.4rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .link-meta {
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .link-url {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.4);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }

      .join-time {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.05);
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
      }
    }
  }

  .link-arrow {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 12px;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;

    svg {
      width: 18px;
      height: 18px;
      color: #2563eb;
    }
  }
}

// 右侧信息区域
.info-section {
  position: sticky;
  top: 2rem;
}

// 信息卡片
.info-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(24, 24, 27, 0.4) 100%);
  backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  animation: slideInUp 0.6s ease 0.1s backwards;

  .info-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
    font-family: 'Archivo', sans-serif;

    svg {
      width: 18px;
      height: 18px;
      color: #2563eb;
    }
  }

  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      position: relative;
      padding-left: 1.2rem;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
      margin-bottom: 0.6rem;

      &:last-child {
        margin-bottom: 0;
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.5rem;
        width: 6px;
        height: 6px;
        background: #2563eb;
        border-radius: 50%;
      }
    }
  }
}

// 申请弹窗遮罩
.apply-modal-overlay {
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

// 申请弹窗
.apply-modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;

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
        color: #fff;
      }
    }
  }

  .modal-body {
    padding: 1.5rem 1.8rem;
    overflow-y: auto;

    .modal-desc {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1.5rem;
    }
  }
}

// 弹窗动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .apply-modal {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;

  .apply-modal {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// 表单样式
.apply-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;

  .required {
    color: #ef4444;
    margin-left: 0.2rem;
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
    border-color: rgba(37, 99, 235, 0.5);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.error-msg {
  display: block;
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.4rem;
}

// Logo上传区域
.logo-upload {
  .upload-area {
    position: relative;
    width: 100%;
    height: 120px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover,
    &.dragging {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(37, 99, 235, 0.5);
    }

    &.has-image {
      border-style: solid;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      color: rgba(255, 255, 255, 0.5);

      svg {
        width: 32px;
        height: 32px;
      }

      span {
        font-size: 0.9rem;
        font-weight: 500;
      }

      small {
        font-size: 0.75rem;
        opacity: 0.7;
      }
    }

    .preview-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .upload-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: rgba(255, 255, 255, 0.7);

      .upload-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      span {
        font-size: 0.85rem;
      }
    }

    .remove-image {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(239, 68, 68, 0.9);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
        color: #fff;
      }

      &:hover {
        background: #dc2626;
        transform: scale(1.1);
      }
    }
  }
}

// 提交按钮
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Archivo', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
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
@media (max-width: 1100px) {
  .links-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .info-section {
    position: relative;
    top: 0;
    order: -1;

    .info-card {
      max-width: 600px;
      margin: 0 auto;
    }
  }
}

@media (max-width: 768px) {
  .links-page {
    padding: 1.5rem 1rem;
  }

  .page-header {
    margin-bottom: 2rem;

    .page-title {
      font-size: 2rem;
    }

    .page-subtitle {
      font-size: 0.95rem;
    }
  }

  .links-section {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;

      .header-actions {
        width: 100%;
        justify-content: space-between;

        .apply-trigger-btn {
          font-size: 0.8rem;
          padding: 0.5rem 0.8rem;
        }
      }
    }
  }

  .link-card {
    padding: 1rem;
    gap: 1rem;

    .link-avatar img {
      width: 48px;
      height: 48px;
    }

    .link-info {
      .link-name {
        font-size: 1rem;
      }

      .link-desc {
        font-size: 0.8rem;
      }

      .link-meta .link-url {
        max-width: 150px;
      }
    }

    .link-arrow {
      display: none;
    }
  }

  .apply-modal-overlay {
    padding: 1rem;
  }

  .apply-modal {
    max-height: 95vh;

    .modal-header,
    .modal-body {
      padding: 1.2rem;
    }
  }
}

@media (max-width: 480px) {
  .link-card {
    .link-info {
      .link-meta {
        flex-wrap: wrap;
        gap: 0.4rem;

        .link-url {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
