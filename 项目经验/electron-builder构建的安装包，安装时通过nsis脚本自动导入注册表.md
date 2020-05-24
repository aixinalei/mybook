### 需求

浏览器端可以通过注册表直接启动本地客户端 同时可以传参数

### 怎么做

1. package.json中electron-builder相关配置，在nsis中添加include属性，值为nsis脚本文件路径。
	```
	"build": {
	"appId": "com.cendc.id",
	"asar": false,
	"directories": {
	"output": "installer"
	},
	"win": {
	"target": [
	"nsis"
	]
	},
	"publish": [
	{
	"provider": "generic",
	"url": "http://192.168.4.101:9090/installer/"
	}
	],
	"nsis": {
	"include": "script/installer.nsh",
	"oneClick": false,
	"perMachine": true,
	"allowToChangeInstallationDirectory": true
	}
	},
	```
2. 书写incluede.nsh
	```nsh
	!macro customInstall
	  WriteRegStr HKCR "CenDC" "URL Protocol" ""
	  WriteRegStr HKCR "CenDC" "" "URL:CenDC Protocol Handler"
	  WriteRegStr HKCR "CenDC\shell\open\command" "" '"$INSTDIR\CenDC.exe" "%1"'
	!macroend
	```

	简单解释脚本的含义，具体了解详情请看下方参考资料：
	!macro 是定义宏
	customInstall会在文件安装后自动调用（electron-builder实现）
	WriteRegStr 是写注册表 如果原来有会覆盖。
	$INSTDIR 是所选的文件安装路径
	
	假如我们所选的安装路径是默认安装路径 最终的注册表文件为
	```reg
	Windows Registry Editor Version 5.00
	
	[HKEY_CLASSES_ROOT\CenDC]
	
	"URL Protocol"=""
	
	@="URL:CenDC Protocol Handler"
	
	[HKEY_CLASSES_ROOT\CenDC\shell]
	
	[HKEY_CLASSES_ROOT\CenDC\shell\open]
	
	[HKEY_CLASSES_ROOT\CenDC\shell\open\command]
	
	@="\"C:\\Program Files\\CenDC\\CenDC.exe\" \"%1\""
	```
### 参考资料
[electron打包总结](https://github.com/eyasliu/blog/issues/22)
[electron-buider nsis](https://www.electron.build/configuration/nsis)
[nsis语法](https://nsis.sourceforge.io/Reference/WriteRegStr)