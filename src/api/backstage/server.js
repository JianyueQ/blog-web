import request from '@/utils/request'

let apiPrefix = '/monitor/server'

export function getInfoServer() {
    return request({
        url: `${apiPrefix}`,
        method: 'get',
    })
}

