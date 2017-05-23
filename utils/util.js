import sdk from "../../wxapp-client-sdk/index";
import config from "../etc/config";
import appConfig from "../../../config";

const constants = {
    ERROR_HTTP_REQUEST: "ERROR_HTTP_REQUEST",
    ERROR_HTTP_RESULT: "ERROR_HTTP_RESULT",
    ERROR_HTTP_REQUEST_MESSAGE: "网络异常，请稍后重试"
}

let globalData={
    userInfo: null,
    cartList:null,
    shopConfig:null
}
let noop = function noop () {};
let now = function now () {
    return new Date().getTime();
}

function __isTabBar(jumpUrl){
    let tabar=appConfig.tabBar;
    let urls=jumpUrl.match(/\w+/g).join("/");
    if (!tabar) return;
    for(let item in tabar){
        if(tabar[item].indexOf(urls)!==-1){
            return true;
        }
    }
    return false;
}

/**
 * wxml---<view data-url='XXX' bindtap="onJump">
 *
 * js---
 * include unit.js
 * jumpUrl(url)
 * onJump:function(ev){
        jumpUrl(ev.currentTarget.dataset.url);
    },
 * @param url
 */
exports.jumpUrl=function(url){
    if(!url) return false;
    let stack=getCurrentPages().length;
    console.log('页面栈',stack)
    let isTabar=__isTabBar(url);
    isTabar && wx.switchTab({
        url: url
    });
    stack>=5 && wx.redirectTo({
        url: url
    });
    wx.navigateTo({
        url: url
    })
}



exports.extend = function extend(target) {
    var sources = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < sources.length; i += 1) {
        var source = sources[i];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
};

/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        传入函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，调用触发于开始边界而不是结束边界
 * @return {function}             返回客户调用函数
 */
exports.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
        // 据上一次触发时间间隔
        var last = now() - timestamp;

        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

exports.confirm = function confirm(options, cbSuccess, cbFail, cbComplete) {
    cbSuccess = typeof cbSuccess == "function" ? cbSuccess : noop;
    cbFail = typeof cbFail == "function" ? cbFail : noop;
    cbComplete = typeof cbComplete == "function" ? cbComplete : noop;
    options = typeof options == "object" ? options : {
        title: "提示",
        content: options || "",
        success: cbSuccess,
        fail: cbFail
    }
    wx.showModal(options);
}
// 简单的事件机制
const _events={};
export function on(event, callback) {
    _events[event] = callback;
}
export function off(event) {
    _events[event] = null;
}
export function trigger(event, data) {
    let cb =_events[event];
    typeof cb === "function" && cb.call(null, data);
}
export function alert (content) {
    wx.showModal({
        title: "提示",
        content: content,
        showCancel: false
    });
}

export function getShopConfig(fn,bool) {
    if(globalData.shopConfig && !bool){
        typeof fn == "function" && fn(globalData.shopConfig)
    }else{
        sdk.request({
            url: config.service.getShopConfig,
            method: 'POST',
            login:true,
            success: function(res) {
                if(res.data.code=="0"){
                    globalData.shopConfig = res.data.data
                }
                typeof fn == "function" && fn(globalData.shopConfig);
            }
        })
    }
}

export function getCartList(fn,bool){
    if(globalData.cartList && !bool ){
        typeof fn == 'function' && fn(globalData.cartList)
    }
    else{
        var cartNo = wx.getStorageSync('cartNo');
        console.log("购物车id",cartNo);
        sdk.request({
                url:config.service.GetCartList,
                method:'post',
                login:true,
                data:{cartNo},
                success:(res)=>{
                if(res.data.code=="0"){
            globalData.cartList = res.data.data
        }
        typeof fn == "function" && fn(globalData.cartList);
    }
    })
    }
}

export function request (options) {
    options = options || {};
    let silent = options.silent = typeof options.silent === "boolean" ? options.silent : false;
    let success = options.success || noop;
    let fail = options.fail || noop;

    options.success = function cbSuccess(res) {
        res = res.data;
        if (!res.success) {
            let err = new sdk.RequestError(constants.ERROR_HTTP_RESULT, res.message);
            options.fail(err);
            return;
        }
        success(res.data, res);
    }
    options.fail = function cbFail(err) {
        if (!err || !err.message) {
            err = new sdk.RequestError(constants.ERROR_HTTP_REQUEST, constants.ERROR_HTTP_REQUEST_MESSAGE);
        }
        if (!silent) {
            alert(err.message);
        }
        fail(err);
    }

    sdk.request(options);
}