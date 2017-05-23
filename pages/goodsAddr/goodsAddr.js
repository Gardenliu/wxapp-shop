import config from "../../etc/config";
import {trigger,jumpUrl,request} from "../../utils/util";
Page({
  data: {
    selectedId: null,
    going:false,
    loading:true
  },
  onLoad: function ({id}) {
    this.setData({
      selectedId:id,
      going:false
    })

    this.getLocation()
  },
  onPullDownRefresh:function(){
    this.getLocation()
  },
  getLocation:function(){
    this.setData({ loading:true})
    let that = this;
    wx.getLocation({
          success: ({latitude, longitude}) => {
          console.log(latitude, longitude)
    that.setData({
      latitude, longitude
    });
    that.search();
  },
    fail:()=>{
      that.setData({ loading: false });
      wx.showModal({
        title: "提示",
        content: '请勾选地理位置，谢谢！！！',
        showCancel: false,
        success:function(){
          wx.openSetting({
                success: ({authSetting}) => {
                if (authSetting['scope.userLocation']) {
            that.getLocation();
          }
          else {
            wx.navigateBack({
              delta: 1
            })
          }
        },
          fail: () => {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        }
      });
    }
  })
  },
  onShow:function(){
    this.setData({
      going:false
    })
  },
  search() {
    let { latitude, longitude,inputVal } = this.data,that=this;
    request({
          url: config.service.GetStoteListUrl,
          data: {
            latitude,
            longitude,
            likeName: inputVal||'',
            limit: 30
          },
          method: 'POST',
          success: (data, res) => {
          console.log(data);
    that.setData({
      list:data,
      loading:false
    });
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
  detail(e){
    let { url } = e.currentTarget.dataset,
        {  going } = this.data;
    if(going){
      return ;
    }

    this.setData({
      going:true
    });
    jumpUrl({url})
  }
})