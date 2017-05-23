// pages/logistics/logistics.js
import { request } from '../../utils/util';
import config from '../../etc/config';

Page({
      data:{
        loading:true
      },
      onLoad:function({id,company,order}){
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
          Waybill:id,
          order,
          company
        });
        this.getData();
      },
      getData:function(){
        let that = this;
        this.setData({
          loading:true
        })
        request({
              url:config.service.BillLogUrl,
              data: {
                no: that.data.Waybill
              },
              method: 'POST',
              login: true,
              success: res => {
              console.log('物理与信息', res);
        that.setData({
          loading:false,
          list: res.map((l) => {

            let date = l.time.split(' ');
        l.date = date[0];
        l.time = date[1].slice(0, -3);

        l.context = l.context.slice(l.context.indexOf(']') + 1);
        l.context = l.context.slice(l.context.indexOf(']') + 1);
        l.context = l.context.replace(/(\[|\])/g, ' ');
        return l;
      })
      })

        wx.stopPullDownRefresh();
      }
      })
      },
      onPullDownRefresh:function(){
        this.getData();
      }
      ,call:(e)=>{
      let { phone } = e.currentTarget.dataset;
      console.log(phone)
  }
})