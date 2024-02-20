// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/front/HomeView.vue'),
        meta: {
          title: '出來喬',
          // 用 login 來當登入判斷說 是否能觀看
          login: false,
          // 用 admin 來當管理員判斷說 是否能觀看
          admin: false
        }
      }, {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/front/RegisterView.vue'),
        meta: {
          title: '出來喬 | 註冊',
          login: false,
          admin: false
        }
      }, {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/front/LoginView.vue'),
        meta: {
          title: '出來喬 | 登入',
          login: false,
          admin: false
        }
      }
    ]
  }, {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: () => import('@/views/admin/HomeView.vue'),
        meta: {
          title: '出來喬 | 管理',
          login: true,
          admin: true
        }
      },
      {
        path: 'reservation',
        name: 'AdminReservation',
        component: () => import('@/views/admin/ReservationView.vue'),
        meta: {
          title: '管理員 | 今日預約',
          login: true,
          admin: true
        }
      },
      {
        path: 'worker',
        name: 'Worker',
        component: () => import('@/views/admin/WorkerView.vue'),
        meta: {
          title: '管理員 | 師傅管理',
          login: true,
          admin: true
        }
      },
      {
        path: 'data',
        name: '`AdminData',
        component: () => import('@/views/admin/DataView.vue'),
        meta: {
          title: '管理員 | 觀看數據',
          login: true,
          admin: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

router.afterEach((to, from) => {
  document.title = to.meta.title
})

// 進去每一頁之前
router.beforeEach(async (to, from, next) => {
// 取當下登入狀態
  const user = useUserStore()

  // 如果我們的來源是 START_LOCATION
  if (from === START_LOCATION) {
    await user.getProfile()
  }

  // 如果我們是登入狀態時 要進入註冊或是登入 重新導向到首頁
  // to.path 表示即將前往的路徑
  if (user.isLogin && ['/register', '/login'].includes(to.path)) next('/')
  // 如果要進去的頁面要登入，但是沒登入，重新導向登入頁
  else if (to.meta.login && !user.isLogin) next('/login')
  // 如果要進去的頁面要管理員，但是不是管理員，重新導向首頁
  else if (to.meta.admin && !user.isAdmin) next('/')
  // 不重新導向
  else next()
})

export default router
