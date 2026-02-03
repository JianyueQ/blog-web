import request from '@/utils/request'

let apiPrefix = '/system/config'

export function getSocialLink(){
    return request({
        url: `${apiPrefix}/social`,
        method: 'get'
    })
}

export function updateSocial(data){
    return request({
        url: `${apiPrefix}/social`,
        method: 'put',
        data: data
    })
}

export function addSocial(data){
    return request({
        url: `${apiPrefix}/social`,
        method: 'post',
        data: data
    })
}

//DELETE /system/config/social/{id}
export function deleteSocial(id){
    return request({
        url: `${apiPrefix}/social/${id}`,
        method: 'delete'
    })
}

//PUT /system/config/social/status
export function updateSocialStatus(data){
    return request({
        url: `${apiPrefix}/social/status`,
        method: 'put',
        data: data
    })
}

