import { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button } from '@tarojs/components'

import { add, minus, asyncAdd } from '../../actions/counter'

import './index.scss'


@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  }
}))
class Index extends Component {
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleClick(errMsg, path, query) {
    console.log(123, errMsg, path, query)
  }

  render () {
    return (
      <View className='weichat'>
        <Button
          openType="contact"
          onContactEventDetail={this.handleClick}
          // sessionFrom={'{"nickName":"{{mynickName}}","avatarUrl":"{{userInfo.avatarUrl}}","trueName":"程秀宁7","phone":"12345678910","qq":"666666","weixin":"围巾","email":"123456@easemob.com","companyName":"环信1","description":"护肤霜1"}'}
          onContact={this.handleClick}
          >微信客服</Button>
      </View>
    )
  }
}

export default Index

