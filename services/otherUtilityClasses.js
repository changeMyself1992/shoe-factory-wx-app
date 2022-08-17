/**
 * 其他工具类  相关api
 */
import api from '../config/api';
import {
  request,
  
  setStatus
} from "../utils/util.js"

/**
 * 获取订单标签配置
 */
function generate_year_month_sequence_number(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.otherUtilityClasses.generate_year_month_sequence_number.url, api.otherUtilityClasses.generate_year_month_sequence_number.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

module.exports = {
  generate_year_month_sequence_number
}