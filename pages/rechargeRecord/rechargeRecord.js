// rechargeRecord.js
import config from "../../etc/config";
import { request,jumpUrl,trigger } from '../../utils/util'

Page({
    data: {
        selectedId: null,
        going: false,
    },
    onLoad: function ({id}) {
        this.setData({
            selectedId: id,
            going: false
        })

        this.search()
    },
    onPullDownRefresh: function () {
        this.search()
    },
    onShow: function () {
        this.setData({
            going: false
        })
    },
    search() {
        let that = this;
        wx.showLoading({
            title: '加载中...',
        })
        request({
            url:config.service.MyMoneyHistoryUrl,
            data: {
                pageInfo:{
                    pageNo:1,
                    pageSize:30
                }
            },
            method: 'POST',
            success: ({list}, res) => {
                console.log(list);
                that.setData({
                    list: list.map((item)=>{
                        console.log(item)
                        item.text = item.moneyChange>0?'充值':'消费'
                        item.remark = item.remark&&item.remark.split('：')[0];
                        item.updateDate = new Date(item.updateDate).toLocaleDateString();
                        return item;
                    })
                })
                wx.hideLoading();
                wx.stopPullDownRefresh();
            }
        })
    },
    selectAddress: function (evt) {
        var id = evt.detail.value;
        var address = this.data.list.find(item => item.id == id);
        if (!address) {
            console.log("地址选择异常");
        }
        wx.navigateBack({
            success: () => trigger("addressChange", address)
        });
    },
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    clearInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    detail(e) {
        let { url } = e.currentTarget.dataset,
            {  going } = this.data;
        if (going) {
            return;
        }

        this.setData({
            going: true
        });

        jumpUrl( url )
    }
})