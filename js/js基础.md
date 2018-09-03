## js作用域链


当js代码执行的时候，都会生成一个作用域链。作用域链的作用是保证有权访问执行环境里的变量和函数是有序访问。访问作用域链的变量只能在包含他的函数中向上访问，直到全局执行环境为止（window对象），整个作用域链是由不同执行位置上的变量对象按照规则所构建一个链表

作用域链就是在内部函数中，可以访问外部函数变量的这种机制，用链式查找决定那些数据能被内部函数访问。

![123](http://files.jb51.net/file_images/article/201605/201655141623615.png?201645141635)

## 闭包的理解

闭包是指有权访问另一个函数的作用域中变量的函数，创建闭包最常见的方式就是在函数中创建另一个函数，通过创建的这个闭包函数访问外层的局部变量，利用闭包可以突破作用域链，将变量缓存在内存中，简单来说闭包就是外部想访问一个函数内部参数或变量的桥梁，并且访问结束后将引用的变量保存在内存中供下次使用。

##### 闭包的特性：

- 函数中嵌套函数

- 闭包函数可以访问外层作用域的参数和变量 （沿着作用域链寻找）

- 闭包内的参数和变量不会被垃圾回收机制回收

- 封装变量，类似其他语言的私有变量，来限制变量的作用域

##### 闭包的优缺

- 创建是为了封装和缓存变量，以供外部使用。可以避免全局变量污染

- 但是闭包会保存在内存中，会增大内存的占有率，使用不当容易造成内存泄漏，

- 在js中，函数就是闭包，只有函数才能产生作用域的概念

- 在退出函数之前，将不使用的局部变量全部删除

- 闭包和循环如果同时使用的话有时会有问题，因为闭包内的变量是保存变化的，如果创建闭包之后再使用函数的话，循环里的 i 可能会一直是最后一个值（比如最大值）。

![js闭包图解](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1524246978601&di=d940f06269611579008d091b87b1d945&imgtype=0&src=http%3A%2F%2Fs15.sinaimg.cn%2Fmw690%2F0066XBEogy6SH2GHjdQ6e%26690)


## js作用域

`全局作用域`:

在js中，最外层定义的变量拥有全局作用域，对任何内容来说，都是可以访问的。

```js
var a = 'js';
function b(){
    console.log(a)
}

b(); // js
```

`局部作用域`:

局部作用域在函数内部定义的变量，一般只有在当前作用域内下可以访问，而对于函数外部是不可以访问的，但是函数内部定义变量一定要写var命令，不然等同于生成了全局作用域。

```js

function a(){
    var b = 'js'
}
a()
console.log(b) // ReferenceError: b is not defined


function a(){
    b = 'js'
}
a()
console.log(b) // js
```

- javascript的作用域是相对函数而言的，可以称为函数作用域

- 所以并不是用var声明的变量作用范围起止于花括号之间，javascript并没有块级作用域


## javascript原型链（prototype）

每一个对象内部都有一个prototype属性，当查找一个对象属性的时候，如果这个属性不存在这个对象中，就会通过这个prototype去查找这个属性，这个prototype又会有自己protoype属性，这样一层一层查找，直到Object内建对象中，如果Object中也不存在，就会返回undefined。

- javascript对象赋值给新的变量的时候，实际上只是通过引用来传递的，新的变量中没有属于自己的原型副本。当我们修改原型的时候，与之相关的对象也会跟随改变，因为他们都指向同一个内存地址。

![原型图解](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1524246781051&di=de48a70f756cd6ac7fb1e93d86dda1c2&imgtype=jpg&src=http%3A%2F%2Fimg1.imgtn.bdimg.com%2Fit%2Fu%3D4057629261%2C3288707102%26fm%3D214%26gp%3D0.jpg)


## 事件代理

事件代理又称事件委托，是把原本需要绑定在元素的事件委托给父元素或包含他的其他元素，让委托的元素监听并处理事件。

- 事件代理的原理是利用dom元素的时间冒泡机制

- 使用事件代理能够提高性能

- 大量节省内存，减少事件注册，（比如在table中代理所有tr元素的click事件）

- 一般新增元素事件是没有添加进去的，这时就可以在父元素上用事件代理能很好解决这个问题


## this的理解

this的指向在函数定义的时候是不确定的，只有在执行函数的时候才能确定this指向谁，实际上this的最终指向的是哪个调用他的对象内

```js
function a(){
    this.name = 'js'
    console.log(this.name,this) // undefined , window
}
a() // 相当于是window.a()



var o = {
    name: 'js',
    fn: function (){
        console.log(this.name,this) // 'js' , fn
    }
}
o.fn() // 相当于window.o.fn()
```
o.fn()是通过o调用的，this自然指向了o

1. 如果一个函数中有this，但是它没有被上一级的对象所调用，那么this指向的就是window，严格模式除外。

2. 如果这个函数被上一级的对象所调用，那么this指向的就是上一级的对象。尽管这个函数被多个的对象所调用，this指向的还是调用它的上一级的对象

3. 在事件中，this指向触发这个事件的对象，特殊的是，IE中的attachEvent中的this总是指向全局对象Window

```js 
var o = {
    a:10,
    b:{
        a:12,
        fn:function(){
            console.log(this.a); // 12
        }
    }
}
o.b.fn();
```

尽管被多个对象调用，但是this依然指向他上一级对象


### 当this遇到return时的问题

如果返回值是一个对象，那么this指向的就是那个返回的对象，如果返回值不是一个对象那么this指向的还是函数实例。

```js 
function fn()  
{  
    this.name = 'js';  
    return {};  
}
var a = new fn;  
console.log(a.name); //undefined
// 返回值返回的是对象


function fn()  
{  
    this.name = 'js';  
    return function(){};
}
var a = new fn;  
console.log(a.name); //undefined
// 返回值返回的是匿名函数


function fn()  
{  
    this.name = 'js';  
    return undefined;
}
var a = new fn;  
console.log(a.name); //js
// 返回值返回的是不是对象



function fn()  
{  
    this.name = 'js';  
    return undefined;
}
var a = new fn;  
console.log(a); //fn {name: "js"}
// 返回值返回的是不是对象
```


还有null比较特殊，虽然null也是对象，但是this指向的还是函数的实例

```js
function fn()  
{  
    this.name = 'js';  
    return null;
}
var a = new fn;  
console.log(a.name); //js
```


总结：

- 在严格模式下，默认的this不是window，而是undefined。在node中，是Global对象

- new 会改变this的对象，就好像new使用了call或apply方法（但实际上可能并不是）


参考文献：https://www.cnblogs.com/pssp/p/5216085.html
参考文献：https://www.cnblogs.com/humin/p/4556820.html
参考文献：https://www.cnblogs.com/liugang-vip/p/5616484.html


## 事件模型

<!-- more -->

冒泡事件： 当使用事件冒泡的时候，子元素先触发，然后父元素后触发

捕获事件： 当使用时间捕获的时候，父元素先触发，然后子元素后触发

dom时间流： 同时支持冒泡和捕获事件，先触发捕获机制然后在冒泡机制

阻止冒泡： 在w3c中设置使用`stopPropagation()`方法；在IE下设置 `cancelBubble = true`.

阻止默认事件： 阻止事件默认的行为，在w3c中使用 `preventDefault()`方法；在IE下设置`window.event.returnValue = false`



## new操作符内部具体干了什么

1. 创建一个空对象
2. 设置原型链，将赋值变量的__proto__指向新对象的prototype，继承属性和方法
3. 将新的对象this指向引用的对象，就好像使用了call或apply
4. 判断函数返回值的类型，如果是对象，就会返回对象的内容，如果不是就返回这个引用类型的对象


## Ajax原理

Ajax的原理就是服务器和客户端之间加了个中间层（ajax引擎），通过xmlhttpRequest对象对服务器发起异步请求，从服务器获取数据，然后用js操作dom更新页面内容，实现用户操作与服务器响应异步化

![](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1524670684736&di=d4ec4bc8d6c9acc21962c474591a1ee3&imgtype=0&src=http%3A%2F%2Ffilesimg.111cn.net%2F2011%2F05%2F20111119011732771.jpg%3F16)


## 几种跨域方案

1. 通过jsonp跨域
2. document.domain + iframe跨域
3. location.hash + iframe
4. window.name + iframe跨域
5. postMessage跨域
6. 跨域资源共享（CORS）
7. nginx代理跨域
8. nodejs中间件代理跨域
9. WebSocket协议跨域


## 实现模块化开发

 模块化就是讲js文件按照功能分离，根据需求引入不同的文件中。

 优点：
 
 1.防止命名冲突
 2.减少文件依赖
 3.异步加载文件


 立即执行函数,不暴露私有成员

 ```js
var module1 = (function(){
　　　　var _count = 0;
　　　　var m1 = function(){
　　　　　　console.log(1)
　　　　};
　　　　var m2 = function(){
　　　　　　console.log(2)
　　　　};
　　　　return {
　　　　　　m1 : m1,
　　　　　　m2 : m2
　　　　};
})();
 ```

 ## 异步加载js方式
 1.动态生成<script>标签
 
 ```js
(function(){
    function lazy(){
        var s=document.createElement("script");
        s.type="text/javascript";
        s.src="http://china-addthis.googlecode.com/svn/trunk/addthis.js";
        document.body.appendChild(s);
    }
    window.addEventListener("load",lazy,false);
})();
```
 
 2.defer（同步，与其他文件加载时并行的）
 <script type="text/javascript" src='http://china-addthis.googlecode.com/svn/trunk/addthis.js' defer="defer"></script>
defer属性规定是否对脚本执行进行延迟，直到页面加载为止。之前只有IE的hack支持defer属性，现在H5开始全面支持defer属性。

 3.async（异步，会打乱执行顺序）
 <script type="text/javascript" src='http://china-addthis.googlecode.com/svn/trunk/addthis.js' async="async"></script>
 async是HTML5的新属性，该属性规定一旦脚本可用，则会异步执行（一旦下载完毕就会立刻执行）。需要注意的是：async属性仅适用于外部脚本（只有在使用src属性时）。

4.XHR注入

5.ajax eval

6.iframe

## XML和JSON的区别

1. JSON 比 XML数据体积小，传输速度快，容易解析处理，数据容易交互

3. JSON 比 XML 不好理解数据格式

4. JSON的速度要远远快于XML


## js 中判断数据类型的方法
```js
typeof 只能判断基本类型(number, string, Boolean, Object ,null , Symol, function)

instanceof 判断已知对象类型的方法，([] instanceof Array)

constructor 根据对象的constructor对象类型判断

Object.prototype.toString.call([]) 根据Object方法判断
```