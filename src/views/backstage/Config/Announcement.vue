<template>
  <div class="announcement-panel">
    <div class="pro-card">
      <div class="card-body">
        <!-- 模板选择区域 -->
        <div class="template-section">
          <div class="template-header">
            <span class="template-title">
              <el-icon><Document /></el-icon>
              快速模板
            </span>
            <span class="template-desc">点击下方模板快速填充内容</span>
          </div>
          <div class="template-list">
            <el-button 
              v-for="(template, index) in templates" 
              :key="index"
              size="small"
              class="template-btn"
              @click="applyTemplate(template.content)"
            >
              {{ template.name }}
            </el-button>
          </div>
        </div>

        <!-- Markdown 编辑器工具栏 -->
        <div class="md-toolbar">
          <div class="toolbar-group">
            <el-tooltip
              content="加粗"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('**', '**')"
              >
                <el-icon><strong>B</strong></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="斜体"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('*', '*')"
              >
                <el-icon><em>I</em></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="标题"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('## ', '')"
              >
                H
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="引用"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('> ', '')"
              >
                <el-icon><MessageBox /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="代码块"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('```\n', '\n```')"
              >
                <el-icon><Tickets /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="链接"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('[', '](url)')"
              >
                <el-icon><Link /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="无序列表"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('- ', '')"
              >
                <el-icon><List /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="有序列表"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('1. ', '')"
              >
                <el-icon><Checked /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="分割线"
              placement="top"
            >
              <el-button
                size="small"
                @click="insertMarkdown('\n---\n', '')"
              >
                <el-icon><Minus /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          <div class="toolbar-group">
            <el-tooltip
              content="上传图片"
              placement="top"
            >
              <el-upload
                class="inline-upload"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageUpload"
                accept="image/*"
              >
                <el-button
                  size="small"
                  :loading="uploading"
                >
                  <el-icon><Picture /></el-icon>
                </el-button>
              </el-upload>
            </el-tooltip>
            <el-tooltip
              content="预览模式"
              placement="top"
            >
              <el-button
                size="small"
                @click="togglePreviewMode"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <!-- 编辑区域 -->
        <div
          class="md-editor-container"
          :class="{ 'preview-only': previewMode === 'preview' }"
        >
          <!-- 编辑器 -->
          <div
            v-show="previewMode !== 'preview'"
            class="editor-pane"
          >
            <el-input
              ref="editorInput"
              v-model="announcementForm.content"
              type="textarea"
              placeholder="在此输入公告内容（支持 Markdown 语法）...\n\n💡 使用提示：\n• 点击工具栏按钮快速插入 Markdown 语法\n• 点击图片按钮上传图片，会自动插入到光标位置\n• 使用 ## 创建标题，**文字** 加粗文本\n• 使用 [文字](链接) 创建超链接\n• 上方有预设模板可快速填充内容\n• 右侧预览区实时查看渲染效果"
              :rows="18"
              @input="handleContentChange"
            />
          </div>

          <!-- 预览区域 -->
          <div
            v-show="previewMode !== 'edit'"
            class="preview-pane"
          >
            <div class="preview-header">
              <span>预览</span>
              <span
                v-if="updateTime"
                class="update-time"
              >最后更新: {{ updateTime }}</span>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              class="markdown-body"
              v-html="renderedMarkdown"
            />
          </div>
        </div>

        <div class="form-actions mt-20">
          <el-button
            type="primary"
            size="large"
            round
            :loading="saving"
            @click="handleSave"
          >
            <el-icon><Check /></el-icon>
            发布公告
          </el-button>
          <el-button
            size="large"
            round
            @click="handleClear"
          >
            <el-icon><Delete /></el-icon>
            清空内容
          </el-button>
          <span
            v-if="saveTime"
            class="save-time"
          >保存于: {{ saveTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAnnouncement, updateAnnouncement } from '@/api/backstage/announcement'
import { uploadImage } from '@/api/backstage/file'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MessageBox, 
  Tickets, 
  Link, 
  List, 
  Checked, 
  Picture, 
  View, 
  Document,
  Minus,
  Check,
  Delete
} from '@element-plus/icons-vue'
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
      } catch (__) {
        // pass
      }
    }
    return ''
  }
})

// 预设模板
const templates = [
  {
    name: '🎉 欢迎公告',
    content: `## 🎉 欢迎来到我的博客！

很高兴你能来到这里，这里是我记录技术成长和生活点滴的地方。

### 关于本站
- 📚 分享全栈开发经验
- 💡 探讨系统架构设计
- 🌟 记录生活中的美好瞬间

### 联系方式
如有任何问题或建议，欢迎通过以下方式联系我：
- 📧 邮箱：your-email@example.com
- 💬 留言板：点击导航栏"留言"菜单

**感谢你的访问，祝你浏览愉快！**`
  },
  {
    name: '📢 维护通知',
    content: `## 📢 系统维护通知

### 维护时间
**2024年XX月XX日 00:00 - 06:00**

### 维护内容
- 服务器升级与优化
- 数据库性能调优
- 安全补丁更新

### 影响范围
维护期间网站可能无法正常访问，请提前保存好您的操作。

> 给您带来的不便，敬请谅解！

---

**预计恢复时间：06:00**`
  },
  {
    name: '🆕 更新日志',
    content: `## 🆕 网站更新日志

### v2.0.0 - 2024-XX-XX

#### ✨ 新功能
- 新增公告系统
- 优化首页排版设计
- 支持 Markdown 编辑器

#### 🐛 修复
- 修复移动端显示问题
- 优化图片加载速度

#### 💄 优化
- 提升页面加载性能
- 改进用户交互体验

---

**更多功能正在开发中，敬请期待！** 🚀`
  },
  {
    name: '📌 重要通知',
    content: `## 📌 重要通知

### 关于评论功能的调整

亲爱的访客：

为了提供更好的交流环境，本站评论功能将进行以下调整：

1. **实名认证** - 发表评论需要进行邮箱验证
2. **内容审核** - 评论将在审核后显示
3. **禁止内容** - 严禁发布违法违规内容

### 生效时间
**即日起正式生效**

> 💡 温馨提示：请文明发言，共同维护良好的交流氛围。

如有疑问，请联系管理员。`
  },
  {
    name: '🎨 简洁风格',
    content: `## 公告标题

这里是公告内容，支持 **Markdown** 语法。

- 列表项一
- 列表项二
- 列表项三

> 这是一段引用内容

[点击访问链接](https://example.com)

---

**感谢阅读！**`
  }
]

