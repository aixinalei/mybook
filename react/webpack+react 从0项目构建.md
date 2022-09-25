# webpack+react 从0项目构建

初衷：总用脚手架构建项目往往对项目整个工程是如何跑起来的有所疏忽。时代在发展项目越来越大，微前端的实际落地也使得构建配置越来越复杂。对与老项目如何升级维护也需要对webpack这些配置是如何工作的有所了解。

本文和其他配置区别是**只教思路**，不会像其他文章一样，只沾代码。最多告诉代码是什么意思。结合官网教程一步一步的从0构建自己的应用。本文也更适合工作几年拓宽思路来看

## 配置

* 遵循webpack指南中[起步](https://webpack.docschina.org/guides/getting-started/)部分将webpack引入;
* 引入[webpack-dev-server](https://webpack.docschina.org/guides/development/#using-webpack-dev-server)

> 经过上面两步，我们得到一个用webpack跑起来的纯js项目,为了书写react语法，我们还需要使用babel对react语法进行转义

* 引入[babel](https://webpack.docschina.org/loaders/babel-loader/#babel-loader-is-slow)
* 引入babel针对[react](https://www.babeljs.cn/docs/babel-preset-react)配置

> 解决样式。
* 引入less less-loader style-loader css-loader
  
> 解决lint
* 引入eslint
  
> 引入antd
> 完善publickPath 首先说下这个东西是干嘛的。