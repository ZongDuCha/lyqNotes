
#### DNS Prefetch 即DNS预获取，可以有效的减少DNS解析时间和次数。是优化网页性能的一部分

#### DNS-prefetch​作用简单说明就是当你浏览网页时，浏览器会加载网页时对网页中的域名进行解析缓存，这样在你单击当前网页链接无需DNS解析，减少浏览者等待时间，提高用户体验。

浏览器对网站第一次的域名DNS解析查找流程一次为：
`浏览器缓存`-`系统缓存`-`路由器缓存`-`ISP`-`DNS缓存`-`递归搜索`

#### DNS-prefetch目前主流浏览器都支持
```html
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//www.spreadfirefox.com/">
<link rel="dns-prefetch" href="//img1.jpg">
```

<!-- more -->

强制查询特定主机名，在这个例子中，浏览器将预解析域名"www.spreadfirefox.com"。
```html
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="http://www.spreadfirefox.com/">
```


#### 需要注意的是，虽然dns-prefetch能够加快网页解析速度，但是也不能随便滥用，因为多页面重复DNS预解析会增加重复DNS查询的次数。

如果需要禁止隐式的 DNS Prefetch，可以使用以下的标签：

```html
<meta http-equiv="x-dns-prefetch-control" content="off">
```

除此外还有：
```html
预连接 <link rel="preconnect" href="//jirengu.com">
预获取 <link rel="prefetch" href="image.png">
预渲染 <link rel="prerender" href="//xiedaimala.com">
```


#### link 和 @import 的区别

1. 诞生的关系不同

`link` 是xhtml提供的标签，不仅可以加载css文件，还可以定义RSS,rel连接属性等等。 `@import` css提供的语法规则，只能导入样式表的作用，

2. 加载顺序不同

加载页面时，`link`标签引入的css文件被同时加载. `@import`引入的css将在页面加载完成后执行加载。

3. 兼容性区别

`@import`是css2.1才有的语法，只能在ie5以上才能识别；`link`标签作为xhtml的元素，不存在兼容问题

4. 可操作Dom区别

可以通过js 动态操作dom ， 插入`link` 标签来改变样式；由于dom方法是基于文档的，无法使用js操控`@import`的方式插入样式

5. 权重区别

引入的样式权重大于`@import`引入的样式