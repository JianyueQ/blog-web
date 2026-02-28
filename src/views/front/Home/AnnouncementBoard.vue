<template>
  <div
    v-if="hasContent"
    class="announcement-board"
  >
    <div class="announcement-header">
      <div class="header-left">
        <span class="announcement-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line
              x1="12"
              y1="9"
              x2="12"
              y2="13"
            />
            <line
              x1="12"
              y1="17"
              x2="12.01"
              y2="17"
            />
          </svg>
        </span>
        <span class="announcement-title">公告</span>
      </div>
      <span
        v-if="updateTime"
        class="update-time"
      >{{ formatTime(updateTime) }}</span>
    </div>
    <div class="announcement-content">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        class="markdown-body"
        v-html="renderedContent"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAnnouncement } from '@/api/front/announcement'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// Markdown 渲染配置
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

const content = ref('')
const updateTime = ref('')

// 是否有内容
const hasContent = computed(() => {
  return content.value && content.value.trim().length > 0
})

// 渲染后的内容
const renderedContent = computed(() => {
  if (!content.value) return ''
  return md.render(content.value)
})

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  // 小于1小时显示"XX分钟前"
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }
  
  // 小于24小时显示"XX小时前"
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  
  // 小于7天显示"XX天前"
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  // 否则显示日期
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取公告内容
const fetchAnnouncement = async () => {
  try {
    const res = await getAnnouncement()
    if (res.data) {
      content.value = res.data.content || ''
      updateTime.value = res.data.updateTime || ''
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

onMounted(() => {
  fetchAnnouncement()
})
</script>

<style scoped lang="scss">
.announcement-board {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(24, 24, 27, 0.5) 100%);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  overflow: hidden;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: 0.15s;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: rgba(37, 99, 235, 0.4);
    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.15);
  }

  .announcement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(37, 99, 235, 0.1);
    border-bottom: 1px solid rgba(37, 99, 235, 0.15);

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .announcement-icon {
        width: 24px;
        height: 24px;
        color: #60a5fa;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      .announcement-title {
        font-family: 'Archivo', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: 0.02em;
      }
    }

    .update-time {
      font-size: 0.75rem;
      color: #71717a;
      font-weight: 500;
    }
  }

  .announcement-content {
    padding: 20px;

    .markdown-body {
      color: #e4e4e7;
      line-height: 1.8;
      font-size: 0.95rem;

      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin-top: 0;
        margin-bottom: 12px;
        font-weight: 600;
        line-height: 1.4;
        color: #fff;
      }

      :deep(h1) { font-size: 1.4em; }
      :deep(h2) { font-size: 1.25em; }
      :deep(h3) { font-size: 1.1em; }

      :deep(p) {
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(a) {
        color: #60a5fa;
        text-decoration: none;
        transition: color 0.2s;
        
        &:hover {
          color: #93c5fd;
          text-decoration: underline;
        }
      }

      :deep(code) {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 0.85em;
        color: #f472b6;
      }

      :deep(pre) {
        background: rgba(0, 0, 0, 0.4);
        padding: 14px;
        border-radius: 12px;
        overflow-x: auto;
        margin: 12px 0;

        code {
          background: none;
          padding: 0;
          color: #d4d4d4;
          font-size: 0.85em;
        }
      }

      :deep(blockquote) {
        border-left: 3px solid #60a5fa;
        padding-left: 14px;
        margin: 12px 0;
        color: #a1a1aa;
        background: rgba(255, 255, 255, 0.03);
        padding: 10px 14px;
        border-radius: 0 8px 8px 0;
        font-style: italic;
      }

      :deep(ul), :deep(ol) {
        padding-left: 20px;
        margin: 12px 0;

        li {
          margin-bottom: 6px;
        }
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 12px 0;
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        font-size: 0.9em;

        th, td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          text-align: left;
        }

        th {
          background: rgba(255, 255, 255, 0.05);
          font-weight: 600;
          color: #fff;
        }
      }

      :deep(hr) {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin: 16px 0;
      }

      :deep(strong) {
        color: #fff;
        font-weight: 600;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 720px) {
  .announcement-board {
    .announcement-header {
      padding: 14px 16px;

      .header-left {
        .announcement-title {
          font-size: 0.95rem;
        }
      }

      .update-time {
        font-size: 0.7rem;
      }
    }

    .announcement-content {
      padding: 16px;

      .markdown-body {
        font-size: 0.9rem;
      }
    }
  }
}
</style>
