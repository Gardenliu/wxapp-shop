// searchPage.js
import { debounce,jumpUrl } from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    going:false,
    focus:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({name}) {
    let history = wx.getStorageSync('searchHistory');
    history = Array.isArray(history) ? history : [];
    console.log('h1',history)
    this.setData({
        inputWord: name,
        history
    })
  },
  input: debounce(function (e) {
      let { value } = e.detail;
      this.setData({
          inputWord: value
      })
  },500),
  inputfocus:function(){
      this.setData({
          focus:true
      })
  },
  inputblur:function(){
      this.setData({
          focus: false
      })
  },
  clear:function(){
      wx.setStorageSync('searchHistory', []);
      this.setData({
          history:[]
      })
  },
  tapHistory:function(e){
      wx.redirectTo({
          url: `../category/category?keyword=${e.currentTarget.dataset.name}`,
      });
  },
  search:function(){
      let { inputWord, going, history } = this.data;
      if(going) return ;
      this.data.going = true;
      if(history.every(function (h) {
          return h != inputWord
      })){
          [].unshift.call(history, inputWord);
      }
      
      console.log('h2',history)
      if (inputWord){
          wx.setStorageSync('searchHistory', history)
      }
      wx.redirectTo({
          url: `../category/category?keyword=${inputWord||''}`,
      });
     
  }
})