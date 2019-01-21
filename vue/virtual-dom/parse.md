### parse （生成 AST结构且解析html模版）
```js
/* @flow */

import he from 'he'
// https://github.com/vuejs/vue/tree/dev/src/compiler/parser
import { parseHTML } from './html-parser'
import { parseText } from './text-parser'
import { parseFilters } from './filter-parser'
import { genAssignmentCode } from '../directives/model'
import { extend, cached, no, camelize } from 'shared/util'
import { isIE, isEdge, isServerRendering } from 'core/util/env'

// https://github.com/vuejs/vue/blob/dev/src/compiler/helpers.js
import {
  addProp,
  addAttr,
  baseWarn,
  addHandler,
  addDirective,
  getBindingAttr,
  getAndRemoveAttr,
  pluckModuleFunction
} from '../helpers'

// 匹配@以及v-on，绑定事件 
export const onRE = /^@|^v-on:/
// 匹配v-、@以及:
export const dirRE = /^v-|^@|^:/
// 匹配v-for中的in以及of
// 比如 for(var items in item) , for(var items of item)
export const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/
// v-for参数中带括号的情况匹配
// 比如 v-for( (items, index) in item)这样的参数
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
// 去掉两边括号，比如 (value, key) => value, key
const stripParensRE = /^\(|\)$/g
// 捕获指令参数
const argRE = /:(.*)$/
// 匹配v-bind以及:
const bindRE = /^:|^v-bind:/
// 根据点来分开各个级别的正则，比如.stop.native.trim解析后可以得到.stop .native .trim
const modifierRE = /\.[^.]+/g

// he 为第三方的库，he.decode 函数用于 HTML 字符实体的解码工作 https://github.com/mathiasbynens/he
// he.decode('foo &copy; bar &ne; baz &#x1D306; qux') → 'foo © bar ≠ baz 𝌆 qux'
const decodeHTMLCached = cached(he.decode)

// configurable state
export let warn: any
let delimiters
let transforms
let preTransforms
let postTransforms
let platformIsPreTag
let platformMustUseProp
let platformGetTagNamespace

type Attr = { name: string; value: string };

/**
 * Convert HTML string to AST.
 */
 /*将HTML字符串转换成AST*/
export function createASTElement (
  tag: string,
  attrs: Array<Attr>,
  parent: ASTElement | void
): ASTElement {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: []
  }
}

/**
 * Convert HTML string to AST.
 */
export function parse (
  template: string,
  options: CompilerOptions
): ASTElement | void {
  /*警告函数，baseWarn是Vue 编译器默认警告*/
  warn = options.warn || baseWarn
  /*检测是否是<pre>标签*/
  platformIsPreTag = options.isPreTag || no
  platformMustUseProp = options.mustUseProp || no
  platformGetTagNamespace = options.getTagNamespace || no

  // 找出options.mudules中每一项中属性含有key方法
  transforms = pluckModuleFunction(options.modules, 'transformNode')
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')

  delimiters = options.delimiters

  /* 解析非一元数组就存入元素 */
  const stack = []
  const preserveWhitespace = options.preserveWhitespace !== false
  let root
  let currentParent
  /*标志位，是否有v-pre属性*/
  let inVPre = false
  /*标志位，是否是pre标签*/
  let inPre = false
  let warned = false

  /*只发出一次的warning*/
  function warnOnce (msg) {
    if (!warned) {
      warned = true
      warn(msg)
    }
  }

  function closeElement (element) {
    // check pre state
    if (element.pre) {
      inVPre = false
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false
    }
    // apply post-transforms
    for (let i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options)
    }
  }

  /*解析HTML*/
  parseHTML(template, {
    warn,
    // 结束标签
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    // 开始标签
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    // 
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,

    // 主要是创建，处理，优化AST元素，
    // 通过`createASTElment`函数创建AST元素，tpye是AST元素类型，（一般1是元素节点，2是表达式，3是纯文本），tag是标签名，attrsList是节点属性列表，attrsMap是节点属性映射表，parent是AST元素的父AST元素，children是AST元素的子AST元素，都保存在 `element`对象中.

    // 判断 元素是不是服务端渲染的元素 或者 是不是被Vue禁止的标签元素，如: <style>, <script>,或者type为 text/javascript ,因为作者认为模板只是负责展示数据和 数据状态到ui的映射，如果存在<script>标签, 标签内的代码很容易有bug

    // 循环调用preTransforms数组里的函数

    // 处理节点的属性，如果是v-pre则跳过编译,同时匹配v-for, v-if、v-else, v-else-if, v-once, v-key, ref, slot, attrs, transforms动画以及组件Component,同时判断去掉属性后是不是一个普通的元素

    // 判断root根元素是否有，默认是无，然后用checkRootConstraints 函数判断模板根元素是否符合要求，即模板必须有跟元素并且只能有一个根元素， 第二根元素不能为slot和template元素，并且v-for不能应用在根元素上，否则就判断stack栈的数组为空，即整个html都解析完后， 首先判断根元素是否存在v-if属性，并且当前元素存在elseif或者else，这样保证了被渲染的根元素就只能有一个，然后调用addIfCondition将条件渲染的元素存入 ifCondition

    // 如果当前元素有父元素 并且 当前元素不是被禁止的标签名（style，script）, 然后判断1 当前元素是否有v-else-if或者else属性，则调用processIfConditions函数相邻查找v-if属性 元素节点。 判断2 如果没有v-else-if或者else属性，就会判断元素是否有用了slot-scope，则将元素保存在父节点的scopedSlots中，

    // 如果没有条件渲染和slot-scope特性的元素，会正常处理父子级关系，即当前元素存入父元素的children中，当前元素的父元素指向当前元素
    
    // !unary 检测是不是一元的标签，如果是就将元素存入stack中，否则直接 调用closeElement 闭合标签

    // start 开始标签时执行
    start (tag, attrs, unary) {
      // check namespace.
      // inherit parent ns if there is one
      // 检查命名空间是否是svg或者math
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      // handle IE svg bug
      /* istanbul ignore if */
      /*处理IE的svg bug*/
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs)
      }
      // 创建AST元素对象
      let element: ASTElement = createASTElement(tag, attrs, currentParent)
      if (ns) {
        element.ns = ns
      }

      // 如果是被禁止的标签或者 是不是服务端渲染的情况
      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true
        process.env.NODE_ENV !== 'production' && warn(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>` + ', as they will not be parsed.'
        )
      }

      // apply pre-transforms
      for (let i = 0; i < preTransforms.length; i++) {
        // 若html里面有v-model等指令，通过preTransforms进行转换
        element = preTransforms[i](element, options) || element
      }

      if (!inVPre) {
          /*
          处理v-pre属性
          v-pre元素及其子元素被跳过编译
          https://cn.vuejs.org/v2/api/#v-pre
        */
        processPre(element)
        if (element.pre) {
          inVPre = true
        }
      }
      /*检测是否是<pre>标签*/
      if (platformIsPreTag(element.tag)) {
        inPre = true
      }
      /*如果有v-pre属性，元素及其子元素不会被编译*/
      if (inVPre) {
        processRawAttrs(element)
      } else if (!element.processed) {
        /*匹配并处理v-for属性*/
        processFor(element)
        /*匹配并处理if属性，分别处理v-if、v-else以及v-else-if属性*/
        processIf(element)
        /* v-once 不可改变的数据  <p v-once>不可以改变：{{ msg }}</p> */
        /*处理并处理v-once属性，https://cn.vuejs.org/v2/api/#v-once*/
        processOnce(element)
        // element-scope stuff
        // 对当前的树节点元素进行处理
        processElement(element, options)
      }

      /*监测根级元素的约束*/
      function checkRootConstraints (el) {
        if (process.env.NODE_ENV !== 'production') {
          /*slot以及templete不能作为根级元素*/
          if (el.tag === 'slot' || el.tag === 'template') {
            warnOnce(
              `Cannot use <${el.tag}> as component root element because it may ` +
              'contain multiple nodes.'
            )
          }
          /*以及根级元素不能有v-for*/
          if (el.attrsMap.hasOwnProperty('v-for')) {
            warnOnce(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements.'
            )
          }
        }
      }

      if (!root) {
        root = element
        /*检测根级元素的约束*/
        checkRootConstraints(root)
      } else if (!stack.length) {
        // allow root elements with v-if, v-else-if and v-else
        /*
          根级元素是可以用v-if、v-else来写多个条件下的多个根级元素的
          比如说
          <template>
            <div v-if="fff">aaa</div>
            <div v-else>bbb</div>
          </template>
          是允许的
        */
        if (root.if && (element.elseif || element.else)) {
          /*监测根级元素的约束*/
          checkRootConstraints(element)
          /*在el的ifConditions属性中加入condition*/
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          })
        } else if (process.env.NODE_ENV !== 'production') {
          /*在根级元素包含多个ele的时候，有不含v-else的ele则报出打印*/
          warnOnce(
            `Component template should contain exactly one root element. ` +
            `If you are using v-if on multiple elements, ` +
            `use v-else-if to chain them instead.`
          )
        }
      }

      /*forbidden标志是否是被禁止的标签（style标签或者script标签）*/
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          /*当遇到当前ele有v-else或者v-elseif属性的时候，需要处理if属性，在其上级兄弟元素中必然存在一个v-if属性*/
          processIfConditions(element, currentParent)
        } else if (element.slotScope) { // scoped slot
          currentParent.plain = false
          /*slot如果没有则是默认的default*/
          const name = element.slotTarget || '"default"'
          /*
              scopedSlots中存放slot元素 https://cn.vuejs.org/v2/api/#vm-scopedSlots
          */
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
        } else {
          // 将当前元素push到父元素
          currentParent.children.push(element)
          element.parent = currentParent
        }
      }
      if (!unary) {
        currentParent = element
        // 存入节点
        stack.push(element)
      } else {
        closeElement(element)
      }
      // apply post-transforms
      for (let i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options)
      }
    },

    // 判断当前元素的children的最后一个节点type是否为3，即
    end () {
      // remove trailing whitespace
      /*从stack中取出最后一个ele*/
      const element = stack[stack.length - 1]
      /*获取该ele的最后一个子节点*/
      const lastNode = element.children[element.children.length - 1]
      /*该子节点是非<pre>标签的文本*/
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
        element.children.pop()
      }
      // pop stack
      /*ele出栈*/
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      closeElement(element)
    },

    // chart 文本内容时执行
    chars (text: string) {
      if (!currentParent) {
        if (process.env.NODE_ENV !== 'production') {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.'
            )
          } else if ((text = text.trim())) {
            warnOnce(
              `text "${text}" outside root element will be ignored.`
            )
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text) {
        return
      }
      const children = currentParent.children
      text = inPre || text.trim()
        ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : preserveWhitespace && children.length ? ' ' : ''
      if (text) {
        let expression
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          children.push({
            type: 2,
            expression,
            text
          })
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          children.push({
            type: 3,
            text
          })
        }
      }
    }
  })
  return root
}

