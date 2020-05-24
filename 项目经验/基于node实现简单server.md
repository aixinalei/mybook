# 基于node实现简单的server

## 背景

由于客户端需要与浏览器端进行一定的通信，客户端使用的是electron可以直接使用node进行搭建本地服务。如果使用类似于koa express等常用框架由于业务需求没那么复杂，所以我需要简单封装一个基于node的server

## 开始搭建

1. 使用http模块 创建端口监听
``` javascript
const http = require('http');
const router = require('./router');
// 注册路由
require('./router-instance');
http.createServer((request, response) => {
  router.do(request, response);
}).listen(9876);
```

2. 完善路由
思路简述 ：
	* 使用path-to-regexp于querystring进行路由匹配和参数解析
	* router使用立即执行函数构造一个类 其中get 和post方法是再数组中存储一个个对象，对象具有两个参数 注册路由实例时的url与匹配路由时需要执行的函数
	* do 方法供http模块调用 当监听到请求时执行此方法
```javascript
// 简单的路由parser
const pathToRegexp = require('path-to-regexp');
const querystring = require('querystring');

function parseUrl(routerJSON, path) {
  let cb = false;
  const match = {};
  for (let i = 0; i < routerJSON.length; i += 1) {
    const keys = [];
    const re = pathToRegexp(routerJSON[i].url, keys);
    const res = re.exec(path);

    if (res) {
      match.url = res[0];
      match.path = routerJSON[i].url;
      const tempObj = {};
      for (let j = 0; j < keys.length; j += 1) {
        tempObj[keys[j].name] = res[j + 1];
      }
      match.params = tempObj;
      cb = routerJSON[i].callback;
      break;
    }
  }

  return {
    cb,
    match,
  };
}

const router = (function (

) {

  const routerOption = {
    GET: [],
    POST: [],
  };

  return {
    get(url, callback) {
      routerOption.GET.push({
        url,
        callback,
      });
    },
    post(url, callback) {
      routerOption.POST.push({
        url,
        callback,
      });
    },
    do(request, response) {
      // 根据url找到匹配的函数
      const url = request.url.split('?')[0];
      const method = request.method;
      // 匹配路径，支持resful
      const res = parseUrl(routerOption[method], url);
      request.match = res.match;
      // 接收post请求参数
      if (method === 'POST') {
        let data = '';
        request.on('data', (chunk) => {
          // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
          data += chunk;
        });
        // 3.当接收表单提交的数据完毕之后，就可以进一步处理了
        // 注册end事件，所有数据接收完成会执行一次该方法
        request.on('end', () => {
          // （1）.对url进行解码（url会对中文进行编码）
          data = decodeURI(data);
          // （2）.使用querystring对url进行反序列化（解析url将&和=拆分成键值对），得到一个对象
          // querystring是nodejs内置的一个专用于处理url的模块，API只有四个，详情见nodejs官方文档
          const dataObject = querystring.parse(data);
          request.dataObject = dataObject;
          res.cb && res.cb(request, response);
        });
      } else {
        res.cb && res.cb(request, response);
      }
    },
  };
}());
module.exports = router;
```
3. 注册路由实例（demo）
```
const router = require('./router');
router.get('/testConnect', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': req.headers.origin,
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'GET',
  });
  res.end(responseJSON(200, 'success'));
});
```

