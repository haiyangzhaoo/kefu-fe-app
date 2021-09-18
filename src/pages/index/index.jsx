import { Component } from 'react'
import { WebView } from '@tarojs/components'

import './index.scss'

class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      url: 'https://kefu.easemob.com/webim/im.html?configId=9ef8fd9b-81b3-450f-88ca-9314de0f4746'
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  handleMessage() {
    console.log('ok')
  }
  
  render () {
    return (
      <WebView src={this.state.url} onMessage={this.handleMessage} />
    )
  }
}

export default Index

