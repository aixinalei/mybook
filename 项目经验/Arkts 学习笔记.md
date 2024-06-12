ArkTs学习笔记
===

1. 如何写组件
通过@Component 定义struct结构体这种写法来定义组件 build() 方法类似于react 中的render函数
@Component
struct HelloComponent {
  @State message: string = 'Hello, World!';

  build() {
    // HelloComponent自定义组件组合系统组件Row和Text
    Row() {
      Text(this.message)
        .onClick(() => {
          // 状态变量message的改变驱动UI刷新，UI从'Hello, World!'刷新为'Hello, ArkUI!'
          this.message = 'Hello, ArkUI!';
        })
    }
  }
}
2. 样式如何书写
特殊的方法，以及链式调用的写法
3. 组件之间如何传参（感觉很像vue）
  1. 组件内state
  2. 父子：props 传递，或者link 双向绑定
  3. 跨层级
  4. 监听变量变化 @watch
4. router的区别
  - router.pushUrl()：目标页不会替换当前页，而是压入页面栈。这样可以保留当前页的状态，并且可以通过返回键或者调用router.back()方法返回到当前页。
  - router.replaceUrl()：目标页会替换当前页，并销毁当前页。这样可以释放当前页的资源，并且无法返回到当前页。
  - const params = router.getParams()
5. 手势和布局的区别
额外多了stack布局这种
6. 数据的持久化
  - LocalStorage：页面级UI状态存储，通常用于UIAbility内、页面间的状态共享。
  - AppStorage：特殊的单例LocalStorage对象，由UI框架在应用程序启动时创建，为应用程序UI状态属性提供中央存储；
  - PersistentStorage：持久化存储UI状态，通常和AppStorage配合使用，选择AppStorage存储的数据写入磁盘，以确保这些属性在应用程序重新启动时的值与应用程序关闭时的值相同；
  - Environment：应用程序运行的设备的环境参数，环境参数会同步到AppStorage中，可以和AppStorage搭配使用。
7. 生命周期
  页面生命周期，即被@Entry装饰的组件生命周期，提供以下生命周期接口：
  - onPageShow：页面每次显示时触发一次，包括路由过程、应用进入前台等场景。
  - onPageHide：页面每次隐藏时触发一次，包括路由过程、应用进入后台等场景。
  - onBackPress：当用户点击返回按钮时触发。
  组件生命周期，即一般用@Component装饰的自定义组件的生命周期，提供以下生命周期接口：
  - aboutToAppear：组件即将出现时回调该接口，具体时机为在创建自定义组件的新实例后，在执行其build()函数之前执行。
  - aboutToDisappear：在自定义组件析构销毁之前执行。不允许在aboutToDisappear函数中改变状态变量，特别是@Link变量的修改可能会导致应用程序行为不稳定。
8. 请求
https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V2/http-request-0000001478061585-V2