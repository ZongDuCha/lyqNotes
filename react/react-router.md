#### 不管是HashRouter,还是BrowserRouter ，他们的子元素必须是只有一个，可以用Switch将route包裹起来

#### react 用js跳转路由时可以用`this.props.history.push('/')`,如果报错push - undefined 的话，往往是props是个空对象，所以需要在`route`中也添加路由
```js
// app.js
<BrowserRouter>
    <div>
        <Route exact path='/' component={Index} />
        <Route path="/list" component={List}/>
        // 把底部导航按钮以组件形式引入，这样组件内部就可以用 this.props.history.push('/'),但是要注意this的指向
        <Route path="/" component={Tabbar}/>
    </div>
</BrowserRouter>
```