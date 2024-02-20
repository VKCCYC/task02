// Utilities
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { apiAuth } = useApi()

  // setup 寫法
  // 用來保存使用者資訊
  // 這裡會是後端傳過來的資料
  const token = ref('')
  const account = ref('')
  const email = ref('')
  const cart = ref(0)
  const role = ref(UserRole.USER)

  const login = (data) => {
    if (data.token) {
      token.value = data.token
    }
    account.value = data.account
    email.value = data.email
    cart.value = data.cart
    role.value = data.role
  }

  // 當登入後做的判斷
  const isLogin = computed(() => {
    // 當 token 長度 > 0
    return token.value.length > 0
  })

  const isAdmin = computed(() => {
    // 是不是管理員
    return role.value === UserRole.ADMIN
  })

  const getProfile = async () => {
    if (token.value.length === 0) return
    try {
      const { data } = await apiAuth.get('/users/me')
      login(data.result)
    } catch (error) {
      console.log(error)
      logout()
    }
  }

  const logout = () => {
    token.value = ''
    account.value = ''
    email.value = ''
    cart.value = 0
    role.value = UserRole.USER
  }

  return {
    token,
    account,
    email,
    cart,
    role,
    login,
    logout,
    isLogin,
    isAdmin,
    getProfile
  }
}, {
  // 這邊寫 store 的設定
  persist: {
    // 這是 loca 的 key 的名字
    key: '20240122',
    paths: ['token']
  }
})
