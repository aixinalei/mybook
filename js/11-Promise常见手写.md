Promise 常见手写
===
1. 重试
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

``` js
async function asyncPool(iteratorFn, poolLimit) {
  const ret = []; // 用于存放所有的promise实例
  const executing = []; // 用于存放目前正在执行的promise
  for (const item of array) {
    const p = Promise.resolve(iteratorFn(item)); // 防止回调函数返回的不是promise，使用Promise.resolve进行包裹
    ret.push(p);
    if (poolLimit <= array.length) {
      // then回调中，当这个promise状态变为fulfilled后，将其从正在执行的promise列表executing中删除
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        // 一旦正在执行的promise列表数量等于限制数，就使用Promise.race等待某一个promise状态发生变更，
        // 状态变更后，就会执行上面then的回调，将该promise从executing中删除，
        // 然后再进入到下一次for循环，生成新的promise进行补充
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}
```

3. 多次请求结果按照顺序返回
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
                        next: fetch,
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