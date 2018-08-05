
可以分为六个过程：
`1、DNS解析` -> `2、TCP连接` -> `3、发送HTTP请求` -> `4、服务器处理请求并返回HTTP报文` -> `5、浏览器解析并渲染页面` -> `6、连接结束`

<!-- more -->

#### dns解析

每一个计算机实际上都有一个ip地址，但是用户不太方便记忆ip地址，所有就有了网址替换ip地址，dns解析就充当了一个翻译官，当用户在浏览器输入网址并打开的时候，实际上就是网址到ip地址的转换。

##### dns解析过程

dns解析实际上是递归查询ip地址的过程

输入地址打开后告诉本地dns服务器，如果没找到，则会进入下一级域名服务器查看，如此重复，比如：www.baidu.com,首先在本地域名服务器中查找ip地址，如果没有找到，本地域名服务器会向根域名服务器发送一个请求，如果跟域名服务器也不存在该域名的ip地址时，本地域名会向com顶级域名服务器发送一个请求，依次类推循环下去，直到最后本地域名服务器得到baidu的ip地址并缓存到本地，供下次使用，所有网址的解析过程为：
`.` -> `.com` -> `baidu.com.` -> `www.baidu.com.`

最后面的.对应根域名服务器

`根域名服务器` -> `com顶级域名服务器` -> `baidu.comy域名服务器` -> `www.baidu.com`


##### dns优化

`dns缓存`

dns有着多个缓存，从离浏览器的距离排序的话，`浏览器缓存` -> `系统缓存` -> `路由器缓存` -> `ips缓存` -> `根域名服务器缓存` -> `顶级域名服务器缓存` -> `主域名服务器缓存`

其主要优化的就是缓存这部分。

不同浏览器的缓存机制不同： IE对DNS记录默认的缓存时间为30分钟，Firefox对DNS记录默认的缓存时间为1分钟，Chrome对DNS记录默认的缓存时间为1分钟。

缓存时间长：减少DNS的重复查找，节省时间。
缓存时间短：及时检测服务器的IP变化，保证访问的正确性。

`减少dns查询次数`

DNS查询也消耗响应时间，若网页内容来自各个不同的domain，则客户端首次解析这些domain需要消耗一定的时间，但由于DNS查询结果会缓存在本地系统和浏览器中一段时间，所以DNS查询一般只是对首次访问时的速度有影响。

减少DNS查询次数需要减少来自不同domain的请求的数量，如尽量将外部域的对象下载到本地服务器上等。

##### dns负载均衡

dns负载均衡又叫dns重定向，其主要作用是将用户的http请求，让最接近用户地理位置的dns服务器接收并返回请求，还有许多优化的手段


#### tcp链接

`建立连接`

建立连接之前，服务器一直会打开端口并对其监听，当客户端主动和服务器端建立连接的时候，发起一个打开端口的请求（该端口一般为临时端口），然后进入三次握手的过程：

`TCP连接的三次握手过程`

**图解：**

![](http://blog.chinaunix.net/attachment/201304/8/22312037_1365405910EROI.png)

TCP报文字段格式
（1）序号：Seq序号，占32位，用来标识从TCP源端向目的端发送的字节流，发起方发送数据时对此进行标记。
（2）确认序号：Ack序号，占32位，只有ACK标志位为1时，确认序号字段才有效，Ack=Seq+1。
（3）标志位：共6个，即URG、ACK、PSH、RST、SYN、FIN等，具体含义如下：
    - （A）URG：紧急指针（urgent pointer）有效。
    - （B）ACK：确认序号有效。
    - （C）PSH：接收方应该尽快将这个报文交给应用层。
    - （D）RST：重置连接。
    - （E）SYN：发起一个新连接。
    - （F）FIN：释放一个连接。

需要注意的是：
    - （A）不要将确认序号Ack与标志位中的ACK搞混了。
    - （B）确认方Ack=发起方Req+1，两端配对。 


- 第一次握手:client将标志位SYN置为1，随机产生一个值为seq=J；并将数据包发送给Server,Client进入SYN_SENT状态，等待server确认

- 第二次握手:Server收到数据包后由标志位SYN=1知道client请求建立连接，server将标志位SYN和ACK都置为1，ack=J+1，随机产生一个值seq=K，并将数据包发送给client以确认连接请求，server进入SYN_RCVD状态。

- 第三次握手：client收到确认后，检查ack是否为J+1，ACK是否为1，如果正确则连接简历成功，Client和server进入ESTABLISHED状态，完成三次握手，随后Client与Server之间可以开始传输数据了。


`TCP的四次挥手过程`

**图解：**

![](http://blog.chinaunix.net/attachment/201304/9/22312037_1365503104wDR0.png)

- 第一次挥手：Client发送一个FIN，用来关闭Client到Server的数据传送，Cient进入FIN_WAIT_1

- 第二次挥手：Server收到FIN后，发送一个ACK给Client，确认序号为收到序号+1（与SYN相同，一个FIN占用一个序号），Server进入CLOSE_WAIT状态

- 第三次挥手：Server发送一个FIN，用来关闭Server到Client的数据传送，Server进入LAST_ACK状态

- 第四次挥手：Client收到FIN后,Client进入TIME_WAIT 状态，接着发送一个ACK给Server，确认序号为收到序号+1，Server进入CLOSED状态，完成四次挥手。


##### HTTP请求

主要是发生在客户端，发送HTTP请求的过程就是构建HTTP请求的过程就是构建HTTP请求报文并通过TCP协议中发送到服务器指定端口（HTTP协议80/8080，hTTPS协议443）。HTTP请求报文是三部分组成：请求行，请求报头和请求正文。


##### 请求行

格式如下：`Method Request-URL HTTP-Version CRLF`

```
eg: GET index.html HTTP/1.1
```

常用的方法有GET,POST,PUT,DELETE,OPTIONS,HEAD.



##### 请求报头

请求报头允许能向服务器传递请求的工具附加信息和客户端（客户端不一定特指浏览器，有时候也可使用Linux下的CURL命令以及HTTP客户端测试工具等。）


##### 请求正文

当使用POST，PUT等方法时，通常需要客户端向服务端传递数据。这些数据就储存在请求正文中



##### 服务器处理请求并返回HTTP报文

HTTP响应报文也是由三部分组成：状态码，响应报头和响应报文



详细参考：https://segmentfault.com/a/1190000006879700，
https://www.cnblogs.com/chengyunshen/p/7196348.html，
https://www.cnblogs.com/xsilence/p/6034361.html，
https://blog.csdn.net/sssnmnmjmf/article/details/68486261