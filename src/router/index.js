import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ==================== 前台路由 ====================
    {
      path: '/',
      component: () => import('@/layouts/FrontLayout.vue'),
      children: [
        {
          path: '',
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
          path: 'more',
          name: 'more',
          component: () => import('@/views/front/More/index.vue')
        }
      ]
    },

    // ==================== 后台路由 ====================
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')

  // 需要登录的页面
  // if (to.meta.requiresAuth && !token) {
  //   next('/backstage/login')
  //   return
  // }

  // 已登录用户不能访问登录页
  // if (to.meta.requiresGuest && token) {
  //   next('/backstage/dashboard')
  //   return
  // }

  next()
})

export default router
