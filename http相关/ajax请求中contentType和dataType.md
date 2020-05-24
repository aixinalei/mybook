ajax请求中的contentType和dataType
---
## contentType
设置你发送给服务器的格式，有以下三种常见情况。
1. application/x-www-form-urlencoded  
默认值:提交的数据会按照 key1=val1&key2=val2格式进行转换
2. multipart/form-data：
这也是一个常见的 POST 数据提交的方式。我们使用表单上传文件时，就要让 form 的 enctype 等于这个值。
3. application/json：
服务端消息主体是序列化后的 JSON 字符串。

## dataType
设置你收到服务器数据的格式，有以下两种常见情况
1. text
返回纯文本字符串
2. json
自动将返回的纯文本字符串进行了json.parse操作，如果parse失败，提示出错误信息