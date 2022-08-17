/**
 * 封装 财务管理   相关api
 */
import api from '../config/api';
import {
  request,
  
  setStatus
} from "../utils/util.js"

/**
 * 通过生产单获取人员工资列表
 */
function generate_salary_list_by_production_note_unique_ids(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.theFinancialManagement.generate_salary_list_by_production_note_unique_ids.url, api.theFinancialManagement.generate_salary_list_by_production_note_unique_ids.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

/**
 * 通过采购单获取供应商应付价格
 */
function generate_supplier_settlement_by_purchase_note_unique_ids(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.theFinancialManagement.generate_supplier_settlement_by_purchase_note_unique_ids.url, api.theFinancialManagement.generate_supplier_settlement_by_purchase_note_unique_ids.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

/**
 * 指定时间 生成工资结算在网页端或者小程序端给管理人员显示的统计数据和详细数据
 */
function generate_salary_list_for_frontend_by_time_range(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.theFinancialManagement.generate_salary_list_for_frontend_by_time_range.url, api.theFinancialManagement.generate_salary_list_for_frontend_by_time_range.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

/**
 * 指定时间 生成工资结算excel表格 给管理人员显示的统计数据和详细数据
 */
function generate_salary_list_for_excel_by_time_range(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.theFinancialManagement.generate_salary_list_for_excel_by_time_range.url, api.theFinancialManagement.generate_salary_list_for_excel_by_time_range.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}

module.exports = {
  generate_salary_list_by_production_note_unique_ids,
  generate_supplier_settlement_by_purchase_note_unique_ids,
  generate_salary_list_for_frontend_by_time_range,
  generate_salary_list_for_excel_by_time_range
}