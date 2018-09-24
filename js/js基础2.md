#### 防抖和节流
- 短时间内多次触发同一个事件，只执行最后一次，或者在开始时执行，中间不执行。比如公交车上车，要等待最后一个乘客上车
- 节流是连续触发事件的过程中以一定时间间隔执行函数。节流会稀释你的执行频率，比如每间隔1秒钟，只会执行一次函数，无论这1秒钟内触发了多少次事件

都为解决高频事件而来， scroll mousewhell mousemover touchmove onresize，后面有相应的代码实现函数的节流和防抖。

#### 1.JS具有自动垃圾收集的机制
- JS的垃圾收集器每隔固定的时间就执行一次释放操作，通用的是通过标记清除的算法
- 在局部作用域中，垃圾回收器很容易做出判断并回收，全局比较难，因此应避免全局变量
- 现在各大浏览器通常用采用的垃圾回收有两种方法：标记清除、引用计数。

09  0### Fcuntion.prototype.bind的实现

```js

Function.prototype.bind = function (){
    var _this = this; // 缓存原函数的this指向
    var _thisBind = [].shift.call(arguments); // 获取传入的第一个参数，即this的指向
    var bingOptions = [].splice.call(arguments); // 除第一个外之后的所有参数
    return function(){
        // 返回新的函数， 并且使用apply, 最后传入两次参数w作为apply的第二个参数
        return _this.apply.(_thisBind, [].concat.call(bingOptions, [].splice.call(arguments)))
    }
}

```

### AOP(面向切面编程)模式

在不改变原函数的代码情况下，添加类似生命周期函数，在原函数执行之前或之后执行某函数，例如在ajax请求中，在请求之前需要判断某个表单元素，判断不成功就不触发ajax请求，或者在请求之后处理数据，可以简单的制作一个http拦截器，主要还是对复杂的函数解耦，
```js
function ajaxData(){
    console.log('准备请求数据');
}
Function.prototype.before = function(fn){
    var _this = this; // 这个例子的this指向的是ajaxData
    if(fn.apply(this, arguments) == false){
        return false;
    }
    _this.apply(this, arguments)
    return _this;
}
Function.prorotype.after = function(fn){
    this.apply(this, arguments)
    console.log(this)
}
ajaxData.before(function(){
    console.log('之前')
}).after(function(){
    console.log('之后')
})
```


### Object.defineProperty

```js
writable // 是否可修改
Enumerable // 是否可以枚举
Configurable // 是否可删除
value // 值
```