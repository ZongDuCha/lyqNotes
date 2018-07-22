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


## vdom的数据定义

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
  functionalContext: Component | void; // only for functional component root nodes
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions
  ) {
    /*当前节点的标签名*/
    this.tag = tag
    /*当前节点对应的 数据对象*/
    this.data = data
    /*当前节点的子节点，是一个数组*/
    this.children = children
    /*当前节点的文本*/
    this.text = text
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm
    /*当前节点的名字空间*/
    this.ns = undefined
    /*编译作用域*/
    this.context = context
    /*函数化组件作用域*/
    this.functionalContext = undefined
    /*节点的key属性，被当作节点的标志，用以优化*/
    this.key = data && data.key
    /*组件的option选项*/
    this.componentOptions = componentOptions
    /*当前节点对应的组件的实例*/
    this.componentInstance = undefined
    /*当前节点的父节点*/
    this.parent = undefined
    /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.raw = false
    /*静态节点标志*/
    this.isStatic = false
    /*是否作为跟节点插入*/
    this.isRootInsert = true
    /*是否为注释节点*/
    this.isComment = false
    /*是否为克隆节点*/
    this.isCloned = false
    /*是否有v-once指令*/
    this.isOnce = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next https://github.com/answershuto/learnVue*/
  get child (): Component | void {
    return this.componentInstance
  }
}
```

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


### html-parse
- 比如`<div><div></div></div>`
- 先匹配到 <   匹配到这个字符我就可以认为是开始标签，后面的要么是子级的开始标签，要么是结束标签。

- 用正则匹配从<到后面的字符，如果是开始标签，现在记录一下，啊，我遇到了一个开始标签`<div>`  顺便用正则记录attrs

- 现在我们匹配走走走。。。走到`<div></div></div>`

- 又匹配到一个 < 。发现是开始标签，再次记录，啊，我又遇到一个开始标签  `<div>`  顺便用正则记录attrs

- 现在我们匹配走走走。。。走到`</div></div>  `

- 又匹配到一个 < 老步骤啊。

- 发现是一个结束标签`</div>` ,它是谁的结束标签？想一想。。按照记录的应该是最后一个遇到的开始标签。  第一个遇到的结束标签不就是最后一个开始标签的结束么？

- 结束了一个。 如此循环下去 每当遇到一个开始标签时就开始记录，然后遇到结束标签才清除掉。

```js
/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simpleser/simplehtmlparser.js
 */

import { makeMap, no } from 'shared/util'
import { isNonPhrasingTag } from 'web/compiler/util'

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t'
}
const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr (value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

export function parseHTML (html, options) {
  const stack = []
  const expectHTML = options.expectHTML
  const isUnaryTag = options.isUnaryTag || no
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
  let index = 0
  let last, lastTag
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
        // 解析注释代码 <!-- xx -->
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd))
            }   
            advance(commentEnd + 3)
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // html头部
        // Doctype:
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag: 结束的标签
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag: 开始标签
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(lastTag, html)) {
            advance(1)
          }
          continue
        }
      }

      // 解析纯文本
      let text, rest, next
      if (textEnd >= 0) {
        rest = html.slice(textEnd)
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          // 解析  123123</div>,,<前的内容 123123
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        text = html.substring(0, textEnd)
        advance(textEnd)
      }

      if (textEnd < 0) {
        text = html
        html = ''
      }

      if (options.chars && text) {
        // 文本解析完之后调用,包括文本自身
        options.chars(text)
      }
    } else {
      let endTagLength = 0;
      const stackedTag = lastTag.toLowerCase()
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          // 解析 '<!-- 123 -->'.replace(/<!\--([\s\S]*?)-->/g, '$1')   123 
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        if (options.chars) {
          // 文本解析完之后调用,包括文本自身
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`)
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance (n) {
    index += n
    html = html.substring(n)
  }

  // 解析开始标签
  function parseStartTag () {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length)
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        // attr 是标签名
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag (match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3] }
        if (args[4] === '') { delete args[4] }
        if (args[5] === '') { delete args[5] }
      }
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
      lastTag = tagName
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }

    // Find the closest opened tag of the same type
    if (tagName) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if (process.env.NODE_ENV !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`
          )
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
```


### patch 更新dom

这一步部分主要是数据更新的核心代码（diff算法），渲染真实dom节点到页面上

然后开始将旧子节点组和新子节点组进行逐一比对，直到遍历完任一子节点组，比对策略有5种：
* oldStartVnode和newStartVnode进行比对，如果相似，则进行patch，然后新旧头索引都后移
* oldEndVnode和newEndVnode进行比对，如果相似，则进行patch，然后新旧尾索引前移
* oldStartVnode和newEndVnode进行比对，如果相似，则进行patch，将旧节点移位到最后
* oldEndVnode和newStartVnode进行比对，处理和上面类似，只不过改为左移
* 如果以上情况都失败了，我们就只能复用key相同的节点了。首先我们要通过createKeyToOldIdx
* 遍历完之后，将剩余的新Vnode添加到最后一个新节点的位置后或者删除多余的旧节点

![](https://images2015.cnblogs.com/blog/572874/201705/572874-20170505153104851-108994539.png)

vue的`update`比较复杂，来看看带注释的简化版，其思想都差不多，也是snabbdom的核心源码:
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

  // 当老节点开始索引 小于等于 老节点的结尾索引
  // 并且新节点开始索引 小于等于 新节点的结尾索引
  // 的时候结束整个循环
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
      //  如果旧头索引节点和新头索引节点相似，可以通过移动来复用
      //  如旧节点为【5,1,2,3,4】，新节点为【1,2,3,4,5】，如果缺乏这种判断，意味着
      //  那样需要先将5->1,1->2,2->3,3->4,4->5五次删除插入操作，即使是有了key-index来复用，
      //  也会出现【5,1,2,3,4】->【1,5,2,3,4】->【1,2,5,3,4】->【1,2,3,5,4】->【1,2,3,4,5】
      //  共4次操作，如果有了这种判断，我们只需要将5插入到最后一次操作即可
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

## patchVnode  
### 对真实dom更新操作
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