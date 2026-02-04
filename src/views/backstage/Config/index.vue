<template>
  <div class="config-manage">
    <el-tabs v-model="activeTab" class="pro-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="社交链接" name="social">
        <div class="pro-card mt-10">
          <div class="card-header-actions">
            <el-button type="primary" icon="Plus" round @click="handleAdd">新增链接</el-button>
          </div>
          <div class="card-body">
            <el-table :data="socialList" v-loading="loading" style="width: 100%" border stripe class="social-table">
              <el-table-column prop="name" label="名称" width="120" />
              <el-table-column label="图标" width="80" align="center">
                <template #default="scope">
                  <div class="icon-preview">
                    <i v-if="scope.row.icon.startsWith('el-icon-')" :class="scope.row.icon"></i>
                    <img v-else-if="scope.row.icon.startsWith('/') || scope.row.icon.startsWith('http')" :src="scope.row.icon" class="icon-img theme-icon" />
                    <span v-else>{{ scope.row.icon }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="tip" label="提示文本" show-overflow-tooltip />
              <el-table-column prop="url" label="跳转链接" show-overflow-tooltip />
              <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    active-value="1"
                    inactive-value="0"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="scope">
                  <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 社交链接对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="550px"
        append-to-body
        destroy-on-close
      >
        <el-form :model="socialForm" label-width="80px" label-position="left">
          <el-form-item label="名称" required>
            <el-input v-model="socialForm.name" placeholder="请输入社交平台名称" />
          </el-form-item>
          <el-form-item label="图标方式" required>
            <el-radio-group v-model="iconType">
              <el-radio label="class">图标类名</el-radio>
              <el-radio label="upload">本地上传</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="图标内容" required>
            <!-- 类名输入 -->
            <el-input v-if="iconType === 'class'" v-model="socialForm.icon" placeholder="例如: /images/icon/github.png" />

            <!-- 上传占位 -->
            <div v-if="iconType === 'upload'" class="upload-placeholder">
              <el-upload
                class="icon-uploader"
                action="#"
                :auto-upload="false"
                disabled
              >
                <el-icon class="uploader-icon"><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">上传接口暂未实现，请先使用预设图标或类名</div>
                </template>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="提示文本">
            <el-input v-model="socialForm.tip" placeholder="请输入悬浮提示文本" />
          </el-form-item>
          <el-form-item label="链接地址" required>
            <el-input v-model="socialForm.url" placeholder="请输入跳转链接" />
          </el-form-item>
          <el-form-item label="排序序号">
            <el-input-number v-model="socialForm.sortOrder" :min="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitSocialForm">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <el-tab-pane label="评论设置" name="comment">
        <div class="pro-card mt-10">
          <div class="card-body">
            <el-form :model="commentForm" label-position="left" label-width="150px">
              <el-form-item label="开启评论">
                <el-switch v-model="commentForm.enable" />
              </el-form-item>
              <el-form-item label="评论审核">
                <el-switch v-model="commentForm.audit" />
              </el-form-item>
              <el-form-item label="邮件通知">
                <el-switch v-model="commentForm.emailNotify" />
              </el-form-item>
              <el-form-item label="黑名单关键词">
                <el-input v-model="commentForm.blacklist" type="textarea" :rows="4" placeholder="每行一个关键词" />
              </el-form-item>
              <div class="form-actions mt-20">
                <el-button type="primary" size="large" round @click="handleSaveComment">保存评论设置</el-button>
              </div>
            </el-form>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关于我" name="about">
        <div class="pro-card mt-10">
          <div class="card-body">
            <!-- Markdown 编辑器工具栏 -->
            <div class="md-toolbar">
              <div class="toolbar-group">
                <el-tooltip content="加粗" placement="top">
                  <el-button size="small" @click="insertMarkdown('**', '**')">
                    <el-icon><strong>B</strong></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="斜体" placement="top">
                  <el-button size="small" @click="insertMarkdown('*', '*')">
                    <el-icon><em>I</em></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="标题" placement="top">
                  <el-button size="small" @click="insertMarkdown('## ', '')">
                    H
                  </el-button>
                </el-tooltip>
                <el-tooltip content="引用" placement="top">
                  <el-button size="small" @click="insertMarkdown('> ', '')">
                    <el-icon><MessageBox /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="代码块" placement="top">
                  <el-button size="small" @click="insertMarkdown('```\n', '\n```')">
                    <el-icon><Tickets /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="链接" placement="top">
                  <el-button size="small" @click="insertMarkdown('[', '](url)')">
                    <el-icon><Link /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="无序列表" placement="top">
                  <el-button size="small" @click="insertMarkdown('- ', '')">
                    <el-icon><List /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="有序列表" placement="top">
                  <el-button size="small" @click="insertMarkdown('1. ', '')">
                    <el-icon><Checked /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
              <div class="toolbar-group">
                <el-tooltip content="上传图片" placement="top">
                  <el-upload
                    class="inline-upload"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleImageUpload"
                    accept="image/*"
                  >
                    <el-button size="small" :loading="uploading">
                      <el-icon><Picture /></el-icon>
                    </el-button>
                  </el-upload>
                </el-tooltip>
                <el-tooltip content="预览模式" placement="top">
                  <el-button size="small" @click="togglePreviewMode">
                    <el-icon><View /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <!-- 编辑区域 -->
            <div class="md-editor-container" :class="{ 'preview-only': previewMode === 'preview' }">
              <!-- 编辑器 -->
              <div v-show="previewMode !== 'preview'" class="editor-pane">
                <el-input
                  ref="editorInput"
                  v-model="aboutForm.content"
                  type="textarea"
                  placeholder="在此输入 Markdown 内容...\n\n💡 使用提示：\n• 点击工具栏按钮快速插入 Markdown 语法\n• 点击图片按钮上传图片，会自动插入到光标位置\n• 使用 # 创建标题（# 一级标题，## 二级标题）\n• 使用 **文字** 加粗文本\n• 使用 [文字](链接) 创建超链接\n• 右侧预览区实时查看渲染效果"
                  :rows="20"
                  @input="handleContentChange"
                />
              </div>

              <!-- 预览区域 -->
              <div v-show="previewMode !== 'edit'" class="preview-pane">
                <div class="preview-header">预览</div>
                <div class="markdown-body" v-html="renderedMarkdown"></div>
              </div>
            </div>

            <div class="form-actions mt-20">
              <el-button type="primary" size="large" round @click="handleSaveAbout" :loading="saving">
                更新关于页面
              </el-button>
              <span v-if="updateTime" class="save-time">最后保存: {{ updateTime }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getSocialLink, addSocial, updateSocial, deleteSocial, updateSocialStatus } from '@/api/backstage/socialLink'
import { getAboutMeContent, updateAboutMeContent } from '@/api/backstage/aboutMe'
import { uploadImage } from '@/api/backstage/file'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MessageBox, Tickets, Link, List, Checked, Picture, View } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const activeTab = ref('social')

