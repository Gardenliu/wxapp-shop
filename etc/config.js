import appConfig from "../../../config";
import theme from "../assets/style/theme";
let host = appConfig.shopConfig.url;
let shopConfig={
	BusinessId: appConfig.service.businessId,
	sharePath:'vendor/wxapp-shop-model',//分享路径根目录
	nickName: appConfig.shopConfig.shopName,
	swiperIndex:appConfig.shopConfig.swiper,
	center:appConfig.shopConfig.centerBg,
	theme:theme,
	service: {
		// 获取商品列表
		ApiLoginUrl: `${host}/api/Account/ApiLogin`,
		// 获取商品列表
		GoodsListUrl: `${host}/api/goods/GetGoodsList`,
		//获取商城配置
		getShopConfig:`${host}/api/ShopConfig/GetShopConfig`,
		// 获取商品分类
		GoodsClassfyListUrl: `${host}/api/goods/GetClassfyList`,
		//获取商品
		GoodsByIdUrl: `${host}/api/goods/getGoodsById/`,
		//物流记录
		BillLogUrl: `${host}/api/GoodsOrder/GetBillLog`,
		//获取收货地址信息config.service.ReceiveAddressGetUrl
		ReceiveAddressAreaListUrl: `${host}/api/ReceiveAddress/AreaList`,
		//获取收货地址信息
		ReceiveAddressGetUrl: `${host}/api/ReceiveAddress/GET`,
		//添加收货地址信息
		ReceiveAddressAddUrl: `${host}/api/ReceiveAddress/Add`,
		//优惠券
		CouponListUrl: `${host}/api/Order/GetCouponList`,
		//订单列表
		OrderIndexUrl: `${host}/api/Order/Index`,
		//订单详情
		OrderDetailsUrl: `${host}/api/Order/Details/`,
		//改变订单状态
		ChangeOrderStateUrl: `${host}/api/GoodsOrder/ChangeOrderState`,
		//删除购物车商品
		DeleteCartByIdUrl: `${host}/api/Cart/DeleteCartByID`,
		//添加购物车
		AddCartUrl: `${host}/api/Cart/AddCart`,
		//购物车结算
		SettlementUrl: `${host}/api/Cart/Settlement`,
		//获取购物车订单
		GetCartOrderUrl: `${host}/api/GoodsOrder/GetCartOrder`,
		//获取订单库存
		GetStoteListUrl: `${host}/api/GoodsOrder/GetStoteList`,
		//获取购物车列表
		GetCartList:`${host}/api/Cart/GetCartList`,
		//生成订单
		UnifiedOrderUrl: `${host}/api/GoodsOrder/UnifiedOrder`,
		//支付完成回调
		PaymentCallbackUrl: `${host}/api/GoodsOrder/PaymentCallback`,
		//跳转支付页
		JumpToPayUrl: `${host}/api/GoodsOrder/JumpToPay`,
		//获取用户地址
		ReceiveAddressListUrl:`${host}/api/ReceiveAddress/IndexList`,
		//删除用户地址
		ReceiveAddressDeleteUrl:`${host}/api/ReceiveAddress/Delete`,
		//获取成员信息
		GetMemberInfoUrl:`${host}/api/Order/GetMemberInfo`,
		//充值
		GetMoneyDiscountsUrl:`${host}/apis/memberMoney/getMoneyDiscounts`,
		AddMoneyAndPrePayUrl:`${host}/apis/memberMoney/addMoneyAndPrePay`,
		GetAddMoneyOrderUrl:`${host}/apis/memberMoney/getAddMoneyOrder`,
		MyMoneyHistoryUrl:`${host}/apis/memberMoney/myMoneyHistory`,
		GetMemberDetailUrl:`${host}/apis/member/getDetail`,
		UpdateBaseMemberUrl:`${host}/apis/member/updateBaseInfo`,
	}
}
export default shopConfig;