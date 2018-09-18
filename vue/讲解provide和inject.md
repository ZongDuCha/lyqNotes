### provide/inject用法

```js
// 父组件
// 省略部分代码
export default {
  provide(){
    return {
      value: 123
    }
  }
}


// 子组件
export default {
  inject:['value'] // 在created中也可直接获取使用
}
```

`而且无论组件嵌套的有多深，只要在上级注入了provide数据，那么下级组件就可以通过inject方式去获取数据，并在起上下游关系成立的时间里始终生效。，但是需要注意的是子组件注入provide，父组件通过inject是拿不到的哈`


但是这样写会有一个问题
#### 数据不是一个可响应的,也就是说父组件改变了数据之后，子组件是无法实时变化的
比如:
```js
// 父组件
// 省略部分代码
export default {
  provide(){
    return {
      value: 123
    }
  },
  created(){
      setTimeout(()=>{
        this._provided.value = '改变的值'
        console.log(this._provided.value)
      },3000)
  }
}


// 在子组件的视图中写 {{value}}
```
3秒过后虽然打印出了'改变的值'，但是子组件的视图中却还是之前的123，好尴尬....
因为这是官网刻意弄成这样的，官方文档对provide/inject也说明了:
> 提示：provide 和 inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。

但是如果传入的是一个响应的数据，那么子组件中还是会实时变化的!众所周知知，vue实例里的data数据是一个响应式的数据，所以可以这样写成：
```js
// 上级组件
// 省略部分代码
export default {
  provide(){
    return {
      app: this
    }
  },
  data(){
      return {
          value: 123
      }
  },
  created(){
      setTimeout(()=>{
          this.value = '改变值把'
      })
  }
}


// 下级组件
export default {
  inject:['app'] // 在created中也可直接获取使用
}

// 调用的时候应该写成 this.app.value
```
下级组件显示了123，3秒后下级组件变化显示为'改变值把'

因为传给value的是一个组件的实例，实例里有包含data里的数据，还有方法，重点的是他们是一个 双向绑定的，所以解决了使用provide/inject后，改变数据无法响应的问题,完美.

#### 配合mixins效果更佳哦