/*
  处理v-pre属性
  v-pre元素及其子元素被跳过编译
  https://cn.vuejs.org/v2/api/#v-pre
*/
function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true
  }
}

/*处理原生属性，将其放入attrs中，以{name, value}的形式*/
function processRawAttrs (el) {
  const l = el.attrsList.length
  if (l) {
    const attrs = el.attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true
  }
}

export function processElement (element: ASTElement, options: CompilerOptions) {
    /*处理key属性 https://cn.vuejs.org/v2/api/#key*/
    processKey(element)

    // determine whether this is a plain element after
    // removing structural attributes
    // 去掉属性后，检测是否是空属性节点
    element.plain = !element.key && !attrs.length

    /*处理ref属性 https://cn.vuejs.org/v2/api/#ref*/
    processRef(element)
    /*处理slot属性 https://cn.vuejs.org/v2/api/#slot*/
    processSlot(element)
    /*处理组件*/
    processComponent(element)
    /*转换*/
    for (let i = 0; i < transforms.length; i++) {
      transforms[i](element, options)
    }
    /*处理属性*/
    processAttrs(element)
}

/*处理key属性 https://cn.vuejs.org/v2/api/#key*/
function processKey (el) {
  const exp = getBindingAttr(el, 'key')
  if (exp) {
    if (process.env.NODE_ENV !== 'production' && el.tag === 'template') {
      warn(`<template> cannot be keyed. Place the key on real elements instead.`)
    }
    el.key = exp
  }
}

