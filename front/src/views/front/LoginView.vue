<template lang="pug">
v-container.color
  v-row
    v-col(cols="12")
      h1.text-center 登入
    v-divider
    v-col(cols="12")
      v-form.form(:disabled="isSubmitting" @submit.prevent="submit")
        v-text-field.my-5(label="帳號" clearable variant="outlined" maxlength="20" minlength="4" counter v-model="account.value.value" :error-messages="account.errorMessage.value")
        v-text-field.my-5(label="密碼" clearable variant="outlined" maxlength="20" minlength="4" counter type="password" v-model="password.value.value" :error-messages="password.errorMessage.value")
        div.text-center
          v-btn.login(type="submit") 登入
</template>

<script setup>
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
// useRoute 取路由資訊 useRouter 做跳頁
import { useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/store/user'

const { api } = useApi()

const router = useRouter()
const createSnackbar = useSnackbar()

const user = useUserStore()

// 定義登入表單資料格式
const schema = yup.object({
  // 帳號驗證
  account: yup
    .string()
    .required('必填')
    .min(4, '長度太短')
    .max(20, '長度太長'),
  password: yup
    .string()
    .required('必填')
    .min(4, '長度太短')
    .max(20, '長度太長')

})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const account = useField('account')
const password = useField('password')

const submit = handleSubmit(async (values) => {
  try {
    // 登入之後 把後端的回應 解構出來後
    const { data } = await api.post('/users/login', {
      account: values.account,
      password: values.password
    })
    // 丟進 store 的 login function 裡面
    user.login(data.result)

    createSnackbar({
      text: '登入成功',
      // 不要出現關閉的按鈕
      showCloseButton: false,
      // 要傳進 snackbarProps 元件的參數
      snackbarProps: {
        // 1.5 秒鐘後消失
        timeout: 1500,
        // 顏色
        color: '#8C8987',
        // 出現在螢幕中間
        location: 'center'
      }
    })
    router.push('/')
  } catch (error) {
    console.log(error)
    /*
        error?.response?.data?.message: 这使用了可选链，用于访问可能为 null 或 undefined 的嵌套属性。
        如果 error 对象存在、response 存在、data 存在以及 message 存在，则取得 message 属性的值；否则，整个链的结果为 undefined。
        || '發生錯誤，請稍後再試': 这使用了空值合并运算符，如果前面的表达式结果为 null 或 undefined，
        那么整个表达式的结果就是 '發生錯誤，請稍後再試'，即设置一个默认值。
        综合起来，text 最终的值将是 error 对象中的 message 属性的值，
        如果该属性不存在或为 null/undefined，则为默认的错误信息字符串 '發生錯誤，請稍後再試'。
        这样可以确保在处理可能嵌套的错误对象时，避免因为某个属性为 null 或 undefined 而导致的错误。
      */
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
})

</script>

<style scoped lang="sass">
  .form
    width: 50vw
    margin: auto
  .color
    color: #d9d5d2
  .login
    background: #d9d5d2
    color: #403635
  </style>
