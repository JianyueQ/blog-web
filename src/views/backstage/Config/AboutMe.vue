<template>
  <div class="about-me-panel">
    <div class="pro-card">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAboutMeContent, updateAboutMeContent } from '@/api/backstage/aboutMe'
import { uploadImage } from '@/api/backstage/file'
import { ElMessage } from 'element-plus'
import { MessageBox, Tickets, Link, List, Checked, Picture, View } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

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
    formData.append('image', file.raw)

    const res = await uploadImage(formData)
    console.log('上传响应:', res)

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
  // 可以在这里添加防抖的自动保存逻辑
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

// 暴露加载方法供父组件调用
defineExpose({
  fetchAboutMe
})

onMounted(() => {
  // 组件挂载时不自动加载，由父组件在标签切换时调用
})
</script>

<style scoped lang="scss">
.about-me-panel {
  .mt-20 { 
    margin-top: 20px; 
  }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);

    .card-body {
      padding: 30px;
    }
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
