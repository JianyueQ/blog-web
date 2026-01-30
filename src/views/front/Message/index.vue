<template>
  <div class="message-page">
    <div class="page-header">
      <h1 class="page-title">留言板</h1>
      <p class="page-subtitle">欢迎留下你的足迹，分享你的想法~</p>
    </div>

    <div class="message-container">
      <!-- 留言输入区 -->
      <div class="message-form-card cards">
        <h3 class="form-title">✍️ 写下你的留言</h3>
        <el-form :model="messageForm" :rules="rules" ref="messageFormRef" class="message-form">
          <el-form-item prop="nickname">
            <el-input
                v-model="messageForm.nickname"
                placeholder="你的昵称"
                size="large"
                :prefix-icon="User"
                maxlength="20"
                show-word-limit
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
                v-model="messageForm.email"
                placeholder="你的邮箱（选填）"
                size="large"
                :prefix-icon="Message"
                maxlength="50"
            />
          </el-form-item>

          <el-form-item prop="content">
            <el-input
                v-model="messageForm.content"
                type="textarea"
                placeholder="说点什么吧..."
                :rows="5"
                maxlength="500"
                show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                size="large"
                @click="submitMessage"
                :loading="submitting"
                class="submit-btn"
            >
              {{ submitting ? '提交中...' : '发表留言' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 留言列表 -->
      <div class="message-list">
        <div class="list-header">
          <h3 class="list-title">💬 留言列表</h3>
          <span class="message-count">共 {{ messages.length }} 条留言</span>
        </div>

        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <el-empty v-else-if="messages.length === 0" description="还没有留言，来做第一个留言的人吧~" />

        <div v-else class="messages">
          <div
              v-for="(item, index) in messages"
              :key="item.id"
              class="message-item cards"
          >
            <div class="message-header">
              <div class="user-info">
                <el-avatar :size="45" class="user-avatar">
                  {{ item.nickname.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-details">
                  <span class="nickname">{{ item.nickname }}</span>
                  <span class="time">{{ formatTime(item.createTime) }}</span>
                </div>
              </div>
              <div class="message-index">#{{ messages.length - index }}</div>
            </div>
            <div class="message-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Message as MessageIcon, Loading } from '@element-plus/icons-vue'

// 表单数据
const messageForm = reactive({
  nickname: '',
  email: '',
  content: ''
})

// 表单引用
const messageFormRef = ref()

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入你的昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 5, max: 500, message: '留言内容在 5 到 500 个字符', trigger: 'blur' }
  ]
}

// 留言列表
const messages = ref([
  {
    id: 1,
    nickname: '简悦',
    content: '欢迎来到我的博客！有任何想法都可以在这里留言~',
    createTime: '2026-01-28 10:00:00'
  },
  {
    id: 2,
    nickname: '访客',
    content: '博客做得很棒！界面很简洁美观，继续加油！',
    createTime: '2026-01-27 15:30:00'
  },
  {
    id: 3,
    nickname: '路过的程序员',
    content: '代码写得不错，学到了很多东西，感谢分享！',
    createTime: '2026-01-26 09:20:00'
  }
])

const loading = ref(false)
const submitting = ref(false)

// 提交留言
const submitMessage = async () => {
  if (!messageFormRef.value) return

  try {
    await messageFormRef.value.validate()
    submitting.value = true

    // TODO: 这里对接后端API
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 添加到列表顶部
    messages.value.unshift({
      id: Date.now(),
      nickname: messageForm.nickname,
      content: messageForm.content,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    })

    ElMessage.success('留言发表成功！')

    // 重置表单
    messageFormRef.value.resetFields()
  } catch (error) {
    console.error('提交留言失败:', error)
  } finally {
    submitting.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
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

// 加载留言列表
const loadMessages = async () => {
  loading.value = true
  try {
    // TODO: 这里对接后端API
    // 模拟加载
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('加载留言失败:', error)
    ElMessage.error('加载留言失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // loadMessages()
})
</script>

<style lang="scss" scoped>
.message-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease;

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    animation: slideInUp 0.6s ease;

    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .message-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .message-form-card {
    padding: 30px;
    animation: slideInUp 0.6s ease 0.1s both;

    .form-title {
      font-size: 1.3rem;
      margin-bottom: 20px;
      color: #fff;
    }

    .message-form {
      :deep(.el-form-item) {
        margin-bottom: 20px;
      }

      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: none;

        &:hover, &.is-focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }
      }

      :deep(.el-input__inner),
      :deep(.el-textarea__inner) {
        color: #fff;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }

      :deep(.el-textarea__inner) {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;

        &:hover, &:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }
      }

      :deep(.el-input__count) {
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
      }

      .submit-btn {
        width: 100%;
        height: 45px;
        font-size: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  .message-list {
    animation: slideInUp 0.6s ease 0.2s both;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 0 10px;

      .list-title {
        font-size: 1.3rem;
        color: #fff;
      }

      .message-count {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .loading-container {
      text-align: center;
      padding: 60px 0;
      color: rgba(255, 255, 255, 0.7);

      .el-icon {
        margin-bottom: 15px;
        color: #667eea;
      }

      p {
        font-size: 0.95rem;
      }
    }

    .messages {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .message-item {
        padding: 25px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-3px);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .user-avatar {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #fff;
              font-weight: bold;
              flex-shrink: 0;
            }

            .user-details {
              display: flex;
              flex-direction: column;
              gap: 4px;

              .nickname {
                font-size: 1rem;
                font-weight: 600;
                color: #fff;
              }

              .time {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.5);
              }
            }
          }

          .message-index {
            font-size: 1.1rem;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.4);
          }
        }

        .message-content {
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .message-page {
    .page-header {
      .page-title {
        font-size: 2rem;
      }

      .page-subtitle {
        font-size: 0.9rem;
      }
    }

    .message-form-card {
      padding: 20px;

      .form-title {
        font-size: 1.1rem;
      }
    }

    .message-list {
      .list-header {
        .list-title {
          font-size: 1.1rem;
        }
      }

      .messages .message-item {
        padding: 20px;

        .message-header {
          .user-info {
            .user-avatar {
              width: 40px;
              height: 40px;
            }

            .user-details {
              .nickname {
                font-size: 0.95rem;
              }

              .time {
                font-size: 0.8rem;
              }
            }
          }

          .message-index {
            font-size: 1rem;
          }
        }

        .message-content {
          font-size: 0.9rem;
        }
      }
    }
  }
}

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
</style>
