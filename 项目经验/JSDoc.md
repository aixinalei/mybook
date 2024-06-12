JSDoc 简单入门
---


背景：svelte/kit已经开始使用jsdoc 来代替 ts。在未来svelte 也有可能将整个ts 替换为jsdoc
那么svelte 也是前端领域里一款崭新且令很多人关注的前端框架，他使用了什么技术栈，当然是值得关注的。
众所周知 ts在前端领域里 非常的重要，所以这个东西使我好奇，什么是jsdoc，并且他们为什么要用这个东西来替换他

什么是jsdoc 
JSDoc（Javascript Doc），通过注释的方式，为 JS 函数或是变量提供类型提示，配合工具或 IDE 还能完成类型校验的功能。
   我们先通过这么一段基础的使用例子来快速的有个感觉 
   1. 基础对象
 /**
  * SendMessageOptions describes different possibility on how to construct message
  * @typedef SendMessageOptions
  * @property {string} topic mail topic/header/name
  * @property {string} text mail body
  * @property {string} toEmail main recepient email
  * @property {string[]} [cc] list of additional recepients. If not specified, message will be send only to main recepient
  * @property {Date} [sendOnDate] send message with delay. If not specified, message will be send without any delays
  * @property {boolean} [noResponse=false] if true, receiver will be placed in spam. No response will be received
  */

 /** @type {SendMessageOptions} */
 const opts = {
   topic: 'topic',
   text: 'text',
   toEmail: 'receiver@mail',
   noResponse: true,
 }
     

   2. 基础函数
  /**
   * Calculates is it cold outside on specific geo lat/long 
  * @param {number} lat
  * @param {number} long
  * @return {boolean} approximtion of the temperature
  */
  const isColdOutside = (lat, long) => Math.random() * lat / long > 5.5
   3. 组合使用

 /**
   * @typedef {'ally' | 'enemy'} PlayerType
   *
   * @typedef Player
   * @property {PlayerType} type
 */

 /** @type {Player[]} */
 const players = [
     {
        type: 'ally',
     }
 ]


   4. 导入导出 
Use @import to get @typedef from another file
/** @type {number}  AnoterNumber */
 const x = 1
/** @type {import('./with-type').AnotherNumber} */
  module.exports = {}

   5. 使用第三方提供的ts With 3-rd party types
  const moment = require('moment')

  /**
  * @typedef Mail
  * @property {import('moment').Moment} sentAt
  */

  /** @type {Mail} */
  const mail = {}

   6. ts默认支持jsdoc语法(当然不是全部支持)，所以ts中同样可以书写jsdoc。于此同时如果我们这个包是完全由jsdoc写的，别人项目是ts 
 /**
   * @typedef Person
  * @property {string} name
  * @property {string} city
  */
/** @param {import('./test').Person}  */

  const a: Person = {
     
  }
   7. 支持react
  import React from "react"
  import PropTypes from "prop-types"

  /**
  * Component for showing details of the user.
  *
  * @component
  * @example
  * const age = 21
  * const name = 'Jitendra Nirnejak'
  * return (
  *   <User age={age} name={name} />
  * )
  */
  const User = props => {
  const { name, age } = props
  return (
     <p>
        {name} is {age} years old.
     </p>
  )
  }

  User.propTypes = {
     /**
        * User's name
        */
     name: PropTypes.string.isRequired,
     /**
        * User's age
        */
     age: PropTypes.number,
     }

     User.defaultProps = {
     text: "Jitendra Nirnejak",
     age: 21,
  }

  export default User

使用jnpm 包jsdoc 基于jsdoc生成文档
它可以根据我们上面的代码去自动的生成类型提示文档，并且直接访问源码。并且他在生成文档的时候也会有类型检查 
安装 
npm install -g  jsdoc
文档生成
     jsdoc yourJavaScriptFile.js

由于有命令行的支持，我们也可以使通过流水线等手段自动的去生成文档，摆脱我们对文档的书写并且他也支持自定义模板满足我们个性化开发的需要
 
Jsdoc 优缺点

优势：
 1.  几乎所有主流浏览器都默认支持了jsdoc 已经属于前端的一种稳定的标准方案,甚至ts也支持兼容这种语法
2. 开箱即用，几乎没有额外配置，当然如果在实际项目中，你也无可避免的去学习一些配置上的东西
3. 生成文档很方便

缺点：
1. 有学习成本，且语法奇怪
2. 目前完全使用的jsdoc 代替ts的较少

其他周边
- jsdoc-to-markdown
- Integrating GitBook with JSDoc
一些个人观点
1.  jsdoc 在书写上比ts 更长。但是我们知道我们一天产出有效代码行数并不会随着这些注释的增多而变少， 所以我不认为他会降低我们的效率，但是我不认为他目前有再前端业务代码中应用的必要，因为上手成本高 更适合一些小型库
2. svelte也有有关于他为什么要使用jsdoc来替换ts的讨论： https://github.com/sveltejs/svelte/pull/8569 
考虑理由是不利于他们开发人员对npm包进行调试
3. 于我而言，当我对其了解后，我脑海中第一印象就是对我的faas函数有所帮助，因为目前faas不支持typescript所以 使用jsdoc 可以非常方便的去支持我的类型定义，降低我代码的风险。同时由于faas单个函数往往都特别小，且功能简单。使用jsdoc 成本不高