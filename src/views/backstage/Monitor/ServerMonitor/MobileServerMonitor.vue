<template>
  <div class="mobile-server-monitor">
    <!-- 实时状态卡片 -->
    <div class="status-header">
      <div
        class="status-item"
        :class="connectionStatus"
      >
        <span class="status-dot" />
        <span class="status-text">{{ statusText }}</span>
      </div>
      <el-button
        circle
        size="small"
        :icon="Refresh"
        :loading="loading"
        @click="handleManualRefresh"
      />
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div
          class="metric-icon"
          :style="{ background: getCpuColor(serverData.cpu?.used, true) }"
        >
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="metric-info">
          <span class="metric-label">CPU</span>
          <span
            class="metric-value"
            :style="{ color: getCpuColor(serverData.cpu?.used) }"
          >
            {{ serverData.cpu?.used || 0 }}%
          </span>
        </div>
        <el-progress
          :percentage="serverData.cpu?.used || 0"
          :color="getCpuColor(serverData.cpu?.used)"
          :stroke-width="6"
          :show-text="false"
        />
        <div class="metric-detail">
          <span>{{ serverData.cpu?.cpuNum || 0 }} 核心</span>
        </div>
      </div>

      <div class="metric-card">
        <div
          class="metric-icon"
          :style="{ background: getMemColor(serverData.mem?.usage, true) }"
        >
          <el-icon><Coin /></el-icon>
        </div>
        <div class="metric-info">
          <span class="metric-label">内存</span>
          <span
            class="metric-value"
            :style="{ color: getMemColor(serverData.mem?.usage) }"
          >
            {{ serverData.mem?.usage || 0 }}%
          </span>
        </div>
        <el-progress
          :percentage="serverData.mem?.usage || 0"
          :color="getMemColor(serverData.mem?.usage)"
          :stroke-width="6"
          :show-text="false"
        />
        <div class="metric-detail">
          <span>{{ serverData.mem?.used || 0 }} / {{ serverData.mem?.total || 0 }} GB</span>
        </div>
      </div>

      <div class="metric-card">
        <div
          class="metric-icon"
          :style="{ background: getJvmColor(serverData.jvm?.usage, true) }"
        >
          <el-icon><SetUp /></el-icon>
        </div>
        <div class="metric-info">
          <span class="metric-label">JVM</span>
          <span
            class="metric-value"
            :style="{ color: getJvmColor(serverData.jvm?.usage) }"
          >
            {{ serverData.jvm?.usage || 0 }}%
          </span>
        </div>
        <el-progress
          :percentage="serverData.jvm?.usage || 0"
          :color="getJvmColor(serverData.jvm?.usage)"
          :stroke-width="6"
          :show-text="false"
        />
        <div class="metric-detail">
          <span>{{ serverData.jvm?.used || 0 }} / {{ serverData.jvm?.max || 0 }} MB</span>
        </div>
      </div>

      <div class="metric-card">
        <div
          class="metric-icon"
          style="background: rgba(19, 194, 194, 0.15);"
        >
          <el-icon style="color: #13c2c2;">
            <Clock />
          </el-icon>
        </div>
        <div class="metric-info">
          <span class="metric-label">运行时长</span>
          <span
            class="metric-value"
            style="font-size: 14px;"
          >{{ serverData.jvm?.runTime || '--' }}</span>
        </div>
        <div class="metric-detail">
          <span>启动: {{ formatStartTime(serverData.jvm?.startTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 服务器信息 -->
    <div class="info-section">
      <div class="section-title">
        服务器信息
      </div>
      <div class="info-card">
        <div class="info-item">
          <span class="info-label">主机名称</span>
          <span class="info-value">{{ serverData.sys?.computerName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">服务器IP</span>
          <span class="info-value ip-text">{{ serverData.sys?.computerIp || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">操作系统</span>
          <span class="info-value">{{ serverData.sys?.osName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">系统架构</span>
          <span class="info-value">{{ serverData.sys?.osArch || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- JVM信息 -->
    <div class="info-section">
      <div class="section-title">
        Java 虚拟机
      </div>
      <div class="info-card">
        <div class="info-item">
          <span class="info-label">JVM 名称</span>
          <span class="info-value">{{ serverData.jvm?.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Java 版本</span>
          <span class="info-value">{{ serverData.jvm?.version || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">总内存</span>
          <span class="info-value">{{ serverData.jvm?.total || 0 }} MB</span>
        </div>
        <div class="info-item">
          <span class="info-label">剩余内存</span>
          <span class="info-value">{{ serverData.jvm?.free || 0 }} MB</span>
        </div>
      </div>
    </div>

    <!-- 磁盘监控 -->
    <div class="info-section">
      <div class="section-title">
        <span>磁盘监控</span>
        <span class="disk-count">{{ serverData.sysFiles?.length || 0 }} 个分区</span>
      </div>
      <div class="disk-list">
        <div
          v-for="(disk, index) in serverData.sysFiles"
          :key="index"
          class="disk-card"
          :class="{ 'disk-warning': disk.usage >= 75, 'disk-danger': disk.usage >= 90 }"
        >
          <div class="disk-header">
            <div class="disk-icon">
              <el-icon><Folder /></el-icon>
            </div>
            <div class="disk-info">
              <span class="disk-name">{{ disk.typeName }}</span>
              <span
                class="disk-usage"
                :style="{ color: getDiskColor(disk.usage) }"
              >{{ disk.usage }}%</span>
            </div>
          </div>
          <el-progress
            :percentage="disk.usage"
            :color="getDiskColor(disk.usage)"
            :stroke-width="8"
            :show-text="false"
          />
          <div class="disk-details">
            <div class="disk-detail-item">
              <span class="detail-label">总容量</span>
              <span class="detail-value">{{ disk.total }}</span>
            </div>
            <div class="disk-detail-item">
              <span class="detail-label">已用</span>
              <span class="detail-value">{{ disk.used }}</span>
            </div>
            <div class="disk-detail-item">
              <span class="detail-label">可用</span>
              <span class="detail-value">{{ disk.free }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getInfoServer } from '@/api/backstage/server'
import { ElMessage } from 'element-plus'
import { Monitor, Coin, SetUp, Clock, Refresh, Folder } from '@element-plus/icons-vue'
import { createServerMonitorWS } from '@/utils/websocket'
import { getToken } from '@/utils/auth'

const loading = ref(false)
const connectionStatus = ref('disconnected')
const serverData = ref({
  cpu: {},
  mem: {},
  jvm: {},
  sys: {},
  sysFiles: []
})

let wsManager = null

const statusText = computed(() => {
  const statusMap = {
    'connected': '已连接',
    'connecting': '连接中...',
    'disconnected': '未连接',
    'error': '连接错误'
  }
  return statusMap[connectionStatus.value] || '未知'
})

// 获取服务器数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getInfoServer()
    serverData.value = res.data || {}
  } catch (error) {
    ElMessage.error('获取服务器信息失败')
  } finally {
    loading.value = false
  }
}

// 初始化 WebSocket
const initWebSocket = () => {
  if (wsManager) {
    wsManager.close()
  }

  wsManager = createServerMonitorWS({
    onOpen: () => {
      connectionStatus.value = 'connected'
    },
    onMessage: (data) => {
      if (data.type === 'server_info' && data.data) {
        serverData.value = data.data
      }
    },
    onClose: () => {
      connectionStatus.value = 'disconnected'
    },
    onError: () => {
      connectionStatus.value = 'error'
      fetchData()
    }
  })

  connectionStatus.value = 'connecting'
  const token = getToken()
  if (token) {
    wsManager.connect(token)
  }
}

// 手动刷新
const handleManualRefresh = () => {
  fetchData()
}

// 颜色计算函数
const getCpuColor = (usage, isBg = false) => {
  if (usage >= 80) return isBg ? 'rgba(255, 77, 79, 0.15)' : '#ff4d4f'
  if (usage >= 50) return isBg ? 'rgba(250, 173, 20, 0.15)' : '#faad14'
  return isBg ? 'rgba(82, 196, 26, 0.15)' : '#52c41a'
}

const getMemColor = (usage, isBg = false) => {
  if (usage >= 90) return isBg ? 'rgba(255, 77, 79, 0.15)' : '#ff4d4f'
  if (usage >= 70) return isBg ? 'rgba(250, 173, 20, 0.15)' : '#faad14'
  return isBg ? 'rgba(82, 196, 26, 0.15)' : '#52c41a'
}

const getJvmColor = (usage, isBg = false) => {
  if (usage >= 85) return isBg ? 'rgba(255, 77, 79, 0.15)' : '#ff4d4f'
  if (usage >= 60) return isBg ? 'rgba(250, 173, 20, 0.15)' : '#faad14'
  return isBg ? 'rgba(82, 196, 26, 0.15)' : '#52c41a'
}

const getDiskColor = (usage) => {
  if (usage >= 90) return '#ff4d4f'
  if (usage >= 75) return '#faad14'
  return '#52c41a'
}

const formatStartTime = (time) => {
  if (!time) return '--'
  return time
}

onMounted(() => {
  fetchData()
  initWebSocket()
})

onUnmounted(() => {
  if (wsManager) {
    wsManager.close()
    wsManager = null
  }
})

defineExpose({
  fetchData
})
</script>

<style lang="scss" scoped>
.mobile-server-monitor {
  padding: 12px;
  background: var(--backstage-bg-color);
  min-height: 100vh;

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      background: var(--backstage-card-bg);
      font-size: 13px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      &.connected {
        .status-dot { background: #52c41a; }
        .status-text { color: #52c41a; }
      }

      &.connecting {
        .status-dot { background: #faad14; }
        .status-text { color: #faad14; }
      }

      &.disconnected, &.error {
        .status-dot { background: #ff4d4f; }
        .status-text { color: #ff4d4f; }
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;

    .metric-card {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      box-shadow: var(--backstage-shadow-light);

      .metric-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;

        .el-icon {
          font-size: 20px;
        }
      }

      .metric-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .metric-label {
          font-size: 13px;
          color: var(--backstage-text-secondary);
        }

        .metric-value {
          font-size: 20px;
          font-weight: 700;
        }
      }

      .metric-detail {
        margin-top: 8px;
        font-size: 12px;
        color: var(--backstage-text-secondary);
      }
    }
  }

  .info-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      font-weight: 600;
      color: var(--backstage-text-primary);
      margin-bottom: 12px;
      padding: 0 4px;

      .disk-count {
        font-size: 13px;
        font-weight: 400;
        color: var(--backstage-text-secondary);
      }
    }

    .info-card {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      box-shadow: var(--backstage-shadow-light);

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--backstage-border-color);

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 13px;
          color: var(--backstage-text-secondary);
        }

        .info-value {
          font-size: 13px;
          color: var(--backstage-text-primary);

          &.ip-text {
            font-family: 'Consolas', monospace;
            color: var(--backstage-primary);
          }
        }
      }
    }
  }

  .disk-list {
    // 上下间距
    margin-bottom: 20px;
    .disk-card {
      background: var(--backstage-card-bg);
      border-radius: var(--backstage-radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(--backstage-shadow-light);
      border-left: 4px solid transparent;

      &.disk-warning {
        border-left-color: #faad14;
      }

      &.disk-danger {
        border-left-color: #ff4d4f;
      }

      .disk-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .disk-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--backstage-border-lighter);
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 20px;
            color: var(--backstage-text-secondary);
          }
        }

        .disk-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .disk-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--backstage-text-primary);
          }

          .disk-usage {
            font-size: 18px;
            font-weight: 700;
          }
        }
      }

      .disk-details {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--backstage-border-color);

        .disk-detail-item {
          text-align: center;

          .detail-label {
            display: block;
            font-size: 11px;
            color: var(--backstage-text-secondary);
            margin-bottom: 4px;
          }

          .detail-value {
            font-size: 12px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
