import config from "../etc/config";
import {request} from "./util";

var cache = {};
var getKey = function getKey (parentId, areaLevel) {
  parentId = typeof parentId !== "undefined" ? parentId : "";
  areaLevel = typeof areaLevel !== "undefined" ? areaLevel : 1;
  return "area_" + parentId + "_" + areaLevel;
}
//config.service.ReceiveAddressGetUrl
var getPath = function getPath (parentId, areaLevel) {
  var path = config.service.ReceiveAddressAreaListUrl;
  if (parentId) {
    path = path + "?parentId=" + parentId;
    if (areaLevel) {
      path = path + "&areaLevel=" + areaLevel;
    }
  }
  return path;
}
var getFromCache = function getFromCache (key) {
  var data = cache[key];
  return data;
}
var setCache = function setCache (key, data) {
  cache[key] = data;
}
export default {
  get: function (parentId, areaLevel, cb) {
    var key = getKey(parentId, areaLevel);
    var data = getFromCache(key);
    if (!data) {
      request({
        url: getPath(parentId, areaLevel),
        method: "POST",
        success: function (data,res) {
          if (!res.success) {
            cb(res.message, null);
            return;
          }
          cb(null, res.data);
          setCache(key, res.data);
        }
      });
    } else {
      cb(null, data);
    }
  }
}