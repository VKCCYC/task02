<template lang="pug">
VCard.card
  RouterLink.color.text-decoration-none(:to="'/products/' +_id") 
    VImg(:src="image[0]" height="200")
  VCardTitle
    RouterLink.color.text-decoration-none(:to="'/products/' +_id") {{ name }}
  VCardSubtitle 一小時 ${{ price }}
  //- (style="white-space: pre;") 加這個才能正常顯示後端設定的換行符號
  VCardText(style="white-space: pre;") {{ description }}
  VCardActions
    VBtn(color="#5FA5AE" prepend-icon="mdi-clock-time-three-outline" @click="addCart") 選擇時段
</template>

<script setup>
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/store/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// defineProps 這個元件有哪些可以接收的資料
const props = defineProps(['_id', 'category', 'description', 'image', 'name', 'price', 'sell'])

const addCart = async () => {
  if (!user.isLogin) {
    router.push('/login')
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product: props._id,
      quantity: 1
    })
    user.cart = data.result
    createSnackbar({
      text: '新增成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
}
</script>

<style scoped lang="sass">
.color
  color: #36E8FF
.card
  background: #595552
  color: #D9D5D2

</style>
