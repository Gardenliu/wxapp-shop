import config from "../etc/config";
import { request } from './util';

let noop = function noop () {};
export function requestPayment (orderId, options) {
  options = options || {};
  options.success = options.success || noop;
  options.fail = options.fail || noop;
  options.complete = options.complete || noop;

  let cbSuccess = function cbSuccess () {
    options.success.apply(this, arguments);
    options.complete.apply(this, arguments);
  }
  let cbFail = function cbFail (res) {
    if (!res || !res.data || !res.data.message) {
      console.log("支付失败: " + JSON.stringify(arguments));
    }
    options.fail.apply(this, arguments);
    options.complete.apply(this, arguments);
  }
  let paymentCallback = function paymentCallback () {
    request({
      url: config.service.PaymentCallbackUrl,
      data: {
        orderNo: orderId
      },
      success: function (data,res) {
        res = res.data;
        if (!res.success) {
          cbFail.apply(null, arguments);
          return;
        }
        cbSuccess.apply(null, arguments);
      },
      fail: function () {
        cbFail.apply(null, arguments);
      }
    })
  }
  request({
    url: config.service.JumpToPayUrl,
    data: {
      orderNo: orderId
    },
    success: function (data,res) {
      if (!res.success) {
        cbFail.apply(null, arguments);
        return
      }
      wx.requestPayment({
        'timeStamp': data.timestamp,
        'nonceStr': data.nonceStr,
        'package':data.packages,
        'signType': data.signType,
        'paySign': data.paySign,
        success: function () {
          paymentCallback();
        },
        fail: function () {
          paymentCallback();
        }
      })
    },
    fail: function () {
      cbFail.apply(null, arguments);
    }
  })
}