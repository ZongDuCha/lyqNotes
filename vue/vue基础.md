### Vue实例有一个完整的生命周期，也就是从开始创建、初始化数据、编译模板、挂载Dom、渲染→更新→渲染、销毁等一系列过程

#### vue生命周期总共分为8个阶段创建前/后，载入前/后，更新前/后，销毁前/后。

在beforeCreated阶段，vue实例的挂载元素 进行数据的观测,只是一个空壳，无法访问到数据和真实的dom，一般不做操作，el还没有。

在created阶段，vue实例已经可以使用数据，绑定事件，在这里更改data数据，不会触发updata钩子函数

在beforeMount阶段，vue实例的$el和data都初始化了，实例中虚拟dom已经创建完成，页面上挂载的数据还未替换。

在mounted阶段，组件已经出现在页面中，数据、真实dom都已经处理好了,事件都已经挂载好了，页面上挂载的数据成功渲染。可以在这里操作真实dom

在beforeUpdate阶段，当组件或实例的数据更改之后，会立即执行beforeUpdate，然后vue的虚拟dom机制会重新构建虚拟dom与上一次的虚拟dom树利用diff算法进行对比之后重新渲染，一般不做什么事儿

在updated阶段，数据已经更改完成，dom也重新render完成，可以操作更新后的虚拟dom

在beforeDestroy阶段后，立即执行beforeDestroy，一般在这里做一些善后工作，例如清除计时器、清除非指令绑定的事件等等

在destroy阶段后，对data的改变不会再触发周期函数，说明此时vue实例已经解除了事件监听以及和dom的绑定，但是dom结构依然存在。

#### vue.js 是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。

具体步骤：

第一步：需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter和getter。这样的话，给这个对象的某个值赋值，就会触发setter，那么就能监听到了数据变化

第二步：compile解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图

第三步：Watcher订阅者是Observer和Compile之间通信的桥梁，主要做的事情是:

1、在自身实例化时往属性订阅器(dep)里面添加自己

2、自身必须有一个update()方法

3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。

第四步：MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。