## 小程序商城模块

### 安装

- `bower install wxapp-shop-model --save`


### 项目目录结构
```        
├── vender                    插件目录
|   ├── wxapp-client-sdk         客户端sdk
|   |   ├── ...            sdk功能包
|   ├── wxapp-shop-model              商城模块
|   |   ├── assets         页面素材包
|   |   ├── etc            模块配置文件(请求地址,主题,素材等)
|   |   ├── pages          模块页面
|   |   └── utils          功能插件
|   └── wyying-assets          小程序公共素材包
├── app.js             小程序入口文件(需要自行添加)
├── app.json           小程序全局配置(配置商城模块页面)
├── app.wxss           小程序全局样式
└── config.js          小程序项目配置文件(配置商城模块功能)
```
#### 配置app.json
> 将需要的页面配置到 `app.json` 文件中

```javascript
"pages": [
        "vendor/wxapp-shop-model/pages/index/index",
        "vendor/wxapp-shop-model/pages/order/order",
        "vendor/wxapp-shop-model/pages/personal/personal",
        "vendor/wxapp-shop-model/pages/goodsAddr/goodsAddr",
        "vendor/wxapp-shop-model/pages/homecategory/homecategory",
        "vendor/wxapp-shop-model/pages/personal/personal",
        "vendor/wxapp-shop-model/pages/cards/cards",
        "vendor/wxapp-shop-model/pages/orderDetail/orderDetail",
        "vendor/wxapp-shop-model/pages/addShip/addShip",
        "vendor/wxapp-shop-model/pages/deliveryAddress/deliveryAddress",
        "vendor/wxapp-shop-model/pages/shipAddress/shipAddress",
        "vendor/wxapp-shop-model/pages/goodsDetail/goodsDetail",
        "vendor/wxapp-shop-model/pages/createOrder/createOrder",
        "vendor/wxapp-shop-model/pages/category/category",
        "vendor/wxapp-shop-model/pages/cart/cart",
        "vendor/wxapp-shop-model/pages/searchPage/searchPage",
        "vendor/wxapp-shop-model/pages/logistics/logistics",
        "vendor/wxapp-shop-model/pages/rechargeRecord/rechargeRecord",
        "vendor/wxapp-shop-model/pages/recharge/recharge",
        "vendor/wxapp-shop-model/pages/baseinfo/baseinfo",
        "vendor/wxapp-client-sdk/pages/noAuth/index",   //必选--页面没有授权时的跳转页面
    ],
```
#### 配置config.js

```javascript
var config = {
    "service": {
      "businessId": "1000000018785",
      "apiHost": "https://gt.wxapp.dev.wyying.cn",//请求地址域名
    },
    shopConfig:{
        url: "https://gt.wxapp.dev.wyying.cn",
        shopName:'长颈鹿',     //商城名称
        theme:{
            radioColor:'#F6B041'    //风格相关,控制radio,switch样式风格
        },
        centerBg:"http://image-10062465.image.myqcloud.com/i/17/03/06/fa5e67eb5f6a21f51a74a793ce6540be.jpg",//个人中心背景
        /*首页轮播图*/
        swiper:[
                {imgUrl:'http://image-10062465.image.myqcloud.com/i/17/03/06/a4c1ca88b101b0f9965beb1bb43fd5bb.jpg',toUrl:"../personal/personal",},
                    {imgUrl:'http://image-10062465.image.myqcloud.com/i/17/03/06/e67ccc050f1b8e03ae2ce726acd12920.jpg',toUrl:''},
                    {imgUrl:'http://image-10062465.image.myqcloud.com/i/17/03/06/5a06abf887031ee82e8556b722ae80e5.jpg',toUrl:''},
        ]
    },
    "version":{
        "designerVersion": "0.0.1v",
        "publishVersion": "0",
        "publishDate": "2017-05-09 21:27:59",
        "appId":"wx90455d5f6625bb9f"
    },
    /*tabBar数据,用于跳转函数做switchTab判断用*/
    "tabBar": [
            "/pages/c729850ca5234a5883512b2e2802f9c1",
            "/vendor/center/index"
            ]
};
```
#### app.js 与app.wxss
> app.js符合设计器中的规范,没有多余代码(功能代码移植到until文件中)

```javascript
var qcloud = require('./vendor/wxapp-client-sdk/index');
var config = require('./config');
App({
    onLaunch() {
        qcloud.setLoginUrl(config.service.apiHost+"/apis/"+config.version.appId+"/login/login");
        qcloud.setBusinessId(config.service.businessId);
    },    
});
```

#### 其他

##### 更改主题
- 主题配置在 `vender-->wxapp-shop-model-->assets-->style-->theme.wxss` 文件中

> 例子(通过scss自动生成主题): 
```javascript
$mainColor:  #ED5564;   //主色
$matchColor: #F6B041;   //配色
```
--命令: `$scss theme.sass theme.wxss`

- PS: 更改`radio,switch`颜色,需要在config.js中修改radioStyle属性

#### 判断跳转方式
- 需要在config.js中配置tabBar的绝对路径,
- 在进行跳转时,可以判断跳转路径是否为tabBar中的路径,
跳转路径-可以为绝对路径,也可以为相对路径
- 历史栈大于等于5,进行redirectTo,其他navigateTo
