import config from "../../etc/config";
import Session from '../../../wxapp-client-sdk/lib/session'
import {debounce, confirm, alert,request,jumpUrl} from "../../utils/util";
Page({
    data: {
        imgsrc: "../../assets/images/personbg.jpg",
        config: {
            logo: config.logo,
            nickName: config.nickName,
            bg: config.center
        },
        userInfo: {},
        userSub: null,
        list:[
            {
                text:'待付款',
                image:'../../assets/images/theme/daifukuai.png',
                type:'WaitPay'
            },
            {
                text:'待发货',
                image:'../../assets/images/theme/daifahuo.png',
                type:'WaitGoods'
            },
            {
                text:'待收货',
                image:'../../assets/images/theme/daishouhuo.png',
                type:'ReadyGoods'
            },
            {
                text:'待评价',
                image:'../../assets/images/theme/daipingjia.png',
                type:'Complete'
            }

        ]
    },
    onLoad: function (options) {
        //调用应用实例的方法获取全局数据
        let {userInfo} = Session.get();
        this.setData({
            userInfo: userInfo
        })

        this.getMemberData();
    },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url)
    },
    getMemberData: function () {
        let that = this;
        request({
            url:config.service.GetMemberInfoUrl,
            method: 'POST',
            success: function (data) {
                console.log('会员信息', data);
                that.setData({
                    userSub: data,
                });
            }
        })
    },
    onShareAppMessage: function () {
        // 用户点击右上角分享
        return {
            title: '微运营商城',
            desc: '让微信运营简单、专业，高效！',
            path: `${config.sharePath}/pages/personal/personal`
        }
    }
})