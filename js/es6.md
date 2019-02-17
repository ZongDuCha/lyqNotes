### import export
```js
1.当用export default people导出时，就用 import people 导入（不带大括号）

2.一个文件里，有且只能有一个export default。但可以有多个export。

3.当用export name 时，就用import { name }导入（记得带上大括号）

4.当一个文件里，既有一个export default people, 又有多个export name 或者 export age时，导入就用 import people, { name, age } 

5.当一个文件里出现n多个 export 导出很多模块，导入时除了一个一个导入，也可以用import * as example
```


### es6 箭头函数

```js
document.querySelector('p').onclick = () => {
    console.log(this)
}
// window
```


箭头函数 Arrow functions ：箭头函数与现有函数不同，但并不是用来替代现有函数的，他一般是用来作为回调函数使用的，主要目的是为了简化回调函数的写法：
箭头函数本身是没有this的，函数内的this执行箭头函数 定义时所在的对象，而不是使用时所在的对象，

箭头函数内部，不存在arguments对象

不可以当作构造函数，不可以使用new指令

简化回调函数
```js
document.querySelector('p').onclick = () => {
    console.log(this)
}
// windoiw  使用箭头函数自身是没有this值的

var x = '1';
var set = x => {
	console.log(x)
	console.log(arguments)
}
set(2)
// 2
// ReferenceError: arguments is not defined
// 箭头函数没有arguments值

function set(x){
    console.log(x)
}
var s = new set(1)
// 1

set = x => {
	console.log(x)
}
var s = new set(1)
// Uncaught TypeError: set is not a constructor
// 一般函数可以用new指令，但是箭头函数不能使用new指令

```

### Array.isArray() 用来判断一个变量是否是数组

```javascript
var arr = []
Array.isArray(arr)
```

除此之外还有五种方式判断一个变量是否是数组

```javascript
// 1.基于instanceof
a instanceof Array;

// 2.基于constructor
a.constructor === Array

// 3.基于Array.prototype.isProtptypeOf()
Array.prototype.isPrototypeOf(a)

// 4.基于Object.getPrototypeOf()
Object.getPrototypeOf(a) === Array.prototype

// 5.Object.prototype.toString.apply()
Object.prototype.toString.apply(a) === '[Object Array]'

```

<!-- more -->

一般主流框架都是基于最后一种方式去判断

既然用这种方式能够判断是不是数组，那是不是能够判断字符串，数组，对象....?马上实验一波

```javascript
Object.prototype.toString.call('')                  // "[object String]"

Object.prototype.toString.call(new String)          // "[object String]"

Object.prototype.toString.call(1)                   // "[object Number]"

Object.prototype.toString.call(NaN)                 // "[object Number]"

Object.prototype.toString.call(new Number)          // "[object Number]"

Object.prototype.toString.call(-'1')                // "[object Number]"

Object.prototype.toString.call(new Object)          // "[object Object]"

Object.prototype.toString.call({})                  // "[object Object]"

Object.prototype.toString.call(new Boolean)         // "[object Boolean]"

Object.prototype.toString.call(false)               // "[object Boolean]"

Object.prototype.toString.call(null)                // "[object Null]"

Object.prototype.toString.call(undefined)           // "[object Undefined]"

Object.prototype.toString.call([])                  // "[object Array]"

Object.prototype.toString.call(new　Array)          // "[object Array]"

```
