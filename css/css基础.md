```css
[class ^=val] 属性值以val开头的class节点元素

[class $=val] 属性值以val结尾的class节点元素

[class *=val] 属性值包含了val的class节点元素

p:first-of-type  在父元素的子元素中选择第一个p元素

p:last-of-type  在父元素的子元素中选择最后一个p元素

p:only-of-type(n)  在父元素的子元素中选择唯一的p元素

p:nth-last-of-type(n)  在父元素中的子元素中选择倒数的第n个p元素


p:only-child ：在父元素中选择只有一个子元素，并且一定要是p元素

p:last-child  在父元素中选择的最后一个子元素，并且一定要是p元素

p:nth-child(n || even || odd)  在父元素中选择第n个p元素 || 偶数 || 基数

p:nth-last-child(n)  在父元素中选择倒数的第n个子元素，并且一定要是p元素


:root 选择文本的根元素

p:empty  选择没有子元素的p元素

p:enable  选择每个未禁用的p元素

p:disable  选择每个被禁用的p元素

p:checked  选择每个被选中的p元素

p:target  选择当前活动的p元素


:not(p) 选择不包括p元素的 每一个元素

::selection  用户选取的部分

:focus 获得焦点的元素器



p:first-line 对p元素的第一行文本进行格式化，只能用于块级元素

p:first-letter 对p元素的首字母设置特殊样式，只能用于块级元素

p:before 在p元素的内容前面插入新内容,

p:after  在p元素的后面插入新内容
```

### 如何创建块级格式化上下文,BFC有什么用？

如果创建：

- 根元素

- 浮动元素 （float不为`none`）

- 绝对定位元素 （position取值为`absolute`或`fixed`）

- 元素display取值为`inline-block`,`inline-flex`,`flex`,`table-caption`,`table-cell`之一

- overflow 除`visible`以外的元素

作用：

- 可以包含浮动元素

- 不被浮动元素覆盖

- 阻止父子元素`margin`值的折叠


### css的盒子模型

有两种盒子模型，`IE盒子模型` ， `W3C盒子模型`.

盒子模型： `content`内容 ， `padding`内边距 ， `margin`外边距 ， `border`边框   组成

区别在于 ： IE盒子模型： 高 或 宽 = content + padding + border


### 去除inline-block元素间的缝隙

inline-block水平呈现的元素间，换行显示或空格分隔的情况下会有间距（html中元素间空格，回车，html注释都会造成缝隙）

- 使用margin负值，不过对于12像素大小的上下文，Arial字体的margin负值为-3像素，Tahoma和Verdana就是-4像素，而Geneva为-6像素

- 使用无闭合标签，（但是为了兼容ie6/7，最后一个列表的结束标签需要加上）

- font-size:0

- letter-spacing为负值，但是有些有浏览器最小间距1像素，在小就会还原了

- word-spacing为负值

- 移除空格


### `display` , `float` , `position` 之间的关系

当display：none的时候，就会忽略掉float和position的值，因为此时元素已经消失在渲染树中，元素不产生框

否则，当position为absolute或fixed的时候，元素就是绝对定位，此时float的值为none。

否则，当float不是none的时候，此时元素是浮动元素。

否则，如果元素是根元素，，其它情况下display的值为指定值。

总结来说，绝对定位，浮动，根元素都需要调整display

而且，当元素设置了position：absolute或fixed，，或float不为none的时候，隐式的会将元素的display转为inline-block,即使指定了display除none之外的其它值的时候也是如此，而且也会将z-index增大为1.


### link 和 @import 的区别

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


CSS 权重优先级顺序简单表示为：

`!important` > `行内样式` > `ID` > `类、伪类、属性` > `标签名` > `继承` > `通配符`

最大   >   1000   >    100    >     10    >     1     >     0


`@import` 的性能优于`link`,因为`@import`在页面加载完后才执行，所以在页面加载的同时不会去并行加载这个css文件，适合加载未来需要的文件。

`link` 在页面加载的同时就会同时加载，浏览器对并行下载有限制，适合 马上就需要加载的文件，并且要放置页面头部。