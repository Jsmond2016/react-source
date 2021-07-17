

class Component {
  constructor(props) {
    this.props = props
  }
  setState(partialState) {
    console.log('更新状态')
    // 第一个参数是 新的元素，第二个为新的状态
    this._currentUnit.update(null, partialState)
  }
}


export default Component