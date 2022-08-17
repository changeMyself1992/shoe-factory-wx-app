/**
 * 封装 供应商送货信息 相关api
 */
import api from '../config/api';
import {
  request,
  
  setStatus
} from "../utils/util.js"

/**
 * 获取客户标签配置
 */
function filter_supplier_info(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.supplierDeliveryInformation.filter_supplier_info.url, api.supplierDeliveryInformation.filter_supplier_info.method, obj).then(res => {
       resolve(res)  
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

/**
 * 添加新的供应商送货单
 */
function add_supplier_transaction(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.supplierDeliveryInformation.add_supplier_transaction.url, api.supplierDeliveryInformation.add_supplier_transaction.method, obj).then(res => {
       resolve(res)  
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

module.exports = {
  filter_supplier_info,
  add_supplier_transaction
}