
//获取应用实例
// import request from "../../utils/request";
import config from "../../etc/config";
import { request,jumpUrl } from "../../utils/util";

var app = getApp()
Page({
    data: {
        loadingHidden: false,  // loading
        checkedCate: -1,
        subCate:[],
        classic: [],
        going:false
    },
    onShow:function(){
        this.setData({
            going:false
        })
    },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url)
    },
    //事件处理函数,参数isReach判断是否滚动加载
    getData: function () {
        this.setData({
            loadingHidden: false
        });
        request({
            url: config.service.GoodsClassfyListUrl,
            method: 'GET',
            login:true,
            success: (data, res) => {
                this.setData({
                    classic: data,
                    checkedCate:data[0]['id'],
                    subCate:data[0]['child']
                });
                console.log('分类', this.data.classic)
            },
            complete: () => {
                wx.stopPullDownRefresh();
                this.setData({
                    loadingHidden: true
                });
            }
        })
    },
    onPullDownRefresh: function () {
        this.getData();
    },
    changeCate:function(e){
        let { classic } = this.data,
            { value } = e.detail;
        
        this.setData({
            checkedCate: value,
            subCate: classic.find(({id}) => {
                return id == value
            }).child
        })
    },
    typeTap: function (ev) {

        let { id,name } = ev.currentTarget.dataset,
        { going } = this.data;

        if(going) return ;
        this.setData({going:true})
        jumpUrl(`../category/category?id=${id}&name=${name}`)
    },
    search:function(){
        let { going } = this.data;
        if (going) return;
        this.setData({ going: true })
        jumpUrl(`../searchPage/searchPage`);
    },
    onLoad: function () {
        this.getData();
    },
    onPullDownRefresh:function(){
      this.getData();
    },
    onShareAppMessage: function () {
        return {
            title: config.nickName,
            desc: '让微信运营简单、专业，高效！',
            path: `${config.sharePath}/pages/category/index`
        }
    }
})

