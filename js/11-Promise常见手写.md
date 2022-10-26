Promise 常见手写

**首先做个总结，凡是跟promise相关的手写，返回值一定是个promise**

===
1. 重试

思路： 重试和all基本是最简单的了。随便网上抄了一个
```js
Promise.retry = (fn, options = {}) => {

  if (!isFunction(fn)) throw new Error('fn is not a function')
  
  const { max = 3, delay = 0 } = options
  let curMax = max
  const delayExec = () => delay && new Promise(resolve => setTimeout(resolve, delay))

  return new Promise(async (resolve, reject) => {
    while (curMax > 0) {
      try {
        const res = await fn()
        resolve(res)
        return
      } catch (error) {
        await delayExec()
        curMax--
        console.warn(`剩余次数${curMax}`)
        if (!curMax) reject(error)
      }
    }
  })
}

```

2. promise 实现一个最大并发

思路：这个东西乍一看还不太好在面试当中写出来，写法思路可能有很多，说下我的思路
* 注意返回值仍然是个promise 用来处理异步错误异常捕获以及回调
* 用变量记录当前pending队列 每次执行请求时向pending队列中加入一个等待执行函数
* 用变量记录当前执行中的函数数量，如果请求数没超过当前限制，触发请求，每次执行请求时+1 
* 实现一个迭代执行函数，实现就是从pending队列中取一个出来执行，执行后判断队列中是否还有没执行的，有的话继续调用。

```js
function asyncPool(promiseFn, limit) {
  // 记录当前请求数
  let currentRunFnNum = 0;
  // 记录当前pending队列
  let pendingList = [];
  
  function run() {
      const [runTask,resolve, reject, ...params] = pendingList.shift();
      runTask(...params).then((res)=>{
          resolve(res)
          currentRunFnNum -= 1;
          if(pendingList.length >0) {
              run(resolve, reject)
          }
      }).catch(reject);
    
    
  }

  return (...params) => new Promise((resolve, reject) => {
       pendingList.push([
           promiseFn,
           resolve, reject,
           ...params,
       ]);
       if(currentRunFnNum < limit) {
           currentRunFnNum +=1;
           run()
       }
      
  });

}

```


3. 多次请求结果按照顺序返回

思路： 考这个就有点变态了其实，至今没遇到。这个是我在实际工作中写的代码 直接粘过来了
思路的话就是每次请求时记录一个自增的请求ID 以及当前的返回状态 默认为false
请求结束后，向前遍历是否有没有请求回结果的函数。如果有，那么说明你要等待，将你的状态改为请求结束，同时保存响应结果以及resolve；如果你的id小于 状态记录长度，说明你后面有请求了，向后访问一个，执行其回调

``` ts
interface asyncOpHistoryItem {
    fetchId: number;
    isResolve: boolean;
    result?: any;
    next?: (res: any) => void;
}

type PromiseFunction = (...props: any[]) => Promise<unknown>;

function asyncOrderWrapper<T extends PromiseFunction>(fetch: T): T {
    const asyncOpHistory: asyncOpHistoryItem[] = [];
    const result = (...props: any[]) => {
        const fetchId = asyncOpHistory.length + 1;
        asyncOpHistory.push({
            fetchId,
            isResolve: false,
        });
        const resultUtil = (res: any, resolve: any) => {
            // 请求结束判断数组前是否有没有resolve的Promise
            for (let i = 0; i < fetchId - 1; i += 1) {
                if (asyncOpHistory[i].isResolve === false) {
                    // 说明有那么带着返回结果等待执行
                    asyncOpHistory[fetchId - 1] = {
                        fetchId,
                        isResolve: true,
                        result: res,
                        next: resolve,
                    };
                    return;
                }
            }

            // 没有 那么就直接resolve
            asyncOpHistory[fetchId - 1] = {
                fetchId,
                isResolve: true,
            };
            resolve(res);
            // 如果当前id 小于数组长度 说明后面有请求请求完了等你呢。
            let loopIndex = fetchId;
            let needLoop = true;
            while (loopIndex < asyncOpHistory.length && needLoop) {
                loopIndex += 1;
                const tempObj = asyncOpHistory[loopIndex - 1];
                if (tempObj.isResolve && tempObj.next) {
                    tempObj.next(tempObj.result);
                    asyncOpHistory[loopIndex - 1] = {
                        fetchId: loopIndex,
                        isResolve: true,
                    };
                } else {
                    needLoop = false;
                }
            }
        };
        // console.log(asyncOpHistory)
        return new Promise((resolve, reject) => {
            fetch(...props).then((res: any) => {
                resultUtil(res, resolve);
            }).catch((res: any) => {
                resultUtil(res, reject);
            });
        });
    };
    return result as T;
}
```

4. Promise.all
```ts

Promise.myAll = (PromiseFnList: (...params: any)=>Promise) => {
  let returnData = [];
  return new Promise((resolve, reject)=>{
    PromiseList.map((i, index) => {
  
      Pomise.resolve(i).then((res)=>{
        returnData[index] = res;

        // 每次请求结束后校验是否所有结果都返回了
        let canResolve = true;
        for(i=0;i<PromiseList.length;i+=1) {
            if(!returnData[i]) {
              canResolve = false
            }
        }
        if(canResolve) resolve(returnData)；
      }).catch(reject)
    })
  })
}

```

all 的话还有个类似于2的变种，限制同时并发请求数，比2简单

思路通
``` js
function asyncPool(promiseFnList, limit) {

  return new Promise((resolve, reject) =>{ 
        let returnValue = [];
        let currentRunIndex = -1;
        function run() {
            currentRunIndex+=1
            promiseFnList[currentRunIndex]().then(res=>{
                returnValue[currentRunIndex] = res;
                if(returnValue.length === promiseFnList && !returnValue.find(n=>!!n)){
                    // 说明所有的请求运行完毕 结果都在请求中
                    resolve(returnValue)
                }
                if(currentRunIndex < promiseFnList.length) {
                    // 此时说明有一个函数执行结束，但是仍有请求没执行完
                    run()
                }
            }).catch(reject)
        }
        promiseFnList.slice(0, limit).map(i=>{
            run()
        })
  });

}
```
5. Promise.race


```ts
Promise.myRace = (PromiseFnList: (...params: any)=>Promise) => {
  return new Promise((resolve, reject)=>{
    // done 用来销毁二次返回
    let done = false;
    PromiseFnList.forEach(item => {
        //如果不是MyPromise对象，需要转换
        Promise.resolve(item).then(res => {
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

6. Promise 实现一个sleep函数

```js
let sleep = (time) => {
    return new Promise((res)=>{
        setTimeout(()=>{
            console.log('执行成功', tiem);
            res();
        }, time)
    })
};
```