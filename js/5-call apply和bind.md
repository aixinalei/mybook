# call apply bind介绍与实现

前言：
为什么要学习 call apply bind？因为这个是js中基础中得基础，学会了他，才可以更多的去了解js中继承、this指向、以及new 得原理。

---
## 作用
他们的作用都是**改变js中this指向**
举例:

```javascript
var name ='小王',age=17
var obj = {
  name:'小张',
  objAge:this.age,
  myFun:function(){
    console.log(this.name+"年龄"+this.age)
  }
}
var db = {
  name:'小刘',
  age:'18',
}
obj.myFun.call(db);　　　　//小刘年龄18
obj.myFun.apply(db);　　　 //小刘年龄18
obj.myFun.bind(db)();　　　//小刘年龄18
```

以上出了bind 方法后面多了个 () 外 ，结果返回都一致！
由此得出结论，bind 返回的是一个新的函数，你必须调用它才会被执行

```javascript
var name ='小王',age=17
var obj = {
  name:'小张',
  objAge:this.age,
  myFun:function(){
    console.log(this.name+"年龄"+this.age)
  }
}
var db = {
  name:'小刘',
  age:'18',
}
obj.myFun.call(db);　　　　//小刘年龄18
obj.myFun.apply(db);　　　 //小刘年龄18
obj.myFun.bind(db)();　　　//小刘年龄18
```
对比call 、bind 、 apply 传参情况下
```javascript
var name ='小王',age=17
var obj = {
  name:'小张',
  objAge:this.age,
  myFun:function(fm,t){
    console.log(this.name+"年龄"+this.age,"来自"+fm,"去往"+t)
  }
}
var db = {
  name:'小刘',
  age:'18',
}

obj.myFun.call(db,'成都','上海')；　　　　 //小刘 年龄 18  来自 成都去往上海
obj.myFun.apply(db,['成都','上海']);      //小刘 年龄 18  来自 成都去往上海  
obj.myFun.bind(db,'成都','上海')();       //小刘 年龄 18  来自 成都去往上海
obj.myFun.bind(db,['成都','上海'])();　　 //小刘 年龄 18  来自 成都,上海去往undefined
```
从上面四个结果不难看出
call 、bind 、 apply 这三个函数的第一个参数都是 this 的指向对象，第二个参数差别就来了：
call的参数是直接放进去的，第二第三第n个参数全都用逗号分隔，直接放到后面  obj.myFun.call(db,'成都', ... ,'string' )；
apply的所有参数都必须放在一个数组里面传进去  obj.myFun.apply(db,['成都', ..., 'string' ]);
bind除了返回是函数以外，它 的参数和call 一样。
当然，三者的参数不限定是string类型，允许是各种类型，包括函数 、 object 等等！

### 实现
call与apply实现思路就是当调用call函数时，给传入的对象绑定一个新的函数，这个函数就是调用call函数本身得函数，同时调用这个函数。
还以第一个例子为例：
```javascript
var name ='小王',age=17
var obj = {
  name:'小张',
  objAge:this.age,
  myFun:function(){
    console.log(this.name+"年龄"+this.age)
  }
}
var db = {
  name:'小刘',
  age:'18',
}
obj.myFun.call(db);　　　　//小刘年龄18
```
那么这个时候，如果db本身被改造成如下，那么就可以成功改变this指向：
```javascript
var db = {
  name:'小刘',
  age:'18',
  myFun:function(){
    console.log(this.name+"年龄"+this.age)
  }
}
```
通过以上，我们可以定义出自己的call函数如下：
```javascript
Function.proptotype.myCall = function(context){
    // 首先要获取调用call的函数，用this可以获取
    context.fn = this;
    context.fn();
    delete context.fn;
}
```
接下来就是完善它，根据传参特性、返回值特性以及没给参数时默认this指向window，具体代码如下：
```javascript
// call实现：
Function.prototype.myCall = function (context) {
    var context = context || window;
    context.fn = this;

    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }

    var result = eval('context.fn(' + args +')');

    delete context.fn
    return result;
}
// apply实现：
Function.prototype.myApply = function (context, arr) {
    var context = Object(context) || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    }
    else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')')
    }

    delete context.fn
    return result;
}
```

bind实现思路

参考文章：
[https://www.cnblogs.com/Shd-Study/p/6560808.html](https://www.cnblogs.com/Shd-Study/p/6560808.html)
[https://github.com/mqyqingfeng/Blog/issues/11](https://github.com/mqyqingfeng/Blog/issues/11)
[https://github.com/mqyqingfeng/Blog/issues/12](https://github.com/mqyqingfeng/Blog/issues/12)
