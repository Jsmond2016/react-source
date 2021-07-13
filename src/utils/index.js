import $ from 'jquery'


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

    return tagStart + '>' + contentStr  +tagEnd
  }
}


function createReactUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new ReactTextUnit(element)
  }

  // 表示使用 React.createElement 创建的元素
  if (typeof element === 'object' || typeof element.type === 'string') {
    return new ReactNativeUnit(element)
  }

}

export default createReactUnit