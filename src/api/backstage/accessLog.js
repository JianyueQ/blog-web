import request from '@/utils/request'

let apiPrefix = '/monitor/access'

export function getList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

export function deleteAccess(infoIds) {
    return request({
        url: `${apiPrefix}/${infoIds}`,
        method: 'delete'
    })
}

export function cleanAccess() {
    return request({
        url: `${apiPrefix}/clean`,
        method: 'delete'
    })
}

