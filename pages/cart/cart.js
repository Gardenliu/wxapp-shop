import config from "../../etc/config";
import { getCartList ,request,jumpUrl} from "../../utils/util";
Page({
    data:{
        allchecked:false,
        noGoods:false,
        loading:true,
        countNum:0,
        countPrice:0
    },
    onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数

    },
    onReady:function(){
        // 页面渲染完成
    },
    onShow:function(){
        // 页面显示
        this.getCart();
    },
    onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url)
    },
    onPullDownRefresh:function(){
        this.getCart();
    },
    getCart:function(){
        this.setData({
            loading: true
        })
        getCartList((list)=>{
            if(list.length){
            console.log('购物车',list);
            let notCheck = list.filter(({iS_VALID})=>{
                    return !iS_VALID;
        })
            this.setData({
                loading:false,
                noGoods:false,
                cartList:list,
                allchecked:!Boolean(notCheck.length)
            })
            this.getCount()
        }
        else{
            this.setData({
                noGoods:true,
                loading:false
            })
        }
        wx.stopPullDownRefresh()
    },true)
    },
    /**
     * 全选
     */
    checkall:function(e){
        let { allchecked,cartList } = this.data;

        cartList.forEach((item,i)=>{
            cartList[i]['iS_VALID'] = !allchecked;
    })
        this.setData({
            cartList,
            allchecked:!allchecked
        });
        this.getCount();
    }
    /**
     * 选择商品
     */
    ,checkcommodity(e){
        let { value } = e.detail,
            { cartList } = this.data;

        cartList.forEach(({ id },index)=>{
            let check = (value||[]).filter((v,i)=>{
                    return id == v
                });
        cartList[index]['iS_VALID'] = check.length
    });

        let notCheck = cartList.filter(({iS_VALID})=>{
                return !iS_VALID;
    })
        console.log(cartList,notCheck)
        this.setData({cartList,allchecked:!Boolean(notCheck.length)});
        this.getCount();
    }
    //
    /**
     * 删除商品
     */
    ,deleteCommodity(id,index){
        let { cartList } = this.data,
            deleteid = id,
            that = this;
        //如果数量为0，提示是否删除
        wx.showModal({
            title: '提示',
            content: '是否删除该商品',
            success: function(res) {
                if (res.confirm) {
                    cartList.forEach(({id},i)=>{
                        if(id == deleteid){
                        let deletobj=cartList.splice(index,1);
                        that.__deletCartById(deletobj[0].id,cartList);
                    }
                })
                }
            }
        });

    }
    /**
     * 改变商品数量
     */
    ,changNum(e){
        let { id,type } = e.currentTarget.dataset,
            { cartList } = this.data,
            changeid = id,
            that = this;



        cartList.forEach(({id,num,stock},i)=>{
            if(changeid == id){
            let newPrice = type == 'add'?num+1:num-1<=0?0:num-1;
            if(newPrice<1){
                that.deleteCommodity(id,i);
                return ;
            }
            console.log(stock)
            cartList[i]['num'] = newPrice <= Math.min(1, stock) ? 1 : newPrice >= Math.max(1, stock) ? Math.max(1, stock) : newPrice;
        }
    })
        this.setData({
            cartList
        })
        this.getCount();
    }
    /**获取商品数量和总价 */
    ,getCount(){
        let { cartList,countNum,countPrice } = this.data;
        countNum = 0,countPrice = 0;
        cartList.forEach(({num,buyprice,iS_VALID})=>{
            if(iS_VALID){
                countNum+=num;
                countPrice += num*buyprice
            }
        })

        this.setData({
            countNum,countPrice:countPrice/100
        })
    }
    ,__deletCartById(id,cartList){
        //从购物车中删除某商品
        if(!id) return false;
        let that=this;
        request({
            url: config.service.DeleteCartByIdUrl,
            method: 'POST',
            data: {id:id},
            success: function(data,res) {
                console.log('DeleteCartByID',res);
                if(res.success){
                    cartList.length>0?that.setData({cartList}):that.setData({noGoods:true});
                    that.getCount();
                }else{
                    console.log(res.message)
                }
            }
        })
    }
    ,checkout:function(){
        //结算
        let that=this;
        let cartId = wx.getStorageSync('cartNo');
        if(!cartId || !this.data.countNum) return false;
        console.log(that.data.cartList);
        request({
            url: config.service.SettlementUrl,
            method: 'POST',
            data: that.data.cartList,
            success: function(data,res) {
                console.log(res);
                if(res.success){
                    let url='../createOrder/createOrder?id='+cartId+'&isPick='+that.data.cartList[0]['iS_PICK'];
                    jumpUrl(url);
                }
            }
        })
    }
})