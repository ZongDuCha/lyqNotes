#### XHTML 和 HTML的区别
主要区别在于功能，书写习惯，XHTML可以兼容各大浏览器，平板，手机，而且也能够快速并且正确编译网页

书写习惯上：
1.  在XHTML中，所有标签都必须是小写，不能既有大写又有小写，也不能都是大写

2. 标签必须正确的闭合，开始标签和结束必须成对出现，标签顺序也必须有序，正确

3. 在XHTML 1.0中规定标签属性必须是双引号

4. XHTML 1.1中不允许使用target="_blank"， 如果想要有开新窗口的功能，就必须改写为rel="external"，并搭配JavaScript实现此效果。
```html
<a href="http://blog.mukispace.com" rel="external">MUKI space</a>
```

#### H5新特性：
新增选择器 document.querySelector、document.querySelectorAll
拖拽释放(Drag and drop) API
媒体播放的 video 和 audio
本地存储 localStorage 和 sessionStorage
离线应用 manifest
桌面通知 Notifications
语意化标签 article、footer、header、nav、section
增强表单控件 calendar、date、time、email、url、search
地理位置 Geolocation
多任务 webworker
全双工通信协议 websocket
历史管理 history
跨域资源共享(CORS) Access-Control-Allow-Origin
页面可见性改变事件 visibilitychange
跨窗口通信 PostMessage
Form Data 对象
绘画 canvas
服务器发送事件 ( SSE, server-sent event ) （只要让服务器保持 HTTP 会话不关闭，当有新的更新时，立刻输出）

#### H5移除的元素：
纯表现的元素：basefont、big、center、font、s、strike、tt、u
对可用性产生负面影响的元素：frame、frameset、noframes

#### DOM文档加载顺序：
解析HTML结构
加载外部脚本和样式表文件(loading)
解析并执行脚本
DOM树构建完成（readyState：interactive）
加载外部资源文件（图片等）
页面加载完成（readyState：complete）

### doctype 作用
doctype一般声明与html文档的第一行，用于告诉浏览器以什么样的文档标准解析文档，doctype不存在或者格式错误会以兼容模式呈现

### 严格模式和混杂模式的区别
严格的模式的排版和js的运作方式都会以浏览器的最高标准运行，兼容模式主要是以向低版本浏览器兼容的方式运行，防止老站点无法运行

### html5 为什么是<!DOCTYPE HTML>？
html5 不基于sgml，因此不需要对dtd进行引用，但是需要让浏览器知道以什么模式运行
html4 还基于sgml，需要引用dtd

### 行内元素有哪些？块级元素有哪些？ 空(void)元素有那些？

***行内元素***：
a - 锚点，em - 强调，strong - 粗体强调，span - 定义文本内区块，i - 斜体,img - 图片,b - 粗体，label - 表格标签，select - 项目选择，textarea - 多行文本输入框，sub - 下标，
sup - 上标，q - 短引用；
***块元素***：
div - 常用块级，dl - 定义列表，dt，dd，ul- 非排序列表，li，ol-排序表单，p-段落，h1，h2，h3，h4，h5-标题，table-表格，fieldset - form控制组，form - 表单，
***空元素***：
br-换行，hr-水平分割线

### html5 离线存储原理
在html标签添加`manifest`属性
```html
<!DOCTYPE HTML>
<html manifest = "cache.manifest">
...
</html>
```
在cache.mainifest文件内编写需要缓存的文件
```html
CACHE MANIFEST
#v0.11

// cache表示需要离线缓存的列表，不需要把自身页面列出来，因为包含manifest 的页面也会自动被缓存
CACHE:
js/app.js
css/index.css

// 优先级比cache高，一般只有在在线的情况下才能访问，离线时无法使用，需要的话可以在cache中添加
NETWORK:
resourse/logo.png

// 如果资源访问失败，就会用第二个资源替代他，比如上面的例子就是，访问资源错误就会跳转至offline.html
FALLBACK:
// offline.html
```
如果浏览器遇到有manifest属性，并且在线：
    如果是第一次访问，就会下载并且缓存manifest文件的具体资源，如果是不是第一次访问，会先使用旧的离线存储数据展示页面，然后浏览器会比较本地和服务器之间的manifest文件,如果不是最新的文件，就会重新下载并且缓存文件
如果是离线的情况：
    直接展示离线缓存的文件

### cookie，localstorage， sessionstorage区别

cookie只能存储4kb的大小，并且数据保存在客户端，每次同源网络请求的时候都会携带，在使用的时候可以设置过期时间，如果没有设置浏览器关闭后就会删除cookie，如果设置了就会存储在硬盘中，就算浏览器关闭后再打开访问，还是可以使用的，比起seesion不是特别安全，一般浏览器限制存储20个cookie，主要用于会话标识

localstorage数据同样保存在客户端，网络请求的时候不会携带数据，在使用的时候没有设置过期时间，但是可以通过存储时间进行封装来实现，如果不手动清除，就会一直保存，就会浏览器关闭后也还存在，持久化方案之一，一般存储可达5mb或者更大，localstorage在同源的窗口可以互相调用，都是共享的

sessionStorage数据保存在服务器端，同源网站的任意网页内都可以访问，session一般在标签页变比或浏览器关闭后就清除，即使标签关闭或刷新网页数据依然可以访问,适合临时存储

区别：
1. cookie和localstorage数据存放在客户端，session数据放在服务器上 
2. cookie和localstorage不是很安全，别人可以分析存放在本地的cookie并进行cookie欺骗，考虑到安全应当使用session 
3. session会在一定时间内保存在服务器上，当访问增多，会比较占用你服务器的性能，考虑到减轻服务器性能方面，应当使用cookie
4. 单个cookie保存的数据不能超过4K，很多浏览器都限制一个站点最多保存20个cookie，localstorage和sessionstorage
5. 建议将登录信息等重要信息存放为session，其他信息如果需要保留，可以放在cookie中 
6. session保存在服务器，客户端不知道其中的信心；cookie保存在客户端，服务器能够知道其中的信息 
7. session中保存的是对象，cookie中保存的是字符串 
8. session不能区分路径，同一个用户在访问一个网站期间，所有的session在任何一个地方都可以访问到，而cookie中如果设置了路径参数，那么同一个网站中不同路径下的cookie互相是访问不到的

参考：
https://www.cnblogs.com/zr123/p/8086525.html


### href和src的区别
- src是指外部资源，用于替代这个元素，这个属性是将资源嵌入到当前文档中元素所在的位置，，浏览器会暂停加载直到这资源加载完成。这也是为什么要将js文件的加载放在body最后的原因（在</body>前面）
- href是指超链接，用于建立这个标签与外部资源之间的关系，如果资源是一个css链接，html的解析和渲染不会暂停，css文件的加载是同时进行的，这不同于在style标签里面的内置样式，用@import添加的样式是在页面载入之后再加载，这可能会导致页面因重新渲染而闪烁。所以我们建议使用link而不是@import。

### defer和async的区别

- defer 会在</html>之后，DOMContentLoaded事件触发之前执行，尽管script标签在head内，也是如此，defer会按照加载顺序执行脚本

- async 在html解析script标签的时候，会异步请求script标签的链接，不会造成阻塞进程

区别：
- async加载的顺序不一定会按照执行的先后顺序执行，defer会按照顺序执行
- 两者都是异步请求
- defer 是立即下载延迟执行脚本，async下载后立即执行
- defer适合对一些脚本有依赖，需要操作dom节点的脚本使用， async适合对无依赖，优先级低的脚本执行，例如：预加载