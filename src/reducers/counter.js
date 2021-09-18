import { ADD, MINUS, SET_USER, CODE } from '../constants/counter'
import Taro from '@tarojs/taro'

const INITIAL_STATE = {
  userInfo: null,
  headerHeight: 0,
  statusBarHeight: 0,
  code: "",
  tenantId: "66024",
  channelId: "19",
  sessionKey: "",
  userId:"",
  easemobWs:  "wss://kefu.easemob.com/v1/trtc/xcx/ws",
  textroomId:0,
  // 访客信息
  // ！注意：驼峰改用下划线连接，user_nickname必传
  visitor:{
      true_name: '环信',
      qq: 'hx@qq.com',
      phone: '13012345678',
      company_name: 'easemob',
      user_nickname: '环信昵称',
      description: "这里是环信的描述",
      email: '123456@qq.com', 
      tags:[  
        'vip1',
        'vip2'
      ]
  }
}

let getLogin = () => {
    const { model, system, statusBarHeight } = Taro.getSystemInfoSync()
    let headHeight
    if (/iphone\s{0,}x/i.test(model)) {
      headHeight = 88
    } else if (system.indexOf('Android') !== -1) {
      headHeight = 68
    } else {
      headHeight = 64
    }
    INITIAL_STATE.headerHeight = headHeight;
    INITIAL_STATE.statusBarHeight = statusBarHeight;

    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    Taro.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        Object.assign(INITIAL_STATE, {code: res.code})
        loginhx()
      }
    })
  }

  let loginhx = () => {
    const accountInfo = Taro.getAccountInfoSync();
    let data = {
      appId: accountInfo.miniProgram.appId,
      code: INITIAL_STATE.code
    }

    let url = `https://kefu.easemob.com/v1/trtc/tenants/${INITIAL_STATE.tenantId}/xcx/login`
    Taro.request({
        url: url,
        method: "POST",
        data: JSON.stringify(data),
        success: res => {
          console.log('init ok', res, JSON.stringify(data))
          let entity = res.data.entity;
          INITIAL_STATE.sessionKey = entity.sessionKey
          INITIAL_STATE.userId = entity.openId.substring(0, 18)
        },
      fail: err => {
        console.error(err)
      }
    })
  }

  getLogin()


export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_USER:
       return {
         ...state,
         userInfo: action.info
       }
      case 'CODE':
        return {
          ...state,
          code: action.code
        }
      case 'SET_DATA':
        return {
          ...state,
          ...action.data
        }
     default:
       return state
  }
}


