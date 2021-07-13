# 手写 React

## 01

- 安装 jquery 

```bash
yarn add jquery
```

```js
// index.js

import react from './react'

react.render("Hello, World", document.getElementById('root'));
```

---

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