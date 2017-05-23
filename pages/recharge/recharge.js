// recharge.js
import { request, debounce, alert, jumpUrl } from '../../utils/util';
import config from '../../etc/config';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    checkedItem:null,
    buying:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({money}) {
      this.getDiscounts();
      this.getMemberData();
  },
  onShow:function(){
      this.setData({
          buying:false
      })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      this.getDiscounts();
      this.getMemberData();
  },
  getMemberData: function () {
      let that = this;
      request({
          url: config.service.GetMemberInfoUrl,
          method: 'POST',
          success: function (data) {
              console.log('会员信息', data);
              that.setData({
                  userSub: data,
              });
              wx.stopPullDownRefresh();
          },
          fail: () => wx.stopPullDownRefresh()
      })
  },
  getDiscounts:function(){
      let that = this;
      wx.showLoading({
          title: '加载中',
      })
      request({
          url: config.service.GetMoneyDiscountsUrl,
          login:true,
          method:'POST',
          success:function(list,res){
              wx.hideLoading();
              console.log(list)
              that.setData({
                  list
              });
              wx.stopPullDownRefresh();
          },
          fail: () => wx.hideLoading()
      })
  },
  //选择确定金额
  changeDis:function(e){
    let { item } = e.currentTarget.dataset,
          { checkedItem } = this.data; 
    !checkedItem||(item.id != checkedItem.id)?this.setData({
        checkedItem:item,
        otherMoney:''
    }):''
  },
  otherFocus:function(){
      this.setData({
          checkedItem:null
      })
  },
  input: debounce(function(e){
    let { value } = e.detail;
    this.setData({
        otherMoney:value
    })
  },500),
  //充值记录
  record:function(){
      jumpUrl("../rechargeRecord/rechargeRecord");
  },
  //提交订单
  createPay:function(){
      let { checkedItem, buying, otherMoney } = this.data,that = this,obj={};
      if (buying) return ;     
      
      if (checkedItem){
          obj = { "moneyDiscountId": checkedItem.id }
      }
      else if (otherMoney){
          obj = { "otherMoney": otherMoney*100 }
      }
      else{
          alert('请选择或输入充值金额');
          return 
      }
      
      this.data.buying = true;
      wx.showLoading({
          title: '加载中...',
      })
      request({
          url: config.service.AddMoneyAndPrePayUrl,
          login:true,
          method:'POST',
          data:obj,
          success:function(data,res){
              wx.hideLoading();
              let { extras,id } = data;
              that.setData({
                  paymentId: id
              })
              that.payment(extras)
          },
          fail: () => wx.hideLoading()
      })
  },
  //调用薇信支付接口
  payment: function (data){
      let that = this;
      wx.requestPayment({
          'timeStamp': data.timestamp,
          'nonceStr': data.nonceStr,
          'package': data.packages,
          'signType': data.signType,
          'paySign': data.paySign,
          'success': function (res) {
              that.__payCallback();
          },
          'fail': function (res) {
              wx.showToast({
                  title: '支付失败',
                  duration: 1500
              })
          }
      })
  },
  //支付回调
  __payCallback:function(){
      let { paymentId } = this.data,that = this;

      request({
          url: config.service.GetAddMoneyOrderUrl,
          login:true,
          method:'POST',
          data: { orderId: paymentId},
          success:function(data,res){
              if (res.success = true & data != null & data.state =="TRUE"){
                  wx.showToast({
                      title: '支付成功',
                      duration: 1500
                  })
                  that.getMemberData();
              }else{
                  wx.showToast({
                      title: '支付失败',
                      duration: 1500
                  })
              }
              
          }
      })
  }
})