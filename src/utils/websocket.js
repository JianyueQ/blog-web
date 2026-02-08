/**
 * WebSocket 管理工具类
 * 支持自动重连、心跳保活、消息队列、协议适配、请求头认证
 */

import {getToken} from '@/utils/auth'

class WebSocketManager {
    constructor(url, options = {}) {
        this.baseUrl = url
        this.options = {
            heartbeatInterval: 10000, // 心跳间隔（与后端一致）
            reconnectInterval: 3000,  // 重连间隔
            maxReconnectAttempts: 5,  // 最大重连次数
            enableHeartbeat: true,    // 启用心跳
            ...options
        }

        this.ws = null
        this.reconnectAttempts = 0
        this.heartbeatTimer = null
        this.reconnectTimer = null
        this.messageQueue = []
        this.isManualClose = false
        this.currentToken = null // 保存当前使用的 token
        this.listeners = {
            onMessage: null,
            onOpen: null,
            onClose: null,
            onError: null
        }
    }

    /**
     * 建立 WebSocket 连接
     * @param {string} token - JWT Token（可选，不传则自动获取）
     */
    connect(token = null) {
        try {
            // 如果已有连接，先关闭
            if (this.ws) {
                this.ws.close()
            }

            // 获取 token（优先使用参数，否则从存储中读取）
            const authToken = token || getToken()
            if (!authToken) {
                console.error('[WebSocket] 未找到认证 token，无法建立连接')
                if (this.listeners.onError) {
                    this.listeners.onError(new Error('未找到认证信息'))
                }
                return
            }

            // 保存当前 token 用于重连
            this.currentToken = authToken

            // 自动协议适配：http/https → ws/wss
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const cleanUrl = this.baseUrl.replace(/^(ws|wss):\/\//, '')

            // 根据认证模式构建连接
            // URL 参数模式
            const wsUrl = `${protocol}//${cleanUrl}?token=${authToken}`
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = this.handleOpen.bind(this)
            this.ws.onmessage = this.handleMessage.bind(this)
            this.ws.onerror = this.handleError.bind(this)
            this.ws.onclose = this.handleClose.bind(this)

        } catch (error) {
            console.error('[WebSocket] 连接失败:', error)
            this.scheduleReconnect()
        }
    }

    /**
     * 连接成功回调
     */
    handleOpen(event) {
        this.reconnectAttempts = 0

        // 启动心跳
        if (this.options.enableHeartbeat) {
            this.startHeartbeat()
        }

        // 发送队列中的消息
        this.flushMessageQueue()

        // 触发用户回调
        if (this.listeners.onOpen) {
            this.listeners.onOpen(event)
        }
    }

    /**
     * 接收消息回调
     */
    handleMessage(event) {
        try {
            // 处理心跳 PING 消息
            if (event.data === 'ping') {
                this.send('pong')
                return
            }

            // 解析 JSON 数据
            const data = JSON.parse(event.data)

            // 触发用户回调
            if (this.listeners.onMessage) {
                this.listeners.onMessage(data)
            }
        } catch (error) {
            console.error('[WebSocket] 消息解析失败:', error, event.data)
        }
    }

    /**
     * 错误回调
     */
    handleError(event) {
        if (this.listeners.onError) {
            this.listeners.onError(event)
        }
    }

    /**
     * 连接关闭回调
     */
    handleClose(event) {
        // 停止心跳
        this.stopHeartbeat()

        // 触发用户回调
        if (this.listeners.onClose) {
            this.listeners.onClose(event)
        }

        // 非主动关闭且未超过重连次数，则自动重连
        if (!this.isManualClose && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.scheduleReconnect()
        }
    }

    /**
     * 发送消息
     * @param {string|object} data - 要发送的数据
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data)
            this.ws.send(message)
        } else {
            this.messageQueue.push(data)
        }
    }

    /**
     * 发送队列中的消息
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift()
            this.send(message)
        }
    }

    /**
     * 启动心跳
     */
    startHeartbeat() {
        this.stopHeartbeat()

        // 注意：后端主动发送 PING，前端只需响应 PONG
        // 这里不需要主动发送心跳，只需保持连接存活
    }

    /**
     * 停止心跳
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = null
        }
    }

    /**
     * 安排重连（使用指数退避策略）
     */
    scheduleReconnect() {
        if (this.reconnectTimer) {
            return
        }

        this.reconnectAttempts++

        // 指数退避：3s → 6s → 12s → 24s → 48s
        const delay = Math.min(
            this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
            30000 // 最大 30 秒
        )

        console.log(`[WebSocket] ${delay / 1000}秒后进行第 ${this.reconnectAttempts} 次重连...`)

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            // 使用保存的 token 进行重连
            this.connect(this.currentToken)
        }, delay)
    }

    /**
     * 手动关闭连接
     */
    close() {
        this.isManualClose = true
        this.stopHeartbeat()

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            this.ws.close()
            this.ws = null
        }

        // 清空 token
        this.currentToken = null
        // 重置重连计数
        this.reconnectAttempts = 0
    }

    /**
     * 注册事件监听器
     */
    on(event, callback) {
        if (this.listeners.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
            this.listeners[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback
        }
    }

    /**
     * 获取连接状态
     */
    getReadyState() {
        if (!this.ws) return WebSocket.CLOSED
        return this.ws.readyState
    }

    /**
     * 是否已连接
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN
    }

    /**
     * 重置连接（断开并重连）
     */
    reconnect() {
        this.isManualClose = false
        this.reconnectAttempts = 0
        this.close()
        this.isManualClose = false // 恢复自动重连
        this.connect(this.currentToken)
    }
}

/**
 * 创建服务器监控 WebSocket 连接的工厂方法
 * @param {Object} callbacks - 回调函数 { onMessage, onOpen, onClose, onError }
 * @returns {WebSocketManager} WebSocket 管理器实例
 */
export function createServerMonitorWS(callbacks = {}) {
    // 动态构建 WebSocket URL（自动适配 localhost / 局域网 IP / 生产域名）
    const hostname = window.location.hostname
    const isDev = import.meta.env.DEV

    // 开发环境使用固定端口 8998，生产环境使用当前端口（Nginx 反向代理）
    const wsBaseUrl = isDev
        ? `${hostname}:8998/ws/monitor/server`
        : `${window.location.host}/ws/monitor/server`

    // 创建 WebSocket 管理器
    const wsManager = new WebSocketManager(wsBaseUrl, {
        heartbeatInterval: 10000,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        enableHeartbeat: true
    })

    // 注册回调
    if (callbacks.onMessage) wsManager.on('message', callbacks.onMessage)
    if (callbacks.onOpen) wsManager.on('open', callbacks.onOpen)
    if (callbacks.onClose) wsManager.on('close', callbacks.onClose)
    if (callbacks.onError) wsManager.on('error', callbacks.onError)

    return wsManager
}

export default WebSocketManager
