/**
 * 封装 员工抵扣信息  相关api
 */
import api from '../config/api'
import {
  request,
  setStatus
} from '../utils/util.js'

/**
 * 员工获取自己的工资抵扣统计信息
 */
function staff_get_staff_costs_stats (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.employeeDeductionInformation.staff_get_staff_costs_stats.url,
      api.employeeDeductionInformation.staff_get_staff_costs_stats.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 员工条件查询自己的工资抵扣记录
 */
function staff_filter_staff_costs (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.employeeDeductionInformation.staff_filter_staff_costs.url,
      api.employeeDeductionInformation.staff_filter_staff_costs.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 管理员条件查询所有人的工资抵扣记录
 */
function manager_filter_staff_costs (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.employeeDeductionInformation.manager_filter_staff_costs.url,
      api.employeeDeductionInformation.manager_filter_staff_costs.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 管理员添加员工抵扣信息
 */
function manager_add_staff_costs (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.employeeDeductionInformation.manager_add_staff_costs.url,
      api.employeeDeductionInformation.manager_add_staff_costs.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}
/**
 * 管理员添加员工抵扣信息
 */
function manager_delete_staff_costs_by_unique_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.employeeDeductionInformation.manager_delete_staff_costs_by_unique_id.url,
      api.employeeDeductionInformation.manager_delete_staff_costs_by_unique_id.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

module.exports = {
  staff_get_staff_costs_stats,
  staff_filter_staff_costs,
  manager_filter_staff_costs,
  manager_add_staff_costs,
  manager_delete_staff_costs_by_unique_id
}