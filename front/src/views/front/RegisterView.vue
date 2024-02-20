<template lang="pug">
v-container.color
  v-row
    v-col(cols="12")
      h1.text-center 註冊
    v-divider
    v-col(cols="12")
      v-form.form(:disabled="isSubmitting" @submit.prevent="submit")
        v-text-field.my-5(label="帳號" clearable variant="outlined" maxlength="20" minlength="4" counter v-model="account.value.value" :error-messages="account.errorMessage.value")
        v-text-field.my-5(label="信箱" clearable variant="outlined" type="email" v-model="email.value.value" :error-messages="email.errorMessage.value")
        v-text-field.my-5(label="密碼" clearable variant="outlined" maxlength="20" minlength="4" counter type="password" v-model="password.value.value" :error-messages="password.errorMessage.value")
        v-text-field.my-5(label="確認密碼" clearable variant="outlined" maxlength="20" minlength="4" counter type="password" v-model="passwordConfirm.value.value" :error-messages="passwordConfirm.errorMessage.value")
        //- 設定不了 沒勾選跳錯誤
        v-checkbox(color="#bfb9b8" label="打勾才能註冊 !" v-model="terms.value.value" :error-messages="terms.errorMessage.value")
        div.text-center
          v-btn.login(type="submit") 註冊
</template>

<script setup>
// import { ref } from 'vue'
import validator from 'validator'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
// useRoute 取路由資訊 useRouter 做跳頁
import { useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

const { api } = useApi()

const router = useRouter()
const createSnackbar = useSnackbar()

// 定義註冊表單資料格式
const schema = yup.object({
  // 帳號驗證
  account: yup
    .string()
    .required('必填')
    .min(4, '長度太短')
    .max(20, '長度太長'),
  email: yup
    .string()
    .required('必填')
    // test(自訂驗證名稱, 錯誤訊息, 驗證 function)
    .test(
      'isEmail', '信箱格式錯誤',
      (value) => {
        return validator.isEmail(value)
      }
      /*
      這是實際的測試函數。在這裡，它使用了 validator.isEmail 函數（可能是 Validator.js 函數），並傳遞了要驗證的值 value。
      如果 validator.isEmail(value) 返回 true，則測試通過，否則返回 false，表示測試失敗。
      總的來說，這段代碼的作用是確保某個值符合電子郵件的格式，如果不符合，則顯示 '信箱格式錯誤' 作為錯誤消息。
      */
    ),
  password: yup
    .string()
    .required('必填')
    .min(4, '長度太短')
    .max(20, '長度太長'),
  passwordConfirm: yup
    .string()
    .required('必填')
    .min(4, '長度太短')
    .max(20, '長度太長')
    // .oneOf 只允許符合陣列內其中一個值
    // .oneOf(陣列, 錯誤訊息)
    // .ref('password') 代表這個 schema 的 password 欄位值
    .oneOf([yup.ref('password')], '密碼不一致'),
  terms: yup
    .bool()
    // .nullable(false)
    .oneOf([true], '必選')
    .required('必選')

})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const account = useField('account')
const email = useField('email')
const password = useField('password')
const passwordConfirm = useField('passwordConfirm')
// 打勾
const terms = useField('terms')

const submit = handleSubmit(async (values) => {
  try {
    await api.post('/users', {
      account: values.account,
      email: values.email,
      password: values.password
    })

    createSnackbar({
      text: '註冊成功',
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
