//定制请求的实例
import axios from 'axios';
import {getToken} from '@/utils/auth'
import {tansParams} from "@/utils/common.js";
import errorCode from "@/utils/errorCode.js";
import {ElMessage, ElMessageBox} from 'element-plus';

// 是否显示重新登录
export let isRelogin = {show: false}

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: import.meta.env.VITE_API_BASE_URL,
    // 超时
    timeout: 10000
})

service.interceptors.request.use(config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    // 间隔时间(ms)，小于此时间视为重复提交
    const interval = (config.headers || {}).interval || 1000
    if (getToken() && !isToken) {
        config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
        let url = config.url + '?' + tansParams(config.params)
        url = url.slice(0, -1)
        config.params = {}
        config.url = url
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
        const requestObj = {
            url: config.url,
            data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
            time: new Date().getTime()
        }
        const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
        const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
        if (requestSize >= limitSize) {
            console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
            return config
        }
    }
    //todo 根据interval时间判断是否重复提交
    return config
}, error => {
    console.log(error)
    Promise.reject(error);
})
// 响应拦截器
service.interceptors.response.use(res => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        // 二进制数据则直接返回
        if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
            return res.data
        }
        if (code === 401) {
            if (!isRelogin.show) {
                isRelogin.show = true
                ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    isRelogin.show = false
                    //todo 登出操作
                    // store.dispatch('LogOut').then(() => {
                    //     location.href = '/index'
                    // })
                }).catch(() => {
                    isRelogin.show = false
                })
            }
            return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
        } else if (code === 500) {
            // Message({message: msg, type: 'error'})
            ElMessage({
                message: msg,
                type: 'error'
            })
            return Promise.reject(new Error(msg))
        } else if (code === 601) {
            // Message({message: msg, type: 'warning'})
            ElMessage({
                message: msg,
                type: 'warning'
            })
            return Promise.reject('error')
        } else if (code !== 200) {
            Notification.error({title: msg})
            return Promise.reject('error')
        } else {
            return res.data
        }
    },
    error => {
        console.log('err' + error)
        let {message} = error
        if (message == "Network Error") {
            message = "后端接口连接异常"
        } else if (message.includes("timeout")) {
            message = "系统接口请求超时"
        } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.slice(-3) + "异常"
        }
        // Message({message: message, type: 'error', duration: 5 * 1000})
        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000,
            placement: 'top-right'
        })
        return Promise.reject(error)
    }
)

export default service
