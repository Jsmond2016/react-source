import $ from 'jquery'

// 通过父类保存参数
class Unit {
  constructor(element) {
    this.currentElement = element
  }
}


class ReactTextUnit extends Unit {
  update(nextElement) {
    if (this.currentElement !== nextElement) {
      this.currentElement = nextElement
      $(`[data-reactid="${this._rootId}"]`).html(this.currentElement)
    }
  }
  // 保存当前元素的 id
  getMarkUp(rootId) {
    this._rootId = rootId
    return `<span data-reactid=${rootId}>${this.currentElement}</span>`
  }
}

class ReactNativeUnit extends Unit {

  // 返回结果为一个字符串 $(container).html(markUp)，这里的 markUp 为字符串
  getMarkUp(rootId) {
    this._rootId = rootId
    let { type, props } = this.currentElement // div data-reactid=0.1
    let tagStart = `<${type} data-reactid="${rootId}"`
    let tagEnd = `</${type}>`

    let contentStr

    for (let propName in props) {

      // 如果属性为事件，添加事件 委托到 document 上
      if (/on[A-Z]/.test(propName)) {

        let eventType = propName.slice(2).toLowerCase()
        $(document).on(eventType, `[data-reactid=${rootId}]`, props[propName])

      } else if (propName === 'children') {

        contentStr = props[propName].map((child, idx) => {
          // 递归循环子节点
          let childInstance = createReactUnit(child)
          //  加上子节点的 id
          return childInstance.getMarkUp(`${rootId}-${idx}`)
        })
          .join('') // 将数组 ['<span>hello</span>', '<button>123</button>'] 拼成字符串

      } else {

        tagStart += (`${propName}=${props[propName]}`)

      }
    }

    return tagStart + '>' + contentStr + tagEnd
  }
}

// 渲染 React 组件
class ReactCompositionUnit extends Unit {
  // 这里负责处理组件的更新操作
  update(nextElement, partialState) {
    // 先获取到新的元素
    this._currentUnit = nextElement || this.currentElement
    // 获取新的状态，不论是否更新组件，组件状态都会改变
    let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState)
    // 新的属性
    let nextProps = this.currentElement.props
    if (this._componentInstance.componentShouldUpdate && !this._componentInstance.componentShouldUpdate(nextProps, nextState)) return

    // 下面要进行更新
    // 获取上次渲染的单元
    let preRenderdUnitInstance = this._renderedUnitInstance
    // 获取上次渲染的元素
    let preRenderedElement = preRenderdUnitInstance.currentElement
    let nextRenderedElement = this._componentInstance.render()
    // 判断是否需要深度比较
    // 若新旧两个元素类型一样，则可以进行深度比较；否则删除老的元素，新建新的元素
    if (shouldDeepCompare(preRenderedElement, nextRenderedElement)) {
      // 如可以进行深比较，则把更新的工作交给 上次渲染出来的那个 element 元素对应的 Unit 来处理
      preRenderdUnitInstance.update(nextRenderedElement)
      this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate()
    } else {
      this._renderedUnitInstance = createReactUnit(nextRenderedElement)
      let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._rootId)
      $(`[data-reactid="${this._rootId}"]`).replaceWith(nextMarkUp)
    }
  }
  getMarkUp(rootId) {
    this._rootId = rootId
    let { type: Component, props } = this.currentElement
    let componentInstance = this._componentInstance = new Component(props)

    componentInstance._currentUnit = this

    // 组件实例化后执行 componentWillMount
    componentInstance.componentWillMount && componentInstance.componentWillMount()

    // render 后返回的结果
    let renderedElement = componentInstance.render() // render 返回的数字 123，若含有子组件，则 往下继续递归
    // 递归渲染 组件 render 后的返回结果
    let reactCompositionInstance = this._renderedUnitInstance = createReactUnit(renderedElement)

    let markUp = reactCompositionInstance.getMarkUp(rootId)

    // 先序深度优先，有儿子的树就进去遍历
    // 组件挂载完成后执行，顺序，先儿子，后父亲
    $(document).on('mounted', () => {
      componentInstance.componentDidMount && componentInstance.componentDidMount()
    })

    return markUp // 实现把 render 返回的结果作为 字符串返还回去
  }
}

// 若新旧两个元素类型一样，则可以进行深度比较；否则删除老的元素，新建新的元素
function shouldDeepCompare(oldElement, newElement) {
  if (oldElement !== null && newElement !== null) {
    let oldType = typeof oldElement
    let newType = typeof newElement
    // 新老元素都是 文本或者数字
    if (['string', 'number'].includes(oldType) && ['string', 'number'].includes(newType)) {
      return true
    }
    if (oldElement instanceof Element && newElement instanceof Element) {
      return oldElement.type == newElement.type
    }
  }
  return true
}


function createReactUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new ReactTextUnit(element)
  }

  // 表示使用 React.createElement 创建的元素
  if (typeof element === 'object' && typeof element.type === 'string') {
    return new ReactNativeUnit(element)
  }

  if (typeof element === 'object' && typeof element.type === 'function') {
    return new ReactCompositionUnit(element) // {type: Counter, {name: 'xxx'}}
  }

}

export default createReactUnit