# 手写 React

> 基于 React 16.x 版本

目录导读：

- 新建项目
- 项目初始化
- 新增文本组件
- 实现 createElement
- 递归子节点拼成 DOM
- 添加事件委托
- 实现 Component 组件
- 生命周期的实现
- setState 方法实现

正文开始：

## 新建项目

- 使用 cra 创建项目，`src` 目录下只留下 `index.js, App.js` 文件
- 启动测试是否正常

## 项目初始化

- 安装 jquery 

```bash
yarn add jquery
```

- 新建 `index.js` 

```js
// index.js

import react from './react'

react.render("Hello, World", document.getElementById('root'));
```
- 新建 `src/react.js` 文件

```js
// react.js

import $ from 'jquery'

let React = {
  render
}

function render(element, container) {
  $(container).html(element)
}

export default React
```

此时，启动：`yarn start`，浏览器可以看到 `Hello, World`

## 新增文本组件

- 新建 `src/utils/indes.js` 文件

```jsx
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
```

- 修改 `src/react.js` 文件

```js
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
```

- 运行测试

## 实现 createElement

- 新建 `src/element.js` 文件

```js
class Element {
    constructor(type, props) {
        this.type = type
        this.props = props
    }
}

function createElement(type, props, ...children) {
    props = props || {}
    props.children = children
    return new Element(type, props)
}


// 返回虚拟 DOM，用对象来描述元素
export default createElement
```

- 在 `src/react.js` 文件引入

```diff
import $ from 'jquery'

import createReactUnit from './utils'
+ import createElement from './element'


let React = {
    render,
    nextRootIndex: 0,
+    createElement
}

// 给每一个元素添加一个属性，为了方便获取这个元素
function render(element, container) {

    let createReactUnitInstance = createReactUnit(element)
    let markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex)

    $(container).html(markUp)
}


export default React
```

- 修改 `src/index.js` 文件，测试

```jsx
import React from './react'


let jsxDom = <div name="xxx">hello<span>234</span></div>

console.log(React.createElement(jsxDom))

// jsx 语法转换成 虚拟 DOM 对象
React.render("Hello, World", document.getElementById('root'));
```



## 递归子节点拼成 DOM

- 修改 `src/utils/index.js` 文件

```js
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

// ----------以下为修改的代码------------
class ReactNativeUnit extends Unit {
  // 返回结果为一个字符串 $(container).html(markUp)，这里的 markUp 为字符串
  getMarkUp(rootId) {
    this._rootId = rootId
    let { type, props } = this.currentElement // div data-reactid=0.1
    let tagStart = `<${type} data-reactid="${rootId}"`
    let tagEnd = `</${type}>`

    let contentStr

    for (let propName in props) {
      if (propName === 'children') {
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
```

- 修改 `src/index.js` 例子，代码为

```js
import React from './react'

let element = React.createElement("div", {name: "xxx"}, "hello", React.createElement("span", null, "234"))

// jsx 语法转换成 虚拟 DOM 对象
React.render(element, document.getElementById('root'));
```

- 启动测试



## 添加事件委托

- 修改 `src/utils/index.js` 文件

```js
// ... 省略部分代码
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
```

- 修改 `src/index.js` 文件，新增 `onClick` 事件 进行测试

```js
import React from './react'

function say() { alert('111') }

let element = React.createElement("div", { name: "xxx" }, "hello", React.createElement("button", {onClick: say}, "234"))

// jsx 语法转换成 虚拟 DOM 对象
React.render(element, document.getElementById('root'));
```

- 启动测试

## 实现 Component 组件

- 新建 `src/component.js` 文件

```js
class Component {
  constructor(props) {
    this.props = props
  }
  setState() {
    console.log('更新状态')
  }
}

export default Component
```

- 在 `src/react.js` 文件引入

```js
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
}


export default React
```

- 修改 `src/utils/index.js`  文件

```js
// ...
// 渲染 React 类组件
class ReactCompositionUnit extends Unit {
  getMarkUp(rootId) {
    this._rootId = rootId
    let { type: Component, props } = this.currentElement
    let componentInstance = new Component(props)
    // render 后返回的结果
    let reactComponentRenderer = componentInstance.render() // render 返回的数字 123，若含有子组件，则 往下继续递归
    // 递归渲染 组件 render 后的返回结果
    let reactCompositionInstance = createReactUnit(reactComponentRenderer)
    let markUp = reactCompositionInstance.getMarkUp(rootId)
    return markUp // 实现把 render 返回的结果作为 字符串返还回去
  }
}


function createReactUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new ReactTextUnit(element)
  }

  // 表示使用 React.createElement 创建的元素
  if (typeof element === 'object' && typeof element.type === 'string') {
    return new ReactNativeUnit(element)
  }

  // 类组件
  if (typeof element === 'object' && typeof element.type === 'function') {
    return new ReactCompositionUnit(element) // {type: Counter, {name: 'xxx'}}
  }

}
```

- 修改测试例子：

```js
// src/index.js

import React from './react'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 123
    }
  }
  render() {
    console.log(this.props);
    return this.state.number
  }
}

// jsx 语法转换成 虚拟 DOM 对象
React.render(React.createElement(Counter, {name: 'test'}), document.getElementById('root'));
```



## 生命周期的实现

主要实现以下 4 个生命周期：

- componentWillMount
- componentShouldUpdate
- componentDidUpdate
- componentDidMount

代码为：

```jsx
// src/utils/index.js

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
    // 调用 componentShouldUpdate
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
      // 执行 componentDidUpdate
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


// ...省略部分代码

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
```

使用 发布订阅模式 实现 componentDidMount，在挂载页面的时候触发事件

```diff

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
+  $(document).trigger('mounted') // 所有组件都 OK 了，发射之前订阅的函数
}


export default React
```



## setState 方法实现

实际上，执行 setState 动作的时候，做了 2 件事，更新 数据，更新视图

- 实现 `setState` 方法

```js
// src/component.js

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
```

- 修改 `src/utils/index.js` 文件

```diff
class ReactTextUnit extends Unit {
+  update(nextElement) {
+    if (this.currentElement !== nextElement) {
+      this.currentElement = nextElement
+      $(`[data-reactid="${this._rootId}"]`).html(this.currentElement)
+    }
+  }
  // 保存当前元素的 id
  getMarkUp(rootId) {
    this._rootId = rootId
    return `<span data-reactid=${rootId}>${this.currentElement}</span>`
  }
}
```

- 修改例子

```js
import React from './react'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 123
    }
  }

  componentWillMount() {
    console.log('组件==> willMount')
  }

  componentShouldUpdate(nextprops, nextState) {
    console.log('组件==> shouldUpdate')
    return true
  }

  componentDidUpdate(){
    console.log('组件==> didUpdate')
    console.log('this.state.number: ', this.state.number);
  }

  componentDidMount() {
    console.log('组件==> didMount')
    setInterval(() => {
      this.setState({
        number: this.state.number + 1
      })
    }, 1000);
  }

  render() {
    return this.state.number
  }
}

// jsx 语法转换成 虚拟 DOM 对象
React.render(React.createElement(Counter, {name: 'test'}), document.getElementById('root'));
```



写在最后：

- 过程源码：[react-source](https://github.com/Jsmond2016/react-source) 对照 commit 记录即可查看每一步的实现



## 参考资料：

- [珠峰架构从零手写React框架](https://www.bilibili.com/video/BV1dK411N7gp)