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

#### H5移除的元素：
纯表现的元素：basefont、big、center、font、s、strike、tt、u
对可用性产生负面影响的元素：frame、frameset、noframes