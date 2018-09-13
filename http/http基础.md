####ji常见状态码
## `2XX 成功`

200 OK，表示从客户端发来的请求在服务器端被正确处理
204 No content，表示请求成功，但响应报文不含实体的主体部分
205 Reset Content，表示请求成功，但响应报文不含实体的主体部分，但是与 204 响应不同在于要求请求方重置内容
206 Partial Content，进行范围请求

## `3XX 重定向`

301 moved permanently，永久性重定向，表示资源已被分配了新的 URL
302 found，临时性重定向，表示资源临时被分配了新的 URL
303 see other，表示资源存在着另一个 URL，应使用 GET 方法丁香获取资源
304 not modified，表示服务器允许访问资源，但因发生请求未满足条件的情况
307 temporary redirect，临时重定向，和302含义类似，但是期望客户端保持请求方法不变向新的地址发出请求

## `4XX 客户端错误`

400 bad request，请求报文存在语法错误
401 unauthorized，表示发送的请求需要有通过 HTTP 认证的认证信息
403 forbidden，表示对请求资源的访问被服务器拒绝
404 not found，表示在服务器上没有找到请求的资源

## `5XX 服务器错误`

500 internal sever error，表示服务器端在执行请求时发生了错误
501 Not Implemented，表示服务器不支持当前请求所需要的某个功能
503 service unavailable，表明服务器暂时处于超负载或正在停机维护，无法处理请求


#### http请求的方式

HTTP Method的历史：
HTTP 0.9 这个版本只有GET方法
HTTP 1.0 这个版本有GET HEAD POST这三个方法
HTTP 1.1 这个版本是当前版本，包含GET HEAD POST OPTIONS PUT DELETE TRACE CONNECT这8个方法
HTTP/1.1之后增加的方法
在HTTP/1.1标准制定之后，又陆续扩展了一些方法。其中使用中较多的是PATCH

`get` 向服务器请求获取指定某一资源，一般用于数据的读取，这不是一个安全的方法，因为请求的数据或者提交数据会附加在url上，也就是幂等

`post` 将某一资源提交至服务器，进行处理，请求的数据或者提交的数据是在请求体中，不会显示出来，所以这是一个安全的方法，也就是非幂等

`head` 跟get一样，都是请求服务器的某一资源，根本get不同的是，head返回的数据是只有服务器的响应头信息即时响应主体，而不会返回资源的内容部分，主要用于客户端查看服务器的性能情况

`put` 将指定资源上传更新至服务器，通过该方法客户端可以将指定资源的最新数据传送给服务器取代指定的资源的内容，也就是幂等

`delete` 删除服务器上的某一资源，也是幂等方法

`connect` http1.1协议方法，建立一个到由目标资源标识的服务器的隧道,通常用于SSL加密服务器的链接与非加密的HTTP代理服务器的通信。

`options` 向服务器请求某一资源支持的所有http请求方法，JavaScript的XMLHttpRequest对象进行CORS跨域资源共享时，就是使用OPTIONS方法发送请求，以判断是否有对指定资源的访问权限。

`trace` 请求某一资源后服务器回显收到的请求数据（译注：TRACE方法让客户端测试到服务器的网络通路，回路的意思如发送一个请返回一个响应，这就是一个请求响应回路），如果请求是有效的，响应应该在响应实体主体里包含整个请求消息，并且响应应该包含一个Content-Type头域值为”message/http”的头域。TRACE方法的响应不能不缓存。

`PATCH` 用来对已知资源进行局部更新,在请求中定义了一个描述修改的实体集合，如果被请求修改的资源不存在，服务器可能会创建一个新的资源。也是非幂等方法


post和get安全一些:
- get方法容易被浏览器缓存
- 在浏览器的历史记录中会保留请求的地址
- get方法还容易造成Cross-site request forgery(csrf)攻击

post和put的本质区别即在于是否具有幂等性，2者都可以用于创建和更新，这取决与你的设计，所以更多的是语义和应用服务器那边怎么处理
需要以更新的形式来修改某一具体资源的时候，如何判断用PUT还是POST呢？
很简单，如果该更新对应的URI多次调用的结果一致，则用PUT
在每次更新提交相同的内容，最终的结果不一致的时候，用POST

PATCH方法和put方法的区别:
- PATCH方法用于资源的部分内容的更新；
- PUT用于更新某个较为完整的资源,并且不能重复做部分更改，否则代理和缓存、甚至服务器或者客户端都会得到有问题的操作结果。 
- PATCH方法可能会在资源不存在时去创建它。

幂等是一个数学和计算机学概念，在计算机范畴内表示一个操作执行任意次对系统的影响跟一次是相同,对于两个参数，如果传入值相等，结果也等于每个传入值，则称其为幂等的，如min(a,b),
在HTTP/1.1规范中幂等性的定义是:
> Methods can also have the property of "idempotence" in that (aside from error or expiration issues) the side-effects of N > 0 identical requests is the same as for a single request.

如：POST 方法不是幂等的，若反复执行多次对应的每一次都会创建一个新资源。如果请求超时，则需要回答这一问题：资源是否已经在服务端创建了？能否再重试一次或检查资源列表？而对于幂等方法不存在这一个问题，我们可以放心地多次请求

#### 何时触发options请求？：
规范要求，对那些可能对服务器数据产生副作用的 HTTP 请求方法,浏览器首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨域请求。服务器确认允许之后，才发起实际的 HTTP 请求。

### 三次握手过程和四次挥手过程
![](https://camo.githubusercontent.com/36cf7d4e1598683fe72a5e1c3e837b16840f4085/687474703a2f2f6f6f327239726e7a702e626b742e636c6f7564646e2e636f6d2f6a656c6c797468696e6b544350342e6a7067)

https://github.com/jawil/blog/issues/14

https://sofish.github.io/restcookbook/http%20methods/idempotency/
https://www.cnblogs.com/machao/p/5788425.html