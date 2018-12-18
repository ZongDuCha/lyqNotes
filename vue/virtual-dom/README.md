# 阅读顺序: [vdom](./vdom.md) -- [parse](./parse.md) -- [patch](./patch.md) -- [html-parse](./html-parse.md)

### Virtual Dom 是什么
 是利用js双缓存dom节点经过diff算法比较，只更新需要更新的dom，实现高效的更新页面，Vue和Ember早就开始用虚拟DOM提高页面更新的速度，随后在Vue.js 2.0中也添加了这一技术

### 为什么要用Virtual Dom

1. 如果页面有成千上万的dom节点时，每更新一次就去创建这么多的节点,不断的对页面造成重绘、重排...，产生的性能和体验都非常差

2. 2. Virtual Dom不仅仅提高页面更新速度，还可以扩展添加其他技术，比如Vue里的v-for,v-if,v-else,v-model,自定义指令,绑定事件...


3. 改变了我们写html的方法，摆脱了获取dom节点对象，对其赋值，取值，时间绑定等操作，
实现了MVVM模式开发，既数据，操作，条件渲染写在html页面上


### Virtual DOM 是怎么实现？
每次在数据改变之后，就会在UI更新之前创建一个新的Virtual DOM。更新浏览器的DOM分三个步骤：
1. 首次渲染之后只要数据发生改变，就会重新生成一个完整的Virtual DOM。
2. 重新diff对比计算比较出新的和之前的Virtual DOM的差异。
3. 更新真实DOM中真正发生改变的部分，就像是给DOM打了个补丁。

### Vue中的Virtual Dom 原理

![](https://cythilya.github.io/assets/2017-04-08-vue-rendering-flow.png)

说明上图过程：
* template 经由 parser 解析得到 vnode object，对这个object 进行模版语法解析，转为AST node，最后生成一棵完整的AST tree (抽象语法树，abstract syntax tree)。
* 使用AST tree 生成渲染函数(render function)，执行渲染函数会得到v-node。
* watcher 搜集依赖、经由observer 对v-node 深度数据绑定和更新。
* v-node 经由patch 后render 为真正的HTML。


数据更新时，渲染得到新的virtual dom,与上次的virtual dom进行diff比较,记录所有有差异的dom节点，然后在patch中更新ui
![](2017-04-11-vue-rendering-flow.png)

* 若是已经parse 过的template，则会做更新，例如：比对、重新绑定数据、更新必要的DOM element。

### diff
* 当组件状态发生更新或交互、数据变更等因素导致需要试图更新的时候，然后触发Virtual Dom数据的变化，然后通过对缓存中的Virtual Dom数据和真实DOM进行diff算法比对，再对真实DOM更新。可以简单认为Virtual Dom是真实DOM的缓存。

![](https://camo.githubusercontent.com/db55af854af44f10b16053687c6c02d3d5ae4b98/68747470733a2f2f692e6c6f6c692e6e65742f323031372f30382f32372f353961323431396133633631372e706e67)


基于 Virtual DOM 的数据更新与UI同步机制:
![](https://user-gold-cdn.xitu.io/2018/5/24/163904e89b21b515?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

初始渲染时，首先将渲染为Virtual dom,然后在转化为dom
![](https://user-gold-cdn.xitu.io/2017/5/16/39eac671c7fae8f73917ba1e6d06daa8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)


* vue的vdom借鉴了开源库[snabbdom](https://github.com/snabbdom/snabbdom)思想，结合vue的特点



- https://zhuanlan.zhihu.com/p/24311601
- http://hcysun.me/vue-design/art/
- https://johnresig.com/files/htmlparser.js
- https://www.jianshu.com/p/9e9477847ba1
- https://github.com/vuejs/vue/blob/dev/src/core/instance/lifecycle.js#L139-L202
