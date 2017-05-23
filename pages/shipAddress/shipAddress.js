import config from "../../etc/config";
import {request,trigger,off,on,jumpUrl} from "../../utils/util";
Page({
  data:{
    selectedId:null,
    radioStyle:config.theme.style.radioColor,
  },
  onLoad:function({id}){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({id})
    this.getData();
    on('addressUpdate',()=>{
      this.getData()
  })
  },
  onJump:function(ev){
    jumpUrl(ev.currentTarget.dataset.url)
  },
  onUnload: function () {
    off("addressUpdate");
  },
  onPullDownRefresh: function () {
    this.getData();
  },
  selectAddress:function(evt){
    var id = evt.detail.value;
    var address = this.data.list.find(item => item.id == id);
    if (!address) {
      console.log("地址选择异常");
    }
    wx.navigateBack({
          success: () => trigger("addressSelected", address)
  });
  },
  getData:function(){
    let { id } = this.data;
    this.setData({
      loadingHidden:false
    });
    request({
          url: config.service.ReceiveAddressListUrl,
          method: "POST",
          success: (data,res) => {
          console.log('用户地址',res)
    if (!res.success) {
      return;
    }
    this.setData({
      list: res.data,
      selectedId:id
    });
  },
    complete: () => {
      this.setData({
        loadingHidden: true
      });
      wx.stopPullDownRefresh();
    }
  });
  }
})