### 函数中 return false 到底做了什么？

jq 每次调用return false时，其实做了三件事
```js
event.preventDfefault();

event.stopPropagation();

停止回调函数执行并立即返回
```

### 对添加事件的兼容
```js
// 添加事件
function addEvent(el, onType, handle, bol){
    if(el.addEventListener){
        el.addEventListener(onType, handle, bol)
    }else if(el.attachEvent){
        el.attachEvent('on'+onType, handle)
    }else{
        el['on'+onType] = handle
    }
}

// 删除事件
function removeEvent(el, onType, handle, bol){
    if(el.addEventListener){
        el.removeEventListener(onType, handle, bol)
    }else if(el.attachEvent){
        el.detachEvent('on'+onType, handle)
    }else{
        el['on'+onType] = null
    }
}
```

### Event.eventPhase属性返回一个整数常量，表示事件目前所处的阶段。该属性只读。
Event.eventPhase的返回值有四种可能。

0. 事件目前没有发生。
1. 事件目前处于捕获阶段，即处于从祖先节点向目标节点的传播过程中。
2. 事件到达目标节点，即Event.target属性指向的那个节点。
3. 事件处于冒泡阶段，即处于从目标节点向祖先节点的反向传播过程中。

http://javascript.ruanyifeng.com/dom/event.html#toc13