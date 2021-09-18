import { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Text, Image, Block } from '@tarojs/components'
import Utils from '../../assets/utils'

import { setUser } from '../../actions/counter'

import './index.scss'

@connect(({ store }) => ({
  store
}), (dispatch) => ({
  setUser(info) {
    dispatch(setUser(info))
  }
}))
class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      motto: 'Hello World',
      hasUserInfo: this.props.store.userInfo ? true : false,
        userInfo: this.props.store.userInfo || {},
      canIUse: Taro.canIUse('button.open-type.getUserInfo'),
      canIUseGetUserProfile: false,

      timer: "",
      socketOpen: false,
      socketMsgQueue: [],
      sessionKey: "",
      roomId:"",
      sdkAppID:"",
      userSign:"",
      userID: '',
      // 
      mynickName: "环环" + Math.floor(Math.random() * 100),
      redirectFlag: true,
      flag: false
    }
  }
  onLoad() {
    if (Taro.getUserProfile) {
      this.setState({
        canIUseGetUserProfile: true
      })
    }
  }
 
  handleImg() {
    console.log('查看启动日志')
  }
  getUserProfile = () => {
    Taro.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.props.setUser(res.userInfo)

        this.setState({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  }
  getUserInfo = (e) => {
    Taro.getUserInfo({
      success: res => {
        this.setState({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  }
  bindVideo = () => {
    if (!this.state.userInfo.nickName) {
      Taro.showToast({
        title: '缺少用户昵称',
        icon: 'none'
      })
      
      return
    }
    this.setState({
      flag: false
    })

    Taro.navigateTo({
      url: '/pages/load/index'
    })

    // Taro.showLoading({
    //   title: '正在呼叫客服'
    // })
    this.startConnect()
  }
  startConnect = () => {
    this.preWaitWs();
    if (this.state.socketOpen) {
      return false
    }
    this.createWs();
    Taro.onSocketOpen(res => {
      console.log("SocketOpen", res)
      this.heartbeat();
      this.setState({
        socketOpen: true
      })
      // this.sendSocketMessageBa(this.state.socketMsgQueue[0])
      for (let i = 0; i < this.state.socketMsgQueue.length; i++){
        this.sendSocketMessageBa(this.state.socketMsgQueue[i])
      }
      this.setState({
        socketMsgQueue: []
      })
    })
    
    Taro.onSocketError(err => {
      setTimeout(() => {
        this.reconnect()
      }, 2000)
    })

    Taro.onSocketClose(res => {
      this.setState({
        socketOpen: false,
        flag: false
      })
      console.log('WebSocket 已关闭！')
      // 重连ws
      this.createWs();
    })

    Taro.onSocketMessage(res => {
      let dat = JSON.parse(res.data) || {};
      let data = dat.body;


      let pages = Taro.getCurrentPages(); // 获取当前页面栈。数组中第一个元素为首页，最后一个元素为当前页面。
      let currPage = pages[pages.length - 1];
      let route = currPage.route;
      // 不走第三页面
      if(route != "pages/load/index") {
        return false
      }
      if(data.type === "RoomInfo"){
        this.setState({
          roomId: data.roomId,
          sdkAppID: data.sdkAppId,
          userSign: data.userSign,
          userID: this.props.store.userId
        }, () => {
          // Taro.hideLoading(); // 隐藏提示框
          this.startVideo();
        })
      }
      // 会话被关闭
      else if(data.type === "SessionInfo"){
        Taro.showToast({
          title: '客服忙线中，请稍后再咨询',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          Taro.hideToast()

          Taro.navigateBack({
            delta: 1,
          })
          // 还原默认状态
          this.setState({
            flag: false
          })
        },2000)
      }
      else{

      }
    })
  }
  startVideo = () => {
    if(this.state.flag){
      return false
    }
    else{
      this.setState({
        flag: true
      })
    }
    let trtcConfig = {
      sdkAppID: this.state.sdkAppID,  // 开通实时音视频服务创建应用后分配的 SDKAppID
      userID: this.state.userID, // 用户 ID，可以由您的帐号系统指定
      userSig: this.state.userSign, // 身份签名，相当于登录密码的作用
      template: '1v1',        // 画面排版模式
    }
  
    const url = `/pages/room/index?roomID=${this.state.roomId}&template=${trtcConfig.template}&userID=${trtcConfig.userID}&userSig=${trtcConfig.userSig}&sdkAppID=${trtcConfig.sdkAppID}`

    Taro.navigateTo({ url: url })
   
  }
  reconnect = () => {
    this.startConnect()
  }
  heartbeat = () => {
    let data = {
      id: Utils.wxuuid(),
      tenantId: this.props.store.tenantId,
      channelId: this.props.store.channelId,
      from: this.state.userInfo.nickName,
      body: {
        type: "Ping"
      }
    }
    if(this.state.timer){
      clearInterval(timer)
    }
    let timer = setInterval(() => {
      Taro.sendSocketMessage({
        data: JSON.stringify(data)
      })
    }, 25000)

    this.setState({
      timer: timer
    })
  }
  preWaitWs = () => {
    let data = {
      id: Utils.wxuuid(),
      tenantId: this.props.store.tenantId,
      channelId: this.props.store.channelId,
      from: this.state.userInfo.nickName,
      body: {
        type: "Invite",
      },
      ext:{
        visitor: this.props.store.visitor || ""
      }
    }


    this.sendSocketMessageBa(JSON.stringify(data));
  }
  sendSocketMessageBa = (msg) => {
    if (this.state.socketOpen) {
      Taro.sendSocketMessage({
        data: msg,
        success: () => {
          console.log('发送成功')
        },
        fail: (msg) => {
          console.error(msg)
        }
      })
    } else {
      let socketMsgQueue = this.state.socketMsgQueue
      socketMsgQueue.push(msg)
      this.setState({
        socketMsgQueue
      })
    }
  }
  createWs = () => {
    Taro.connectSocket({
      url: this.props.store.easemobWs,
      header: {
        Cookie: `session_id=${this.props.store.sessionKey}`
      },
      success: () => {
        console.log('websocket连接成功')
      },
      fail: () => {
        console.log('websocket连接失败')
      }
    })
  }
  render () {
    return (
      <View className='video'>
        <View className='userinfo'>
          {
            this.state.hasUserInfo ? (
              <Block>
                <Image
                className='userinfo-avatar'
                src={this.state.userInfo.avatarUrl}
                mode='scaleToFill'
                onClick={this.handleImg}
                />
                <Text className="userinfo-nickname">{this.state.userInfo.nickName}</Text>
            </Block>
            ) : <Block>
                {
                  this.state.canIUseGetUserProfile ? <Button className="get-info" onClick={this.getUserProfile}>获取头像昵称</Button> : <Button className="get-info" onClick={this.getUserInfo} openType="getUserInfo">获取头像昵称</Button>
                }
              </Block>
          }
        </View>
        <Button className="contact-kefu" onClick={this.bindVideo}>视频客服</Button>
      </View>
    )
  }
}

export default Index