/*处理ref属性 https://cn.vuejs.org/v2/api/#ref*/
function processRef (el) {
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    /*
      检测该元素是否存在一个for循环中。
      将会沿着parent元素一级一级向上便利寻找是否处于一个for循环中。
      当 v-for 用于元素或组件的时候，引用信息将是包含 DOM 节点或组件实例的数组。
    */
    el.refInFor = checkInFor(el)
  }
}

/*匹配v-for属性*/
export function processFor (el: ASTElement) {
  let exp
  /*取出v-for属性*/
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const res = parseFor(exp)
    if (res) {
      extend(el, res)
    } else if (process.env.NODE_ENV !== 'production') {
      warn(
        `Invalid v-for expression: ${exp}`
      )
    }
  }
}

type ForParseResult = {
  for: string;
  alias: string;
  iterator1?: string;
  iterator2?: string;
};

export function parseFor (exp: string): ?ForParseResult {
  const inMatch = exp.match(forAliasRE)
  if (!inMatch) return
  const res = {}
  res.for = inMatch[2].trim()
  const alias = inMatch[1].trim().replace(stripParensRE, '')
  const iteratorMatch = alias.match(forIteratorRE)
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '')
    res.iterator1 = iteratorMatch[1].trim()
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim()
    }
  } else {
    res.alias = alias
  }
  return res
}

