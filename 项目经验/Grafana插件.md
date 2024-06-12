Grafana插件开发
===

Grafana是一个开源的数据可视化和监控平台，广泛应用于云计算、容器化环境、IoT等。它提供灵活的仪表板和图表功能，帮助用户实时监控和分析数据。
拥有非常全面的功能集，可以联动多个数据源、权限、报警等使用功能，操作面板也非常人性化，因此用户基数非常大
而Grafana的一个关键特性是其丰富的插件生态系统。用户可以通过安装各种插件来扩展Grafana的功能，例如添加新的数据源、图表类型、告警规则等等。这为用户提供了更多的选择和灵活性，使得Grafana能够适应复杂的监控场景和多样化的数据可视化需求。
其他云服务提供商在日志和监控等相关产品中也有Grafana插件支持，如阿里巴巴、腾讯和华为

Grafana插件
Grafana插件主要分四种类型
- Pannel 插件-面板插件，可以实现自定义的图表展示。
- dataSouce插件-可以连接到自定义的数据源，设置自定义请求字段
- App plugin-支持创建应用，创建自定义页面

Grafana插件开发
1. 本地环境准备
docker
node. js>16
2. 创建项目
  1. 在新目录中，使用create-plugin工具从模板创建插件。当提示输入插件类型时，选择datasouce,创建出来的项目为react项目
    
npx @grafana/create-plugin@latest
  2. 转到新创建插件的目录：
cd <your-plugin>
  3. 安装依赖项：
npm install
  4. 构建插件：
npm run dev
  5. 通过docker启动Grafana：
npm run server 
    实际执行的命令是：
[图片]
    它将读取默认项目中由脚手架生成的Docker配置文件：composite yaml；
version: '3.0'

services:
  grafana:
    container_name: 'vestack-cloudmonitor-datasource'
    platform: 'linux/amd64'
    build:
      context: ./.config
      args:
        grafana_image: ${GRAFANA_IMAGE:-grafana-enterprise}
        grafana_version: ${GRAFANA_VERSION:-10.0.3}
    ports:
      - 3000:3000/tcp
    volumes:
      - ./dist:/var/lib/grafana/plugins/vestack-cloudmonitor-datasource
      - ./provisioning:/etc/grafana/provisioning

  6. 打开Grafana，默认情况下http://localhost:3000/，在登录页面上，输入用户名和密码的admin。然后转到管理>插件。确保您的数据源插件在那里。


  核心文件解释
  src
├─ module.ts  
├─ plugin.json 
  ├─ datasource.ts 
├─ components 
      ├─ ConfigEditor.tsx 
      └─ QueryEditor.tsx 

模块
插件的入口点
plugin.json 
该plugin. json文件包含有关您的插件的信息，并告诉Grafana您的插件需要哪些功能和依赖项。
datasource.ts 
由module.ts引入，实现DataSourceApi接口，负责处理数据
ConfigEditor. tsx
由module.ts引入，数据源插件引入时配置，通常用于配置一些秘钥

QueryEditor. tsx
由module.ts引入，用户实际编辑页面上的每一个查询
插件开发过程中可能用到的参考资料
- GrafanaUI库-UI组件，帮助您使用Grafana设计规范系统构建接口
- grafana-plugin-examples-一些官方提供的演示库
- 参考（plugin. json）-查看所有可用的plugin.json配置设置


Grafana插件构建
npm build

用户使用
有两种使用方式
1. 我们给开发的插件在grafana官方上以企业的名义注册一个签名，同时在上面进行发布，用户可以在插件市场上搜到。参考文档： https://grafana.com/developers/plugin-tools/publish-a-plugin/publish-a-plugin
2. 本地打包同时调整grafana配置文件
  1. 本地打包后将插件放到grafana server的插件目录/var/lib/grafana/plugins/
  2. 调整grafana server配置目录下defaults.ini
  3. 配置allow_loading_unsigned_plugins为插件的id，允许未签名的云监控数据源服务插件运行。
  4. 重启grafana server
3. Grafana 装载datasouce 插件 