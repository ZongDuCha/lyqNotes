#### Keep-Alive是什么? 如何工作的
http 1.0中默认是关闭KeepAlive，需要在http头加入"Connection:Keep-Alive"，才能启用KeepAlive。
在http1.1之前,每一个tcp连接都会在请求后返回数据之后关闭连接，如果网站上有大量的图片，css等等资源，就会不断的向服务器简历http请求，这样的效率就会慢很多,之后，http1.1就推出了HTTP keep-alive（http persistent connection）的长连接.
![](http://www.nowamagic.net/librarys/images/201312/2013_12_20_02.png)

http长连接的方案之一，如果浏览器支持keep-alive，就会在发起http请求的请求头中添加：
> Connection: Keep-Alive

然后服务器响应数据后，也会在返回的请求头中添加:
> Connection: Keep-Alive

当需要关闭连接时，HTTP 头中会包含如下内容：

> Connection: Close

这样在一定的时间（keep-alive timeout）里还会保持http的连接，不会中断，当客户端发起另一个请求的时候，会使用同一个连接，因为在发起之前客户端和服务器链接还没断开，直到客户端或者服务器一方觉得会话可以结束后，

维基百科的说明：

> 在 HTTP 1.1 中 所有的连接默认都是持续连接，除非特殊声明不支持。 HTTP 持久连接不使用独立的 keepalive 信息，而是仅仅允许多个请求使用单个连接。然而， Apache 2.0 httpd 的默认连接过期时间 是仅仅15秒 ，对于 Apache 2.2 只有5秒。 短的过期时间的优点是能够快速的传输多个web页组件，而不会绑定多个服务器进程或线程太长时间。

#### 优点：
- 减少tcp的连接建立次数
- 允许请求和应答的HTTP管线化
- 降低拥塞控制 （TCP连接减少了）
- 减少后续请求的响应时间，因为此时不需要建立TCP，也不需要TCP握手等过程；
- 报告错误无需关闭TCP连接
- 提高性能和提高httpd服务器的吞吐率

#### 缺点

- 长时间的tcp连接容易导致资源浪费，而且keep-alive配置不当也会造成反效果
- 可能会损害服务器的整体性能，直接影响到服务器的并发数。



http://www.nowamagic.net/academy/detail/23350305
https://zh.wikipedia.org/wiki/HTTP%E6%8C%81%E4%B9%85%E8%BF%9E%E6%8E%A5