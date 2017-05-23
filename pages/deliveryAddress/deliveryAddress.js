import config from "../../etc/config";
import {debounce, confirm, alert,request,off,on,jumpUrl} from "../../utils/util";
Page({
  data:{
    loadingHidden:false
  },
  onLoad:function(){
    this.getData();
    // 页面初始化 options为页面跳转所带来的参数
    on("addressUpdate", (item) => {
      this.getData();
  });
  },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url);
    },
  getData:function(){
    this.setData({
      loadingHidden: false
    });
    request({
          url: config.service.ReceiveAddressListUrl,
          method: "POST",
          success: (data,res) => {
          console.log('用户地址',data)
    if (!res.success) {
      return;
    }
    this.setData({
      list: data
    });
  },
    complete: () => {
      this.setData({
        loadingHidden: true
      });
      wx.stopPullDownRefresh();
    }
  });
  },
  del:function(e){
    let that = this;
    confirm("确认删除该地址?", (res) => {
      if (!res.confirm) {
      return;
        }
        this.setData({
          loadingHidden: false
        });
        request({
              url: config.service.ReceiveAddressDeleteUrl,
              method: "POST",
              data: {
                id: e.currentTarget.dataset.id
              },
              success: function (data) {
                that.getData()
              },
              complete: () => this.setData({
              loadingHidden: true
              })
        })
    })
  },
  onPullDownRefresh: function () {
    this.getData();
  },

  onUnload: function () {
    off("addressUpdate");
  },
})