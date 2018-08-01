# virtual dom

* 一个元素的属性将近有200多个，但是具体用到的却只有几个，当我们频繁的去操作dom，就会造成性能不好的问题。

* 采用virtual dom的思路,不仅提升了dom操作的效率，主要思想就是模拟dom的树状结构，在内存中创建保存要映射的dom节点信息的数据

* 在交互，数据变更等因素导致需要试图更新的时候，先通过对节点数据进行diff比较后记录差异结果，在一次性对dom进行批量更新操作，所有复杂的操作

* 交互都在平行世界中的virtual dom中处理完成,最后将更新好的节点数据渲染成真实的dom节点。

* 在js里操作数据更加高效，快捷，提高了性能，优化了dom操作

* 当组件状态发生更新时，然后触发Virtual Dom数据的变化，然后通过Virtual Dom和真实DOM的diff比对，再对真实DOM更新。可以简单认为Virtual Dom是真实DOM的缓存。

基于 Virtual DOM 的数据更新与UI同步机制:
![](https://user-gold-cdn.xitu.io/2018/5/24/163904e89b21b515?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

初始渲染时，首先将渲染为Virtual dom,然后在转化为dom
![](https://user-gold-cdn.xitu.io/2017/5/16/39eac671c7fae8f73917ba1e6d06daa8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

数据更新时，渲染得到新的virtual dom,与上次的virtual dom进行diff比较,记录所有有差异的dom节点，然后在patch中更新ui

![](https://cythilya.github.io/assets/2017-04-08-vue-rendering-flow.png)

说明上图过程：
* template 经由HTML parser 解析得到node object，对这个object 进行模版语法解析，转为AST node，最后生成一棵完整的AST tree (抽象语法树，abstract syntax tree)。
* 使用AST tree 生成渲染函数(render function)，执行渲染函数会得到v-node。
* watcher 搜集依赖、经由observer 对v-node 深度数据绑定和更新。
* v-node 经由patch 后render 为真正的HTML。



![](https://cythilya.github.io/assets/2017-04-11-vue-rendering-flow.png)

* 若是已经parse 过的template，则会做更新，例如：比对、重新绑定数据、更新必要的DOM element。
* vue的vdom借鉴了开源库[snabbdom](https://github.com/snabbdom/snabbdom)思想，结合vue的特点



- https://zhuanlan.zhihu.com/p/24311601
- http://hcysun.me/vue-design/art/
- https://johnresig.com/files/htmlparser.js
- https://www.jianshu.com/p/9e9477847ba1
![](https://pic1.zhimg.com/v2-be94fd2b90a02196edcfc6af5c176dc8_r.jpg)
