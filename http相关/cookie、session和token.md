Cookie、Session与Token
===
## Cookie
Cookie是一个http请求首部，当服务端响应头上标记着setCookie时，可以设置此cookie到当前域名下。浏览器端会将此cookie以kv的形式存储到本地文件中

目前cookie 还支持很多属性设置
* Secure：安全 只支持https
* SameSite：指定当您通过网站内的链接移动到另一个站点时是否从目标站点发送 Cookie，有以下三个值
    * Strict：如果您单击链接并转到另一个站点，则不会发送来自该站点的 cookie。
    * Lax：仅针对 GET 等安全方法发送 Cookie。如果 POST 则不发送
    * None：在任何情况下都发送 cookie
* HttpOnly： 只有http请求时可以操作 禁止js操作cookie

通过正确的配置可以提高csrf安全；

## Session
session实际上是一种概念，表示每次会话服务器存储的用户信息

### 实现：	
常见的手段是使用cookie来实现session。以java为例，客户端首次请求服务端后（例如登录），服务端通过setCookie 设置jsessionid （不设置cookie超时时间，浏览器对于不设置cookie超时间的cookie会在浏览器标签页关闭时自动清空这些cookie）。服务端存储这个sessionid。当客户端第二次请求服务端时，浏览器会自动将属于该域名下的cookie通过http请求首部带到后端服务器中，后端服务器跟本地存储的sessionid进行验证来比对是否是正确用户。
既然session是个概念，那么也肯定有其他的实现方式。还有一种需要前端配合的实现方式是通过页面的url中携带session信息。来实现客户端和服务端session之间的传递，不过比较麻烦与过时，这里不详细介绍。
### 缺点：
1. 每次认证用户发起请求时，服务器需要去创建一个记录来存储信息。当越来越多的用户发请求时，内存的开销也会不断增加。
2. 当用户过多时，在服务端的内存中存储的大量session信息会严重影响内存，不方便扩展。比方说当你打算用两台电脑存储session时，session的同步就很不方便。也可以使用单独的服务器使用redis来存放session信息。但是万一这一台数据库服务器宕机后，让所有正在登陆的用户重新登陆当然会让用户很不爽。

## Token：
token是一种身份验证的机制，初始时客户端携带用户信息访问服务器（比如说登录），服务端采用一定的加密策略生成一个字符串（token）返回给客户端，客户端保存token的信息，并在接下来请求的过程中将**token信息**及**用户信息**通过httpHeader来发送给服务端。客户端跟据相同的加密算法对用户信息进行比对，生成新的token和用户发过来的token进行比对，来判断是否是正确且过期的用户。
这个时候我们就可以考虑到其实用服务器的session也可以实现类似于token的功能，那么为什么一定要用token。我在网上找到一个值得信服的理由是：如果是开发api接口，前后端分离，最好使用token，为什么这么说呢，因为session+cookies是基于web的。但是针对 api接口，可能会考虑到移动端，app是没有cookies和session的。
### 实现：
1.  使用cookie来实现。使用cookie实现的话就和session差不多。这里不多加赘述。
2.  使用其他的httpHeader来实现。这就需要前端的一定配合。完整方案如下：
    * 随便设定一个响应头与请求头，比方说userToken，Authorization，前端访问后台登录接口获取到token后，将token存储在 Cookie 里或者 Local Storage中。
    * 在前端的请求ajax加一个过滤，再向后端发送请求时，先再beforSend函数中设置这个请求头。后端收到请求后也先检测规定请求头中是否携带了token并且验证token是否过期（实际开发中还是比较少用这种情况，因为直接设置一个过期时间比较长的token即可，当发现过期是就直接返回token过期即可）
    * 在前端的响应中加一个过滤，检测后端发回的token是否更新，如果更新则更新持久化的token信息（目的是token续期）    
通过上面的这一套流程我们能发现使用token还是很麻烦的。需要大量的前端配合，所以这种方案真的很适合前后端分离的项目（由于前后端分离，那么前端大概率是SPA单页面应用，这种应用基本都会在ajax中加过滤，方便对统一的ajax返回的错误信息进行统一处理等）
对于服务端来说，有统一的标准来实现token，叫JWT（JSON WEB TOKEN）有兴趣深入了解的话可以看下面的参考文章。


### token的优势
1. 方便横向拓展 比方说我们有不用语言构建的服务，比方说java node php等等。那么我们如何做到统一登录呢，这个时候就需要统一的验证机制。
2. 由于不再依赖cookie，所以不再有CSRF问题
3. 支持移动设备

### 有状态Token
实际开发过程中，我们实际上还是会把token存入服务器，这样就跟web中session基本没什么区别。因为token中内容还是比较长的，每次客户端访问服务器都带着这么长的信息，并且每次在服务器还要重新计算进行比对还是比较耗费时间和流量的。
所以我们还是要用有状态token，我们可以想象下传统session的实现：客户端频繁访问服务器只携带session_id，然后服务器通过session_id去session中查找对应的存储信息。有状态token也是使用这个逻辑：在用户第一次登陆成功后，服务器生成token，因为token比较长，遂将其存在了服务器，然后返回客户端一个加密的tokenid，客户端每次通过这个加密的tokenid访问服务器，原理就跟session_id的流程是一样的了。
我们知道服务器的session是存储在内存中的，为了高效。同理我们将token信息也存储在服务器的内存，通用的解决方案是存储到redis中，我们知道redis的存储是基于内存的。速度会比数据库快一些，同时redis是可以设置数据的有校时间的，假如有效期为30天，在插入数据时，就可以设置该条数据的有效期为30天，30天后，redis就会自动删除该数据。那么30天后，用户携带tokenid来访问服务器，服务器去redis中查询不到信息，代表验证失败。（当搭建集群后redis显得尤为重要，分布式session就是通过redis解决的）。


### 感悟
技术只是手段，不同的使用场景用不同的技术。

### 参考文献
[Cookie-MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cookie)
[彻底理解cookie，session，token](https://zhuanlan.zhihu.com/p/63061864)
[Jwt的使用场景](https://blog.csdn.net/wzmde007/article/details/94409848)
[10分钟了解JSON Web令牌（JWT）](https://baijiahao.baidu.com/s?id=1608021814182894637&wfr=spider&for=pc)
[后端可以直接从cookie里取到token，为什么前端还要token设置到Authorization？](https://www.zhihu.com/question/558219586/answer/2710675882)