hash router browser-router 都利用了浏览器内部机制

首先是监听路由变化，都用的是的window.addEventListener

区别在于 监听的是hashChange 另外监听的是 popstate

监听变化那自然是切换子组件

手动跳转用到的就是window.location.hash 直接更改

或者用的就是history.pushState


