## 前言
对于前端开发来说，我们经常能够遇到的问题就是js的深浅复制问题，通常情况下我们解决这个问题的方法就是用JSON.parse(JSON.Stringify(xx))转换或者用类似于Inmmutable这种第三方库来进行深复制，但是我们还是要弄懂其中原理，这样在开发过程中可以省掉很多的坑。
### 首先让我们看几个例子

```javascript
// eg1(操作原对象对复制对象无影响)：
var a = 'a';
var b =a;
a = 'c';
console.log(b); // a

// eg2(操作原对象对复制对象有影响)：
var a = {
a:'a'
};
var b =a;
a.a = 'c';
console.log(b); // {a:'c'}

// eg3(操作原对象对复制对象无影响)：
var a = {
a:'a'
};
var b =a.a;
a.a = 'c';
console.log(b); // a

// eg4(操作复制对象对原对象有影响)：
var a = {
a:'a'
};
var b = a
b.b = 'b';
console.log(a); // {a:'a',b:'b'}
// eg5(操作复制对象对原对象没有影响):
var a = {
a:'a'
};
var b = a;
b = {
b:'b'
}
console.log(a); // {a:'a'}

// eg6 es6 扩展运算符 深浅拷贝的影响
let obj = { a: 1, b: { c: 2 } };

let obj2 = { ...obj };

obj2.a = 3;
obj2.b.c = 4;

console.log(obj); // {a:1, b: { c: 4 }}
console.log(obj2); // {a: 3, b: { c: 4 }}

// eg7 数组的slice 和concat
let obj = ['iyongbao', score: { vue: 98 }]

let obj2 = obj.slice();
let obj3 = obj.concat();

obj[0] = "zhangsan";
obj[1].vue = 60;

console.log(obj); // {name: "zhangsan", score: { vue: 60 }}
console.log(obj2); // {name: "iyongbao", score: { vue: 60 }}
console.log(obj3); // {name: "iyongbao", score: { vue: 60 }}

```
想要理解上面例子发生的原因就要从数据类型和堆栈内存开始说起
### 基本数据类型于引用数据类型
js中存在着两种数据类型：**基本数据类型**和**引用数据类型**;
基本数据类型包括：Number、String 、Boolean、Null和Undefined这些常见类型
引用数据类型包括: Object 、Array 、Function这些对象类型
### 堆内存和栈内存
在大多数编程语言中，都存在着这样的两个内存空间一个是**堆内存（heap）**，另一个是**栈内存（stack）**。
当我们存储一个基本数据类型的时候，我们直接放到栈内存中。而当我们存储一个引用数据类型的时候，我们将实际内容存储在堆内存当中，同时在栈内存中存放着该内容的引用，也就是一个指针
为什么我们这么做呢？简单来说有两点，一是因为栈内存中存放大小固定的数据，即基本数据类型的数据，同时引用数据类型的指针也是大小固定的，也可以放进栈内存中，方便程序查找这个数据；而堆内存中存放的是大小不固定的数据，所以适合存放引用数据类型。二这么分的好处就是在于节省内存资源，便于os合理回收内存
###  详解js中的深浅复制
有了上面的铺垫，那么我们理解起深浅复制就变得容易的许多。
首先我们要记住：**当我们复制一个基本数据类型的数据时，是新建一个数据同时存放到栈内存中，而当我们复制一个引用数据类型时，是复制这个引用数据类型的地址，存放到栈内存中，此时堆内存中并没有任何变化**
让我们来看之前的例子
例一和例二就没什么好说的了，我们从例三开始:
a.a是一个字符串类型，是基本类型，所以当b复制的时候是直接复制了一个存放到栈内存中，当a改变时，对b没有影响
例四：
a是一个对象，是引用数据类型，所以当b复制的时候是复制了a的指针，当对a和b操作时，仍然操作的是堆内存中同一对象，所以a会发生改变
例五：
这个例子看似和上面的很像但实际有很大不同，b = {b:'b'}这个操作实际上是新建了一个对象
也就是说在堆内存中新建了一个地方，来存放{b:'b'}同时将栈内存中b原来存储的指向a的指针指向了这个对象，多以a并未发生任何改变

### 如何手写一个深拷贝
```
function deepClone (obj) {
    if (typeof obj !== 'object' || obj == null) {
        return obj;
    }
    
    let deepCloneObj = Array.isArray(obj) ? [] : {}
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            deepCloneObj[key] = deepClone(obj[key]);
        }
    }
}
```
#### 参考文献
https://segmentfault.com/a/1190000008838101（重点看这篇，写的很好！）
http://blog.csdn.net/flyingpig2016/article/details/52895620
https://www.cnblogs.com/cxying93/p/6106469.html

