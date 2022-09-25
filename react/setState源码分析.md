# setState原理解析
简述setState执行过程，具体源码解析可以根据此文章看《深入React技术栈》
本文不适用于js初学者 起码需要知道 闭包 立即执行函数 js事件队列等概念再进行阅读

## 原理简述
1. 首先react有事务得概念， 类似于生命周期。将自定义函数 传入事务封装函数中 执行被封装得自定义函数时回先执行 封装事务时定义得init方法 然后在执行自定义函数 再执行close方法（开始 执行 结束）
2. 当我们调用setState过程中，我们往往是在生命周期函数或者是react封装得事件当中，当react组件处于此状态当中时，组件在虚拟dom中具有属性是否正在批量更新 ```isBatchingUpdates``` 设置为true
3. 接着我们去执行setState setState也时被事务封装过得 他会先判断组件是否在处于正在更新 如果是true就该state放到批量更新队列当中。同时将回调放入回调队列.如果不是正在更新中 就直接执行
4. 接着执行上一个事务得close 将正在批量更新属性设置为false
5. 执行setState 事务中得close 既队列执行批量更新队列

这也就解释了为什么异步函数中的setState会变直接执行。因为此时上一个事务已经执行结束，所以此时isBatchingUpdates已经是false 所以就会直接执行
## 样例代码分析
```
import React from 'react';
class ClassComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 1
        }
    }
    componentDidMount() {
        console.log('类组件state初始值', this.state.count)
        this.setState({count: 2})
        console.log('类组件第一个state', this.state.count)
        setTimeout(() => {
            console.log('类组件第二个state',this.state.count);
            this.setState({count: 3})
            console.log('类组件第三个state',this.state.count);
            this.setState({count: 4})
            console.log('类组件第四个state',this.state.count);
        }, 0)
        setTimeout(() => {
            console.log('类组件第五个state',this.state.count);
            this.setState({count: 5})
            console.log('类组件第六个state',this.state.count);
            this.setState({count: 6})
            console.log('类组件第七个state',this.state.count);
        }, 0)
        this.setState({count: 7})
        console.log('类组件第八个setState', this.state.count)
    }

    render() {
        console.log('类组件渲染')
        return (
          <div>
            <div>
                类组件最终显示结果 {
                this.state.count
            } </div>
            </div>
        );
    }
}

export default ClassComponent;
```
控制台打印结果
```
        类组件渲染
        类组件state初始值 1
        类组件第一个state 1
        类组件第八个setState 1
        类组件渲染
        类组件第二个state 7
        类组件渲染
        类组件第三个state 3
        类组件渲染
        类组件第四个state 4
        类组件第五个state 4
        类组件渲染
        类组件第六个state 5
        类组件渲染
        类组件第七个state 6
```
至于为什么显示这些，自行套入原理中所述过程

## React hocks 中不一样的表现

但是类似代码用react hocksapi重新实现一遍 会有不一样表现
```
import React ,{useState,useEffect} from 'react';

export default function TestReactHock(){
const [count,setCount] = useState('1');
useEffect(()=>{
    console.log('纯组件state初始值', count)
    setCount(2)
    console.log('纯组件第一个state', count)
    setTimeout(() => {
        console.log('纯组件第二个state', count);
        setCount(3)
        console.log('纯组件第三个state', count);
        setCount(4)
        console.log('纯组件第四个state', count);
    }, 0)

    setTimeout(() => {
        console.log('纯组件第五个state', count);
        setCount(5)
        console.log('纯组件第六个state', count);
        setCount(6)
        console.log('纯组件第七个state', count);
    }, 0)
    setCount( 7)
    console.log('纯组件第八个setState', count);
},[])

console.log('纯组件渲染',count);
    return (
        <div>
            最终的结果是{count}
        </div>
    )
}
```
最终结果为
```
      纯组件渲染<br/>

            纯组件state初始值 1<br/>

            纯组件第一个state 1<br/>

            纯组件第八个setState 1<br/>

            纯组件渲染<br/>

            纯组件第二个state 1<br/>

            纯组件渲染<br/>

            纯组件第三个state 1<br/>

            纯组件渲染<br/>

            纯组件第四个state 1<br/>

            纯组件第五个state 1<br/>

            纯组件渲染<br/>

            纯组件第六个state 1<br/>

            纯组件渲染<br/>

            纯组件第七个state 1<br/>
```
** 可以看到 再react hocks 中的useEffect中 无论是同步还是异步函数中 获取到的state或者props值都是最开始传入的state 或者props**
** 除此之外 再更新逻辑上和类组件并无异同**

## 问题原因
实际上useEffect传入的函数 中的state值是通过闭包的形式传入的，我这里简单实现了一个版本
```
var c = 0; // 理解为state
function setC(newC){

    c = newC
} // 理解为setState
function b(){ // b是useEffect

 (function dd(i) { // dd(i) 就是给effect传入的函数
         setTimeout(function() {
           
           setC(2)
             console.log(i)
         }, 0);
         setTimeout(function() {

             setC(3)
             console.log(i)
         }, 0);
     })(c); // 用闭包的形式传入i
}
b()
console.log(c)
```
结果就是 00 3