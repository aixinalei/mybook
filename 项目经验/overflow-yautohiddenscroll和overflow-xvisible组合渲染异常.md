最近做项目想做一个这样的效果：就是我想要内部div x轴溢出div则显示y轴溢出div则出现滚动条
于是用到了overflow-y 和 overflow-x 这个css属性
原来以为css中直接设置就ok
```
{
overflow-y：scroll;
overflow-x: visible;
}
```
但是实际情况是并不好用 会出现两边都是scroll的情况上网上查了一下解决方案，很多都说试着将overflow-x和overflow-y放在不同的DOM元素上。但是会因为实际使用情况和逻辑上的复杂程度而变得并不好用。最终解决方案如下：
** 把容器的宽度去掉，让其内容自己撑开容器，这样不会出现滚动条，和横向溢出的最终目的是一样的；然后设置纵向overflow-y:scroll即可。**
至于浏览器为什么会这样 就只搬运了 不详细解释
***
** 参考资料：**
解决方案：https://power.baidu.com/question/1110520949000857499.html?fr=iks&word=overflow-y%3Aauto%BA%CDoverflow-x%3Avisible%C9%E8%D6%B5%CE%DE%D0%A7%3F&ie=gbk
原因：http://w3help.org/zh-cn/causes/RV1001