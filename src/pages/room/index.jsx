import { Component } from 'react'
import { View } from '@tarojs/components'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { connect } from 'react-redux'
import { setData } from '../../actions/counter'

import './index.scss'

@connect(({ store }) => ({
  store
}), (dispatch) => ({
  setData(info) {
    dispatch(setData(info))
  }
}))
class Index extends Component {
    constructor(props) {
        super(props)

        this.state = {
            roomID: 0, // 房间号
            userList: [], 
            headerHeight: this.props.store.headerHeight,
            statusBarHeight: this.props.store.statusBarHeight,
            frontCamera: "front", // 设置前置还是后置摄像头，可选值：front 或 back。
            trtcConfig: {
                sdkAppID: '', // 必要参数 开通实时音视频服务创建应用后分配的 sdkAppID
                userID: '', // 必要参数 用户 ID 可以由您的帐号系统指定
                userSig: '', // 必要参数 身份签名，相当于登录密码的作用
                template: '', // 必要参数 组件模版，支持的值 1v1 grid custom ，注意：不支持动态修改, iOS 不支持 pusher 动态渲染
                beautyLevel: 9, // 美颜，取值范围 0-9，0表示关闭。
                localVideo: true,
                localAudio: true,
                enableCamera: true,
                enableMic: true,
            },
        }
    }
    trtcComponent = null

    onLoad(options) {
      const { page } = getCurrentInstance()
        this.setState({
            roomID: parseInt(options.roomID),
            trtcConfig:{
                sdkAppID: options.sdkAppID,  // 开通实时音视频服务创建应用后分配的 SDKAppID
                userID: options.userID, // 用户 ID，可以由您的帐号系统指定
                userSig: options.userSig, // 身份签名，相当于登录密码的作用
                template: options.template,        // 画面排版模式
            }
           })

        // // 获取 rtcroom 实例
        setTimeout(() => {
          this.trtcComponent = page.selectComponent('#trtcroom'); 
           // this.trtcComponent = page.select('#trtcroom')
          // 监听TRTC Room 关键事件
          this.bindTRTCRoomEvent();
          // 进入房间
          this.enterRoom();
        }, 1000)
       
    }
    enterRoom = () => {
        const roomID = this.state.roomID;
        // 进入房间
        this.trtcComponent.enterRoom({roomID: roomID})
        .catch((res)=>{
            console.error('room joinRoom 进房失败:', res)
        })
    }
    bindTRTCRoomEvent = () => {
        let EVENT = this.trtcComponent.EVENT
        if(this.trtcComponent) {
          // 初始化事件订阅，发布本地音频流和视频流
          this.trtcComponent.on(EVENT.LOCAL_JOIN, (event)=>{
            console.log('* room LOCAL_JOIN', event)
            // 进房成功，触发该事件后可以对本地视频和音频进行设置
            if (this.state.trtcConfig.localVideo === true || this.state.trtcConfig.template === '1v1') {
              this.trtcComponent.publishLocalVideo()
            }
            if (this.state.trtcConfig.localAudio === true || this.state.trtcConfig.template === '1v1') {
              this.trtcComponent.publishLocalAudio()
              console.log("发布音频流");
            }
            if (this.state.trtcConfig.template === 'custom') {
              this.trtcComponent.setViewRect({
                userID: event.userID,
                xAxis: '0rpx',
                yAxis: '0rpx',
                width: '240rpx',
                height: '320rpx',
              })
            }
          })
          // 成功离开房间
          this.trtcComponent.on(EVENT.LOCAL_LEAVE, (event)=>{
            console.log('* room LOCAL_LEAVE', event)
          })
          // 本地推流出现错误、渲染错误事件等
          this.trtcComponent.on(EVENT.ERROR, (event)=>{
            console.log('* room ERROR', event)
          })
        // 远端用户进房
        this.trtcComponent.on(EVENT.REMOTE_USER_JOIN, (event)=>{
          console.log('* room REMOTE_USER_JOIN', event, this.trtcComponent.getRemoteUserList())
          const userList = this.trtcComponent.getRemoteUserList()
          this.handleOnUserList(userList).then(() => {
            console.log(this.state.userList)
          })
        })
          // 监听远端用户的视频流的变更事件
          this.trtcComponent.on(EVENT.REMOTE_VIDEO_ADD, (event)=>{
            // 订阅（即播放）远端用户的视频流
            let userID = event.data.userID
            let streamType = event.data.streamType// 'main' or 'aux'     
            console.log("远端", userID)       
            this.trtcComponent.subscribeRemoteVideo({userID: userID, streamType: streamType})
          })
        
          // 监听远端用户的音频流的变更事件
          this.trtcComponent.on(EVENT.REMOTE_AUDIO_ADD, (event)=>{
            // 订阅音频
            const data = event.data
            if (this.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
              this.remoteUser = data.userID
              this.trtcComponent.subscribeRemoteAudio({ userID: data.userID })
            } else {
              this.trtcComponent.subscribeRemoteAudio({
                userID: data.userID,
            })
              // 标记该用户已首次订阅过
              // this.data.subscribeList[data.userID + '-audio'] = true
            }
          })

          // 远端用户退出
          this.trtcComponent.on(EVENT.REMOTE_USER_LEAVE, (event)=>{
            console.log('* room REMOTE_USER_LEAVE', event, this.trtcComponent.getRemoteUserList())
            if (this.template === '1v1') {
              this.timestamp = []
            }
            if (this.template === '1v1' && this.remoteUser === event.data.userID) {
              this.remoteUser = null
            }
            Taro.showToast({
              title: '对方已离开',
              icon: 'none',
              duration: 1500
            })
            setTimeout(() => {
                Taro.navigateBack({
                delta: 2,
              })
            },1500)
          })
        }
    }

    handleOnUserList = userList => {
      return new Promise((resolve, reject) => {
        const newUserList = []
        let index = 0
        const oldUserList = this.state.userList
        userList.forEach((item) => {
          if (item.hasMainAudio) {
            const user = this.judgeWhetherExist({ userID: item.userID, streamType: 'main' }, oldUserList)
            index += 1
            if (user) {
              // 已存在
              newUserList.push(Object.assign(user, { index: index }))
            } else {
              newUserList.push({
                userID: item.userID,
                streamType: 'main',
                index: index,
                hasMainAudio: item.hasMainAudio,
                volume: 0,
              })
            }
          }
        })
        this.setState({
          userList: newUserList,
        }, () => {
          console.log('handleOnUserList newUserList', newUserList)
          resolve()
        })
      })
    }

  judgeWhetherExist = (target, userList) => {
    userList.forEach( (item) => {
      if (target.userID === item.userID && target.streamType === item.streamType) {
        return item
      }
    })
    return false
  }

    render() {
        return (
            <View>             
                <trtc-room id="trtcroom" config={this.state.trtcConfig}></trtc-room>
            </View>
        )
    }
}

export default Index
