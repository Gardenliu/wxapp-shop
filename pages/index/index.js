import config from "../../etc/config";
import { extend, request,debounce,getShopConfig,jumpUrl } from "../../utils/util";
var isReach = false;
Page({
    data: {
        loadingHidden: false,  // loading
        bannerList: config.swiperIndex || null,
        objGetData: {
            Keyword: '',
            ClassfyId: 0,//固定
            PageSize: 6,//固定
            PageIndex: 1,//变化
            Order: 'timeDesc'
        },
        isLastPage: false,
        listData: [],
    },
    getData: function (page) {
        let that = this;
        let listData = this.data.listData || [];
        page = page || this.data.objGetData.PageIndex;
        let query = extend({}, this.data.objGetData, {
            PageIndex: page
        });
        console.log('发送请求', query);
        this.setData({
            loadingHidden: false
        });
        request({
                url: config.service.GoodsListUrl,
                method: 'GET',
                login: true,
                data: query,
                success: function (data, res) {
                    Array.prototype.push.apply(listData, data.dataSource);
                    that.setData({
                        listData: listData,
                        isLastPage: data.isLastPage,
                        "objGetData.PageIndex": page
                    });
                },
                complete: () => this.setData({
                    loadingHidden: true
                })
        })
    },

    GetClassfyList: function () {
        let that = this;
        this.setData({
            loadingHidden: false
        })
        request({
                url: config.service.GoodsClassfyListUrl,
                method: 'GET',
                login: true,
                // data: query,
                success: function (data, res) {
                    console.log('分类', data)
                    that.setData({
                        classic: data
                    });
                    that.getData();
                },
                complete: () => this.setData({
                loadingHidden: true
            })
    })
    },
    twSearch: debounce(function (event) {
        this.setData({
            'objGetData.Keyword': event.detail.value
        });
    },500),
    serachTap: function () {
        this.__initPostData();
        this.resetData();
    },
    resetData: function () {
        this.setData({
            listData: [],
            "objGetData.PageIndex": 1
        });
        this.getData();
    },
    prizeTap: function () {
        this.__initPostData();
        this.setData({
            'objGetData.Order': this.data.objGetData.Order == "priceAsc" ? "priceDesc" : "priceAsc"
        });
        console.log(this.data.objGetData.Order)
        this.getData();
    },
    timeTap: function () {
        this.__initPostData();
        this.setData({
            'objGetData.Order': this.data.objGetData.Order == "timeAsc" ? "timeDesc" : "timeAsc"
        });
        console.log(this.data.objGetData.Order)
        this.getData();
    },
    __addArr: function (arr1, arr2) {
        if (!arr1.length || !arr2.length) return false;
        for (let item in arr2) {
            arr1.push(arr2[item])
        }
        return arr1;
    },
    __initPostData: function () {//初始化
        this.setData({
            'objGetData.PageIndex': 1
        });
        isReach = false;
    },
    onLoad: function () {
        let that = this;
        that.GetClassfyList()
        // wx.setNavigationBarTitle({
        //     title: config.nickName
        // })
    },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url)
    },
    onShow:function(){
        this.data.going = false;
    },
    showDetail:function(e){
        if(this.data.going){
            return false;
        }
        this.data.going = true;
        let { url } = e.currentTarget.dataset;
        jumpUrl(url)
    },
    onReachBottom: function () {
        let objGetData = this.data.objGetData;
        if (!this.data.isLastPage && this.data.loadingHidden) {
            this.getData(objGetData.PageIndex + 1);
        }
    },
    onPullDownRefresh:function(){
        this.setData({
            listData:[],
            "objGetData.PageIndex":1
        })
        this.getData(1);
    },
    onShareAppMessage: function () {
        return {
            title: config.nickName,
            desc: '让微信运营简单、专业，高效！',
            path: `${config.sharePath}/pages/index/index`
        }
    }
})
