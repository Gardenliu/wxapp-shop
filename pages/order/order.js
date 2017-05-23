import config from "../../etc/config";
import { OrderState, ConfirmMsg } from "./utils/constants";
import { requestPayment } from "../../utils/pay.js";
import { confirm,request,jumpUrl } from "../../utils/util";
Page({
    data: {
        status: 'all',
        loadingHidden: false,
        toDetail: false,
        query: {
            page: 1,
            type: ''
        },
        orderState: OrderState,
        list: [],
        bar: [
            {
                id: 1,
                name: '全部订单',
                value: '',
                checked: true
            },
            {
                id: 2,
                name: '待付款',
                checked: false,
                value: 'WaitPay',
            },

            {
                id: 3,
                name: '待发货',
                checked: false,
                value: 'WaitGoods'
            },
            {
                id: 4,
                name: '待收货',
                checked: false,
                value: 'ReadyGoods'
            },
            {
                id: 5,
                name: '已取消',
                checked: false,
                value: "Cancel"
            }
        ]
    },
    onLoad: function ({type = ''}) {
        let { bar } = this.data,
            newBar = bar.map((item) => {
                item.checked = item.value == type;
                return item;
            })
        this.setData({
            "query.type": type,
            bar: newBar
        });
        this.getData()
    },
    onShow: function () {
        this.setData({
            toDetail: false
        })
    },
    //获取订单列表
    getData: function (page) {
        var query = this.data.query,
            list = this.data.list,
            page = page || query.page;
        this.setData({
            loadingHidden: false
        });
        request({
            url: config.service.OrderIndexUrl,
            data: {
                pageIndex: page,
                orderState: query.type
            },
            success: (res) => {
                list.push.apply(list, res.dataSource);
                console.log('list数据', list);
                if (res.dataSource.length) {
                    this.setData({
                        list: list,
                        isLastPage: res.isLastPage,
                        "query.page": page
                    });
                }

            },
            complete: () => {
                wx.stopPullDownRefresh();
                this.setData({
                    loadingHidden: true
                });
            }
        });
    },
    onReachBottom: function () {
        let { page } = this.data.query;
        this.getData(page + 1)
    },
    //物流
    logistics: function (e) {
        let { id, company, order } = e.currentTarget.dataset;
        let url=`../logistics/logistics?id=${id}&company=${company}&order=${order}`;
        jumpUrl(url);

    },
    //订单详情
    orderDetail: function (e) {
        let { url } = e.currentTarget.dataset,
            { toDetail } = this.data;
        if (toDetail) {
            return false;
        }
        this.setData({
            toDetail: true
        });
        jumpUrl(url)
    },
    //取消订单
    cancelOrder: function (e) {
        let { orderid, state } = e.currentTarget.dataset;

        console.log('post数据', {
            orderNo: orderid,
            state: state
        })
        confirm(ConfirmMsg[state], res => {
            if (!res.confirm) return;
            request({
                url: config.service.ChangeOrderStateUrl,
                method: 'POST',
                data: {
                    orderNo: orderid,
                    state: state
                },
                success: res => {
                    this.resetData();
                }
            });
        });
    },
    orderAct: function (ev) {
        let dataset = ev.target.dataset;
        let state = dataset.state, orderNo = dataset.orderid;
        console.log('post数据', {
            orderNo: orderNo,
            state: state
        })
        confirm(ConfirmMsg[state], res => {
            if (!res.confirm) return;
            request({
                url: config.service.ChangeOrderStateUrl,
                method: 'POST',
                data: {
                    orderNo: orderNo,
                    state: state
                },
                success: (data, res) => {
                    console.log('orderAct返回数据', res);
                    this.resetData();
                }
            });
        });
    },
    //支付
    toPay: function (ev) {
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
                success: function (res) {
                    let url='../orderDetail/orderDetail?id=' + orderId;
                    jumpUrl(url);
                }
            }),
            fail: res => {
                wx.showModal({
                    title: '提示',
                    content: res && res.data && res.data.message || "网络异常，请稍后重试",
                    showCancel: false,
                    success: function (res) {
                        let url='../orderDetail/orderDetail?id=' + orderId;
                        jumpUrl(url);
                    }
                })
            },
            complete: () => {
                this.setData({
                    isPaying: false
                });
                this.resetData();
            }
        });
    },
    //重置
    resetData: function () {
        this.setData({
            list: [],
            "query.page": 1
        });
        this.getData();
    },
    //切换选项卡
    changBar: function (e) {
        let { value } = e.detail,
            { bar } = this.data,
            newBar = bar.map((item) => {
                item.checked = item.value == value;
                return item;
            })

        this.setData({
            list: [],
            bar: newBar,
            "query.page": 1,
            'query.type': value
        });
        this.getData();
    }

})