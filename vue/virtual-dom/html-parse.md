### html-parse （解析html模版）
  - src/compiler/parser/html-parser

  - 循环解析 `template`，用正则匹配相应元素（开始和结束标签，注释节点，文档类型...）,不同的情况不同处理

  - 循环中利用`advance函数`不断的前进字符，直到结束

  - 对于注释节点和文档类型的匹配，只advance前进字符串到结尾

  - 匹配和解析开始标签，先通过正则`startTagOpen `匹配开始 标签名，调用`handleStartTag `解析,正则`match`匹配节点属性(class,id,自定义属性...)，将属性添加到match.attrs,判断如果不是一元标签类似`<img>`,`<br>`,`<hr>`，就遍历处理attrs属性, 如果是一元标签，就保存开始标签名压入stack，利用`advance函数`前进至开始标签的闭合符，

  - 匹配和解析闭合标签，先通过正则`endTag`匹配闭合标签，前进至闭合标签末尾，调用`parseEndTag`倒序遍历解析，判断闭合标签名跟handleStartTag保存的开始标签名匹配比较，如果不同，就报错，如果匹配就从stack里弹出开始标签名，并从stack尾部获取`lastTag`,最后调用`option.end`。

  - 接下来就是截取html的text文本，如果textEnd大于或等于0，就说明从当前位置到textEnd的位置都是文本，并且如果有 < 的字符，就继续查找真正文本结束的位置，调用`advance`前进字符, 如果textEnd小于0的情况下，说明整个`tepmlate`解析完了或者没有 文本了，就把剩余的html传给text，清空html,最后调用chars 回调函数


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
    // 如果没有lastTag，并确保不是在一个纯文本内容元素中：script、style、textarea
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      //判断html字符串是否以<开头
      if (textEnd === 0) {
        // 判断html是不是以 <!-- --> 注释的
        // const comment = /^<!\--/
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')
          
          if (commentEnd >= 0) {
            // 如果有保留注释，就执行 comment 方法
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd))
            }   
            advance(commentEnd + 3)
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 判断是否为向下兼容放入注释，如<![if !IE]>
        // const conditionalComment = /^<!\[/
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')
          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // html头部
        // 获取doctype 开头的标签内容
        // const doctype = /^<!DOCTYPE [^>]+>/i
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // 处理结束标签
        // const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // 处理起始标签, 获取开始标签的match对象
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          // 解析头部 节点属性
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(lastTag, html)) {
            advance(1)
          }
          continue
        }
      }

      let text, rest, next
      // 如果<标签位置大于0，表示b标签内有内容
      // 解析<，开始标签或结束标签
      if (textEnd >= 0) {
        // 截取从 0 - textEnd 的字符串
        rest = html.slice(textEnd)
        // 获取在普通字符串中的<字符，而不是开始标签、结束标签、注释、条件注释
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          // 处理文本中的<字符
          // 解析  123123</div>,,<前的内容 123123
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        // 最终截取字符串的内容
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
      // 处理stackedTag为 script, style, textarea 安全解析
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
      // tag解析结束
      parseEndTag(stackedTag, index - endTagLength, index)
    }
    // 如果html文本解析到最后
    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`)
      }
      break
    }
  }

  // Clean up any remaining tags
  // 清除所有的残余标签
  parseEndTag()

  // 将index推进n个字符，然后从第n个字符截取html内容字符串
  function advance (n) {
    index += n
    html = html.substring(n)
  }

  // 开始匹配开始标签中的内容
  // 该方法使用正则匹配获取HTML开始标签，并且将开始标签中的属性都保存到一个数组中。最终返回标签结果：标签名、标签属性和标签起始结束位置
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

      // 在第二次while循环后 end匹配到结束标签 => ['>','']
      if (end) {
        match.unarySlash = end[1] 
        advance(end[0].length)  // 标记结束位置
        match.end = index   // 返回结束位置的索引
        return match  // 返回匹配对象 ----------- （start）左开始标签起始位置 （end）右标签结束位置 （tagName）标签名 （attrs）节点属性集合
      }
    }
  }

  // 处理开始标签，提取节点属性
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

    // 解析开始标签的属性名和属性值
    const l = match.attrs.length
    const attrs = new Array(l)
    // {name:'id',value:'test'}的格式
    // 循环提取开始标签的节点属性,存入attrs
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
        // 处理转义字符
        value: decodeAttr(value, shouldDecodeNewlines)
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
      //设置结束标签
      lastTag = tagName
    }

    if (options.start) {
      // 调用start回调函数
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  // 处理结束标签
  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }

    // Find the closest opened tag of the same type
    // 倒序循环 从堆栈中找到结束标签对应的tag名
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
      // 从栈中移除元素，并标记为 lastTag
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {  // 从栈中移除元素，并标记为 lastTag
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') { // 段落标签
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}
/*
  先是获取开始结束位置、小写标签名；然后遍历堆栈找到同类开始 TAG 的位置；
  对找到的 TAG 位置后的所有标签都执行 options.end 方法；
  将 pos 后的所有标签从堆栈中移除，并修改最后标签为当前堆栈最后一个标签的标签名；
  如果是br标签，执行 option.start 方法；如果是 p 标签，执行 options.start 和options.end 方法。
*/
```

### parseHTML 参数说明
![](https://segmentfault.com/img/bVbeE3d?w=951&h=524)


### parseHTML函数 While循环处理流程
![](https://segmentfault.com/img/bVbeFbN?w=1082&h=809)
