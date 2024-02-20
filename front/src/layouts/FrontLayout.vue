<template lang="pug">
v-navigation-drawer.bg-color(v-model="drawer" temporary location="right" v-if="isMobile")
  v-list(nav)
    template(v-for="item in navItems" :key="item.to")
      v-list-item.color(exact :to="item.to"  v-if="item.show")
        template(#prepend)
          v-icon(:icon="item.icon")
        v-list-item-title {{ item.text }}
  template(v-slot:append)
    div.pa-2
      v-btn.logout-bg-color.logout-color(block v-if="user.isLogin" @click="logout") 登出
v-app-bar(:elevation="24" color="#403635")
  template(v-slot:prepend)
    v-btn(to="/" :active="false")
      v-icon.color mdi-hand-okay
      v-app-bar-title.color() 出來喬
  template(v-if="isMobile")
    v-app-bar-nav-icon.color(@click="drawer = true")
  template(v-else)
    template( v-for="item in navItems" :key="item.to" )
      v-btn.color(exact :to="item.to" :icon="item.icon" v-if="item.show")
    v-btn(icon="mdi-logout" v-if="user.isLogin" @click="logout")
//- 頁面內容
v-main
  router-view

</template>

<script setup>
import { useDisplay } from 'vuetify'
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

const { apiAuth } = useApi()

const router = useRouter()

const createSnackbar = useSnackbar()

const user = useUserStore()

// 手機版判斷
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

// 手機版判斷
const drawer = ref(false)

// 用 computed 包起來是用來做動態判斷
// 判斷是否為登入狀態
const navItems = computed(() => {
  return [
    { to: '/', icon: 'mdi-home', text: '首頁', show: !user.isLogin || user.isLogin },
    { to: '/register', icon: 'mdi-account-plus', text: '註冊', show: !user.isLogin },
    { to: '/login', icon: 'mdi-login', text: '登入', show: !user.isLogin },
    { to: '/cart', icon: 'mdi-cart', text: '購物車', show: user.isLogin },
    { to: '/order', icon: 'mdi-list-box-outline', text: '訂單', show: user.isLogin },
    { to: '/admin', icon: 'mdi-account-cog', text: '管理者', show: user.isLogin && user.isAdmin }
  ]
})

const logout = async () => {
  try {
    await apiAuth.delete('/users/logout')
    user.logout()
    createSnackbar({
      text: '登出成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 1000,
        color: '#8C8987',
        location: 'center'
      }
    })
    router.push('/')
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      // 不要出現關閉的按鈕
      showCloseButton: false,
      // 要傳進 snackbarProps 元件的參數
      snackbarProps: {
        // 1.5 秒鐘後消失
        timeout: 1500,
        // 顏色
        color: 'error',
        // 出現在螢幕中間
        location: 'center'
      }

    })
  }
}

</script>

<style scoped lang="sass" >
.color
  color: #d9d5d2
.bg-color
  background:#403635
.logout-bg-color
  background: #d9d5d2
.logout-color
  color: #403635
</style>
