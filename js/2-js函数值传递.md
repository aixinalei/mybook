# js 函数值传递

**如果参数为原始类型，则js创建一个隐性复制，传入函数中，函数内部修改值不影响外部对象；如果参数为对象类型，则传入对象指针的复制**（不理解指针的看前篇）

前者比较好理解，重点以例子讲解后者

```
function test(person) { 
  person.age = 26 
  person = { name: 'yyy', age: 30 } 
  return person 
} 
const p1 = { name: 'yck', age: 25 } 
const p2 = test(p1) 
console.log(p1) // -> ?  
console.log(p2) // -> ?
```

1. 首先函数传递的参数为对象时，传递的是对象指针的复制。也就是说虽然内存中有两个person，但指向的数据都是同一个
2. perseon.age = 26并没有改变指针指向 直接修改内部值 所以 原始对象也被改变
3. person = {name: 'yyy', age: 30 } 相当于通过new Object() 创建一个新的对象 该指针的指向改变，不再指向原对象 而是一个新对象。
4. 所以p1为{ name: 'yck', age: 26 }  p2为{ name: 'yyy', age: 30 } 