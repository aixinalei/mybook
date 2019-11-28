promise
===

## 1.简介：
`promise`是一个对象，更合理的解决异步编程的问题。避免了传统使用回调函数的方式解决异步
`Promise`对象有以下两个特点。

（1）对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是`Promise`这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。`Promise`对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对`Promise`对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

## 2.API基本用法：
* 基本创建
`Promise`构造函数接受一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`。它们是两个函数，由 Promise对象提供。
`resolve`函数的作用是，将`Promise`对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；`reject`函数的作用是，将`Promise`对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。
代码示例：
	```javascript
	const promise = new Promise(function(resolve, reject) {
	  // ... some code
	
	  if (/* 异步操作成功 */){
	    resolve(value);
	  } else {
	    reject(error);
	  }
	});
	```
* Promise.prototype.then
`then`方法的第一个参数是`resolved`状态的回调函数，第二个参数（可选）是`rejected`状态的回调函数。
`then`方法返回的是一个新的`Promise`实例（注意，不是原来那个`Promise`实例）。因此可以采用链式写法，即`then`方法后面再调用另一个`then`方法。
* Promise.prototype.catch
`Promise.prototype.catch`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。
* Promise.prototype.finally
`finally`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。
* Promise.all
`Promise.all()`方法用于将多个 Promise 实例，包装成一个新的 Promise 实例,`Promise.all()`方法接受一个promise数组作为参数，
新的Promise示例的状态设置如下：
`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。
（1）只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。
（2）只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。
注意，如果作为参数的 Promise 实例，自己定义了`catch`方法，那么它一旦被`rejected`，并不会触发`Promise.all()`的`catch`方法。
* Promise.race()
`Promise.race()`方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。只不过新的Promise实例的状态变化是根据多个Promise实例中率先变化的实例来定义的。率先变化的Promise实例变化

## 3.简单实现：
这里只实现一个基本具有支持异步处理与链式调用以下特定的promise
* 思路简述：
	* 定义MyPromise类
	*   构造函数传入回调函数 `callback` 。当新建 `MyPromise` 对象时，我们需要运行此回调，并且 `callback` 自身也有两个参数，分别是 `resolve` 和 `reject` ，他们也是回调函数的形式；
	*   定义了几个变量保存当前的一些结果与状态、事件队列，见注释；*   执行函数 `callback` 时，如果是 `resolve` 状态，将结果保存在 `this.__succ_res` 中，状态标记为成功；如果是 `reject` 状态，操作类似；
	*   同时定义了最常用的 `then` 方法，是一个原型方法；
	*   执行 `then` 方法时，判断对象的状态是成功还是失败，分别执行对应的回调，把结果传入回调处理；*   这里接收 `...arg`和传入参数 `...this.__succ_res` 都使用了扩展运算符，为了应对多个参数的情况，原封不动地传给 `then` 方法回调。
	*  then方法是要等待异步处理的结果结束而结束，此时使用事件队列及promise的状态，当promise的状态是`success`时，执行`resolve`如果是`error`执行`reject`，否则将then方法传进来的回调函数传递至事件队列等待promise传入的回调函数执行执行。
   *  then方法返回的也要是一个promise对象，这样才能支持链式调用

* 具体代码：
``` javascript
class MyPromise {
    constructor(fn) {
        this.__succ_res = null;     //保存成功的返回结果
        this.__err_res = null;      //保存失败的返回结果
        this.status = 'pending';    //标记处理的状态
        this.__queue = [];          //事件队列
        //箭头函数绑定了this，如果使用es5写法，需要定义一个替代的this
        fn((...arg) => {
            this.__succ_res = arg;
            this.status = 'success';
            this.__queue.forEach(json => {
                json.resolve(...arg);
            });
        }, (...arg) => {
            this.__err_res = arg;
            this.status = 'error';
            this.__queue.forEach(json => {
                json.reject(...arg);
            });
        });
    }
	then(onFulfilled, onRejected) {
	    return new MyPromise((resFn, rejFn) => {
	        if (this.status === 'success') {
	            handle(...this.__succ_res);
	        } else if (this.status === 'error') {
	           errBack(...this.__err_res);									
	        } else {
	           this.__queue.push({resolve: handle, reject: errBack});			
	        };
	        function handle(value) {
	            //then方法的onFulfilled有return时，使用return的值，没有则使用保存的值
	            let returnVal = onFulfilled instanceof Function && onFulfilled(value) || value;
	            //如果onFulfilled返回的是新MyPromise对象或具有then方法对象，则调用它的then方法
	            if (returnVal && returnVal['then'] instanceof Function) {
	                returnVal.then(res => {
	                    resFn(res);
	                }, err => {
	                    rejFn(err);
	                });
	            } else {//其他值
	                resFn(returnVal);
	            };
	        };
	        function errBack(reason) {										//++
		        if (onRejected instanceof Function) {
		        	//如果有onRejected回调，执行一遍
		            let returnVal = onRejected(reason);
		            //执行onRejected回调有返回，判断是否thenable对象
		            if (typeof returnVal !== 'undefined' && returnVal['then'] instanceof Function) {
		                returnVal.then(res => {
		                    resFn(res);
		                }, err => {
		                    rejFn(err);
		                });
		            } else {
		                //无返回或者不是thenable的，直接丢给新对象resFn回调
		                resFn(returnVal);				//resFn，而不是rejFn
		            };
		        } else {//传给下一个reject回调
		            rejFn(reason);
		        };
	        };
	    })
	}

};


```
## 4.相关面试
* 使用promise封装基本ajax
	 * 思路简述：
		一个返回promise对象的函数，函数内部使用js中XMLHttpRequest对象来实现。其中xhr中open来创建一个实际的ajax请求、
		onloadend来监听ajax请求结束，将返回结果传入promise中的resolve方法，其他监听失败的函数将返回的错误信息传入promise的reject方法
	 * 具体代码：
	```javascript
	function ajaxMise(url, method, data, async, timeout)
	 { 
		var xhr = new XMLHttpRequest()
		return new Promise(function (resolve, reject) {
			xhr.open(method, url, async);
			xhr.timeout = options.timeout;
			xhr.onloadend = function () { 
			if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) resolve(xhr); 
			else reject({ errorType: 'status_error', xhr: xhr }) } 
			xhr.send(data); 
			//错误处理 
			xhr.onabort = function () { 
			 reject(new Error({ errorType: 'abort_error', xhr: xhr })); 
			}
			xhr.ontimeout = function () {
			 reject({ errorType: 'timeout_error', xhr: xhr }); 
			} 
			xhr.onerror = function () {
			 reject({ errorType: 'onerror', xhr: xhr }) 
			} 
		}) 
	}
	```
