import request from '@/utils/request'


export function getCode() {
    return request({
        url: '/captchaImage',
        method: 'get'
    })
}

export function login(data) {
    return request({
        url: '/login',
        method: 'post',
        data
    })
}
