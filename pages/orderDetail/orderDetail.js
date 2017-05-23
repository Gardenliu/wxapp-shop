import config from "../../etc/config";
import {request,trigger,jumpUrl} from "../../utils/util.js";
import {OrderState, ConfirmMsg,OrderType} from "./utils/constants";
import {requestPayment} from "../../utils/pay";
Page({
    data:{
        loadingHidden:false,
        orderType: OrderType,
        orderState:OrderState
    },
    onLoad:function({id}){
        // 生命周期函数--监听页面加载
        console.log('订单id',id);
        if(!id) return;
        this.setData({
            id: id
        });
        this.getData();
    },
    onPullDownRefresh:function(){
        let { id } = this.data;
        if (!id) return;
        this.getData();
    },
    //物流
    logistics: function (e) {
        let { id, company, order } = e.currentTarget.dataset;
        let url=`../logistics/logistics?id=${id}&company=${company}&order=${order}`;
        jumpUrl(url);
    },
    getData: function () {
        this.setData({
            loadingHidden: false
        });
        request({
                url: config.service.OrderDetailsUrl + this.data.id,
                success: (data,res) => {
                console.log('订单详情',data);
        if (!res.success) {
            return;
        }

        this.setData({
            orderDetail: data.orderDetail[0],
            goodsList: data.orderDetail
        });
    },
        complete: () => {
            this.setData({
                loadingHidden: true
            });
            wx.stopPullDownRefresh();
        }
    })
    },
    //立即支付
    createPay:function(ev){

        let dataset = ev.target.dataset;
        let orderId = dataset.orderid;
        this.setData({
            isPaying: true
        });
        requestPayment(orderId, {
                success: res => wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 3000,
                    success: res => this.getData()
    }),
        fail: res => {
            wx.showModal({
                    title: '提示',
                    content: res && res.data && res.data.message || "网络异常，请稍后重试",
                    showCancel: false,
                    success: res => this.getData()
        })
        },
        complete: res => this.setData({
            isPaying: false
        })
    });


    },
    //
    orderAct:function(ev){

        let dataset = ev.target.dataset;
        let state = dataset.state,
            orderNo = dataset.orderid;
        console.log('post数据', {
            orderNo: orderNo,
            state: state
        })
        // TODO 添加确认弹出框
        let that = this;
        confirm(ConfirmMsg[state], res => {
            if (!res.confirm) return;
        request({
            url: config.service.ChangeOrderStateUrl,
            method: 'POST',
            data: {
                orderNo: orderNo,
                state: state
            },
            success: function (res) {
                console.log('orderAct返回数据', res);
                wx.redirectTo({
                    url:'../order/order',
                    success: function (res) {
                        trigger('refresh');
                    }
                });

            }
        })
    });


    }
})