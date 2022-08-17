/**
 * 操作日志   相关api
 */
import api from '../config/api';
import {
  request,
  
  setStatus
} from "../utils/util.js"

/**
 * 获取某条日志操作记录详情
 */
function get_operation_log_by_id(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.operationLogManagement.get_operation_log_by_id.url, api.operationLogManagement.get_operation_log_by_id.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

/**
 * 获取所有操作记录日志
 */
function filter_operation_log(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.operationLogManagement.filter_operation_log.url, api.operationLogManagement.filter_operation_log.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

module.exports = {
  get_operation_log_by_id,
  filter_operation_log
}