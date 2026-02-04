import request from '@/utils/request'

let apiPrefix = '/system/config'

export function getAboutMeContent() {
    return request({
        url: `${apiPrefix}/aboutMe`,
        method: 'get'
    })
}

export function updateAboutMeContent(aboutMeId, aboutMeContent) {
    const data = {
        aboutMeId,
        aboutMeContent
    }
    return request({
        url: `${apiPrefix}/aboutMe`,
        method: 'put',
        data
    })
}
