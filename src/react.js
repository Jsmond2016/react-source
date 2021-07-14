
import $ from 'jquery'

import createReactUnit from './utils'
import createElement from './element'
import Component from './component.js'

let React = {
  render,
  nextRootIndex: 0,
  createElement,
  Component
}

// 给每一个元素添加一个属性，为了方便获取这个元素
function render(element, container) {

  // 写一个工厂函数，用来创建 React 元素
  let createReactUnitInstance = createReactUnit(element)
  let markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex)

  $(container).html(markUp)

  // 触发挂载完成的方法
  $(document).trigger('mounted') // 所有组件都 OK 了，发射之前订阅的函数
}


export default React