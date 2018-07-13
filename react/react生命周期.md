```js
import React from 'react'

class App extends React.Component{
    consttructor(props, cont){
        // 只要组件有consttructor就要写super()，不然this会指向错误
        // 这里最先执行，可以获取从其他组件传来的数据，可以初始化数据
        super(props, cont)
        this.state = {...}
    }
    componentWillMount(){ // 组件准备挂载
        // consttructor 刚刚执行完后 才执行 componentWillMount
        // 这时组件和dom还没渲染，render还没执行
        // 主要是在服务端渲染
        // ajax请求数据，最好不要写在这里，因为如果数据返回空，就会造成页面空白,且不利于服务端渲染
    }
    componentDidMount(){ // 组件渲染完成
        // 组件首次渲染完成，此时dom节点已经生成
        // ajax请求数据可以写在这里，使用setState后悔重新渲染
    }
    componentWillReceiveProps(nextProps){ // props改变后执行
        // 仅在props有变化的时候才执行
        // 接收一个参数，通过对比 新的nextProps和旧的this.props,,用setState重新赋值新的props,从而重新渲染组件
    }
    shouldComponentUpdate(){

        // return false会阻止组件的更新
    }
}
```