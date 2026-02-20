<template>
  <MobileServerMonitor v-if="isMobile" ref="mobileRef" />
  <div v-else class="server-monitor">
    <!-- 自动刷新控制 -->
    <div class="pro-card toolbar-card">
      <div class="toolbar-left">
        <el-switch v-model="autoRefresh" active-text="实时推送" @change="handleAutoRefreshChange"/>
        <el-tag
            :type="connectionStatus === 'connected' ? 'success' : connectionStatus === 'connecting' ? 'warning' : 'info'"
            size="small"
            effect="plain"
        >
          <template v-if="connectionStatus === 'connected'">
            ● 已连接 WebSocket
          </template>
          <template v-else-if="connectionStatus === 'connecting'">
            ● 连接中...
          </template>
          <template v-else>
            ● 未连接
          </template>
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button circle @click="handleManualRefresh" :icon="Refresh" title="立即刷新" :loading="loading"/>
      </div>
    </div>

    <!-- 核心监控指标 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="pro-card metric-card">
          <div class="metric-header">
            <el-icon class="icon" :style="{ color: getCpuColor(serverData.cpu?.used) }">
              <Monitor/>
            </el-icon>
            <span class="title">CPU 使用率</span>
          </div>
          <div class="metric-body">
            <div class="value">{{ serverData.cpu?.used || 0 }}%</div>
            <el-progress
                :percentage="serverData.cpu?.used || 0"
                :color="getCpuColor(serverData.cpu?.used)"
                :stroke-width="8"
            />
            <div class="metric-details">
              <span>核心数: {{ serverData.cpu?.cpuNum || 0 }}</span>
              <span>系统: {{ serverData.cpu?.sys || 0 }}%</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="pro-card metric-card">
          <div class="metric-header">
            <el-icon class="icon" :style="{ color: getMemColor(serverData.mem?.usage) }">
              <Coin/>
            </el-icon>
            <span class="title">内存占用</span>
          </div>
          <div class="metric-body">
            <div class="value">{{ serverData.mem?.usage || 0 }}%</div>
            <el-progress
                :percentage="serverData.mem?.usage || 0"
                :color="getMemColor(serverData.mem?.usage)"
                :stroke-width="8"
            />
            <div class="metric-details">
              <span>已用: {{ serverData.mem?.used || 0 }} GB</span>
              <span>总计: {{ serverData.mem?.total || 0 }} GB</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="pro-card metric-card">
          <div class="metric-header">
            <el-icon class="icon" :style="{ color: getJvmColor(serverData.jvm?.usage) }">
              <SetUp/>
            </el-icon>
            <span class="title">JVM 内存</span>
          </div>
          <div class="metric-body">
            <div class="value">{{ serverData.jvm?.usage || 0 }}%</div>
            <el-progress
                :percentage="serverData.jvm?.usage || 0"
                :color="getJvmColor(serverData.jvm?.usage)"
                :stroke-width="8"
            />
            <div class="metric-details">
              <span>已用: {{ serverData.jvm?.used || 0 }} MB</span>
              <span>最大: {{ serverData.jvm?.max || 0 }} MB</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="pro-card metric-card">
          <div class="metric-header">
            <el-icon class="icon" style="color: #13c2c2">
              <Clock/>
            </el-icon>
            <span class="title">运行时长</span>
          </div>
          <div class="metric-body">
            <div class="value runtime">{{ serverData.jvm?.runTime || '- - -' }}</div>
            <div class="metric-details" style="margin-top: 12px">
              <span>启动: {{ serverData.jvm?.startTime || '- - -' }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 详细信息 -->
    <el-row :gutter="20">
      <!-- 服务器信息 -->
      <el-col :xs="24" :lg="12">
        <div class="pro-card info-card">
          <div class="card-header">
            <span class="title">服务器信息</span>
          </div>
          <div class="card-body">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="主机名称">{{ serverData.sys?.computerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="服务器IP">{{ serverData.sys?.computerIp || '-' }}</el-descriptions-item>
              <el-descriptions-item label="操作系统">{{ serverData.sys?.osName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="系统架构">{{ serverData.sys?.osArch || '-' }}</el-descriptions-item>
              <el-descriptions-item label="项目路径">
                <div class="path-text">{{ serverData.sys?.userDir || '-' }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-col>

      <!-- JVM 详细信息 -->
      <el-col :xs="24" :lg="12">
        <div class="pro-card info-card">
          <div class="card-header">
            <span class="title">Java 虚拟机</span>
          </div>
          <div class="card-body">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="JVM 名称">{{ serverData.jvm?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="Java 版本">{{ serverData.jvm?.version || '-' }}</el-descriptions-item>
              <el-descriptions-item label="JDK 路径">
                <div class="path-text">{{ serverData.jvm?.home || '-' }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="总内存">{{ serverData.jvm?.total || 0 }} MB</el-descriptions-item>
              <el-descriptions-item label="剩余内存">{{ serverData.jvm?.free || 0 }} MB</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 磁盘监控 -->
    <div class="pro-card disk-card">
      <div class="card-header">
        <span class="title">磁盘监控</span>
        <span class="disk-count">共 {{ serverData.sysFiles?.length || 0 }} 个分区</span>
      </div>
      <div class="card-body">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8" v-for="(disk, index) in serverData.sysFiles" :key="index">
            <div class="disk-item" :class="{ 'disk-warning': disk.usage >= 75, 'disk-danger': disk.usage >= 90 }">
              <div class="disk-header">
                <div class="disk-icon-wrapper">
                  <el-icon class="disk-icon">
                    <Folder/>
                  </el-icon>
                </div>
                <div class="disk-info">
                  <el-tooltip :content="disk.typeName" placement="top" :show-after="500">
                    <span class="disk-name">{{ disk.typeName }}</span>
                  </el-tooltip>
                  <span class="disk-usage" :style="{ color: getDiskColor(disk.usage) }">{{ disk.usage }}%</span>
                </div>
              </div>
              <div class="disk-progress-wrapper">
                <el-progress
                    :percentage="disk.usage"
                    :color="getDiskColor(disk.usage)"
                    :stroke-width="12"
                    :show-text="false"
                />
              </div>
              <div class="disk-details">
                <div class="detail-item">
                  <span class="detail-label">总容量</span>
                  <span class="detail-value">{{ disk.total }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">已用</span>
                  <span class="detail-value">{{ disk.used }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">可用</span>
                  <span class="detail-value">{{ disk.free }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref, computed} from 'vue'
import {getInfoServer} from '@/api/backstage/server'
import {ElMessage} from 'element-plus'
import {Clock, Coin, Folder, Monitor, Refresh, SetUp} from '@element-plus/icons-vue'
import {createServerMonitorWS} from '@/utils/websocket'
import {getToken} from '@/utils/auth'
import MobileServerMonitor from './MobileServerMonitor.vue'

// 检测是否为移动端
const isMobile = computed(() => window.innerWidth < 768)
const mobileRef = ref(null)

const loading = ref(false)
const autoRefresh = ref(true)
const connectionStatus = ref('disconnected') // disconnected | connecting | connected | error
const serverData = ref({
  cpu: {},
  mem: {},
  jvm: {},
  sys: {},
  sysFiles: []
})

let wsManager = null

// 获取服务器数据（HTTP 降级方案）
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

// 初始化 WebSocket 连接（使用工厂方法简化逻辑）
const initWebSocket = () => {
  // 关闭旧连接
  if (wsManager) {
    wsManager.close()
  }

  // 创建 WebSocket 连接
  wsManager = createServerMonitorWS({
    onOpen: () => {
      connectionStatus.value = 'connected'
      console.log('[ServerMonitor] WebSocket 连接成功')
    },
    onMessage: (data) => {
      if (data.type === 'server_info' && data.data) {
        serverData.value = data.data
      }
    },
    onClose: (event) => {
      connectionStatus.value = 'disconnected'
      console.log('[ServerMonitor] WebSocket 连接关闭', event)
    },
    onError: (event) => {
      connectionStatus.value = 'error'
      console.error('[ServerMonitor] WebSocket 错误', event)
      // 降级到 HTTP 轮询
      fetchData()
    }
  })

  // 建立连接
  connectionStatus.value = 'connecting'
  const token = getToken()
  if (token) {
    wsManager.connect(token)
  } else {
    ElMessage.error('未找到认证信息，无法连接实时监控')
    connectionStatus.value = 'error'
  }
}

// 自动刷新控制（WebSocket 模式下仅用于重连）
const handleAutoRefreshChange = (val) => {
  autoRefresh.value = val

  if (val) {
    // 如果 WebSocket 未连接，尝试重新连接
    if (!wsManager || !wsManager.isConnected()) {
      initWebSocket()
    }
  } else {
    // 关闭 WebSocket 连接
    if (wsManager) {
      wsManager.close()
    }
  }
}

// 手动刷新（强制拉取一次 HTTP 数据）
const handleManualRefresh = () => {
  fetchData()
}

// 颜色计算函数
const getCpuColor = (usage) => {
  if (usage >= 80) return '#ff4d4f'
  if (usage >= 50) return '#faad14'
  return '#52c41a'
}

const getMemColor = (usage) => {
  if (usage >= 90) return '#ff4d4f'
  if (usage >= 70) return '#faad14'
  return '#52c41a'
}

const getJvmColor = (usage) => {
  if (usage >= 85) return '#ff4d4f'
  if (usage >= 60) return '#faad14'
  return '#52c41a'
}

const getDiskColor = (usage) => {
  if (usage >= 90) return '#ff4d4f'
  if (usage >= 75) return '#faad14'
  return '#52c41a'
}

onMounted(() => {
  if (isMobile.value) return
  
  // 首次加载使用 HTTP 获取数据
  fetchData()

  // 启动 WebSocket 实时推送
  if (autoRefresh.value) {
    initWebSocket()
  }
})

onUnmounted(() => {
  // 清理 WebSocket 连接
  if (wsManager) {
    wsManager.close()
    wsManager = null
  }
})
</script>

<style lang="scss" scoped>
.server-monitor {
  .pro-card {
    background: var(--backstage-card-bg);
    border: 1px solid var(--backstage-border-color);
    border-radius: var(--backstage-radius-xl);
    box-shadow: var(--backstage-shadow-light);
    margin-bottom: 24px;

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--backstage-border-color);

      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--backstage-text-primary);
      }
    }

    .card-body {
      padding: 20px;
    }
  }

  .toolbar-card {
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .refresh-interval {
        font-size: 14px;
        color: var(--backstage-text-secondary);
      }
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .metric-card {
    .metric-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 16px;

      .icon {
        font-size: 24px;
      }

      .title {
        font-size: 14px;
        font-weight: 500;
        color: var(--backstage-text-secondary);
      }
    }

    .metric-body {
      padding: 0 20px 20px;

      .value {
        font-size: 32px;
        font-weight: 700;
        color: var(--backstage-text-primary);
        margin-bottom: 12px;

        &.runtime {
          font-size: 18px;
          font-weight: 600;
        }
      }

      .metric-details {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        font-size: 12px;
        color: var(--backstage-text-secondary);
      }
    }
  }

  .info-card {
    .path-text {
      font-size: 12px;
      word-break: break-all;
      color: var(--backstage-text-regular);
    }
  }

  .disk-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .disk-count {
        font-size: 13px;
        color: var(--backstage-text-secondary);
        font-weight: 400;
      }
    }

    .card-body {
      padding: 24px;
    }

    .disk-item {
      padding: 24px;
      background: var(--backstage-bg-color);
      border: 1px solid var(--backstage-border-color);
      border-radius: var(--backstage-radius-xl);
      margin-bottom: 24px;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--backstage-primary-light);
        box-shadow: var(--backstage-shadow-light);
      }

      &.disk-warning {
        border-color: #faad14;
        background: rgba(250, 173, 20, 0.05);
      }

      &.disk-danger {
        border-color: #ff4d4f;
        background: rgba(255, 77, 79, 0.05);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .disk-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;

        .disk-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--backstage-border-lighter);
          border-radius: var(--backstage-radius-lg);

          .disk-icon {
            font-size: 24px;
            color: var(--backstage-text-secondary);
          }
        }

        .disk-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-width: 0;

          .disk-name {
            font-size: 15px;
            font-weight: 600;
            color: var(--backstage-text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: calc(100% - 60px);
            cursor: default;
          }

          .disk-usage {
            font-size: 18px;
            font-weight: 700;
          }
        }
      }

      .disk-progress-wrapper {
        margin-bottom: 20px;
      }

      .disk-details {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        .detail-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: var(--backstage-border-lighter);
          border-radius: var(--backstage-radius-md);

          .detail-label {
            font-size: 12px;
            color: var(--backstage-text-secondary);
            margin-bottom: 4px;
          }

          .detail-value {
            font-size: 13px;
            font-weight: 600;
            color: var(--backstage-text-primary);
          }
        }
      }
    }
  }
}
</style>
