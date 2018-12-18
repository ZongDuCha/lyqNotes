### proxy是es6引入Proxies的，他可以改变你操作对象的方式，比如拦截对象的写入和读取属性操作

##### 一般对一个对象的赋值，其实也就是set方法里对对象的一次赋值，获取对象的属性其实就是在get里return了 对象的属性，也算是给对象加一个壳（拦截），

```js
var observed = {
  /*
  * @object 正在操作的对象本身
  * @prop 被访问的对象属性
  * @value 接受的新值
  */
  set: (object, prop, value) => {
    // object[prop] = value
  },
  /*
  * @object 正在操作的对象本身
  * @prop 被访问的对象属性
  */
  get: (object, prop) => {
    // return object[prop]
  }
}
/*
* 创建proxy对象
* new Proxy 接受两个参数 1. 观察的值 2. handler 定义get或set逻辑
* get在获取对象属性时触发， set在赋值对象属性时触发
* 返回Proxy对象
*/
let obj = new Proxy({}, observed)
obj.name = 'js'
// js
console.log(obj.name)
// undefined
console.log(obj)
// Proxy {}
```

##### 如果把set和get里的注释去掉，就可以正常的对对象的属性赋值和获取，就是我们生活中正常的使用对象

#### 还可以对传入的值和获取对象属性的行为做一次验证，例如实现私有对象属性：
#### 不能获取身高的值，但是可以赋值
#### 不能修改体重，但是可以获取
#### 爱好即可以修改也可以获取
```js
var my = {
  height: 190,
  weight: 115,
  hobby: 'js'
}
var observed = {
  set: (object, prop, value) => {
    if (prop == 'weight') {
      throw new TypeError('不能修改体重')
    } else {
      object[prop] = value
    }
  },
  get: (object, prop) => {
    if (prop == 'height') {
      throw new TypeError('不能获取身高')
    } else {
      return object[prop]
    }
  }
}
let obj = new Proxy(my, observed)
obj.weight = 130 // 会报错不能修改体重
consoel.log(obj.weight) // 115 , 上一句赋值没有成功

console.log(obj.height) // 会报错不能获取身体
obj.height = 170
console.log(obj) 
// Proxy {height: 170, weight: 115, hobby: "js"}  虽然不能获取，但是可以修改

obj.hobby = 'java'
console.log(obj.hobby)
// java 即可以修改，也可以获取
```
#### 当然我只是举个小例子，其实实用的功能很强大

#### 还有时你希望切换两个不同的元素的属性或类名。例如：
```js
let view = new Proxy({
  selected: null
},
{
  set: function(obj, prop, newval) {
    let oldval = obj[prop];

    if (prop === 'selected') {
      if (oldval) {
        oldval.setAttribute('aria-selected', 'false');
      }
      if (newval) {
        newval.setAttribute('aria-selected', 'true');
      }
    }

    // The default behavior to store the value
    obj[prop] = newval;
  }
});

let i1 = view.selected = document.getElementById('item-1');
console.log(i1.getAttribute('aria-selected')); // 'true'

let i2 = view.selected = document.getElementById('item-2');
console.log(i1.getAttribute('aria-selected')); // 'false'
console.log(i2.getAttribute('aria-selected')); // 'true'
```

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable