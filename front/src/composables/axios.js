import axios from 'axios'
import { useUserStore } from '@/store/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API
})

// 跟驗證相關的請求
const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API
})

// 01/08 02:49
// 攔截器
// 送出去前，加點料
// function 有一個參數 config 這次請求的設定
// config 我的目標是哪裡，我的請求方式 是 get 或是什麼；請求的內容有哪些
apiAuth.interceptors.request.use(config => {
  const user = useUserStore()
  // 每次送請求的時候
  // 這是請求設定 hander 的驗證
  // 加上 JWT 的 token
  config.headers.Authorization = 'Bearer ' + user.token
  return config
})

/*
  1. 呼叫 axios.get / axios.post 時
  2. interceptors.request 請求攔截器
  3. 送出請求
  4. interceptors.response 回應攔截器
  5. 呼叫的地方的 .then() .catch()
*/

// apiAuth.interceptors.response(成功時執行， 失敗時執行)
apiAuth.interceptors.response.use((res) => {
  // 成功時直接回傳，原本是什麼就回傳什麼
  return res
}, (error) => {
  // 如果失敗有收到回應
  if (error.response) {
    // 如果是 jwt 過期，且不是舊換新請求
    if (error.response.data.message === 'JWT 過期' && error.config.url !== '/users/extend') {
      console.log('111')
      const user = useUserStore()
      // 傳送舊換新請求
      return apiAuth.patch('/users/extend')
      // 更新 pinia 保存的 token
        .then(({ data }) => {
          user.token = data.result
          // 修改發生錯誤的原請求設定的 jwt
          error.config.headers.Authorization = 'Bearer ' + user.token
          // 重新傳送原請求
          return axios(error.config)
        })
        .catch(() => {
          // 如果舊換新失敗，登出
          user.logout()
          // 回傳原錯誤到呼叫的地方
          return Promise.reject(error)
        })
    }
  }
  // 如果請求沒回應，或不是過期的錯誤，回傳原錯誤到呼叫的地方
  return Promise.reject(error)
})

export const useApi = () => {
  return { api, apiAuth }
}
