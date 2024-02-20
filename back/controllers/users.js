import { StatusCodes } from 'http-status-codes'
import users from '../models/users.js'
import jwt from 'jsonwebtoken'

export const create = async (req, res) => {
  try {
    await users.create(req.body)
    res.status(200).json({
      // 不用特別傳訊息回給前端
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const login = async (req, res) => {
  try {
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    // 把新的 token 放進 user 的 token 裡面
    req.user.tokens.push(token)
    // 然後保存
    await req.user.save()
    // 把前端需要的東西全部回去
    // 當成功時
    res.status(200).json({
      success: true,
      message: '',
      // 當你前端登入的時候你會需要哪些資料，全部回回去
      result: {
        token,
        account: req.user.account,
        email: req.user.email,
        // 一定需要使用者角色 管理者或是會員
        role: req.user.role,
        // 購物車數量加總
        cart: req.user.cart.reduce((total, current) => {
          return total + current.quantity
        }, 0)
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: '未知錯誤c-user'
    })
  }
}

export const logout = async (req, res) => {
  try {
    // 将请求对象（req）的tokens属性更新为从用户对象（req.user）的tokens属性中过滤掉与req.token不相等的所有元素。
    req.tokens = req.user.tokens.filter(token => token !== req.token)
    await req.user.save()
    res.status(200).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 舊換新
export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => token === req.token)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7days' })
    req.user.tokens[idx] = token
    await req.user.save()
    res.status(200).json({
      success: true,
      message: '',
      result: token
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 我們前端不會保存她個人資料，只會保存 JWT 而已
// jwt 存在 pinia 裡面
// 所以我們要寫個簡單的 controller(控制器) 叫 getProfile
// 直接把他的個人資訊回傳回去
/*
  1. 登入回什麼我們就取到什麼
  2. 登入之後我們再回到網頁的時候
  3. 我們用它 pinia 裡面的 jwt 去發請求去得到他的 帳號、信箱、管理員權限...資訊
*/
export const getProfile = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: '',
      // 當你前端登入的時候你會需要哪些資料，全部回回去
      result: {
        account: req.user.account,
        email: req.user.email,
        // 一定需要使用者角色 管理者或是會員
        role: req.user.role,
        // 購物車數量加總(.cartQuantity => models.user 裡面 mongo 的虛擬欄位)
        cart: req.user.cartQuantity

      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: '未知錯誤'
    })
  }
}
