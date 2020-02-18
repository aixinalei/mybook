js原型链详解（一：基础知识铺垫）
===
普通对象和函数对象
------
首先我们来举例说明对象的创建
```javascript
var o1 = {}; 
var o2 =new Object();
var o3 = new f1(); 

function f1(){}; 
var f2 = function(){};		
var f3 = new Function('str','console.log(str)'); 

console.log(typeof Object); //function console.log(typeof Function); //function console.log(typeof f1); //function console.log(typeof f2); //function console.log(typeof f3); //function console.log(typeof o1); //object console.log(typeof o2); //object console.log(typeof o3); //object
```
在这里我们可以简单的理解成经typeof检验成object的就是普通对象（null除外），检验成function的就是函数对象 那么我们怎么构造普通对象，又怎么构造函数对象呢
js中构造对象的方式很简单，就是通过js中已有的构造函数来构建例如：Object、Array、Date、Function
以上例说明``` var o2 = new Object()```就直接通过构造函数来构建的，```var o1 = {}```本质也是通过构造函数来创建的。我们可以这样理解，其等同于```var o1 = new Object({})``` 或者 ``` var o1 = new Object() ```
这样我们做一个总结：**通过new Function来创造的对象即为函数对象除此之外创造的对象都为普通对象**

构造函数
------
我们这里只是介绍具体概念，不考虑应用
首先举个例子
```javascript
var Function1 = new Function()
var f1 =new Function1();
console.log(f1.constructor == Function1) // true

var test=new Array()；
console.log(test.constructor == Array) // true
```
这里我们先介绍两个概念
f1是Function1的一个实例,test 也是 Array的一个实例
**实例的构造函数属性（constructor） 即为创建此对象的函数对象（其构造函数）的引用**

思考：
结合上两个模块我们进行一定的思考。首先new Function返回的是函数对象，通过这个返回的函数对象创建的对象的结果是普通对象（除了通过new Function创建的对象都是普通对象）。通过new Object等函数对象创造的对象也是普通对象，我们可以理解为Object等函数对象其实也是通过Function对象创造出来的，这里我们就可以看出js中函数是一等公民的思想，js中不像java是以对象作为基础，而是以函数作为基础来创造的语言。

原型对象
---
在javascript当中，每当定义一个对象（函数对象和普通对象）都会包含一些预定义的对象，其中每个**函数对象**都有一个prototype属性，这个属性指向了函数的**原型对象**。
那么什么是原型对象呢？其实就是一个普通对象，可以理解为是这个函数对象的一个实例
```javascript
var function1 = new Function();
typeof function1.prototype
'object'
```
那么这个对象包含着那些属性呢
我们可以自己在浏览器尝试打印下```function1.prototype```就会发现这个对象只有两个属性一个constructor一个_proto_（详情看下一节）

\_proto\_
----
每一个对象都有一个_proto_属性，他指向了构建他的函数对象的原型对象
```javascript
function Person(){}
var person1 = new Person();
console.log(person1.__proto__ === Person.prototype); // true
```
总结：
说道这里我们总结几个概念
1.  通过new Function来创造的对象即为函数对象除此之外创造的对象都为普通对象
2.  函数的构造函数属性（constructor）指向其构造函数对象
3.  每一个函数对象都有一个prototype属性 指向了这个函数对象的原型对象
4.  每一个对象都由一个_proto_属性，指向了构建他的函数对象的原型对象

那么原型链又是怎么一回事呢？
**js中，每一个对象都有一个_proto_属性，指向其构造函数的原型对象(prototype属性)上，其原型对象也是一个对象，那么这个原型对象也会有一个_proto_属性继续向上指，直到指向null(稍后讲解为什么指向null)，这样就构成了一条原型链。当js引擎查找对象具有的属性时，先找对象本身是否具有该属性，如果不存在，就会顺着原型链上找，但不会查找自身的prototype**

看了肯定还是蒙
那么我们以一道经典的面试题再来深入的讲解一下原型链
```javascript
var animal = function(){}
var dog = function(){} 

animal.price = 2000;
dog.prototype = animal
var tidy = new dog();

console.log(tidy.price) // 为什么输出2000
console.log(dog.price) // 为什么输入undifined
```
我们以上面的总结一下原型链
先以```tidy.price```为例
首先tidy自己没有price属性但是顺着tidy的原型链向上寻找可以找到 ```tidy._proto_.price = dog.prototype.price = animl.price = 2000```

这个很好理解，那么我们再来看为什么dog.price为undifined：
dog有price属性吗？没有，那么他会顺着他的原型链往上找，即找```dog._proto_.price```也就是```Function.prototype.price```,```Function.prototype```是什么？上文说过函数对象的prototype属性其本质就是他的一个实例，就是一个普通对象，这个普通对象显然没有price属性，接下来就要找这个普通对象的_proto_属性，我们姑且叫这个普通对象为obj，那么我们找的就是```dog._proto_.price._proto_.price```即为```obj._proto_.price === Object.prototype.price```。显然还是没有这个属性。这个时候就要特别记忆一下，Object.prototype._proto_为null，他是原型链的顶端，原型链到此为止。所以dog.price即为undifined;

通过上面的例子我们实现了一个简单的继承，**这个继承实际上是通过修改子类的prototype属性为想要继承的父类实现的继承**，那么这个继承的作用范围是什么呢？**在子类的实例和父类的原型对象之间**


* * *
参考资料：