* 实现一个简单Promise.resolve() Promise.reject()
	* 思路简介：
	   因为其它方法对`MyPromise.resolve()`方法有依赖，所以先实现这个方法。 先要完全弄懂`MyPromise.resolve()`方法的特性，研究了阮一峰老师的[ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/promise#Promise-resolve)对于`MyPromise.resolve()`方法的描述部分，得知，这个方法功能很简单，就是把参数转换成一个`MyPromise`对象，关键点在于参数的形式，分别有：
	
	*   参数是一个 `MyPromise` 实例；
	*   参数是一个`thenable`对象；
	*   参数不是具有`then`方法的对象，或根本就不是对象；
	*   不带有任何参数。
	
	处理的思路是：
	
	*   首先考虑极端情况，参数是undefined或者null的情况，直接处理原值传递；
	*   其次，参数是`MyPromise`实例时，无需处理；
	*   然后，参数是其它`thenable`对象的话，调用其`then`方法，把相应的值传递给新`MyPromise`对象的回调；
	*   最后，就是普通值的处理。
	
	`MyPromise.reject()`方法相对简单很多。与`MyPromise.resolve()`方法不同，`MyPromise.reject()`方法的参数，会原封不动地作为`reject`的理由，变成后续方法的参数。

	* 具体代码：
	``` javascript
	MyPromise.resolve = (arg) => {
	    if (typeof arg === 'undefined' || arg == null) {//无参数/null
	        return new MyPromise((resolve) => {
	            resolve(arg);
	        });
	    } else if (arg instanceof MyPromise) {
	        return arg;
	    } else if (arg['then'] instanceof Function) {
	        return new MyPromise((resolve, reject) => {
	            arg.then((res) => {
	                resolve(res);
	            }, err => {
	                reject(err);
	            });
	        });
	    } else {
	        return new MyPromise(resolve => {
	            resolve(arg);
	        });
	    }
	};
	MyPromise.reject = (arg) => {
	    return new MyPromise((resolve, reject) => {
	        reject(arg);
	    });
	};
	```
* 实现一个简单Promise.all()与Promise.race()
	* 思路简介：
	 首先Promise.all()的调用方式为Promise对象直接调用，所以不用挂载再Promise.prototype上。其次，都要传入一个promise数组。all是等待全部Promise对象执行完毕后，将所有promise的返回合并成一个数组统一返回，顺序跟iterable的顺序保持一致。**`Promise.race(iterable)` **方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。
	* 具体代码：
	```javascript
	MyPromise.all = (arr) => {
	    if (!Array.isArray(arr)) {
	        throw new TypeError('参数应该是一个数组!');
	    };
	    return new MyPromise(function(resolve, reject) {
	        let i = 0, result = [];
	        next();
	        function next() {
	            //如果不是MyPromise对象，需要转换
	            MyPromise.resolve(arr[i]).then(res => {
	                result.push(res);
	                i++;
	                if (i === arr.length) {
	                    resolve(result);
	                } else {
	                    next();
	                };
	            }, reject);
	        };
	    })
	};
	MyPromise.race = arr => {
	    if (!Array.isArray(arr)) {
	        throw new TypeError('参数应该是一个数组!');
	    };
	    return new MyPromise((resolve, reject) => {
	        let done = false;
	        arr.forEach(item => {
	            //如果不是MyPromise对象，需要转换
	            MyPromise.resolve(item).then(res => {
	                if (!done) {
	                    resolve(res);
	                    done = true;
	                };
	            }, err => {
	                if (!done) {
	                    reject(err);
	                    done = true;
	                };
	            });
	        })
	    })
	
	}
	
	```

### 参考文献
[阮一峰老师es6文档](http://es6.ruanyifeng.com/#docs/promise)
[Promise详解](https://juejin.im/post/5b2a422bf265da59810b677c#heading-5)
[Promise实现](https://juejin.im/post/5bfc9e4ee51d451dca4794af#heading-6)

