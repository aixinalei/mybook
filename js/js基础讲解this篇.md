# js基础讲解——this篇

---
## 什么是this？
**在函数内部有一些特殊的对象，其中有arguments和this等，其中this对象是在运行时基于函数的运行环境绑定的**

通过这个简单的定义我们知道两点1、this是函数内部的对象，即普通对象内部不存在this 2、this对象是会根据运行环境变化的
那么怎么变化的呢？基本原则就是这样
**在全局函数中，this等同于window,而当函数被作为某个对象的方法调用时，this指代了那个对象**
接下来以上面的基本原则为基准通过下面的几个常见情况 来介绍实际情况中this的指代情况。

---
## 指代案例
### 指代window
1.全局作用域的this一般指向全局对象，在浏览器中这对象就是window，在node中这对象就是global。
```javascript
console.log(this.document === document); // true (document === window.document)
console.log(this === window); // true 
this.a = 37;  //相当于创建了一个全局变量a
console.log(window.a); // 37
```
2.非严格模式下的全局函数内部
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

### 指代调用对象本身

1. 作为对象方法的函数中的this
```javascript
var o = {
    a:"a",
    fn:function(){
        console.log(this.a);  //a
 }
}
o.fn();
```
这里得调用对象是o 所以this就只想o本身
再通过一个例子来加深理解
```javascript
var o = {
    a:10,
    b:{ 
       a:12,
       fn:function(){
              console.log(this.a); //12       
       }
    }
}
o.b.fn();
```
因为是o.b这个对象调用了fn所以this指向a.b
再来一个复杂例子
```javascript
var o = {
    a:10,
    b:{
        a:12,
        fn:function(){
            console.log(this.a); //undefined
            console.log(this); //window
 }
    }
} 
var j = o.b.fn;
j();
```
很好理解其实，j是一个新得变量，指代fn（内存种指向fn得地址） 调用fn得是还是window
2. apply 调用
`apply()`是函数的一个方法，作用是改变函数的调用对象。它的第一个参数就表示改变后的调用这个函数的对象。因此，这时`this`指的就是这第一个参数。`apply()`的参数为空时，默认调用全局对象。
例子如下：
```javascript
var x = 0;
function test() {
　console.log(this.x);
}

var obj = {};
obj.x = 1;
obj.m = test;
obj.m.apply() // 0

obj.m.apply(obj); //1

```
3. 构造函数中得this
所谓构造函数，就是通过这个函数，可以生成一个新对象。这时，`this`就指这个新对象。
```javascript
function test() {
　this.x = 1;
}

var obj = new test();
obj.x // 1
```
原理:
为什么this会指向a？首先new关键字会创建一个空的对象，然后会自动调用一个函数apply方法，将this指向这个空对象，这样的话函数内部的this就会被这个空的对象替代。
4. 箭头函数
**箭头函数没有自己本身得this，而是再定义它时，包裹它得函数得this**

原理：箭头函数转成 ES5 的代码如下：
```javascript
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```
上面代码中，转换后的 ES5 版本清楚地说明了，箭头函数里面根本没有自己的`this`，而是引用外层的`this`。

## 总结
再次强调一遍：
**this只存在于函数当中，指代调用函数得对象本身**
用这句话去理解这副图来加深理解
![this指向](img/this指向.png)
## 参考文献
[追梦子——彻底理解this不必硬背](https://www.cnblogs.com/pssp/p/5216085.html)
[阮一峰this](https://www.ruanyifeng.com/blog/2010/04/using_this_keyword_in_javascript.html)
