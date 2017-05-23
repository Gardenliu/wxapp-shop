import config from "../../etc/config";
import { extend, request,jumpUrl } from "../../utils/util"
Page({
    data:{
        loadingHidden: false,  // loading
        objGetData:{
            Keyword:'',
            ClassfyId:0,//固定
            PageSize:6,//固定
            PageIndex:1,//变化
            Order:'priceAsc'
        },
        isLastPage:false,
        listData:[],
        inputWord:'',
        going:false
    },
    onLoad: function (option) {
        let {name, id,keyword} = option;
        console.log(name,id);
        name = name ? name : keyword ? keyword:''
        this.setData({
            'objGetData.ClassfyId': id||0,
            'objGetData.Keyword':keyword || '',
            inputWord:name

        });
        this.getData();
    },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url);
    },
    getData: function (page) {
        let that = this;
        let listData = this.data.listData || [];
        page = page || this.data.objGetData.PageIndex;
        let query = extend({}, this.data.objGetData, {
            PageIndex: page
        });
        this.setData({
            loadingHidden: false
        });
        request({
            url: config.service.GoodsListUrl,
            method: 'GET',
            data: query,
            success: (data, res) => {
                Array.prototype.push.apply(listData, data.dataSource);
        that.setData({
            listData: listData,
            isLastPage: data.isLastPage,
            "objGetData.PageIndex": page
        });
    },
        complete: () => {
            wx.stopPullDownRefresh();
            this.setData({
                loadingHidden: true
            });
        }
    });
    },
    search:function(){
        let { going, inputWord } = this.data;
        if (going) return;
        this.setData({ going: true })
        wx.redirectTo({
            url: `../searchPage/searchPage?name=${inputWord}`,
        })
    },
    resetData: function () {
        this.setData({
            listData: [],
            "objGetData.PageIndex": 1
        });
        this.getData();
    },
    __initPostData:function(){//初始化
        this.setData({
            'objGetData.PageIndex': 1
        });
    },
    prizeTap:function(){
        this.__initPostData();
        this.setData({
            'objGetData.Order': this.data.objGetData.Order=="priceAsc"?"priceDesc":"priceAsc"
        });
        console.log(this.data.objGetData.Order)
        this.resetData();
    },
    timeTap:function(){
        this.__initPostData();
        this.setData({
            'objGetData.Order': this.data.objGetData.Order=="timeAsc"?"timeDesc":"timeAsc"
        });
        console.log(this.data.objGetData.Order)
        this.resetData();
    },
    onReachBottom:function(){
        let that=this;
        let objGetData=this.data.objGetData;
        if(!this.data.loadingHidden) return false;
        if(!this.data.isLastPage){
            this.getData(objGetData.PageIndex + 1);
        }
    },
    onShow:function(){
        this.setData({
            going:false
        })
    },
    onPullDownRefresh:function(){
        this.setData({
            listData:[]
        })
        this.getData(1);
    }
})