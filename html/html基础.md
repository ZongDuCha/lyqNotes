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