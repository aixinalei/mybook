single-spa源码分析
===

作用：
它就是一个子应用加载器 + 状态机的结合体，而且具体怎么加载子应用还是基座应用提供的；框架里面维护了各个子应用的状态，以及在适当的时候负责更改子应用的状态、执行相应的生命周期函数


### 实现流程

1. 注册子应用

    实现非常简单 就是向一个全局的apps数组里面添加应用对象。添加应用时顺便给应用一些初始状态
    ``` js
    apps.push(
        // 给每个应用增加一个内置属性
        assign(
          {
            loadErrorTime: null,
            // 最重要的，应用的状态
            status: NOT_LOADED,
            parcels: {},
            devtools: {
              overlays: {
                options: {},
                selectors: [],
              },
            },
          },
          registration
        )
      );
    ```

2. 核心函数reroute
   ``` js
    /**
     * 每次切换路由前，将应用分为4大类，
     * 首次加载时执行loadApp
     * 后续的路由切换执行performAppChange
     * 为四大类的应用分别执行相应的操作，比如更改app.status，执行生命周期函数
     * 所以，从这里也可以看出来，single-spa就是一个维护应用的状态机
     * @param {*} pendingPromises 
     * @param {*} eventArguments 
     */
    export function reroute(pendingPromises = [], eventArguments) {
      // 应用正在切换，这个状态会在执行performAppChanges之前置为true，执行结束之后再置为false
      // 如果在中间用户重新切换路由了，即走这个if分支，暂时看起来就在数组中存储了一些信息，没看到有什么用
      // 字面意思理解就是用户等待app切换
      if (appChangeUnderway) {
        return new Promise((resolve, reject) => {
          peopleWaitingOnAppChange.push({
            resolve,
            reject,
            eventArguments,
          });
        });
      }

      // 将应用分为4大类
      const {
        // 需要被移除的
        appsToUnload,
        // 需要被卸载的
        appsToUnmount,
        // 需要被加载的
        appsToLoad,
        // 需要被挂载的
        appsToMount,
      } = getAppChanges(); // 内部就是通过获取当前apps状态来判断的

      let appsThatChanged;

      // 是否已经执行 start 方法
      if (isStarted()) {
        // 已执行
        appChangeUnderway = true;
        // 所有需要被改变的的应用
        appsThatChanged = appsToUnload.concat(
          appsToLoad,
          appsToUnmount,
          appsToMount
        );
        // 执行改变
        return performAppChanges();
      } else {
        // 未执行
        appsThatChanged = appsToLoad;
        // 加载Apps
        return loadApps();
      }

      // 整体返回一个立即resolved的promise，通过微任务来加载apps
      function loadApps() {
        return Promise.resolve().then(() => {
          // 加载每个子应用，并做一系列的状态变更和验证（比如结果为promise、子应用要导出生命周期函数）
          const loadPromises = appsToLoad.map(toLoadPromise);

          return (
            // 保证所有加载子应用的微任务执行完成
            Promise.all(loadPromises)
              .then(callAllEventListeners)
              // there are no mounted apps, before start() is called, so we always return []
              .then(() => [])
              .catch((err) => {
                callAllEventListeners();
                throw err;
              })
          );
        });
      }

      function performAppChanges() {
        return Promise.resolve().then(() => {
          // https://github.com/single-spa/single-spa/issues/545
          // 自定义事件，在应用状态发生改变之前可触发，给用户提供搞事情的机会
          window.dispatchEvent(
            new CustomEvent(
              appsThatChanged.length === 0
                ? "single-spa:before-no-app-change"
                : "single-spa:before-app-change",
              getCustomEventDetail(true)
            )
          );

          window.dispatchEvent(
            new CustomEvent(
              "single-spa:before-routing-event",
              getCustomEventDetail(true)
            )
          );
          // 移除应用 => 更改应用状态，执行unload生命周期函数，执行一些清理动作
          // 其实一般情况下这里没有真的移除应用
          const unloadPromises = appsToUnload.map(toUnloadPromise);

          // 卸载应用，更改状态，执行unmount生命周期函数
          const unmountUnloadPromises = appsToUnmount
            .map(toUnmountPromise)
            // 卸载完然后移除，通过注册微任务的方式实现
            .map((unmountPromise) => unmountPromise.then(toUnloadPromise));

          const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);

          const unmountAllPromise = Promise.all(allUnmountPromises);

          // 卸载全部完成后触发一个事件
          unmountAllPromise.then(() => {
            window.dispatchEvent(
              new CustomEvent(
                "single-spa:before-mount-routing-event",
                getCustomEventDetail(true)
              )
            );
          });

          /* We load and bootstrap apps while other apps are unmounting, but we
          * wait to mount the app until all apps are finishing unmounting
          * 这个原因其实是因为这些操作都是通过注册不同的微任务实现的，而JS是单线程执行，
          * 所以自然后续的只能等待前面的执行完了才能执行
          * 这里一般情况下其实不会执行，只有手动执行了unloadApplication方法才会二次加载
          */
          const loadThenMountPromises = appsToLoad.map((app) => {
            return toLoadPromise(app).then((app) =>
              tryToBootstrapAndMount(app, unmountAllPromise)
            );
          });

          /* These are the apps that are already bootstrapped and just need
          * to be mounted. They each wait for all unmounting apps to finish up
          * before they mount.
          * 初始化和挂载app，其实做的事情很简单，就是改变app.status，执行生命周期函数
          * 当然这里的初始化和挂载其实是前后脚一起完成的(只要中间用户没有切换路由)
          */
          const mountPromises = appsToMount
            .filter((appToMount) => appsToLoad.indexOf(appToMount) < 0)
            .map((appToMount) => {
              return tryToBootstrapAndMount(appToMount, unmountAllPromise);
            });

          // 后面就没啥了，可以理解为收尾工作
          return unmountAllPromise
            .catch((err) => {
              callAllEventListeners();
              throw err;
            })
            .then(() => {
              /* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
              * events (like hashchange or popstate) should have been cleaned up. So it's safe
              * to let the remaining captured event listeners to handle about the DOM event.
              */
              callAllEventListeners();

              return Promise.all(loadThenMountPromises.concat(mountPromises))
                .catch((err) => {
                  pendingPromises.forEach((promise) => promise.reject(err));
                  throw err;
                })
                .then(finishUpAndReturn);
            });
        });
      }
    }

   ```

补充：路由劫持
https://juejin.cn/post/7074172393001861133