import { Component } from 'react'
import { View, Button, Text, Image, Block } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import {setUser} from '../../actions/counter'

import './index.scss'

@connect(({store}) => ( {store} ), dispatch => ({
    setUser(info) {
        dispatch(setUser(info))
    }
}))
class Index extends Component {
    state = {
        nickName: '环环' + Math.floor(Math.random() * 100),
        canIUseGetUserProfile: false,
        hasUserInfo: this.props.store.userInfo ? true : false,
        userInfo: this.props.store.userInfo || {}
    }
    onLoad() {
        if (Taro.getUserProfile) {
          this.setState({
            canIUseGetUserProfile: true
          })
        }
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
    handleClickH5 = () => {
        Taro.navigateTo({
            url: '/pages/index/index'
        })
    }
    handleClickVideo = () => {
        if (!this.state.userInfo.nickName) {
            Taro.showToast({
              title: '缺少用户昵称',
              icon: 'none'
            })

            return
        }

        Taro.navigateTo({
            url: '/pages/video/index'
        })
    }
  render () {
    return (
        <View className="view-body">
            <View className="user-info">
                {
                this.state.hasUserInfo ? (
                <Block>
                    <Image
                        className='userinfo-avatar'
                        src={this.state.userInfo.avatarUrl}
                        mode='scaleToFill'
                    />
                    <Text className="userinfo-nickname">{this.state.userInfo.nickName}</Text>
                </Block>
                ) : <Block>
                    {
                    this.state.canIUseGetUserProfile ? <Button className="get-info" onClick={this.getUserProfile}>获取头像昵称</Button> : <Button className="get-info"  onClick={this.getUserInfo} openType="getUserInfo">获取头像昵称</Button>
                    }
                </Block>
            }
            </View>
            <View className="view-container">
                <Button className="button" onClick={this.handleClickH5}>H5客服</Button>
                <Button
                    className="button"
                    openType="contact"
                    sessionFrom={
                        JSON.stringify({
                            nickName: this.state.userInfo.nickName || this.props.store.visitor.user_nickname,
                            avatarUrl: this.state.userInfo.avatarUrl || '',
                            trueName: this.props.store.visitor.true_name,
                            phone: this.props.store.visitor.phone,
                            qq: this.props.store.visitor.qq,
                            weixin: 'weixin123',
                            email: this.props.store.visitor.email,
                            companyName: this.props.store.visitor.company_name,
                            description: this.props.store.visitor.description
                        })}
                    >微信客服</Button>
                <Button className="button"  onClick={this.handleClickVideo}>音视频客服</Button>
            </View>
        </View>
    )
  }
}

export default Index

