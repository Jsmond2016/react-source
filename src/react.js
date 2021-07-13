
import $ from 'jquery'

import createReactUnit from './utils'

let React = {
  render,
  nextRootIndex: 0
}

// 给每一个元素添加一个属性，为了方便获取这个元素
function render(element, container) {


  let createReactUnitInstance = createReactUnit(element)
  let markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex)

  $(container).html(markUp)
}


export default React