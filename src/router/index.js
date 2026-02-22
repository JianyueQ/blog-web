import {createRouter, createWebHistory} from 'vue-router'
import {getToken, removeToken} from "@/utils/auth.js"
import {ElMessage} from 'element-plus'
import {useUserStore} from "@/stores/user.js";

// 前台页面组件 - 直接导入避免懒加载导致的浏览器加载条
import Home from '@/views/front/Home/index.vue'
import Archive from '@/views/front/Archive/index.vue'
import Gallery from '@/views/front/Gallery/index.vue'
import About from '@/views/front/About/index.vue'
import More from '@/views/front/More/index.vue'
import Message from '@/views/front/Message/index.vue'
import Links from '@/views/front/Links/index.vue'

// 后台页面组件 - 直接导入避免懒加载导致的浏览器加载条
import BackstageHome from '@/views/backstage/Home/index.vue'
import BackstageArticle from '@/views/backstage/Article/index.vue'
import BackstageCategory from '@/views/backstage/Category/index.vue'
import BackstageTag from '@/views/backstage/Tag/index.vue'
import BackstageGallery from '@/views/backstage/Gallery/index.vue'
import BackstageUpload from '@/views/backstage/Upload/index.vue'
import BackstageComment from '@/views/backstage/Comment/index.vue'
import BackstageLinks from '@/views/backstage/Links/index.vue'
import BackstageUser from '@/views/backstage/User/index.vue'
import BackstageProfile from '@/views/backstage/User/Profile/index.vue'
import BackstageConfig from '@/views/backstage/Config/index.vue'
import BackstageOperlog from '@/views/backstage/Monitor/OperLog/index.vue'
import BackstageAccesslog from '@/views/backstage/Monitor/AccessLog/index.vue'
import BackstageServer from '@/views/backstage/Monitor/ServerMonitor/index.vue'
import BackstageOnline from '@/views/backstage/Monitor/OnlineUser/index.vue'
import BackstageVisitorRecord from '@/views/backstage/Visitor/Record/index.vue'
import BackstageVisitorBlacklist from '@/views/backstage/Visitor/Blacklist/index.vue'
import BackstageGuestbook from '@/views/backstage/Guestbook/index.vue'

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
                    component: Home,
                    meta: { keepAlive: true }
                },
                {
                    path: 'archive',
                    name: 'archive',
                    component: Archive,
                    meta: { keepAlive: false }
                },
                {
                    path: 'links',
                    name: 'links',
                    component: Links,
                    meta: { keepAlive: true }
                },
                {
                    path: 'gallery',
                    name: 'gallery',
                    component: Gallery,
                    meta: { keepAlive: false }
                },
                {
                    path: 'about',
                    name: 'about',
                    component: About,
                    meta: { keepAlive: true }
                },
                {
                    path: 'message',
                    name: 'message',
                    component: Message,
                    meta: { keepAlive: false }
                },
                {
                    path: 'more',
                    name: 'more',
                    component: More,
                    meta: { keepAlive: true }
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
                    component: BackstageHome,
                    meta: { title: '首页' }
                },
                {
                    path: 'article',
                    name: 'backstageArticle',
                    component: BackstageArticle,
                    meta: { title: '文章管理' }
                },
                {
                    path: 'category',
                    name: 'backstageCategory',
                    component: BackstageCategory,
                    meta: { title: '分类管理' }
                },
                {
                    path: 'tag',
                    name: 'tag',
                    component: BackstageTag,
                    meta: { title: '标签管理' }
                },
                {
                    path: 'gallery',
                    name: 'backstageGallery',
                    component: BackstageGallery,
                    meta: { title: '图库管理' }
                },
                {
                    path: 'upload',
                    name: 'backstageUpload',
                    component: BackstageUpload,
                    meta: { title: '文件上传' }
                },
                {
                    path: 'comment',
                    name: 'backstageComment',
                    component: BackstageComment,
                    meta: { title: '评论管理' }
                },
                {
                    path: 'links',
                    name: 'backstageLinks',
                    component: BackstageLinks,
                    meta: { title: '友链管理' }
                },
                {
                    path: 'user',
                    name: 'backstageUser',
                    component: BackstageUser,
                    meta: { title: '用户管理' }
                },
                {
                    path: 'profile',
                    name: 'backstageProfile',
                    component: BackstageProfile,
                    meta: { title: '个人中心' }
                },
                {
                    path: 'config',
                    name: 'backstageConfig',
                    component: BackstageConfig,
                    meta: { title: '系统配置' }
                },
                // 监控管理路由
                {
                    path: 'operlog',
                    name: 'backstageOperlog',
                    component: BackstageOperlog,
                    meta: { title: '操作日志' }
                },
                {
                    path: 'accesslog',
                    name: 'backstageAccesslog',
                    component: BackstageAccesslog,
                    meta: { title: '系统访问记录' }
                },
                {
                    path: 'server',
                    name: 'backstageServer',
                    component: BackstageServer,
                    meta: { title: '服务器监控' }
                },
                {
                    path: 'online',
                    name: 'backstageOnline',
                    component: BackstageOnline,
                    meta: { title: '在线用户' }
                },
                // 访客管理路由
                {
                    path: 'visitor/record',
                    name: 'backstageVisitorRecord',
                    component: BackstageVisitorRecord,
                    meta: { title: '访客记录' }
                },
                {
                    path: 'visitor/blacklist',
                    name: 'backstageVisitorBlacklist',
                    component: BackstageVisitorBlacklist,
                    meta: { title: '访客黑名单' }
                },
                {
                    path: 'guestbook',
                    name: 'backstageGuestbook',
                    component: BackstageGuestbook,
                    meta: { title: '留言板管理' }
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

        // 获取用户信息
        const userStore = useUserStore()
        if (userStore.user === null) {
            userStore.getInfo().then(() => {
                next()
            }).catch((err) => {
                // 优化错误处理逻辑
                if (err && err.code === 401) {
                    // 当返回 401 错误时，由 request.js 统一弹出 MessageBox 提醒
                    // 这里中止本次路由跳转，等待用户在弹窗中点击“确定”后再跳转
                    next(false)
                } else {
                    // 对于 500 等其他服务器异常，已经在 request.js 中弹出错误消息
                    // 这里我们中止导航，防止用户被错误地引导至登录页
                    if (!from.name) {
                        next({ path: '/home' })
                    } else {
                        next(false)
                    }
                }
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
