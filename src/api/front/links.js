import request from '@/utils/request'

// 获取社交链接
export function getSocialLinks() {
    return request({
        url: '/front/socialLinks',
        method: 'get'
    })
}

// 获取站点配置
export function getSiteConfig() {
    return request({
        url: '/front/SiteConfig',
        method: 'get'
    })
}