/*匹配if属性，分别处理v-if、v-else以及v-else-if属性*/
function processIf (el) {
  /*取出v-if属性*/
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
  /*存在v-if属性*/
    el.if = exp
    /*在el的ifConditions属性中加入{exp, block}*/
    addIfCondition(el, {
      exp: exp,
      block: el
    })
  } else {
  /*不存在v-if属性*/
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}

/*处理if条件*/
function processIfConditions (el, parent) {
  /*当遇到当前ele有v-else或者v-elseif属性的时候，需要处理if属性，在其上级兄弟元素中必然存在v-if属性*/
  const prev = findPrevElement(parent.children)
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    })
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
      `used on element <${el.tag}> without corresponding v-if.`
    )
  }
}

/*找到上一个ele*/
function findPrevElement (children: Array<any>): ASTElement | void {
  let i = children.length
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if (process.env.NODE_ENV !== 'production' && children[i].text !== ' ') {
        warn(
          `text "${children[i].text.trim()}" between v-if and v-else(-if) ` +
          `will be ignored.`
        )
      }
      children.pop()
    }
  }
}

/* 用于将条件渲染的元素存入ifConditions*/
export function addIfCondition (el: ASTElement, condition: ASTIfCondition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}

/*处理v-once属性，https://cn.vuejs.org/v2/api/#v-once*/
function processOnce (el) {
  const once = getAndRemoveAttr(el, 'v-once')
  if (once != null) {
    el.once = true
  }
}

