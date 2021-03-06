HTTP协议规格说明定义ETag为“被请求变量的实体值”。另一种说法是，ETag是一个可以与Web资源关联的记号（token）。
Etag由服务器端生成，客户端通过If-Match或者说If-None-Match这个条件判断请求来验证资源是否修改。常见的是使用If-None-Match。

Etag的作用：主要为了解决 Last-Modified 无法解决的一些问题。

请求流程如下：

当发送一个服务器请求时，浏览器首先会进行缓存过期判断,浏览器先根据缓存过期时间判断缓存文件是否过期。

- 情景一：若没有过期，则不向服务器发送请求，直接使用缓存中的结果，此时我们在浏览器控制台中可以看到 200 OK(from cache) ，此时的情况就是完全使用缓存，浏览器和服务器没有任何交互的。  

- 情景二：若已过期，则向服务器发送GET请求，此时请求中会带上文件修改时间和Etag。

然后，进行资源更新判断。服务器根据浏览器传过来的文件修改时间，判断自浏览器上一次请求之后，文件有没有被修改过；根据Etag，判断文件内容自上一次请求之后，有没有发生变化。

- 情形一：若两种判断的结论都是文件没有被修改过，则服务器就不给浏览器发index.html的内容了，直接告诉它，文件没有被修改过，你用你那边的缓存吧—— 304 Not Modified，此时浏览器就会从本地缓存中获取index.html的内容。此时的情况叫协议缓存，浏览器和服务器之间有一次请求交互。

- 情形二：若修改时间和文件内容判断有任意一个没有通过，则服务器会受理此次请求，之后的操作同情景一。

客户端通过将该记号传回服务器要求服务器验证其（客户端）缓存。工作过程如下:
![](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1537366736208&di=ad46c4d1886cf78d2a66345c8a7d2340&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20180824%2Ff1335f8436cf43e28b40f578b8a1beb8.jpeg)
1. 客户端请求一个页面（A）。
2. 服务器返回页面A，并在给A加上一个Last-Modified/ETag。
3. 客户端展现该页面，并将页面连同Last-Modified/ETag一起缓存。
4. 客户再次请求页面A，并将上次请求时服务器返回的Last-Modified/ETag一起传递给服务器。
5. 服务器检查该Last-Modified或ETag，并判断出该页面自上次客户端请求之后还未被修改，直接返回响应304和一个空的响应体。

Etag 主要为了解决 Last-Modified 无法解决的一些问题。

1、一些文件也许会周期性的更改，但是他的内容并不改变(仅仅改变的修改时间)，这个时候我们并不希望客户端认为这个文件被修改了，而重新GET;

2、某些文件修改非常频繁，比如在秒以下的时间内进行修改，(比方说1s内修改了N次)，If-Modified-Since能检查到的粒度是s级的，这种修改无法判断(或者说UNIX记录MTIME只能精确到秒)

3、某些服务器不能精确的得到文件的最后修改时间；

为此，HTTP/1.1 引入了 Etag(Entity Tags).Etag仅仅是一个和文件相关的标记，可以是一个版本标记,比如说v1.0.0或者说"2e681a-6-5d044840"这么一串看起来很神秘的编码。但是HTTP/1.1标准并没有规定Etag的内容是什么或者说要怎么实现，唯一规定的是Etag需要放在""内。