// 公告表单
const announcementForm = reactive({
  content: '',
})

const editorInput = ref(null)
const previewMode = ref('split') // 'edit', 'split', 'preview'
const uploading = ref(false)
const saving = ref(false)
const updateTime = ref('')
const saveTime = ref('')

// 渲染 Markdown
const renderedMarkdown = computed(() => {
  return md.render(announcementForm.content || '<div class="empty-preview">预览区域 - 开始编辑以查看效果</div>')
})

// 切换预览模式
const togglePreviewMode = () => {
  const modes = ['split', 'preview', 'edit']
  const currentIndex = modes.indexOf(previewMode.value)
  previewMode.value = modes[(currentIndex + 1) % modes.length]
}

// 应用模板
const applyTemplate = async (content) => {
  try {
    await ElMessageBox.confirm(
      '应用模板将替换当前内容，是否继续？',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    announcementForm.content = content
    ElMessage.success('模板已应用')
  } catch {
    // 用户取消
  }
}

// 插入 Markdown 语法
const insertMarkdown = (before, after) => {
  const textarea = editorInput.value?.textarea
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = announcementForm.content.substring(start, end)
  const replacement = before + (selectedText || '文本') + after

  announcementForm.content =
    announcementForm.content.substring(0, start) +
    replacement +
    announcementForm.content.substring(end)

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

    if (res && res.imgUrl) {
      // 插入图片链接到光标位置
      const imageMarkdown = `\n![图片描述](${res.imgUrl})\n`
      const textarea = editorInput.value?.textarea
      if (textarea) {
        const start = textarea.selectionStart
        announcementForm.content =
          announcementForm.content.substring(0, start) +
          imageMarkdown +
          announcementForm.content.substring(start)

        setTimeout(() => {
          textarea.focus()
          const newPos = start + imageMarkdown.length
          textarea.setSelectionRange(newPos, newPos)
        }, 0)
      } else {
        announcementForm.content += imageMarkdown
      }
      ElMessage.success('图片上传成功并已插入')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

// 内容变化处理
const handleContentChange = () => {
  // 可以在这里添加防抖的自动保存逻辑
}

// 加载公告内容
const fetchAnnouncement = async () => {
  try {
    const res = await getAnnouncement()
    if (res.data) {
      announcementForm.content = res.data.content || ''
      updateTime.value = res.data.updateTime || ''
    }
  } catch (error) {
    console.error('获取公告内容失败:', error)
    ElMessage.error('获取公告内容失败')
  }
}

// 保存公告
const handleSave = async () => {
  if (!announcementForm.content.trim()) {
    ElMessage.warning('公告内容不能为空')
    return
  }

  saving.value = true
  try {
    await updateAnnouncement(announcementForm.content)
    ElMessage.success('公告发布成功')
    const now = new Date()
    saveTime.value = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0') + ':' + 
      String(now.getSeconds()).padStart(2, '0')
    // 刷新更新时间
    await fetchAnnouncement()
  } catch (error) {
    console.error('发布公告失败:', error)
    ElMessage.error('发布公告失败')
  } finally {
    saving.value = false
  }
}

// 清空内容
const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有内容吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确认清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    announcementForm.content = ''
    ElMessage.success('内容已清空')
  } catch {
    // 用户取消
  }
}

// 暴露加载方法供父组件调用
defineExpose({
  fetchAnnouncement
})

onMounted(() => {
  // 组件挂载时不自动加载，由父组件在标签切换时调用
})
</script>

<style scoped lang="scss">
.announcement-panel {
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

  // 模板选择区域
  .template-section {
    margin-bottom: 20px;
    padding: 16px 20px;
    background: var(--backstage-card-hover-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-md);

    .template-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .template-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 14px;
        color: var(--backstage-text-primary);
      }

      .template-desc {
        font-size: 12px;
        color: var(--backstage-text-secondary);
      }
    }

    .template-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .template-btn {
        font-size: 13px;
        padding: 6px 14px;
        border-radius: var(--backstage-radius-sm);
        transition: all 0.2s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
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
      margin-left: auto;
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
        line-height: 1.8;
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
        display: flex;
        justify-content: space-between;
        align-items: center;

        .update-time {
          font-weight: normal;
          font-size: 12px;
          color: var(--backstage-text-placeholder);
        }
      }

      .markdown-body {
        padding: 16px;
        overflow-y: auto;
        max-height: 540px;
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

        :deep(.empty-preview) {
          color: var(--backstage-text-placeholder);
          text-align: center;
          padding: 60px 20px;
          font-style: italic;
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

    .template-list {
      .template-btn {
        font-size: 12px;
        padding: 5px 10px;
      }
    }
  }
}
</style>
