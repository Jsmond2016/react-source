


// 通过父类保存参数
class Unit {
  constructor(element) {
    this.currentElement = element
  }
}


class ReactTextUnit extends Unit {
  // 保存当前元素的 id
  getMarkUp(rootId) {
    this._rootId = rootId
    return `<span data-reactid=${rootId}>${this.currentElement}</span>`
  }
}


function createReactUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new ReactTextUnit(element)
  }

}

export default createReactUnit