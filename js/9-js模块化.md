js模块化
==
前端模块化分几种:CommonJS、ES6、AMD、CMD
1. CommonJS
CommonJS 采用的是运行时同步加载，模块输出的是一个值的拷贝。
针对为什么CommonJS是运行时同步加载：阮一峰老师有着很好的解释
> 是因为 CommonJS 加载的是一个对象（即`module.exports`属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成

主要API
* module对象
Node内部提供一个`Module`构建函数。所有模块都是`Module`的实例
每个模块内部，都有一个`module`对象，代表当前模块。它有以下属性
	*   `module.id` 模块的识别符，通常是带有绝对路径的模块文件名。
	*   `module.filename` 模块的文件名，带有绝对路径。
	*   `module.loaded` 返回一个布尔值，表示模块是否已经完成加载。
	*   `module.parent` 返回一个对象，表示调用该模块的模块。
	*   `module.children` 返回一个数组，表示该模块要用到的其他模块。
	*   `module.exports` 表示模块对外输出的值，**其他文件加载该模块，实际上就是读取`module.exports`变量**。
* exports变量
为了方便，Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令`var exports = module.exports`。很明显这里会涉及到对象的引用问题。所以实际开发中尽量避免使用exports变量
* require
引用module.exports导出的整个变量
2. ES6 
ES6模块化采用的是编译时输出接口，提供的是值的引用
主要API:
`export`命令用于规定模块的对外接口，export可以定义再文件的任何一个位置中 例如:`export var a = 2`
此时 我们可以使用`import` 命令进行接收 形如：`import {a as b} form '路径'`。其中大括号中的变量名必须与导出的名字相一致，as 后是可以使用别名。
也可以用`export default b = 3`来导出默认的一个值，这样使用`import`命令时就无须记住变量名，形如`import a from '路径'`
3. AMD
[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)是"Asynchronous Module Definition"的缩写，意思就是"异步模块定义"。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。由于是异步 所以更适合浏览器环境，他比较强调的是**依赖前置**
语法为:`require([module], callback);define([module],callback)`
主要实现库为require.js
4. CMD
推崇**依赖就近**，只有真正需要才加载，只有使用的时候才定义依赖。没什么用了解即可


参考文章
[阮一峰-ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/module-loader#ES6-%E6%A8%A1%E5%9D%97%E4%B8%8E-CommonJS-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82)
[CommonJS规范](https://javascript.ruanyifeng.com/nodejs/module.html)
[前端模块化：CommonJS,AMD,CMD,ES6](https://juejin.im/post/5aaa37c8f265da23945f365c)
