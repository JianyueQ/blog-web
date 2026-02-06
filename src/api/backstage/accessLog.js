import request from '@/utils/request'

let apiPrefix = '/monitor/access'

export function getList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

export function deleteAccess(operId) {
    return request({
        url: `${apiPrefix}` + operId,
        method: 'delete'
    })
}

export function cleanAccess() {
    return request({
        url: `${apiPrefix}/clean`,
        method: 'delete'
    })
}