// 社交链接相关
const loading = ref(false)
const socialList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 图标处理
const iconType = ref('class')

const socialForm = reactive({
  socialLinkId: undefined,
  name: '',
  icon: '',
  tip: '',
  url: '',
  sortOrder: 0,
})

const fetchSocialLinks = async () => {
  loading.value = true
  try {
    const res = await getSocialLink()
    socialList.value = res.data || []
  } catch (error) {
    console.error('获取社交链接失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增社交链接'
  iconType.value = 'class'
  Object.assign(socialForm, {
    socialLinkId: undefined,
    name: '',
    icon: '',
    tip: '',
    url: '',
    sortOrder: 0,
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑社交链接'
  // 根据图标内容判断类型
  if (row.icon.startsWith('')) {
    iconType.value = 'class'
  } else {
    iconType.value = 'upload'
  }

  Object.assign(socialForm, {
    socialLinkId: row.socialLinkId,
    name: row.name,
    icon: row.icon,
    tip: row.tip,
    url: row.url,
    sortOrder: row.sortOrder,
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除社交链接 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteSocial(row.socialLinkId)
    ElMessage.success('删除成功')
    fetchSocialLinks()
  }).catch(() => {})
}

const handleStatusChange = async (row) => {
  try {
    await updateSocialStatus({
      socialLinkId: row.socialLinkId,
      status: row.status
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === '1' ? '0' : '1' // 恢复状态
    console.error('更新状态失败:', error)
  }
}

const submitSocialForm = async () => {
  if (!socialForm.name || !socialForm.icon || !socialForm.url) {
    ElMessage.warning('请填写必填项')
    return
  }

  try {
    if (socialForm.socialLinkId) {
      await updateSocial(socialForm)
      ElMessage.success('修改成功')
    } else {
      await addSocial(socialForm)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchSocialLinks()
  } catch (error) {
    console.error('保存社交链接失败:', error)
  }
}

onMounted(() => {
  fetchSocialLinks()
  // 当切换到关于我标签时加载数据
  if (activeTab.value === 'about') {
    fetchAboutMe()
  }
})

// 监听标签切换
const handleTabChange = (tab) => {
  if (tab === 'about' && !aboutForm.content) {
    fetchAboutMe()
  }
}

const commentForm = reactive({
  enable: true,
  audit: true,
  emailNotify: false,
  blacklist: '广告\n色情\n暴力'
})

// Markdown 编辑器配置
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return ''
  }
})

// 关于我表单
const aboutForm = reactive({
  aboutMeId: undefined,
  content: '',
})

const editorInput = ref(null)
const previewMode = ref('split') // 'edit', 'split', 'preview'
const uploading = ref(false)
const saving = ref(false)
const updateTime = ref('')

// 渲染 Markdown
const renderedMarkdown = computed(() => {
  return md.render(aboutForm.content || '')
})

// 切换预览模式
const togglePreviewMode = () => {
  const modes = ['split', 'preview', 'edit']
  const currentIndex = modes.indexOf(previewMode.value)
  previewMode.value = modes[(currentIndex + 1) % modes.length]
}

// 插入 Markdown 语法
const insertMarkdown = (before, after) => {
  const textarea = editorInput.value?.textarea
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = aboutForm.content.substring(start, end)
  const replacement = before + (selectedText || '文本') + after

  aboutForm.content =
    aboutForm.content.substring(0, start) +
    replacement +
    aboutForm.content.substring(end)

  // 重新设置光标位置
  setTimeout(() => {
    textarea.focus()
    const newPos = start + before.length + (selectedText ? selectedText.length : 2)
    textarea.setSelectionRange(newPos, newPos)
  }, 0)
}

// 处理图片上传
const handleImageUpload = async (file) => {
  if (!file || !file.raw) return

  // 验证文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return
  }

  // 验证文件大小 (5MB)
  const isLt5M = file.raw.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    // 后端接口要求使用 'image' 字段名
    formData.append('image', file.raw)

    const res = await uploadImage(formData)
    console.log('上传响应:', res)

    // 注意: axios 响应拦截器已经 return res.data，所以这里 res 就是后端返回的 data 对象
    // 后端返回: { code: 200, msg: '成功', imgUrl: 'http://...' }
    if (res && res.imgUrl) {
      // 插入图片链接到光标位置
      const imageMarkdown = `\n![图片描述](${res.imgUrl})\n`
      const textarea = editorInput.value?.textarea
      if (textarea) {
        const start = textarea.selectionStart
        aboutForm.content =
          aboutForm.content.substring(0, start) +
          imageMarkdown +
          aboutForm.content.substring(start)

        setTimeout(() => {
          textarea.focus()
          const newPos = start + imageMarkdown.length
          textarea.setSelectionRange(newPos, newPos)
        }, 0)
      } else {
        aboutForm.content += imageMarkdown
      }
      ElMessage.success('图片上传成功并已插入')
    } else {
      console.error('响应数据:', res)
    }
  } catch (error) {
    console.error('图片上传失败:', error)
  } finally {
    uploading.value = false
  }
}

// 内容变化处理（可用于自动保存等）
const handleContentChange = () => {
  //todo 可以在这里添加防抖的自动保存逻辑
}

// 加载关于我内容
const fetchAboutMe = async () => {
  try {
    const res = await getAboutMeContent()
    if (res.data) {
      aboutForm.aboutMeId = res.data.aboutMeId
      aboutForm.content = res.data.aboutMeContent || ''
      updateTime.value = res.data.updateTime
    }
  } catch (error) {
    console.error('获取关于我内容失败:', error)
  }
}

// 保存关于我内容
const handleSaveAbout = async () => {
  if (!aboutForm.content.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }

  saving.value = true
  try {
    await updateAboutMeContent(aboutForm.aboutMeId, aboutForm.content)
    ElMessage.success('保存成功')
    const now = new Date()
    updateTime.value = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + (now.getSeconds() < 10 ? '0' : '') + now.getSeconds()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.config-manage {
  .mt-10 { margin-top: 10px; }
  .mt-20 { margin-top: 20px; }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);

    .card-header-actions {
      padding: 20px 30px 0;
      display: flex;
      justify-content: flex-end;
    }

    .card-body {
      padding: 30px;
    }
  }

  .icon-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    .icon-img {
      width: 24px;
      height: 24px;
      object-fit: contain;

      &.theme-icon {
        // 在明亮模式下，如果图标是纯白的（通过 brightness/invert 处理过），需要反转回黑色
        [data-theme='light'] & {
          filter: invert(1) contrast(200%);
        }
      }
    }
  }

  .preset-icons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    max-height: 180px;
    overflow-y: auto;
    padding: 8px;
    background: var(--backstage-bg-color);
    border-radius: var(--backstage-radius-md);

    .preset-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px;
      border: 1px solid var(--backstage-border-color);
      border-radius: var(--backstage-radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      background: var(--backstage-card-bg);

      &:hover {
        border-color: var(--backstage-primary-light);
        transform: translateY(-2px);
      }

      &.active {
        background: var(--backstage-primary-lighter);
        border-color: var(--backstage-primary);
        box-shadow: 0 0 0 2px var(--backstage-primary-lighter);

        span {
          color: var(--backstage-primary);
          font-weight: 600;
        }
      }

      img {
        width: 20px;
        height: 20px;
        margin-bottom: 4px;
        object-fit: contain;

        [data-theme='light'] & {
          filter: invert(1) brightness(0.2);
        }
      }

      span {
        font-size: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
      }
    }
  }

  .upload-placeholder {
    .icon-uploader {
      border: 1px dashed var(--backstage-border-color);
      border-radius: var(--backstage-radius-md);
      cursor: not-allowed;
      text-align: center;
      padding: 20px;

      .uploader-icon {
        font-size: 28px;
        color: var(--backstage-text-placeholder);
      }
    }
  }

  .social-table {
    :deep(.el-table__row--striped) {
      td.el-table__cell {
        background: var(--backstage-card-hover-bg) !important;
      }
    }
  }

  .pro-tabs {
    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
      padding: 0 24px;
      height: 48px;
      line-height: 48px;
    }
    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 3px;
    }
  }

  .config-form {
    max-width: 800px;
  }

  .form-actions {
    border-top: 1px solid var(--backstage-border-color);
    padding-top: 24px;
    display: flex;
    align-items: center;
    gap: 1rem;

    .save-time {
      font-size: 13px;
      color: var(--backstage-text-placeholder);
    }
  }

  // Markdown 编辑器样式
  .md-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--backstage-card-hover-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-md) var(--backstage-radius-md) 0 0;
    margin-bottom: -1px;

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-button {
        padding: 6px 10px;
        font-weight: 600;
      }

      .inline-upload {
        display: inline-block;
      }
    }
  }

  .md-editor-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    border: 1px solid var(--backstage-border-color);
    border-radius: 0 0 var(--backstage-radius-md) var(--backstage-radius-md);
    overflow: hidden;
    background: var(--backstage-border-color);

    &.preview-only {
      grid-template-columns: 1fr;
    }

    .editor-pane {
      background: var(--backstage-card-bg);

      :deep(.el-textarea__inner) {
        border: none;
        border-radius: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 2.19;
        padding: 16px;
        resize: none;
      }
    }

    .preview-pane {
      background: var(--backstage-card-bg);
      display: flex;
      flex-direction: column;

      .preview-header {
        padding: 12px 16px;
        background: var(--backstage-card-hover-bg);
        border-bottom: 1px solid var(--backstage-border-color);
        font-weight: 600;
        font-size: 13px;
        color: var(--backstage-text-secondary);
      }

      .markdown-body {
        padding: 16px;
        overflow-y: auto;
        max-height: 600px;
        line-height: 1.8;

        :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.4;
        }

        :deep(h1) { font-size: 2em; border-bottom: 1px solid var(--backstage-border-color); padding-bottom: 8px; }
        :deep(h2) { font-size: 1.5em; border-bottom: 1px solid var(--backstage-border-color); padding-bottom: 6px; }
        :deep(h3) { font-size: 1.25em; }
        :deep(h4) { font-size: 1.1em; }

        :deep(p) {
          margin-bottom: 16px;
        }

        :deep(a) {
          color: var(--backstage-primary);
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }

        :deep(code) {
          background: var(--backstage-card-hover-bg);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.9em;
        }

        :deep(pre) {
          background: #1e1e1e;
          padding: 16px;
          border-radius: var(--backstage-radius-md);
          overflow-x: auto;
          margin: 16px 0;

          code {
            background: none;
            padding: 0;
            color: #d4d4d4;
          }
        }

        :deep(blockquote) {
          border-left: 4px solid var(--backstage-primary);
          padding-left: 16px;
          margin: 16px 0;
          color: var(--backstage-text-secondary);
          background: var(--backstage-card-hover-bg);
          padding: 12px 16px;
          border-radius: 0 var(--backstage-radius-md) var(--backstage-radius-md) 0;
        }

        :deep(ul), :deep(ol) {
          padding-left: 24px;
          margin: 16px 0;

          li {
            margin-bottom: 8px;
          }
        }

        :deep(img) {
          max-width: 100%;
          height: auto;
          border-radius: var(--backstage-radius-md);
          margin: 16px 0;
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;

          th, td {
            border: 1px solid var(--backstage-border-color);
            padding: 8px 12px;
          }

          th {
            background: var(--backstage-card-hover-bg);
            font-weight: 600;
          }
        }

        :deep(hr) {
          border: none;
          border-top: 2px solid var(--backstage-border-color);
          margin: 24px 0;
        }
      }
    }
  }

  // 响应式处理
  @media (max-width: 1024px) {
    .md-editor-container:not(.preview-only) {
      grid-template-columns: 1fr;

      .editor-pane {
        border-bottom: 1px solid var(--backstage-border-color);
      }
    }
  }
}
</style>
