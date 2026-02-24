import request from '@/utils/request'

//系统监控接口
const apiPrefix = '/blog/monitor/uptime'

// 获取格式化的累计运行时长
export function getSystemUptimeFormatted() {
    return request({
        url: `${apiPrefix}/formatted`,
        method: 'get'
    })
}