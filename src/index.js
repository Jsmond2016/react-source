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

