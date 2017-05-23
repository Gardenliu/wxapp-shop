import config from "../../etc/config";
import { request,getCartList,jumpUrl } from "../../utils/util";
var WxParse = require('../../../wyying-assets/plugins/RichTextArea/wxParse/wxParse.js');
Page({
    data: {
        hidden:true,
        loadingHidden: false,
        pageInfo: {},
        postData: {},
        curentSpecIndex: [],
        typeShow: false,//类型弹出,
        cartNum: 0,
        argid: '',
        nodata: true,
        isSingle: false, // 是否是单规格商品
        stock:0,
        buying:false    //控制购买点击

    },
    onLoad: function ({id}) {
        // 生命周期函数--监听页面加载
        console.log(id);
        this.setData({id})
        this.getDetail()
    } ,
    getDetail:function(){
        var that = this, cartNo,{ id } = this.data;
        this.setData({
            loadingHidden:false
        })
        this.getCart();
        try {
            cartNo = wx.getStorageSync('cartNo');
            console.log('stroageCartNo', cartNo)
        } catch (e) {
            console.log(e)
        }
        request({
            url: config.service.GoodsByIdUrl + id,
            method: 'GET',
            login: true,
            success: function (info) {
                wx.stopPullDownRefresh();
                let nodata = info ? false : true,
                    defaultStandard = null,
                    defaultStandardStock = null,
                    isSingle = that.data.isSingle;
                that.setData({
                    loadingHidden: true,
                    nodata: nodata
                });
                if (nodata) return false;
                if (!info.goodsStandards.length) {
                    isSingle = true;
                    defaultStandard = {
                        standard_id: "0",
                        standard_name: "默认规格",
                        standard_values: [
                            {
                                standard_value_id: "0",
                                standard_value_name: "默认"
                            }
                        ]
                    };
                    defaultStandardStock = {
                        id: "0",
                        standard_value_id: "0",
                        standard_value_name: "默认",
                        price: info.defaulT_PRICE,
                        stock: info.stock
                    };
                    info.goodsStandards = [defaultStandard];
                    info.goodsStandardStock = [defaultStandardStock];
                }
                info.images = info.images.split(';');

                let specMap = info.goodsStandardStock.reduce((memo, item, index) => {
                        memo[item.standard_value_id] = item;
                return memo;
            }, {});
                that.data.curentSpecIndex = info.goodsStandards.map((item, index) => item.standard_values[0].standard_value_id);
                let curentSpecIndex = that.data.curentSpecIndex.join(",");
                console.log('post详情', info)
                that.setData({
                    curentSpecIndex: that.data.curentSpecIndex,
                    pageInfo: info,
                    postData: {
                        GoodsID: info.id,
                        GoodsSpecID: specMap[curentSpecIndex]['standard_value_id'],
                        GoodsSpec: specMap[curentSpecIndex]['standard_value_name'],
                        GoodsName: info.name,
                        GoodsImg: info.defaulT_IMAGE,
                        CartType: "QuickMall",
                        CartNo: cartNo,
                        IsValid: 1,
                        OriPrice: specMap[curentSpecIndex]['price'],
                        OriPrice2: specMap[curentSpecIndex]['original_price'],  //显示的原价
                        BuyPrice: specMap[curentSpecIndex]['price'],
                        Num: 1,
                        Stock: specMap[curentSpecIndex]['stock'],
                        IsPick: info.iS_PICK
                    },
                    specMap: specMap,
                    isSingle: isSingle,
                })
                WxParse.wxParse('article', 'html', info.introduction, that, 0);
                console.log('load', that.data.postData)
            },
            fail: function () {

            }
        })
    }
    ,onShow:function(){
        this.data.buying = false;
    },
    getCart:function(){
        let that = this;
        getCartList(function(cartList){
            //更新数据
            let cartCount=that.__getCartNum(cartList);
            that.setData({
                cartNum:cartCount,
                cartList:cartList
            });
        },true);
    }
    //获取购物车中总数
    ,__getCartNum:function(cartList){
        if(!cartList.length) return 0;
        let count=0;
        for(let item in cartList){
            count+=cartList[item].num;
        }
        return count;
    }
    ,onShareAppMessage:function(){
        return {
            title: '微运营商城',
            desc: '让微信运营简单、专业，高效！',
            path: `${config.sharePath}/pages/goodsDetail/goodsDetail?id=`+this.data.postData.GoodsID,
        }
    }
    , chooseType: function (e) {
        this.setData({
            hidden: false
        })
    }
    , closeType: function () {
        this.setData({
            hidden: true
        })
    },
    changeSpec: function (ev) {
        //选择规格
        let target = ev.detail.value;
        let standardIdx = target.slice(0,1);
        let idx = target.slice(-1);
        console.log(standardIdx,idx);
        let currentSpecIndex = this.data.curentSpecIndex.slice(0);
        currentSpecIndex[standardIdx] = idx;
        let spec = this.data.specMap[currentSpecIndex.join(",")];
        console.log('currentSpecIndex',currentSpecIndex);
        console.log(spec)
        this.setData({
            curentSpecIndex: currentSpecIndex,
            "postData.GoodsSpecID": spec['standard_value_id'],
            "postData.GoodsSpec": spec['standard_value_name'],
            "postData.OriPrice": spec['price'],
            "postData.OriPrice2": spec['original_price'],
            "postData.BuyPrice": spec['price'],
            "postData.Stock": spec['stock']
        });
        console.log(this.data.postData)
    }
    , changNum: function (e) {//切换商品数量
        let { type } = e.currentTarget.dataset,
            step = type == 'add' ? 1 : type == 'dec' ? -1 : 0,
            { Num,Stock } = this.data.postData,
            currentNum = Num + step;

        this.setData({
            "postData.Num": currentNum <= Math.min(1,Stock) ? 1 : currentNum >= Math.max(1, Stock) ? Math.max(1, Stock) : currentNum
        })
    }
    , addTocart: function () {
        //加入购物车
        let that = this;
        let curentCartNum = that.data.cartNum + that.data.postData.Num;
        let postData = that.data.postData;
        let isSingle = that.data.isSingle;

        postData.CartType = 'Mall';
        postData.GoodsSpecID = isSingle ? "" : postData.GoodsSpecID;
        postData.GoodsSpec = isSingle ? "" : postData.GoodsSpec;
        console.log('加入购物车post数据', postData);
        // postData.IsPick自提
        if(that.data.cartNum){//购物车中有商品，就判断跟购物车商品是否一致
            if(that.data.cartList[0]['iS_PICK'] !==  postData.IsPick){
                wx.showModal({
                    title: '提示',
                    content: `货运方式与购物车中商品不一致，请选择其他商品`,
                    showCancel: false,
                    success: function (res) {
                        return;
                    }
                })
                return false;
            }
        }

        if(postData.Stock < postData.Num){
            wx.showModal({
                title: '提示',
                content: `库存不足`,
                showCancel: false,
                success: function (res) {
                    return;
                }
            })
            return false;
        }
        request({
            url: config.service.AddCartUrl,
            method: 'POST',
            login: true,
            data: postData,
            success: function (data) {
                wx.setStorageSync('cartNo', data);
                that.setData({
                    cartNum: curentCartNum,
                    'postData.Stock':postData.Stock-postData.Num
                });
                wx.showToast({
                    title: '已加购物车',
                    icon: 'success',
                    duration: 2000
                });
                that.getCart();
            },
            file:function(e){
                console.log(e)
            }
        })
    },
    //立即购买
    buyTap:function(){
        if(this.data.buying){
            return false;
        }
        this.data.buying = true;
        let that = this,
            {postData,isSingle} = that.data;

        postData.CartNo = null;
        postData.GoodsSpecID = isSingle ? "" : postData.GoodsSpecID;
        postData.GoodsSpec = isSingle ? "" : postData.GoodsSpec;
        console.log(postData);
        if(postData.Stock < postData.Num){
            wx.showModal({
                title: '提示',
                content: `库存不足`,
                showCancel: false,
                success: function (res) {
                    return;
                }
            })
            that.data.buying = false;
            return false;
        }
        request({
            url: config.service.AddCartUrl,
            method: 'POST',
            login: true,
            data: postData,
            success: function(data) {
                jumpUrl(`../createOrder/createOrder?id=${data}&isPick=${postData.IsPick}`);
            }
        })
    },
    onPullDownRefresh:function(){
        this.getDetail()
    }
})