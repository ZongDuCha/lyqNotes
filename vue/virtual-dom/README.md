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
* vue的vdom借鉴了一个开源库[snabbdom](https://github.com/snabbdom/snabbdom)思想，结合vue的特点


## createElement 
### 创建虚拟节点
 [src/core/vdom/create-elemenet.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/create-element.js#L28-#L130)
```js
// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,    
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  /*创建虚拟节点*/
  return _createElement(context, tag, data, children, normalizationType)
}
```
createElement函数里定义数据，
判断data是不是一个数组对象或原始类型值，即：string、number、boolean,function,object以及 symbol。
函数最后执行_createElement，相当于是封装了_createElement


```js
/*创建虚拟节点*/
function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  /*
    如果data未定义（undefined或者null）或者是data的__ob__已经定义（代表已经被observed，上面绑定了Oberver对象），
    那么创建一个空节点
  */
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  /*如果tag不存在也是创建一个空节点*/
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // 作用域插槽 slot
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  // tag表示标签名，可以是string，也可以是component
  if (typeof tag === 'string') {
    let Ctor
    // getTagNamespace 获取tag的名字空间
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 判断是否是保留的标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    // 如果不是保留标签，那么会在components里查找是否有定义
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 创建虚拟组件节点
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    // 创建一个组件，最终会返回Vnoded对象
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```
其次检查是不是组件，如果是组件就执行`createComponent`，否则执行`new VNode`







## patchVnode  
### 对真实dom局部更新操作
https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js
```js
  // 根据不同的状态对dom做合理的更新操作（添加，移动，删除）整个过程还会依次调用prepatch,update,postpatch等钩子函数
  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // 新旧 vnode 相等
    if (oldVnode === vnode) {
      return
    }

    const elm = vnode.elm = oldVnode.elm
    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }

    // 如果新旧 vnode 为静态；新旧 vnode key相同；
    // 新 vnode 是克隆所得；新 vnode 有 v-once 的属性
    // 则新 vnode 的 componentInstance 用老的 vnode 的。
    // 即 vnode 的 componentInstance 保持不变。
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    // 执行 data.hook.prepatch 钩子。
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      // 遍历 cbs，执行 update 方法
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      // 执行 data.hook.update 钩子
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    // 旧 vnode 的 text 选项为 undefined
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        // 新旧 vnode 都有 children，且不同，执行 updateChildren 方法。
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // 清空文本，添加 vnode
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 移除 vnode
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 如果新旧 vnode 都是 undefined，清空文本
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 有不同文本内容，更新文本内容
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      // 执行 data.hook.postpatch 钩子，表明 patch 完毕
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

- https://zhuanlan.zhihu.com/p/24311601
- http://hcysun.me/vue-design/art/
- https://johnresig.com/files/htmlparser.js
![](https://pic1.zhimg.com/v2-be94fd2b90a02196edcfc6af5c176dc8_r.jpg)