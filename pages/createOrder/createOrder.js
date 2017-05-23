import config from "../../etc/config";
import { extend, request, debounce,off,on,jumpUrl } from "../../utils/util";
Page({
    data: {
        hidden: true,  //优惠券
        loadingHidden: false,
        buying: false,    //正在购买
        radioStyle:config.theme.style.radioColor,
        Distribution: 'express', //快递类型
        checkcode: 0,  //优惠券
        check: {
            radioCredit: false, //积分
            radiomoney: false, //储蓄卡
        },
        orderDecs: {
            memberCredit: 0, //积分抵扣
            memberMoney: 0,  //卡抵扣
            userMsg: '', //备注信息
            invoiceType: '个人', //发票类型
            invoiceTitle: '',  //发票抬头
            couponPrice: 0,  //优惠券价格
            couponValue: 0,  //优惠券值
            couponCode: null,//优惠券代码
            couponTitle: '', //优惠券名字
            orderPrice: 0    //最终价格
        }
    },
    globalData: {
        id: null,
        orderId: null
    },
    onLoad: function ({id, isPick}) {
        // 生命周期函数--监听页面加载

        this.globalData.id = id;
        this.setData({
            id, isPick
        })
        this.createOrder();
        // 通过监听 `addressSelected` 事件来更新地址
        on('addressSelected',function(address){
            this.setData({
                "orderInfo.userAddress": [address]
            });
        });
    },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url);
    },
    onPullDownRefresh: function () {
        this.createOrder()
    },
    createOrder: function () {
        let { id, isPick, Distribution } = this.data, that = this;
        request({
            url: `${config.service.GetCartOrderUrl}?cartNo=${id}`,
            method: 'GET',
            login: true,
            success: function (data) {
                console.log('create订单页面', data, isPick);
                if (data) {
                    let count = data.priceAfterDiscount + data.freight;
                    that.setData({
                        loadingHidden: true,
                        'orderInfo': data,
                        'countPrize': count, //商品价格
                        'orderDecs.orderPrice': count - (Distribution == 'ziti' || isPick == 1 ? data.freight : 0),
                        isPick: isPick,
                        zitiAddress: null
                    });
                }
            }
        })
    },
    onUnload: function () {
        off("addressSelected");
        off("addressChange");
    },
    getTicketData: function () {//卡券
        let that = this;
        this.setData({
            loadingHidden: false
        });
        request({
                url: `${config.basePath}Order/GetCouponList`,
                method: 'POST',
                success: function (data) {
                    console.log('卡券', data)
                    that.setData({
                        ticketlist: data
                    });
                },
                complete: () => this.setData({
                loadingHidden: true
            })
    })
    },
    //选择优惠券
    couponTap: function (e) {
        let { item } = e.currentTarget.dataset,
            { ticketlist, checkcode } = this.data,
            { couponList } = this.data.orderInfo,
            value = item.code,
            obj = this.data.orderDecs,
            { radioCredit, radiomoney } = this.data.check,
            {Distribution, orderInfo, isPick} = this.data;

        let orderPrice = this.data.countPrize - (radioCredit ? obj.memberCredit : 0) - (radiomoney ? obj.memberMoney * 100 : 0) - ((Distribution == 'ziti' || isPick == 1) ? orderInfo.freight: 0) - item.reduceCost;

        if (orderPrice >= 0) {
            this.setData({
                checkcode: value == checkcode ? 0 : value
            })
            console.log(item);
            this.setData({
                "orderDecs.couponPrice": value == checkcode ? 0 : item.reduceCost,
                "orderDecs.couponValue": value == checkcode ? 0 : item.leastCost,
                "orderDecs.couponCode": value,
            })
            this.realPrice();
        }
        else {
            alert('最终价格不得低于0元');
        }

    },
    // 勾选使用积分
    toggleCredit: function (e) {
        let { radioCredit } = this.data.check,
            available = !radioCredit;
        this.setData({
            'check.radioCredit': available,
        });
        this.realPrice();
    },
    inputCredit: function (e) {
        let { value } = e.detail,
            { maxAvailCredit } = this.data.orderInfo,
            obj = this.data.orderDecs,
            { radioCredit, radiomoney } = this.data.check,
            {Distribution, orderInfo, isPick} = this.data,
            credit = value > maxAvailCredit ? maxAvailCredit : value;
        //最终价格计算结果
        let orderPrice = this.data.countPrize - (radioCredit ? credit : 0) - (radiomoney ? obj.memberMoney * 100 : 0) - ((Distribution == 'ziti' || isPick == 1) ? orderInfo.freight: 0) - obj.couponPrice;
        if (orderPrice < 0) {
            credit = this.data.countPrize - (radiomoney ? obj.memberMoney * 100 : 0) - ((Distribution == 'ziti' || isPick == 1) ? orderInfo.freight : 0) - obj.couponPrice
        }
        this.setData({
            "orderDecs.memberCredit": credit,
        })
        this.realPrice();
        return credit;
    },

    //勾选金额
    togglemoney: function (e) {
        let { radiomoney } = this.data.check,
            available = !radiomoney;
        this.setData({
            'check.radiomoney': available,
        })
        this.realPrice();
    },
    inputMoney: function (e) {
        let { value } = e.detail,
            { maxAvailMoney } = this.data.orderInfo,
            obj = this.data.orderDecs,
            { radioCredit, radiomoney } = this.data.check,
            {Distribution, orderInfo, isPick} = this.data,
            money = value > maxAvailMoney / 100 ? maxAvailMoney / 100 : value;
        //计算结果
        let orderPrice = this.data.countPrize - (radioCredit ? obj.memberCredit : 0) - (radiomoney ? money * 100 : 0) - ((Distribution == 'ziti' || isPick == 1) ? orderInfo.freight : 0) - obj.couponPrice;
        if (orderPrice < 0) {
            money = (this.data.countPrize - (radioCredit ? obj.memberCredit : 0) - ((Distribution == 'ziti' || isPick == 1) ? orderInfo.freight: 0) - obj.couponPrice) / 100
        }
        this.setData({
            "orderDecs.memberMoney": money,
        })
        this.realPrice();
        if (value > maxAvailMoney / 100) {
            return maxAvailMoney / 100
        }
        return money;
    },
    // 打开优惠券
    getCoupon: function () {
        this.setData({
            hidden: false
        })
    },
    // 关闭优惠券
    closeCoupon: function () {
        this.setData({
            hidden: true
        })
    }
    //备注，发票类型，抬头
    , input: function (e) {
        let {value} = e.detail,
            { name } = e.currentTarget.dataset,
            obj = {};
        obj["orderDecs." + name] = value
        this.setData(obj);
    }
    //最终价格
    , realPrice: function () {
        let obj = this.data.orderDecs,
            { radioCredit, radiomoney } = this.data.check,
            {Distribution, orderInfo, isPick} = this.data;
        console.log('orderDecs', obj)
        // 页面中输入的memberMoney单位为元，计算时需要进行换算
        let orderPrice = this.data.countPrize - (radioCredit ? obj.memberCredit : 0) - (radiomoney ? obj.memberMoney * 100 : 0) - ((Distribution == 'ziti' || isPick == 1) ? orderInfo.freight : 0) - obj.couponPrice;

        orderPrice = Math.max(Math.round(orderPrice * 100) / 100,0)
        this.setData({
            'orderDecs.orderPrice': orderPrice
        });
    }
    //选择自提地址
    , chooseAddr: function (e) {
        let { zitiAddress } = this.data, that = this,
            url = zitiAddress ? `../goodsAddr/goodsAddr?id=${zitiAddress.id}` : '../goodsAddr/goodsAddr';

        jumpUrl(url)

        on('addressChange', zitiAddress => {
            console.log('zitiAddress',zitiAddress)
        that.setData({
            zitiAddress
        })
    })
    },
    changeDis: function (e) {  //选择快递方式
        let { mode } = e.currentTarget.dataset;
        this.setData({
            Distribution: mode
        })
        if ('express' == mode) {
            this.setData({
                zitiAddress: null
            })
        }
        this.realPrice();
    }
    , createPay: function (e) {
        if (this.data.buying) return;

        let that = this,
        // payWay = 1, //0为货到付款
            payWay = e.target.dataset.offline ? 0 : 1,
            info = that.data.orderInfo,
            { radioCredit, radiomoney } = this.data.check,
            { orderDecs, isPick, zitiAddress, Distribution } = this.data,
            address = that.data.orderInfo.userAddress && that.data.orderInfo.userAddress[0] || {};
        this.setData({
            buying: true,
            loadingHidden: false,
            payway: payWay
        });
        let Address = address.provincE_NAME + address.citY_NAME + address.countY_NAME + address.address
        let postData = {
            CartNo: this.globalData.id,
            Person: address.name,
            Phone: address.teL_PHONE,
            Address,
            BusinessAddress: null,
            BusinessPhone: null,
            PayWay: payWay,
            OrderType: "QuickMall",
            OrderLabel: "商城小程序",
            GoodsTotalPrice: info.goodsPrice,
            GoodsRealPrice: info.priceAfterDiscount,
            GoodsDiscount: info.memberDiscount,
            Freight: (Distribution == 'ziti' || isPick == 1) ? 0 : info.freight,
            OrderPrice: orderDecs.orderPrice,
            // 页面中输入的 memberMoney 单位为元，提交时需要转换为分
            StoreCardPrice: radiomoney ? orderDecs.memberMoney * 100 : 0,
            Integral: radioCredit ? orderDecs.memberCredit : 0,
            IntegralPrice: radioCredit ? orderDecs.memberCredit : 0,
            CouponPrice: orderDecs.couponPrice,
            CouponValue: orderDecs.couponValue,
            CouponCode: orderDecs.couponCode,
            UserMsg: orderDecs.userMsg,
            InvoiceType: orderDecs.invoiceType,
            InvoiceTitle: orderDecs.invoiceTitle,
            ProductName: null
        }
        if (postData.Freight && !Address) {//如果没有用户地址
            that.setData({
                buying: false
            });
            wx.showModal({
                title: '提示',
                content: '您的地址未选择',
                showCancel: false,
                success: function (res) {
                    that.setData({
                        loadingHidden: true
                    })
                    return;
                }
            })
            return;
        }
        if (!postData.Freight) {
            if (!zitiAddress) {
                that.setData({
                    loadingHidden: true
                })
                wx.showModal({
                    title: '提示',
                    content: '请选择自提地址',
                    showCancel: false,
                    success: function (res) {
                        that.setData({ buying: false })
                        return;
                    }
                })
                return;
            }
            postData.BusinessAddress = zitiAddress.address;
            postData.BusinessPhone = zitiAddress.telephone;
            postData.Storeid = zitiAddress.id
        }
        console.log('postData数据', postData)
        //生成订单
        request({
            url: config.service.UnifiedOrderUrl,
            method: 'POST',
            data: postData,
            success: function (data, res) {
                console.log('订单返回', data)
                that.setData({
                    buying: false,
                    loadingHidden: true
                });

                if (res.success) {
                    console.log('res.data数据', data)
                    that.globalData.orderId = res.message;
                    // 实际付款价格为0时，不需要进行付款
                    if (data && payWay == 1) {
                        that.__pay(data);
                    } else {//货到付款
                        wx.redirectTo({
                            url: '../orderDetail/orderDetail?id=' + that.globalData.orderId
                        })
                    }
                }
                else {
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel: false,
                        success: function (res) {console.log(res)
                            if (data.data) {
                                wx.redirectTo({
                                    url: '../orderDetail/orderDetail?id=' + data.data
                                })
                            }
                        }
                    })
                }
            },
            fail: function (res) {
                that.setData({
                    buying: false,
                    loadingHidden: true
                });
            }
        })
    }
    //调用微信支付接口
    , __pay: function (data) {
        let that = this;
        wx.requestPayment({
            'timeStamp': data.timestamp,
            'nonceStr': data.nonceStr,
            'package': data.packages,
            'signType': data.signType,
            'paySign': data.paySign,
            'success': function (res) {
                that.__payCallback();
            },
            'fail': function (res) {
                that.__payCallback();
            }
        })
    },
    //支付完成回掉
    __payCallback: function () {
        console.log('orderId', this.globalData.orderId);
        let postPayData = { 'orderNo': this.globalData.orderId },
            orderId = this.globalData.orderId;
        request({
            url: config.service.PaymentCallbackUrl,
            method: 'POST',
            data: postPayData,
            success: function (data, res) {
                console.log('支付后回调后台返回的数据', res);
                if (res.success) {
                    wx.showToast({
                        title: '成功',
                        icon: 'success',
                        duration: 3000,
                        success: function (res) {
                            wx.redirectTo({
                                url: '../orderDetail/orderDetail?id=' + orderId
                            })
                        }
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel: false,
                        success: function (res) {
                            wx.redirectTo({
                                url: '../orderDetail/orderDetail?id=' + orderId
                            })
                        }
                    })
                }
            },
            fail: function (res) {
                wx.showModal({
                    title: '提示',
                    content: res.message,
                    showCancel: false,
                    success: function (res) {
                        wx.redirectTo({
                            url: '../orderDetail/orderDetail?id=' + orderId
                        })
                    }
                })
            }
        })
    },
})