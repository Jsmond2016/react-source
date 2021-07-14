// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react'




// let jsxDom = <div name="xxx">hello<button>234</button></div>
// babel 转换成 虚拟 DOM 对象如下：https://www.babeljs.cn/repl
// React.createElement("div", {
//   name: "xxx"
// }, "hello", /*#__PURE__*/React.createElement("span", null, "234"));


function say() { alert('111') }

let element = React.createElement("div", { name: "xxx" }, "hello", React.createElement("button", {onClick: say}, "234"))


console.log(element)


class SubCounter {
  componentWillMount() {
    console.log('儿子--组件将要挂载')
  }

  componentDidMount() {
    console.log('儿子--组件已经挂载')
  }

  render() {
    return '123'
  }
}


class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 123
    }
  }

  componentWillMount() {
    console.log('父亲--组件将要挂载')
  }

  componentDidMount() {
    console.log('父亲--组件已经挂载')
  }

  render() {
    return <SubCounter />
  }
}

// jsx 语法转换成 虚拟 DOM 对象
React.render(React.createElement(Counter, {name: 'test'}), document.getElementById('root'));

