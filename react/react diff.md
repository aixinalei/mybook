# React Diff 算法

react diff算法网上讲解的有很多，大多数都是基于<<深入React技术栈>>进行一些简单的拓展，很多书里没有介绍到的细节也是含糊不清，本人基于网上大量文章，针对一些小细节做了一些补充。另外react diff 这个部分的原理也并不复杂还是需要简单理解的，有助于提高组件性能。希望有助于大家的阅读

## 传统diff算法
这部分简单理解即可
计算两颗树形结构差异并进行转换，传统diff算法是这样做的：循环递归每一个节点

![传统diff](img/%E4%BC%A0%E7%BB%9Fdiff.png)

比如左侧树a节点依次进行如下对比，左侧树节点b、c、d、e亦是与右侧树每个节点对比
算法复杂度能达到O(n^2)，n代表节点的个数
查找完差异后还需计算最小转换方式，最终达到的算法复杂度是O(n^3)
至于具体实现 可以参考下 这两篇论文
[https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf](https://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf)
[http://vldb.org/pvldb/vol5/p334_mateuszpawlik_vldb2012.pdf](http://vldb.org/pvldb/vol5/p334_mateuszpawlik_vldb2012.pdf)
## React diff策略
如果是传统的O(n^3)对于页面中dom结构比较复杂的情况下去实现显然是不现实的，效率会异常之低
所以React基于实际情况，做了三点假设将时间复杂度从O(n^3)降低到O(n)
* 策略一：Web UI 中 DOM 节点跨层级的移动操作特别少，可以忽略不计。
* 策略二：拥有相同类的两个组件将会生成相似的树形结构，拥有不同类的两个组件将会 生成不同的树形结构。 
* 策略三：对于同一层级的一组子节点，它们可以通过唯一 id 进行区分。 

基于以上策略，React 分别对 tree diff、component diff 以及 element diff 进行算法优化。事实 也证明这 3 个前提策略是合理且准确的，它保证了整体界面构建的性能。 

### tree diff 
基于策略一，React 对树的算法进行了简洁明了的优化，即对树进行分层比较，两棵树只会**只做同层级的比对，忽略跨层级的元素移动**。如果出现跨层级的组件操作，回直接通过先删除组件树，再在目标位置创建一个新的组件树（这有可能会造成状态的丢失）。但我们也可以思考我们平时写代码的时候，大范围的这种操作也几乎没有，所以可以忽略不计。
![react-层级变换 2](img/react-%E5%B1%82%E7%BA%A7%E5%8F%98%E6%8D%A2%202.png)

### component diff 

* 如果是同一类型（个人理解为同一class或者function）且key值相同的组件，按照原策略继续比较 Virtual DOM 树即可（这里的比较虚拟dom要更新属性事件，递归更新子组件）。
* 如果不是，则将该组件判断为 dirty component，从而**替换**整个组件下的所有子节点。 
* 对于同一类型的组件，有可能其 Virtual DOM 没有任何变化，如果能够确切知道这点，那 么就可以节省大量的 diff 运算时间。因此，React 允许用户通过 shouldComponentUpdate() 来判断该组件是否需要进行 diff 算法分析。

针对上面两点 我们可以写出伪代码来辅助理解整个diff的过程
```javascript
function diff(oldVNode, newVNode) {
    if (isSameVNode(oldVNode, newVNode)) {
        // 开始 diff
        // 	diffVNode
        ...
    } else {
        // 新节点替换旧节点
        // replaceVNode
        ...
    }
}

// 根据 type || key 判断是否为同类型节点
function isSameVNode(oldVNode, newVNode) {
    return oldVNode.key === newVNode.key && oldVNode.type === newVNode.type
}
```
那么是如何理解替换这么一个过程呢？我们看如下代码
```javascript
import React from 'react';
import Child1 from './child1';
import Child2 from './child2';
class TestDiff extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            refresh:Math.random(),
        }
    }
    render() {
        console.log('父组件渲染')
        return (
            <div>
                <button onClick={()=>{this.setState({
                    refresh:Math.random()
                })}}>重新渲染组件</button>
                <Child1 key="1"/>
                <Child2 key={
                    Math.random()
                }/>
            </div>
        );
    }
}
export default TestDiff;
// 固定key子组件1
import React from 'react';
class Child1 extends React.Component {
    componentWillUnmount() {
        console.log('固定key值子组件卸载')
    }
    render() {
        console.log('固定key值子组件1渲染')
        return (
            <div></div>
        );
    }
}
export default Child1;
// 非固定key子组件2
import React from 'react';
class Child2 extends React.Component {
    componentWillUnmount() {
        console.log('非固定key值子组件卸载')
    }
    render() {
        console.log('非固定key值子组件2渲染')
        return (
            <div></div>
        );
    }
}

export default Child2;
```
刷新的结果非常好理解，结果如下：可以看到非固定key的组件会整个组件重新渲染。另外有个有意思的点是旧组件卸载在新组件创建之后
```
父组件渲染
固定key值子组件1渲染
非固定key值子组件2渲染
(点击刷新后)
父组件渲染
固定key值子组件1渲染
非固定key值子组件2渲染
非固定key值子组件卸载
```
> **这里如果组件不给key值得话 效果等同于给定一个固定key值，是react会在组件创立时给组件生成一个默认得key**
###  element diff
对于统一类别的子组件，更新属性或者事件都比较容易理解。但是子组件列表的比对，才是diff算法的核心部分
比对同一级别得子组件使用得策略为 **两端比对算法 + Key值比对**，具体diff算法策略如下:
*   优先从新旧列表的 **两端** 的 **四个节点** 开始进行 **两两比对**；
*   如果均不匹配，则尝试 **key 值比对**；
    *   如 **key 值** 匹配上，则移动并更新节点；
    *   如 未匹配上，则在对应的位置上 **新增新节点
*   最后全部比对完后，列表中 **剩余的节点** 执行 **删除或新增**；
（如果想看具体样例请移步下方郭东东个人博客，就不进行搬运了）

** 另外关于for循环创建组件得时候我们不给key值会出现react警告得问题，网上很多时候会说影响reactdiff算法，但时基于上面样例得测试我们其实知道 react在组件刚创立得时候其实会默认给组件一个key值（react16.7），那么其实你不给key值也不影响什么性能，但是切记不要为了消除警告给随机key，根据上述算法，旧组件会被销毁，重新生成一个新的 **

举个例子
```javascript
// 父组件
import React from 'react';
import Child1 from './child1';
import Child2 from './child2';
class TestDiff extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            refresh:Math.random(),
            testList:[1,2,3]
        }
    }

    render() {
        console.log('父组件渲染')
        return (
            <div>
                <button onClick={()=>{
                let newList = JSON.parse(JSON.stringify(this.state.testList))
                newList.push(Math.random())
                this.setState({
                    refresh:Math.random(),
                    testList:newList
                })}}>重新渲染组件</button>
                {
                    this.state.testList.map((i)=>{
                        return (
                            <Child1 key={i}/>
                        )
                    })
                }
                 {
                    this.state.testList.map((i)=>{
                        return (
                            <Child2 />
                        )
                    })
                }
            </div>
        );
    }
}

export default TestDiff;
// 子组件1
import React from 'react';
class Child1 extends React.Component {
    constructor(props){
        super(props)
        console.log('固定key值子组件装载')
    }
    componentWillUnmount() {
        console.log('固定key值子组件卸载')
    }
    render() {
        console.log('固定key值子组件1渲染')
        return (
            <div>child1</div>
        );
    }
}

export default Child1;

// 子组件2
import React from 'react';
class Child2 extends React.Component {
    constructor(props){
        super(props)
        console.log('非固定key值子组件装载')
    }
    componentWillUnmount() {
        console.log('非固定key值子组件卸载');
    }

    render() {
        console.log('非固定key值子组件2渲染');
        return (
            <div>Child2</div>
        );
    }
}

export default Child2;
```

测试得结果如下:
```
页面加载时
固定key值子组件装载
固定key值子组件1渲染
固定key值子组件装载
固定key值子组件1渲染
固定key值子组件装载
固定key值子组件1渲染
非固定key值子组件装载
非固定key值子组件2渲染
非固定key值子组件装载
非固定key值子组件2渲染
非固定key值子组件装载
非固定key值子组件2渲染
重新加载时
父组件渲染
3 *固定key值子组件1渲染
固定key值子组件装载
 固定key值子组件1渲染
3 *非固定key值子组件2渲染
非固定key值子组件装载
 非固定key值子组件2渲染
```
可以看到有固定key和没有key是一样得

## 参考文章
深入React技术栈
[郭东东个人博客](https://github.com/xd-tayde/blog/blob/master/ReactGL-1.md)

