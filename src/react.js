
import $ from 'jquery'

import createReactUnit from './utils'
import createElement from './element'


let React = {
  render,
  nextRootIndex: 0,
  createElement
}

// 给每一个元素添加一个属性，为了方便获取这个元素
function render(element, container) {

  // 写一个工厂函数，用来创建 React 元素
  let createReactUnitInstance = createReactUnit(element)
  let markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex)

  $(container).html(markUp)
}


export default React