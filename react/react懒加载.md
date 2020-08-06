react懒加载
===
## 为什么需要懒加载
React应用都会使用Webpack等打包工具进行文件打包。打包是一个根据入口文件，查询各文件引入关系，最后将所有需要的文件合并到一个单独文件的过程。

随着我们项目需求的增大，这个单独的文件就会越来越大，首次加载往往会有好几M的文件。严重影响体验，所以我们需要拆分这个文件。

拆分文件的思路之一就是懒加载。即当组件需要被调用时才去加载

## 如何做
主流分为两种解决方案
1. react官方提供的代码分割[React.lazy](https://zh-hans.reactjs.org/docs/code-splitting.html#reactlazy)
2. react官网推荐的[loadable-components](https://github.com/gregberge/loadable-components#readme)

> 两种解决方案最大的区别在于方案2支持SSR（Server Side Rendering）；

## import()动态引入
写法样例
```javascript
// 使用前
import { add } from './math';

console.log(add(16, 26));
// 使用后
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```
import()是符合[ECMAScript提案](https://github.com/tc39/proposal-dynamic-import)的一种方式。当webpack遇到这种语法时，会自动进行代码分割。当模块被调用时，进行加载

关于使用import()时webpack的[配置](https://webpack.docschina.org/guides/code-splitting/#dynamic-imports)

## import() 的原理
```javascript
function importModule(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const tempGlobal = "__tempModuleLoadingVariable" + Math.random().toString(32).substring(2);
    script.type = "module";
    script.textContent = `import * as m from "${url}"; window.${tempGlobal} = m;`;

    script.onload = () => {
      resolve(window[tempGlobal]);
      delete window[tempGlobal];
      script.remove();
    };

    script.onerror = () => {
      reject(new Error("Failed to load module script with URL " + url));
      delete window[tempGlobal];
      script.remove();
    };

    document.documentElement.appendChild(script);
  });
}
```
## React.lazy
1. 使用React.lazy(()=>import(uri))形式引入组件
2. 使用被引入的组件需要包裹在Suspense之中
   
写法样例
```javascript
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

> 思考：既然import(）已经帮我们做了这么一个代码分割。那么我们为什么还需要用`React.lazy()`包一下？

    答案：就是要把import()返回的是promise对象 转换成可以调用的组件

## loadable-components
写法样例
```javascript
import loadable from '@loadable/component'

const OtherComponent = loadable(() => import('./OtherComponent'))

function MyComponent() {
  return (
    <div>
      <OtherComponent />
    </div>
  )
}
```

> 思考：可以看到与React.lazy()方式主要差异就是他不需要包裹层，那么他是如何实现的？

    答案： 定义了一个函数，函数返回一个普通react组件A。组件内部维护一个更新状态，默认是false，组件内部调用函数传参中返回的promise，当promise触发结束时。更新状态改为true，A组件渲染返回的子组件

> 思考：那么他可以实现包裹层中组件没有加载完出等待效果嘛？

    答案： 当然可以，@loadable/component提供更完善的功能；

