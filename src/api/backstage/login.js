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

// 注册方法
export function register(data) {
    return request({
        url: '/register',
        headers: {
            isToken: false
        },
        method: 'post',
        data: data
    })
}

// 获取用户详细信息
export function getInfo() {
    return request({
        url: '/getAdminInfo',
        method: 'get'
    })
}

// 退出方法
export function logout() {
    return request({
        url: '/logout',
        method: 'post'
    })
}
