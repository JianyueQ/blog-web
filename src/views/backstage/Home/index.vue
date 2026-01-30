<template>
  <div class="dashboard-pro">
    <!-- 欢迎栏 -->
    <div class="welcome-banner fade-in">
      <div class="welcome-content">
        <h1>欢迎回来，{{ userStore.nickname }}</h1>
        <p>这是您今天的博客概览。所有系统运行正常，继续保持！</p>
      </div>
      <div class="current-time">
        <el-icon><Calendar/></el-icon>
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <!-- 统计核心指标 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in statsCards" :key="index">
        <div class="pro-card stats-card slide-in" :style="{ animationDelay: (index * 0.1) + 's' }">
          <div class="card-body">
            <div class="stats-icon" :style="{ backgroundColor: item.color + '15', color: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="stats-info">
              <div class="label">{{ item.label }}</div>
              <div class="value">{{ item.value }}</div>
              <div class="trend" :class="item.trend > 0 ? 'up' : 'down'">
                <el-icon><CaretTop v-if="item.trend > 0"/><CaretBottom v-else/></el-icon>
                <span>{{ Math.abs(item.trend) }}%</span>
                <span class="trend-label">自上周</span>
              </div>
            </div>
          </div>
          <div class="mini-chart">
             <!-- 简单的 CSS 渐变背景作为迷你图占位 -->
             <div class="chart-line" :style="{ background: 'linear-gradient(90deg, ' + item.color + '00 0%, ' + item.color + '44 100%)' }"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content-row">
      <!-- 最近动态 -->
      <el-col :xs="24" :lg="16">
        <div class="pro-card content-card slide-in delay-300">
          <div class="card-header">
            <div class="title-area">
              <span class="title">内容中心动态</span>
              <span class="subtitle">实时监控您的文章发布状态</span>
            </div>
            <el-button link type="primary">查看全部</el-button>
          </div>
          <div class="card-body">
            <el-table :data="recentArticles" style="width: 100%" class="pro-table">
              <el-table-column label="文章标题" min-width="250">
                <template #default="scope">
                  <div class="article-title-cell">
                    <div class="article-icon"><Document /></div>
                    <span>{{ scope.row.title }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="category" label="分类" width="120">
                <template #default="scope">
                  <el-tag :type="getTagType(scope.row.category)" size="small" effect="light">
                    {{ scope.row.category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="date" label="发布时间" width="180" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default>
                  <el-button link type="primary" size="small">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>

      <!-- 快捷指令 -->
      <el-col :xs="24" :lg="8">
        <div class="pro-card quick-card slide-in delay-400">
          <div class="card-header">
            <span class="title">快捷创作指令</span>
          </div>
          <div class="card-body">
            <div class="quick-grid">
              <div v-for="(act, idx) in quickActions" :key="idx" 
                   class="quick-item" @click="handleAction(act.label)">
                <div class="icon-box" :style="{ color: act.color, backgroundColor: act.color + '10' }">
                  <el-icon><component :is="act.icon" /></el-icon>
                </div>
                <span>{{ act.label }}</span>
              </div>
            </div>
            
            <div class="system-status">
              <div class="status-header">系统运行状态</div>
              <div class="status-item">
                <span class="label">CPU 使用率</span>
                <el-progress :percentage="12" status="success" :stroke-width="4" />
              </div>
              <div class="status-item">
                <span class="label">内存 占用</span>
                <el-progress :percentage="35" :stroke-width="4" />
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  Document, View, ChatDotRound, Link, Edit, 
  Upload, Setting, Calendar, CaretTop, CaretBottom,
  Plus, Monitor, Collection, Operation
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
})

const statsCards = [
  { label: '文章总数', value: '1,284', icon: Document, color: '#1677ff', trend: 12.5 },
  { label: '访客总量', value: '52,862', icon: View, color: '#52c41a', trend: 8.2 },
  { label: '互动评论', value: '842', icon: ChatDotRound, color: '#faad14', trend: -2.4 },
  { label: '友链数量', value: '126', icon: Link, color: '#722ed1', trend: 5.1 }
]

const recentArticles = ref([
  { title: 'PRO MAX 2.0 视觉更新说明', category: '公告', date: '2026-01-29 10:00' },
  { title: '现代化后台架构演进实践', category: '技术', date: '2026-01-28 15:30' },
  { title: 'Element Plus 极致自定义指南', category: '教程', date: '2026-01-27 09:20' },
  { title: '博客响应式布局深度优化', category: '技术', date: '2026-01-26 14:15' },
  { title: '从零开始构建全栈博客', category: '教程', date: '2026-01-25 11:45' }
])

const quickActions = [
  { label: '写文章', icon: Plus, color: '#1677ff' },
  { label: '传图片', icon: Upload, color: '#52c41a' },
  { label: '配系统', icon: Setting, color: '#faad14' },
  { label: '看前台', icon: Monitor, color: '#722ed1' },
  { label: '分类集', icon: Collection, color: '#13c2c2' },
  { label: '管理台', icon: Operation, color: '#eb2f96' }
]

const getTagType = (cat) => {
  const map = { '公告': 'warning', '技术': 'primary', '教程': 'success' }
  return map[cat] || 'info'
}

const handleAction = (action) => {
  // TODO: 之后根据需要添加交互, 目前使用 ElMessage.info(`${action}模块正在加载...`)
}
</script>

<style scoped lang="scss">
.dashboard-pro {
  .welcome-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .welcome-content {
      h1 {
        font-size: 24px;
        font-weight: 600;
        color: var(--backstage-text-primary);
        margin: 0 0 8px 0;
      }
      p {
        font-size: 14px;
        color: var(--backstage-text-secondary);
        margin: 0;
      }
    }
    
    .current-time {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--backstage-card-bg);
      border: 1px solid var(--backstage-border-color);
      border-radius: var(--backstage-radius-lg);
      font-size: 14px;
      color: var(--backstage-text-regular);
      box-shadow: var(--backstage-shadow-light);
      
      .el-icon {
        color: var(--backstage-primary);
      }
    }
  }

  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    margin-bottom: 20px;

    &:hover {
      box-shadow: var(--backstage-shadow-base);
      transform: translateY(-2px);
    }
    
    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--backstage-border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
      
      .subtitle {
        display: block;
        font-size: 12px;
        color: var(--backstage-text-secondary);
        font-weight: 400;
        margin-top: 2px;
      }
    }
    
    .card-body {
      padding: 20px;
    }
  }

  .stats-card {
    position: relative;
    .card-body {
      display: flex;
      gap: 16px;
      padding: 24px;
      z-index: 1;
      position: relative;
    }
    
    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .stats-info {
      .label {
        font-size: 13px;
        color: var(--backstage-text-secondary);
        margin-bottom: 4px;
      }
      .value {
        font-size: 24px;
        font-weight: 700;
        color: var(--backstage-text-primary);
        line-height: 1;
        margin-bottom: 8px;
      }
      .trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        
        &.up { color: var(--backstage-success); }
        &.down { color: var(--backstage-danger); }
        
        .trend-label {
          color: var(--backstage-text-placeholder);
          margin-left: 2px;
          font-weight: 400;
        }
      }
    }
    
    .mini-chart {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      opacity: 0.3;
      pointer-events: none;
      
      .chart-line {
        width: 100%;
        height: 100%;
        clip-path: polygon(0% 100%, 0% 60%, 10% 70%, 20% 40%, 30% 60%, 40% 30%, 50% 50%, 60% 20%, 70% 40%, 80% 10%, 90% 30%, 100% 0%, 100% 100%);
      }
    }
  }

  .main-content-row {
    margin-top: 4px;
  }

  .pro-table {
    :deep(.el-table__header) th {
      background-color: var(--backstage-border-lighter);
      color: var(--backstage-text-regular);
      font-weight: 600;
      font-size: 13px;
      border-bottom: none;
    }
    
    .article-title-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .article-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: var(--backstage-primary-lighter);
        color: var(--backstage-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
    }
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
    
    .quick-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border-radius: var(--backstage-radius-lg);
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      
      &:hover {
        background-color: var(--backstage-border-lighter);
        border-color: var(--backstage-border-color);
        transform: translateY(-2px);
      }
      
      .icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      
      span {
        font-size: 13px;
        color: var(--backstage-text-regular);
        font-weight: 500;
      }
    }
  }

  .system-status {
    background: var(--backstage-border-lighter);
    padding: 16px;
    border-radius: var(--backstage-radius-lg);
    
    .status-header {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--backstage-text-primary);
    }
    
    .status-item {
      margin-bottom: 12px;
      &:last-child { margin-bottom: 0; }
      
      .label {
        display: block;
        font-size: 12px;
        color: var(--backstage-text-secondary);
        margin-bottom: 6px;
      }
    }
  }
}

// 动画
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: fadeIn 0.6s ease-out forwards; }
.slide-in { animation: slideIn 0.5s ease-out forwards; }

.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }

@media (max-width: 1200px) {
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
