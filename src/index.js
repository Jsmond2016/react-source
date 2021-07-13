// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react'


let jsxDom = <div name="xxx">hello<span>234</span></div>
// babel 转换成 虚拟 DOM 对象如下：https://www.babeljs.cn/repl
// React.createElement("div", {
//   name: "xxx"
// }, "hello", /*#__PURE__*/React.createElement("span", null, "234"));


console.log(React.createElement(jsxDom))


// jsx 语法转换成 虚拟 DOM 对象
React.render("Hello, World", document.getElementById('root'));

