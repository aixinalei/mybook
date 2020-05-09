# setState原理解析
简述setState执行过程，具体源码解析可以根据此文章看《深入React技术栈》
1. 首先react有事务得概念 类似于生命周期，将自定义函数 传入事务封装函数中 执行被封装得自定义函数时回先执行 封装事务时定义得init方法 然后在执行自定义函数 再执行close方法（开始 执行 结束）
2. 当我们调用setState过程中，我们往往是在生命周期函数或者是react封装得事件当中，当react组件处于此状态当中时，组件在虚拟dom中具有属性是否正在批量更新 ```isBatchingUpdates``` 设置为true
3 接着我们去执行setState setState也时被事务封装过得 他会先判断组件是否在处于正在更新 如果是true就该state放到批量更新队列当中。同时将回调放入回调队列.如果不是正在更新中 就直接执行
4 接着执行 上一个事务得close 将正在批量更新属性设置为false
5 紧接着执行setState 事务中得close 既队列执行批量更新队列

这也就解释了为什么异步函数中的setState会变直接执行。因为此时上一个事务已经执行结束，所以此时isBatchingUpdates已经是false 所以就会直接执行



