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

export function useGuestbook() {
  // 表单数据
  const messageForm = reactive({
    nickname: '',
    email: '',
    content: '',
    avatar: ''
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

  // 分页参数
  const pageParams = reactive({
    pageNum: 1,
    pageSize: 20,  // 每页20条记录
    total: 0,
    guestbookAllCount: 0,
    hasMore: true
  })

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
        const newTotal = Math.max(rootMessage.replyTotal || 0, res.total || 0)
        rootMessage.replyTotal = newTotal
        rootMessage.replyCount = newTotal // 同步更新列表页显示的计数
        
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
      
      // 修正 parentId 逻辑：如果是直接回复根评论（即在详情页回复），parentId 应为 0
      let parentId = replyTarget.value.guestbookId
      // 检查是否回复的是当前的根评论对象
      if (currentRootMessage.value && replyTarget.value.guestbookId === currentRootMessage.value.guestbookId) {
        parentId = 0
      }

      // 计算分页参数
      const pageSize = 5
      const targetRootMessage = currentRootMessage.value
      // 预测新增后的总数
      const nextTotal = (targetRootMessage.replyTotal || 0) + 1
      const pageNum = Math.ceil(nextTotal / pageSize) || 1

      const data = {
        nickname: replyForm.nickname.trim(),
        email: replyForm.email.trim(),
        content: replyForm.content.trim(),
        avatar: avatarUrl,
        rootId: rootId,
        parentId: parentId,
        pageNum,
        pageSize,
        orderByColumn: 'create_time',
        isAsc: 'asc',
        reasonable: true
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
        // const targetRootMessage = currentRootMessage.value // 已在上方定义

        closeReplyModal()

        // 手动更新总数
        pageParams.guestbookAllCount = (pageParams.guestbookAllCount || 0) + 1

        // 刷新子留言列表
        if (targetRootMessage) {
          // 手动增加子评论总数 (修复异步更新延迟问题)
          targetRootMessage.replyTotal = (targetRootMessage.replyTotal || 0) + 1
          targetRootMessage.replyCount = (targetRootMessage.replyCount || 0) + 1
          
          // 确保展开
          if (!expandedReplies.value.includes(targetRootMessage.guestbookId)) {
            expandedReplies.value.push(targetRootMessage.guestbookId)
          }
          
          // 手动构造新评论对象并追加到列表末尾
          // 直接使用后端返回的完整数据
          const newReply = res.data
          
          if (!targetRootMessage.replyList) {
            targetRootMessage.replyList = []
          }
          targetRootMessage.replyList.push(newReply)
          
          // 不再调用 loadChildReplies 刷新列表，避免已加载的分页数据丢失
          // await loadChildReplies(targetRootMessage, targetPage)
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

        // 自动加载子评论
        messages.value.forEach(item => {
          if ((item.replyCount || 0) > 0) {
            loadChildReplies(item)
          }
        })

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
          
          // 自动加载子评论（对新添加的响应式对象进行操作）
          const newItems = messages.value.slice(-processedMessages.length)
          newItems.forEach(item => {
            if ((item.replyCount || 0) > 0) {
              loadChildReplies(item)
            }
          })

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

  return {
    messageForm,
    replyForm,
    formErrors,
    messages,
    loading,
    submitting,
    replySubmitting,
    isMessageModalOpen,
    isReplyModalOpen,
    replyTarget,
    currentRootMessage,
    showEmojiPicker,
    showReplyEmojiPicker,
    showAvatarPicker,
    showReplyAvatarPicker,
    expandedReplies,
    isDragging,
    avatarUploading,
    fileInput,
    isReplyDragging,
    replyAvatarUploading,
    replyFileInput,
    hasSavedInfo,
    defaultEmojis,
    avatarStyles,
    currentStyle,
    presetAvatars,
    pageParams,
    totalMessages,
    showBackToTop,
    loadingMore,
    openMessageModal,
    closeMessageModal,
    toggleAvatarPicker,
    selectPresetAvatar,
    switchAvatarStyle,
    toggleEmojiPicker,
    insertEmoji,
    toggleReplyEmojiPicker,
    insertReplyEmoji,
    toggleReplies,
    loadChildReplies,
    getPageRange,
    openReplyModal,
    closeReplyModal,
    toggleReplyAvatarPicker,
    selectReplyPresetAvatar,
    triggerReplyFileInput,
    handleReplyFileChange,
    handleReplyDrop,
    removeReplyAvatar,
    triggerFileInput,
    handleFileChange,
    handleDrop,
    removeAvatar,
    getReplyToNickname,
    submitMessage,
    submitReply,
    formatTime,
    handleAvatarError,
    loadMessages,
    loadMoreMessages,
    scrollToTop,
    clearUserInfo
  }
}
