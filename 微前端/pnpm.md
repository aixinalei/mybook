pnpm 解决了哪些问题
---

## 解决那些问题：
1. 节省安装时间、磁盘空间
2. 没有幽灵依赖、重复依赖问题
3. 更好的monorep 支持

## 前置理解
1. hard link： 硬链接，在文件系统中，硬链接就是一个指向原文件的入口。可以理解为多个名字指向同一个文件。在不同地址下更改这个文件内容，会同时影响到所有硬链接的文件。
2. soft link： 软链接，可以理解为一个单向指针，类似于windows的快捷方式
3. 幽灵依赖：
npm3后 包安装时会提取公共包置顶，如果项目依赖了这个包但package.json中没有 那么仍可以使用
4. 不确定依赖；
如果a依赖b@v1.0 c依赖b@v2.0 那么npm置顶行为不确定，存在幽灵依赖时会有问题
5. 依赖分身 或者叫重复依赖：
如果a包依赖b@V1.0 c包依赖b@v1.0 那么npm会同时下载两个b@v1.0
## 原理解析：

pnpm安装包时，pnpm会在全局的store目录里存储项目的依赖。所以安装速度更快，比如npm 他应该还要去算一下这个包的依赖树，然后再去下载。pnpm则完全不需要

pnpm 生成的目录为非扁平化的目录，而是根据真实目录去存储对应的软链。
就是将 node_modules 里的文件软链接到对应的 .pnpm/[package_name]@version/node_modules/[package_name] 中,而这个地址实际上是个硬链，链到全局的store当中。
这样做主要是为了两点，1 解决幽灵依赖和依赖分身的问题，因为nodemodule下只有package.json直接依赖的包，2. 满足node的寻址逻辑，如果直接是个硬链，硬链接地址是xxx@version


## 其他
1. pnpm 第一次安装时会自动算npm.lock 和 yarn.lock无需担心依赖问题
2. 如果存在peer依赖时，可能存在多个相同版本的包 由于peer依赖版本不同，而被安装两次 [参考](https://github.com/orgs/pnpm/discussions/3897)
比如a包peer依赖b@v>1.0 那么一个monorepo下的仓库 一个里面b 是2.0 一个里面是1.0 那么a包会被安装两次
解决办法就是monorepo下尽可能的去统一版本，比如常见的UI库（需要再相同环境下） react等。提测升级做统一提测升级

## 参考
[转载于此](https://juejin.cn/post/7036319707590295565#heading-7)
[参考2](https://juejin.cn/post/7131185575545012255#heading-4)
[参考3](https://zhuanlan.zhihu.com/p/442133074)
[pnpm 在monorepo上的一些应用操作](https://juejin.cn/post/7211537759849037882)
