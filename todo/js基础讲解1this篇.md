js基础讲解——this篇
===
什么是this？
---
**在函数内部有一些特殊的对象，其中有arguments和this等，其中this对象是在运行时基于函数的运行环境绑定的**

通过这个简单的定义我们知道两点1、this是函数内部的对象，即普通对象内部不存在this 2、this对象是会根据运行环境变化的
那么怎么变化的呢？基本原则就是这样
**在全局函数中，this等同于window,而当函数被作为某个对象的方法调用时，this指代了那个对象**
接下来以上面的基本原则为基准通过下面的几个常见情况 来介绍实际情况中this的指代情况。

指代window
---
1.全局作用域的this一般指向全局对象，在浏览器中这对象就是window，在node中这对象就是global。
```javascript
console.log(this.document === document); // true (document === window.document)
console.log(this === window); // true 
this.a = 37;  //相当于创建了一个全局变量a
console.log(window.a); // 37
```
2.非严格模式下的function内部
```javascript
var x = 1; 
function test(){
　alert(this.x);
}
test(); // 1
```
3.普通对象没有this
```javascript
var a = 1;
var b = {
a:'a',
b:this.a
}
b.b // 1 这里的this仍然指代的全局对象
```
看下面的例子会加深下理解
```
var b = {
a:'a',
b:this.a
}
b.b // undifined 这里的this仍然指代的全局对象 但全局对象中没有定义
```
这种情况一般的使用场景就是在写传统的html页面时 在每个页面的script标签内写js时会遇到 遇到时不要搞混。


指代调用对象本身
---
1. 作为对象方法的函数的this

