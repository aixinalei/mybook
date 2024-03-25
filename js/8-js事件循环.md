# 事件循环EventLoop

## 首先,请牢记2点:

**_(1) JS是单线程语言_**

**_(2) JS的Event Loop是JS的执行机制。深入了解JS的执行,就等于深入了解JS里的event loop_**

### 1.灵魂三问 : JS为什么是单线程的? 为什么需要异步? 单线程又是如何实现异步的呢?

技术的出现,都跟现实世界里的应用场景密切相关的。

同样的,我们就结合现实场景,来回答这三个问题

> (1) JS为什么是单线程的?

JS最初被设计用在浏览器中,那么想象一下,如果浏览器中的JS是多线程的。

```
场景描述:

那么现在有2个线程,process1 process2,由于是多线程的JS,所以他们对同一个dom,同时进行操作

process1 删除了该dom,而process2 编辑了该dom,同时下达2个矛盾的命令,浏览器究竟该如何执行呢?
```

这样想,JS为什么被设计成单线程应该就容易理解了吧。

> (2) JS为什么需要异步?

```
场景描述:

如果JS中不存在异步,只能自上而下执行,如果上一行解析时间很长,那么下面的代码就会被阻塞。
对于用户而言,阻塞就意味着"卡死",这样就导致了很差的用户体验

```

所以,JS中存在异步执行。

> (3) JS单线程又是如何实现异步的呢?

既然JS是单线程的,只能在一条线程上执行,又是如何实现的异步呢?

**_是通过的事件循环(event loop),理解了event loop机制,就理解了JS的执行机制_**

### 2.JS中的event loop
js 当执行异步代码 会把任务放到任务栈中，不同的任务会分配到不同的任务栈中，任务源可以分为 **微任务**（microtask） 和 **宏任务**（macrotask）
Event Loop执行顺序如下：

*   首先执行同步代码，这属于宏任务
*   当执行完所有同步代码后，执行栈为空，查询是否有异步代码需要执行
*   执行所有微任务
*   当执行完所有微任务后，如果必要会渲染页面
*   然后开始下一轮Event Loop，执行宏任务中的异步代码，也就是setTimeout中的回调函数
*   微任务包括：

    *   process.nextTick（node独有）
    *   promise.then 或者 promise.resolve 里的内容
    *   MutationObserver
*   宏任务：

    *   script
    *   setTimeout
    *   setInterval
    *   setImmediate
    *   I/O
    *   UI rendering
    *   new Promise(fn) 中的fn
举个经典例子

```
console.log('script start') 

async function async1() { 
	await async2() 
	console.log('async1 end') 
} 

async function async2() { 
	console.log('async2 end') 
} 

async1() 

setTimeout(function() { 
	console.log('setTimeout') 
}, 0) 

new Promise(resolve => { 
	console.log('Promise') 
	resolve() 
}).then(function() {
    console.log('promise1') 
}).then(function() { 
	console.log('promise2') 
}) 

console.log('script end') 
```

这里首先要明白async和await写法对于promise的关系 async仅相当于定义时宣布此函数里有异步操作。await相当于暂停，await后面的代码相当于放到promise的then当中。await 里函数的代码相当于放到创建promise的new函数之中
接下来解析上面代码
首先执行第一轮宏任务
1. console.log('script start') 同步任务直接执行
2. 遇到async1() 同步任务直接执行
3. 遇到async2() 将await后的函数放入至微服务之中，同时执行async2()
4. console.log('async2 end') 
5. 遇到settimeout 放到宏任务等待下一轮执行
6. new 对象创建一个promise 创建的过程是非异步的，直接console.log('Promise') 同时将两个then函数放入微服务队列中等待执行
7. console.log('script end') 
8. 检测该论循环中微服务队列，首先打印console.log('async1 end') 
9. 然后按顺序打印两个then console.log('promise1') console.log('promise2') 
10. 微服务执行结束，执行下一轮宏任务
11. 打印console.log('setTimeout') 
### node中的事件循环
node中的事件循环和浏览器中的事件循环大体相似，不过整体上分了多个阶段这里不展开描述
参考文章：
[10分钟理解JS引擎的执行机制](https://segmentfault.com/a/1190000012806637)
