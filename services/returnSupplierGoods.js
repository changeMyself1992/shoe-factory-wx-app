/**
 * 退货功能   相关api
 */
import api from '../config/api';
import {
  request,
  
  setStatus
} from "../utils/util.js"

/**
 * 返回可以退回的商品
 */
function warehouse_return_goods_list(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.returnSupplierGoods.warehouse_return_goods_list.url, api.returnSupplierGoods.warehouse_return_goods_list.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      reject(err)
      setStatus(that, false);
    })
  })
}
/**
 * 生成退货单
 */
function warehouse_add_return_goods_note(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.returnSupplierGoods.warehouse_add_return_goods_note.url, api.returnSupplierGoods.warehouse_add_return_goods_note.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      reject(err)
      setStatus(that, false);
    })
  })
}
/**
 * 确认退货单
 */
function warehouse_confirm_refund_transaction_by_id(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.returnSupplierGoods.warehouse_confirm_refund_transaction_by_id.url, api.returnSupplierGoods.warehouse_confirm_refund_transaction_by_id.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      reject(err)
      setStatus(that, false);
    })
  })
}
/**
 * 作废退货单
 */
function warehouse_delete_refund_transaction_by_id(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.returnSupplierGoods.warehouse_delete_refund_transaction_by_id.url, api.returnSupplierGoods.warehouse_delete_refund_transaction_by_id.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      reject(err)
      setStatus(that, false);
    })
  })
}
module.exports = {
  warehouse_delete_refund_transaction_by_id,
  warehouse_confirm_refund_transaction_by_id,
  warehouse_add_return_goods_note,
  warehouse_return_goods_list
}