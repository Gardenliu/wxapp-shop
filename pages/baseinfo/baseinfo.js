// baseinfo.js
import { debounce,request,alert } from '../../utils/util';
import  config  from '../../etc/config';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    model:{
        truename:'',
        mobilePhone:'',
        gender:'',
        customerType: "WXAPP"
    },
      radioStyle:config.theme.style.radioColor,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.getMemberInfo()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      this.getMemberInfo()
  },
  getMemberInfo:function(){
      let that = this,{ model } = that.data;
      wx.showLoading({
          title: '加载中',
      })
    request({
        url: config.service.GetMemberDetailUrl,
        login:true,
        method:'POST',
        success:function(data,res){
            console.log(res);
            wx.hideLoading();
            for (let k of Reflect.ownKeys(model)){//去除data中多余的属性
                model[k] = data[k]||model[k]
            }
            that.setData({
                model
            })
            wx.stopPullDownRefresh();
        }
    })
  },
  changeValue:function(e){
    let { value } = e.detail,{name} = e.currentTarget.dataset,obj={};
    console.log(value,name);
    
    obj["model."+name] = value
    this.setData(obj)
  },
  submit:function(){
      let { model } = this.data,that = this;
      console.log(JSON.stringify({
          "memberReqDto": model
      }))
      wx.showLoading({
          title: '加载中',
      })
      if (!/\d{11}/.test(model.mobilePhone)) {
          wx.hideLoading();
          alert('请输入正确的11位手机号');
          return;
      }
      request({
          url: config.service.UpdateBaseMemberUrl,
          login:true,
          method:'POST',
          data: { 
              "memberReqDto": model
          },
          success:function(data,res){
            if(data && res.success){
                wx.hideLoading();
                wx.showToast({
                    title: '操作成功',
                    icon: 'success',
                    duration: 1500
                })
                wx.navigateBack({
                    delta:1
                })
            }
          },
          fail: function (res) { wx.hideLoading();}
      })
  }
})