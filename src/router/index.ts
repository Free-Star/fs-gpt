import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import ChatView from '@/views/ChatView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { requiresAuth: false }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查本地存储的登录状态
  authStore.checkAuth()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录,重定向到登录页
    next({ 
      name: 'login',
      query: { redirect: to.fullPath } // 保存原始目标路径
    })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // 已登录但访问登录页,重定向到首页
    next({ name: 'chat' })
  } else {
    next()
  }
})

export default router 