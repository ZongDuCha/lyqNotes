virtual dom的出现就是解决 直接操作dom造成的性能问题， virtual dom相当于是在js里模拟虚拟dom，当数据发生改变的时候，在虚拟dom先完成更新，最后在创建渲染真实dom节点:

```js {.line-numbers}
let el = {
    tagName: 'div',
    props:{
        id: 'wrap'
    },
    children: [
        { tgName: 'li', props: {id: 'list-1',content:'1'}}
        { tgName: 'li', props: {id: 'list-2',content:'2'}}
        { tgName: 'li', props: {id: 'list-3',content:'3'}}
    ]
}
```

对应上面代码的html结构是：

```html {.line-numbers}
<div id="wrap">
    <li id="list-1">1</li>
    <li id="list-2">2</li>
    <li id="list-3">3</li>
</div>
```

virtual domd当数据状态变更 > 新的渲染树和旧的渲染树比较，记录出两者的差异.

简单学习下写一个遍历元素的函数:

```js {.line-numbers}
function nodeInit( el ) {
    // 判断传入类型
    let elNode = typeof el == 'string' ? document.querySelector(el) : el;
    // 判断传入有效值
    if ( !el || !(elNode instanceof HTMLCollection) && !( elNode instanceof Element)) {
        throw(el+'This is not an effective value.')
        return false;
    }
    const vm = {        
        elNode,     // 元素节点
        props: [],      // 元素属性值
        children: []，        // 元素子元素
        html: elNode.innerHTML,      // 内容
        tagNmae: elNode.tagName.toLowerCase()   // 标签名 
    }
    for(let i in vm.elNode){ // 遍历属性值
        vm.props.push( {[i]: vm.elNode[i]} )
    }
    if( !!elNode.children ){ // 如果有子节点
        for( let i= 0,len= elNode.children.length; i < len; i++){
            // 深度遍历
            vm.children[i] = nodeInit( elNode.children[i] )
        }
    }
    return vm;
}
```

```html {.line-numbers}
<div class="wrap">
    <ul>
        <li>123</li>
    </ul>
    <div class="con">123</div>
</div>

-------

var ren = new nodeInit('.wrap')
console.log( ren )

// 输出如下:
// ren = {
//     elNode: div.wrap,
//     props: [...],
//     innerText: '',
//     tagName: 'div',
//     children: [{
//             elNode: ul,
//             props: [...],
//             tagName: 'ul',
//             innerText: '',
//             children: [
//                 {
//                     elNode: li,
//                     props: [...],
//                     innerText: '',
//                     tagName: 'li',
//                     children: [...]
//                 }
//             ]
//         },
//         {
//             elNode: div.con,
//             props: [...],
//             tagName: 'li',
//             innerText: '',
//             children: [...]
//         }
//     ],

// }
```


在写一个jsHTML结构对象,实现渲染真实的dom元素
```js 
var nodeObj = {
    elNode: 'div.wrap',
    props: [{id: 'wrap'},{class: 'totinsa'}],
    tagName: 'div',
    innerText: '123',
    children: [{
            elNode: 'ul',
            props: [],
            innerText: '',
            tagName: 'ul',
            children: [
                {
                    elNode: 'li',
                    props: [],
                    html: [],
                    tagName: 'li',
                    innerText: '123',
                    children: []
                }
            ]
        },
        {
            elNode: 'div.con',
            props: [{class: 'con'}],
            tagName: 'div',
            innerText: '123',
            children: []
        }
    ]
}
```

```js
function renderNode(obj){
    const elNode = document.createElement( obj.tagName )

    // 文本内容
    elNode.innerText = obj.innerText || ''

    // 渲染props属性值
    if( !!obj.props.length ){
        obj.props =  Object.assign(...obj.props)
        for(let i in obj.props){
            elNode.setAttribute(i, obj.props[i])
        }
    }

    // 深度遍历子节点元素
    if(!!obj.children.length){
        for(let i in obj.children){
            elNode.appendChild( renderNode( obj.children[i] ) )
        }
    }
    return elNode
}
let b = document.body
b.insertBefore( renderNode(nodeObj), b.children[0] )
```