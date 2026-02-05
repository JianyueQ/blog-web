import request from '@/utils/request'

let apiPrefix = '/monitor/operlog'

export function getOperlogList(params) {
    return request({
        url: `${apiPrefix}/list`,
        method: 'get',
        params
    })
}

///monitor/operlog/{operIds}
export function deleteOperlog(operId) {
    return request({
        url: '/monitor/operlog/' + operId,
        method: 'delete'
    })
}
///monitor/operlog/clean
export function cleanOperlog() {
    return request({
        url: `${apiPrefix}/clean`,
        method: 'delete'
    })
}

///monitor/operlog/detail/{operId}
export function getOperlogDetail(operId) {
    return request({
        url: `${apiPrefix}/detail/${operId}`,
        method: 'get'
    })
}

