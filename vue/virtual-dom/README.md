# virtual dom

* 采用virtual dom的思路,不仅提升了dom操作的效率，主要思想就是模拟dom的树状结构，在内存中创建保存要映射的dom节点信息的数据

* 在交互，数据变更等因素导致需要试图更新的时候，先通过对节点数据进行diff比较后记录差异结果，在一次性对dom进行批量更新操作，所有复杂的操作

* 交互都在平行世界中的virtual dom中处理完成,最后将更新好的节点数据渲染成真实的dom节点。

* 在js里操作数据更加高效，快捷，提高了性能，优化了dom操作


`在掘金的图：`
![](https://user-gold-cdn.xitu.io/2018/5/24/163904e89b21b515?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![](https://user-gold-cdn.xitu.io/2017/5/16/39eac671c7fae8f73917ba1e6d06daa8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)




## vdom的数据定义

一个元素的属性将近有200多个，但是具体用到的却只有几个，当我们频繁的去操作dom，就会造成性能不好的问题。
[Vue中定义vdom路径 - src/core/vdom/vnode.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/vnode.js)

```js
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
```
vue的vdom借鉴了一个开源库[snabbdom](https://github.com/snabbdom/snabbdom)思想，结合了vue的特色，相比之下vue的vdom更加复杂交错，许多的交互操作，如果想深入了解，更加推荐先去看snabbdom的源码，简洁纯粹

## createElement
这一部分是创建virtual dom
他定义在 [src/core/vdom/create-elemenet.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/create-elemenet.js)
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
  return _createElement(context, tag, data, children, normalizationType)
}
```
createElement函数里定义数据，
判断data是不是一个数组对象或原始类型值，即：string、number、boolean以及 symbol。
函数最后执行_createElement，相当于是封装了_createElement


```js
function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
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
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
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
`context` : Vnode的执行上下文环境
`tag` : 代表标签
`data` : Vnode的数据
`children` : Vnode的子节点
`normalizationType` : 子节点的数据类型


## updateChildren

这一步部分主要是首次渲染和数据更新的核心代码（diff算法），渲染真实dom节点到页面上

然后开始将旧子节点组和新子节点组进行逐一比对，直到遍历完任一子节点组，比对策略有5种：
* oldStartVnode和newStartVnode进行比对，如果相似，则进行patch，然后新旧头索引都后移
* oldEndVnode和newEndVnode进行比对，如果相似，则进行patch，然后新旧尾索引前移
* oldStartVnode和newEndVnode进行比对，如果相似，则进行patch，将旧节点移位到最后
* oldEndVnode和newStartVnode进行比对，处理和上面类似，只不过改为左移

* 如果以上情况都失败了，我们就只能复用key相同的节点了。首先我们要通过createKeyToOldIdx
* 遍历完之后，将剩余的新Vnode添加到最后一个新节点的位置后或者删除多余的旧节点

![](https://images2015.cnblogs.com/blog/572874/201705/572874-20170505153104851-108994539.png)
vue的`updateChildren`比较复杂，来看看带注释的简化版，也是snabbdom的核心源码:
```js
  /**
   *
  * @param parentElm 父节点
  * @param oldCh 旧节点数组
  * @param newCh 新节点数组
  * @param insertedVnodeQueue
  */
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
  var oldStartIdx = 0, newStartIdx = 0;
  var oldEndIdx = oldCh.length - 1;
  var oldStartVnode = oldCh[0];
  var oldEndVnode = oldCh[oldEndIdx];
  var newEndIdx = newCh.length - 1;
  var newStartVnode = newCh[0];
  var newEndVnode = newCh[newEndIdx];
  var oldKeyToIdx, idxInOld, elmToMove, before;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    }
    //如果旧头索引节点和新头索引节点相同，
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      //对旧头索引节点和新头索引节点进行diff更新， 从而达到复用节点效果
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
      //旧头索引向后
      oldStartVnode = oldCh[++oldStartIdx];
      //新头索引向后
      newStartVnode = newCh[++newStartIdx];
    }
    //如果旧尾索引节点和新尾索引节点相似，可以复用
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      //旧尾索引节点和新尾索引节点进行更新
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
      //旧尾索引向前
      oldEndVnode = oldCh[--oldEndIdx];
      //新尾索引向前
      newEndVnode = newCh[--newEndIdx];
    }
      //如果旧头索引节点和新头索引节点相似，可以通过移动来复用
      //如旧节点为【5,1,2,3,4】，新节点为【1,2,3,4,5】，如果缺乏这种判断，意味着
      //那样需要先将5->1,1->2,2->3,3->4,4->5五次删除插入操作，即使是有了key-index来复用，
      // 也会出现【5,1,2,3,4】->【1,5,2,3,4】->【1,2,5,3,4】->【1,2,3,5,4】->【1,2,3,4,5】
      // 共4次操作，如果有了这种判断，我们只需要将5插入到最后一次操作即可
    else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
      api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    //原理与上面相同
    else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
      api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    //如果上面的判断都不通过，我们就需要key-index表来达到最大程度复用了
    else {
      //如果不存在旧节点的key-index表，则创建
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      //找到新节点在旧节点组中对应节点的位置
      idxInOld = oldKeyToIdx[newStartVnode.key];
      //如果新节点在旧节点中不存在，我们将它插入到旧头索引节点前，然后新头索引向后
      if (isUndef(idxInOld)) { // New element
        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
        newStartVnode = newCh[++newStartIdx];
      } else {
        //如果新节点在就旧节点组中存在，先找到对应的旧节点
        elmToMove = oldCh[idxInOld];
        //先将新节点和对应旧节点作更新
        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
        //然后将旧节点组中对应节点设置为undefined,代表已经遍历过了，不在遍历，否则可能存在重复插入的问题

        oldCh[idxInOld] = undefined;
        //插入到旧头索引节点之前
        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
        //新头索引向后
        newStartVnode = newCh[++newStartIdx];
      }
    }
  }
  //当旧头索引大于旧尾索引时，代表旧节点组已经遍历完，将剩余的新Vnode添加到最后一个新节点的位置后
  if (oldStartIdx > oldEndIdx) {
    before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
    addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
  }
  //如果新节点组先遍历完，那么代表旧节点组中剩余节点都不需要，所以直接删除
  else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}
```