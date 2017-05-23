import config from "../../etc/config";
import {debounce, confirm, alert,request} from "../../utils/util";
Page({
    data:{
        loadingHidden: false,
        ticketlist: null
    },
    onLoad:function(options){
        // 生命周期函数--监听页面加载
        this.getTicketData();
    },
    getTicketData: function () {
        let that = this;
        this.setData({
            loadingHidden: false
        });
        request({
                url: config.service.CouponListUrl,
                method: 'POST',
                success: function (data) {
                    console.log('卡券',data)
                    that.setData({
                        ticketlist: data
                    });
                    wx.stopPullDownRefresh();
                    that.setData({
                        loadingHidden: true
                    })
                },
                complete: () => this.setData({
                loadingHidden: true
            })
    })
    },
    onPullDownRefresh: function() {
        // 页面相关事件处理函数--监听用户下拉动作
        this.getTicketData();
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数

    },
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    }
})