/*处理slot属性 https://cn.vuejs.org/v2/api/#slot*/
function processSlot (el) {
  if (el.tag === 'slot') {
    /*获取name特殊属性:name或者bind:name，用作slot的name https://cn.vuejs.org/v2/api/#slot-1*/
    el.slotName = getBindingAttr(el, 'name')
    if (process.env.NODE_ENV !== 'production' && el.key) {
      warn(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`
      )
    }
  } else {
    let slotScope
    if (el.tag === 'template') {
      slotScope = getAndRemoveAttr(el, 'scope')
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && slotScope) {
        warn(
          `the "scope" attribute for scoped slots have been deprecated and ` +
          `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
          `can also be used on plain elements in addition to <template> to ` +
          `denote scoped slots.`,
          true
        )
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
        warn(
          `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
          `(v-for takes higher priority). Use a wrapper <template> for the ` +
          `scoped slot to make it clearer.`,
          true
        )
      }
      el.slotScope = slotScope
    }
    /*获取属性为slot的slot https://cn.vuejs.org/v2/api/#slot*/
    const slotTarget = getBindingAttr(el, 'slot')
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
      // preserve slot as an attribute for native shadow DOM compat
      // only for non-scoped slots.
      if (el.tag !== 'template' && !el.slotScope) {
        addAttr(el, 'slot', slotTarget)
      }
    }
  }
}

/*处理组件*/
function processComponent (el) {
  let binding
  /*获取is属性，用于动态动态组件 https://cn.vuejs.org/v2/api/#is */
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding
  }
  /*inline-template 内置组件 https://cn.vuejs.org/v2/api/#内置的组件*/
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true
  }
}

/*处理属性*/
function processAttrs (el) {
  /*获取元素属性列表*/
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, isProp
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
    /*匹配v-、@以及:，处理ele的特殊属性*/
    if (dirRE.test(name)) {
      /*标记该ele为动态的*/
      // mark element as dynamic
      el.hasBindings = true
      // modifiers
      /*解析表达式，比如a.b.c.d得到结果{b: true, c: true, d:true}*/
      modifiers = parseModifiers(name)
      if (modifiers) {
        /*得到第一级，比如a.b.c.d得到a，也就是上面的操作把所有子级取出来，这个把第一级取出来*/
        name = name.replace(modifierRE, '')
      }
      /*如果属性是v-bind的*/
      if (bindRE.test(name)) { // v-bind
        /*这样处理以后v-bind:aaa得到aaa*/
        name = name.replace(bindRE, '')
        /*解析过滤器*/
        value = parseFilters(value)
        isProp = false
        if (modifiers) {
          /*
              https://cn.vuejs.org/v2/api/#v-bind
              这里用来处理v-bind的修饰符
          */
          /*.prop - 被用于绑定 DOM 属性。*/
          if (modifiers.prop) {
            isProp = true
            /*将原本用-连接的字符串变成驼峰 aaa-bbb-ccc => aaaBbbCcc*/
            name = camelize(name)
            if (name === 'innerHtml') name = 'innerHTML'
          }
          /*.camel - (2.1.0+) 将 kebab-case 特性名转换为 camelCase. (从 2.1.0 开始支持)*/
          if (modifiers.camel) {
            name = camelize(name)
          }
          //.sync (2.3.0+) 语法糖，会扩展成一个更新父组件绑定值的 v-on 侦听器。
          if (modifiers.sync) {
            addHandler(
              el,
              `update:${camelize(name)}`,
              genAssignmentCode(value, `$event`)
            )
          }
        }
        if (isProp || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          /*将属性放入ele的props属性中*/
          addProp(el, name, value)
        } else {
          /*将属性放入ele的attr属性中*/
          addAttr(el, name, value)
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers, false, warn)
      } else { // normal directives
        /*去除@、:、v-*/
        name = name.replace(dirRE, '')
        // parse arg
        const argMatch = name.match(argRE)
        /*比如:fun="functionA"解析出fun="functionA"*/
        const arg = argMatch && argMatch[1]
        if (arg) {
          name = name.slice(0, -(arg.length + 1))
        }
        /*将参数加入到ele的directives中去*/
        addDirective(el, name, rawName, value, arg, modifiers)
        if (process.env.NODE_ENV !== 'production' && name === 'model') {
          checkForAliasModel(el, value)
        }
      }
    } else {
      /*处理常规的字符串属性*/
      // literal attribute
      if (process.env.NODE_ENV !== 'production') {
        const expression = parseText(value, delimiters)
        if (expression) {
          /*
            插入属性内部会被删除，请改用冒号或者v-bind
            比如应该用<div :id="test">来代替<div id="{{test}}">
          */
          warn(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          )
        }
      }
      /*将属性放入ele的attr属性中*/
      addAttr(el, name, JSON.stringify(value))
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component &&
          name === 'muted' &&
          platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true')
      }
    }
  }
}

/*检测该元素是否存在一个for循环中，将会沿着parent元素一级一级向上便利寻找是否处于一个for循环中。*/
function checkInFor (el: ASTElement): boolean {
  let parent = el
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent
  }
  return false
}

/*解析表达式，比如a.b.c.d得到结果{b: true, c: true, d:true}*/
function parseModifiers (name: string): Object | void {
  /*根据点来分开各个级别的正则，比如a.b.c.d解析后可以得到.b .c .d*/
  const match = name.match(modifierRE)
  if (match) {
    const ret = {}
    match.forEach(m => { ret[m.slice(1)] = true })
    return ret
  }
}

function makeAttrsMap (attrs: Array<Object>): Object {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (
      process.env.NODE_ENV !== 'production' &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn('duplicate attribute: ' + attrs[i].name)
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el): boolean {
  return el.tag === 'script' || el.tag === 'style'
}

/*判断是否是被禁止的标签（style标签或者script标签）*/
function isForbiddenTag (el): boolean {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

const ieNSBug = /^xmlns:NS\d+/
const ieNSPrefix = /^NS\d+:/

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  const res = []
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '')
      res.push(attr)
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  let _el = el
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn(
        `<${el.tag} v-model="${value}">: ` +
        `You are binding v-model directly to a v-for iteration alias. ` +
        `This will not be able to modify the v-for source array because ` +
        `writing to the alias is like modifying a function local variable. ` +
        `Consider using an array of objects and use v-model on an object property instead.`
      )
    }
    _el = _el.parent
  }
}

```