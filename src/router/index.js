import {createRouter, createWebHistory} from 'vue-router'
import {getToken} from "@/utils/auth.js"
import {ElMessage} from 'element-plus'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // ==================== 前台路由 ====================
        {
            path: '/',
            component: () => import('@/layouts/FrontLayout.vue'),
            redirect: '/home',
            children: [
                {
                    path: 'home',
                    name: 'home',
                    component: () => import('@/views/front/Home/index.vue')
                },
                {
                    path: 'archive',
                    name: 'archive',
                    component: () => import('@/views/front/Archive/index.vue')
                },
                {
                    path: 'links',
                    name: 'links',
                    component: () => import('@/views/front/Links/index.vue')
                },
                {
                    path: 'gallery',
                    name: 'gallery',
                    component: () => import('@/views/front/Gallery/index.vue')
                },
                {
                    path: 'about',
                    name: 'about',
                    component: () => import('@/views/front/About/index.vue')
                },
                {
                    path: 'message',
                    name: 'message',
                    component: () => import('@/views/front/Message/index.vue')
                },
                {
                    path: 'more',
                    name: 'more',
                    component: () => import('@/views/front/More/index.vue')
                }
            ]
        },
        {
            path: '/backstage/login',
            name: 'login',
            component: () => import('@/views/backstage/Login.vue')
        },
        // ==================== 后台路由 ====================
        {
            path: '/backstage',
            component: () => import('@/layouts/BackstageLayout.vue'),
            redirect: '/backstage/home',
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'home',
                    name: 'backstageHome',
                    component: () => import('@/views/backstage/Home/index.vue'),
                    meta: { title: '首页' }
                },
                {
                    path: 'article',
                    name: 'backstageArticle',
                    component: () => import('@/views/backstage/Article/index.vue'),
                    meta: { title: '文章管理' }
                },
                {
                    path: 'category',
                    name: 'backstageCategory',
                    component: () => import('@/views/backstage/Category/index.vue'),
                    meta: { title: '分类管理' }
                },
                {
                    path: 'tag',
                    name: 'tag',
                    component: () => import('@/views/backstage/Tag/index.vue'),
                    meta: { title: '标签管理' }
                },
                {
                    path: 'gallery',
                    name: 'backstageGallery',
                    component: () => import('@/views/backstage/Gallery/index.vue'),
                    meta: { title: '图库管理' }
                },
                {
                    path: 'upload',
                    name: 'backstageUpload',
                    component: () => import('@/views/backstage/Upload/index.vue'),
                    meta: { title: '文件上传' }
                },
                {
                    path: 'comment',
                    name: 'backstageComment',
                    component: () => import('@/views/backstage/Comment/index.vue'),
                    meta: { title: '评论管理' }
                },
                {
                    path: 'links',
                    name: 'backstageLinks',
                    component: () => import('@/views/backstage/Links/index.vue'),
                    meta: { title: '友链管理' }
                },
                {
                    path: 'user',
                    name: 'backstageUser',
                    component: () => import('@/views/backstage/User/index.vue'),
                    meta: { title: '用户管理' }
                },
                {
                    path: 'config',
                    name: 'backstageConfig',
                    component: () => import('@/views/backstage/Config/index.vue'),
                    meta: { title: '系统配置' }
                }
            ]
        },
        // 最后添加 404 页面路由
        {
            path: '/:pathMatch(.*)*',
            meta: {title: '404'},
            component: () => import('@/components/error/404.vue')
        }


    ]
})

/**
 * 路由守卫
 *
 * @description 全局前置守卫，用于控制路由访问权限
 * - 前台路由：无需登录，任何人都可以访问
 * - 后台路由：需要登录验证，未登录自动跳转到登录页
 * - 登录页：已登录状态下访问会自动跳转到后台首页
 */
router.beforeEach((to, from, next) => {
    const token = getToken()
    const isBackstageRoute = to.path.startsWith('/backstage')
    const isLoginPage = to.path === '/backstage/login'

    // 设置页面标题
    // if (to.meta.title) {
    //     document.title = to.meta.title + ' - 博客'
    // }

    // 判断是否是后台路由（排除登录页）
    if (isBackstageRoute && !isLoginPage) {
        // 需要验证 token
        if (!token) {
            // 未登录，提示并跳转到登录页
            ElMessage.warning('请先登录')
            next({
                path: '/backstage/login',
                query: { redirect: to.fullPath } // 保存目标路由，登录后可跳转回来
            })
            return
        }
        // 已登录，允许访问
        next()
    } else if (isLoginPage) {
        // 如果已登录，访问登录页时自动跳转到后台首页
        if (token) {
            // 如果有重定向参数，则跳转到重定向页面
            const redirect = to.query.redirect
            if (redirect && redirect.startsWith('/backstage')) {
                next({ path: redirect })
            } else {
                next({ path: '/backstage/home' })
            }
            return
        }
        // 未登录，允许访问登录页
        next()
    } else {
        // 前台路由，直接放行
        next()
    }
})

export default router
