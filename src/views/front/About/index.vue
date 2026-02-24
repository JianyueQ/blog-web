<template>
  <div class="about-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="aboutContent" class="about-container">
      <!-- Markdown 渲染区域 -->
      <article class="markdown-body" v-html="renderedMarkdown"></article>

      <!-- 社交联系方式 -->
      <div v-if="contacts.length > 0" class="social-section">
        <h2 class="social-title">快速联系</h2>
        <div class="social-grid">
          <a
            v-for="contact in contacts"
            :key="contact.url"
            :href="contact.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-item"
            :title="contact.tip"
          >
            <img :src="contact.icon" :alt="contact.name" class="social-icon" />
            <span class="social-name">{{ contact.name }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <p>暂无内容</p>
    </div>

    <!-- 回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getBlogOwnerAboutMe } from '@/api/front/about'
import { getBlogOwnerSocialInfo } from '@/api/front/links'
import BackToTop from '@/components/BackToTop.vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// Markdown 渲染器配置
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

const loading = ref(true)
const aboutContent = ref('')
const contacts = ref([])

// 渲染 Markdown
const renderedMarkdown = computed(() => {
  return aboutContent.value ? md.render(aboutContent.value) : ''
})

// 获取关于我内容
const fetchAboutMe = async () => {
  try {
    const res = await getBlogOwnerAboutMe()
    // 注意: axios 响应拦截器已经解包 res.data
    if (res && res.data && res.data.aboutMeContent) {
      aboutContent.value = res.data.aboutMeContent
    }
  } catch (error) {
    console.error('获取关于我内容失败:', error)
  }
}

// 获取社交联系方式
const fetchSocialInfo = async () => {
  try {
    const res = await getBlogOwnerSocialInfo()
    if (res && res.data) {
      contacts.value = res.data
        .map(item => ({
          name: item.name,
          tip: item.tip,
          icon: item.icon,
          url: item.url,
          sortOrder: parseInt(item.sortOrder) || 0
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
  } catch (error) {
    console.error('获取社交信息失败:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchAboutMe(), fetchSocialInfo()])
  loading.value = false
})
</script>

<style lang="scss" scoped>
.about-view {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 80vh;

  // 加载状态
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    color: rgba(255, 255, 255, 0.7);

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.1rem;
      margin: 0;
    }
  }

  // 内容容器
  .about-container {
    animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  // Markdown 样式
  .markdown-body {
    padding: 3rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    margin-bottom: 3rem;

    // 标题样式
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 700;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.95);

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(h1) {
      font-size: 2.5em;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    :deep(h2) {
      font-size: 1.8em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 0.4rem;
      margin-bottom: 1.2rem;
    }

    :deep(h3) {
      font-size: 1.4em;
    }

    :deep(h4) {
      font-size: 1.2em;
    }

    // 段落样式
    :deep(p) {
      margin-bottom: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
    }

    // 链接样式
    :deep(a) {
      color: #60a5fa;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.3s;

      &:hover {
        color: #93c5fd;
        border-bottom-color: #93c5fd;
      }
    }

    // 列表样式
    :deep(ul),
    :deep(ol) {
      padding-left: 2rem;
      margin: 1.2rem 0;

      li {
        margin-bottom: 0.8rem;
        color: rgba(255, 255, 255, 0.8);

        &::marker {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    // 引用块样式
    :deep(blockquote) {
      border-left: 4px solid #60a5fa;
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(96, 165, 250, 0.1);
      padding: 1rem 1.5rem;
      border-radius: 0 12px 12px 0;
      font-style: italic;

      p {
        margin: 0;
      }
    }

    // 代码样式
    :deep(code) {
      background: rgba(0, 0, 0, 0.4);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
      color: #e879f9;
    }

    :deep(pre) {
      background: #1e1e1e;
      padding: 1.5rem;
      border-radius: 12px;
      overflow-x: auto;
      margin: 1.5rem 0;
      border: 1px solid rgba(255, 255, 255, 0.1);

      code {
        background: none;
        padding: 0;
        color: #d4d4d4;
        font-size: 0.95em;
      }
    }

    // 图片样式
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      margin: 1.5rem 0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.02);
      }
    }

    // 表格样式
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      overflow: hidden;
      border-radius: 12px;

      th,
      td {
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0.8rem 1rem;
        text-align: left;
      }

      th {
        background: rgba(255, 255, 255, 0.1);
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
      }

      td {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.8);
      }

      tr:hover td {
        background: rgba(255, 255, 255, 0.08);
      }
    }

    // 水平线
    :deep(hr) {
      border: none;
      border-top: 2px solid rgba(255, 255, 255, 0.2);
      margin: 2.5rem 0;
    }

    // 强调文本
    :deep(strong) {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 700;
    }

    // 斜体
    :deep(em) {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  // 社交联系区域
  .social-section {
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    animation-delay: 0.2s;
    animation-fill-mode: both;

    .social-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .social-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1.5rem;

      .social-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;
        padding: 1.5rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s;
        text-decoration: none;
        cursor: pointer;

        &:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-5px);
          border-color: rgba(96, 165, 250, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .social-icon {
          width: 48px;
          height: 48px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          filter: brightness(0) invert(1);
          opacity: 0.9;
          transition: all 0.3s;
        }

        &:hover .social-icon {
          opacity: 1;
          background: rgba(96, 165, 250, 0.2);
        }

        .social-name {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          text-align: center;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;

    .markdown-body {
      padding: 2rem 1.5rem;
      border-radius: 16px;

      :deep(h1) {
        font-size: 2em;
      }

      :deep(h2) {
        font-size: 1.5em;
      }

      :deep(h3) {
        font-size: 1.3em;
      }

      :deep(pre) {
        padding: 1rem;
        font-size: 0.85em;
      }
    }

    .social-section {
      padding: 1.5rem;

      .social-grid {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;

        .social-item {
          padding: 1rem 0.8rem;

          .social-icon {
            width: 40px;
            height: 40px;
          }

          .social-name {
            font-size: 0.85rem;
          }
        }
      }
    }
  }
}

// 动画
@keyframes fadeInUp {
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
</style>
