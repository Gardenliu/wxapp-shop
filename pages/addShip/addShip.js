import address from '../../utils/address.js';
import config from "../../etc/config";
import {debounce, confirm, alert,request,trigger} from "../../utils/util";
Page({
  data:{
    loadingHidden:true,
    currentProvince:0,
    currentCity:0,
    currentArea:0,
    address:'',
    provinceArr:[],
    cityArr:[],
    areaArr:[],
    radioStyle:config.theme.style.radioColor,
    model: {
      id: null,
      name: "",
      phone: "",
      province: {areA_NAME:'省'},
      city: {areA_NAME:'市'},
      area:{areA_NAME:'区'},
      address: "",
      email:'',
      isDefault: true
    }
  },
  onLoad:function({id}){
    // 生命周期函数--监听页面加载
    let that =this;
    if(id){
      this.setData({
        pickerValue:[10,2,2]
      })
      wx.setNavigationBarTitle({
        title: "编辑收货地址"
      });
      this.getData(id);
    }
    else{
      wx.setNavigationBarTitle({
        title: "添加收货地址"
      });
      address.get("", 1, (err, provinceArr) => {
        console.log('省份',provinceArr)
      this.setData({
        provinceArr,
        loadingHidden:true
      });
    });
    }
  },
  //获取地址信息
  getData: function (id) {

    let that = this;
    this.setData({
      loadingHidden: false
    });
    request({
      url: config.service.ReceiveAddressGetUrl,
      method: "POST",
      data: {
        id: id
      },
      success: (data) => {
      let pIndex=0,cIndex=0,aIndex=0;
    console.log('地址信息',data)
    this.setData({
      "model.id": id,
      "model.name": data.name,
      "model.phone": data.teL_PHONE,
      "model.provinceId": data.provincE_ID,
      "model.cityId": data.citY_ID,
      "model.areaId": data.countY_ID,
      "model.address": data.address,
      "model.isDefault": data.defaulT_ADDRESS == 1,
      //address:`${data['provincE_NAME']} - ${data['citY_NAME']} - ${data['countY_NAME']}`
    });
    address.get("", 1, (err, provinceArr) => {
      let province =  provinceArr.find(({areA_ID},i)=>{
        pIndex = i;
    return areA_ID==data.provincE_ID
  })
    address.get(data.provincE_ID, 2, (err, cityArr) => {
      let city =  cityArr.find(({areA_ID},i)=>{
        cIndex = i;
    return areA_ID==data.citY_ID
  })
    address.get(data.citY_ID, 3, (err, areaArr) => {
      let area =  areaArr.find(({areA_ID},i)=>{
        aIndex = i;
    return areA_ID==data.countY_ID
  })
    this.setData({
      provinceArr,
      cityArr,
      areaArr,
      loadingHidden:true,
      "model.area":area,
      "model.province":province,
      "model.city":city,
      currentProvince:pIndex,
      currentCity:cIndex,
      currentArea:aIndex,
    });
  });
  });
  });
  },
    complete: () => this.setData({
      loadingHidden: true
    })
  })
  }
  //选择省
  ,provinceChange:function(e){
    // let {provinceId} = this.data.model,
    let id = e?e.detail.value:0,
        {provinceArr} = this.data;

    this.setData({
      "model.province":provinceArr[id],
      currentProvince:id
    })
    address.get(provinceArr[id].areA_ID, 2, (err, cityArr) => {
      this.setData({
      cityArr: cityArr
    });
    this.cityChange();
  })
  }
  //选择市
  ,cityChange:function(e){
    let id = e?e.detail.value:0,
        {cityArr} = this.data;
    this.setData({
      "model.city":cityArr[id],
      currentCity:id
    })
    address.get(cityArr[id].areA_ID, 3, (err, areaArr) => {
      this.setData({
      areaArr: areaArr
    });
    this.areaChange()
  })
  }
  //选择区
  ,areaChange:function(e){
    let id = e?e.detail.value:0,
        {areaArr} = this.data;
    this.setData({
      "model.area":areaArr[id],
      currentArea:id
    })
  }




  ,switchChange:function(e){
    this.setData({
      'model.isDefault':e.detail.value
    })
  }
  //改变值
  ,changeValue:debounce(function(e){
    let { name } = e.currentTarget.dataset,
        { value } = e.detail,
        key = 'model.'+name,
        data = {};
    data[key] = value
    this.setData(data)
  },500)
  //提交地址
  ,submit:function(){
    let { id,name,phone,address,province,city,area,isDefault } = this.data.model,
        data = null,
        regTel = /^1\d{10}$/;
    if (!name || !phone || !address) {
      wx.showModal({
        title:'提醒',
        content:'请填写完整的地址信息',
        showCancel:false
      })
      return;
    }
    if (!regTel.test(phone)) {
      wx.showModal({
        title:'提醒',
        content:'请填写正确的电话号码',
        showCancel:false
      })
      return;
    }
    data = {
      id,
      NAME: name,
      TEL_PHONE: phone,
      PROVINCE_ID: province.areA_ID,
      PROVINCE_NAME: province.areA_NAME,
      CITY_ID: city.areA_ID,
      CITY_NAME: city.areA_NAME,
      COUNTY_ID: area.areA_ID,
      COUNTY_NAME: area.areA_NAME,
      ADDRESS: address,
      DEFAULT_ADDRESS: isDefault ? 1 : 0
    };
    console.log(data);
    this.setData({
      loadingHidden: false
    });
    request({
          url: config.service.ReceiveAddressAddUrl,
          method: "POST",
          data: data,
          success: function (data,res) {
            console.log('新增',res)
            if (!res.success) {
              return;
            }
            // 返回上一页，触发更新事件
            wx.navigateBack({
              success: function (res) {
                trigger("addressUpdate");
              }
            });
          },
          complete: () => {
          this.setData({
          loadingHidden: true
        });
  }
  });
  }
})