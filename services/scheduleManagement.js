/**
 * 封装 进度管理   相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 通过id获取用户信息
 */
function generate_manager_record_count_input (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.generate_manager_record_count_input.url,
      api.scheduleManagement.generate_manager_record_count_input.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 管理员计件接口
 */
function manager_record_count (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.manager_record_count.url,
      api.scheduleManagement.manager_record_count.method,
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
 * 管理人员确认员工计件
 */
function manager_confirm_staff_record (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.manager_confirm_staff_record.url,
      api.scheduleManagement.manager_confirm_staff_record.method,
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
 * 通过提交排产产品信息 获取排产产品工序最近的对应信息缓存信息 用于自动填充
 */
function match_recent_production_note_process_info_by_product_info (
  obj,
  that = null
) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement
        .match_recent_production_note_process_info_by_product_info.url,
      api.scheduleManagement
        .match_recent_production_note_process_info_by_product_info.method,
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
 * 指定时间 员工获得他的工资统计信息
 */
function staff_get_salary_stats (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_get_salary_stats.url,
      api.scheduleManagement.staff_get_salary_stats.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 指定时间 员工获得他的工资记录信息
 */
function staff_get_salary_records (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_get_salary_records.url,
      api.scheduleManagement.staff_get_salary_records.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 员工获得本月/昨日/今天的工资小结
 */
function staff_get_recent_salary_summary (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_get_recent_salary_summary.url,
      api.scheduleManagement.staff_get_recent_salary_summary.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 获取某员工所在各部门列表
 */
function staff_get_process_summary_stats (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_get_process_summary_stats.url,
      api.scheduleManagement.staff_get_process_summary_stats.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 获取某员工在指定时间内部门工资详情统计
 */
function staff_get_process_summary_detail_by_process_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_get_process_summary_detail_by_process_id.url,
      api.scheduleManagement.staff_get_process_summary_detail_by_process_id
        .method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 获取某员工所在各部门列表
 */
function mananger_get_process_summary_stats (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.mananger_get_process_summary_stats.url,
      api.scheduleManagement.mananger_get_process_summary_stats.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 管理员获得自己所确认的部门的工资详细信息
 */
function manager_get_process_summary_detail (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.manager_get_process_summary_detail.url,
      api.scheduleManagement.manager_get_process_summary_detail.method,
      obj
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 员工计件接口
 */
function staff_record_count (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_record_count.url,
      api.scheduleManagement.staff_record_count.method,
      obj
    )
      .then(res => {
        console.log(res.msg)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 合伙计件接口
 */
function partnership_record_count (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.partnership_record_count.url,
      api.scheduleManagement.partnership_record_count.method,
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
 * 管理人员批量确认员工计件
 */
function batch_manager_confirm_staff_record (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.batch_manager_confirm_staff_record.url,
      api.scheduleManagement.batch_manager_confirm_staff_record.method,
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
 * 员工录入同批次生产单数据
 */
function staff_record_count_same_group (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.scheduleManagement.staff_record_count_same_group.url,
      api.scheduleManagement.staff_record_count_same_group.method,
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
  generate_manager_record_count_input,
  manager_record_count,
  manager_confirm_staff_record,
  match_recent_production_note_process_info_by_product_info,
  staff_get_salary_stats,
  staff_get_salary_records,
  staff_get_recent_salary_summary,
  staff_get_process_summary_stats,
  staff_get_process_summary_detail_by_process_id,
  mananger_get_process_summary_stats,
  manager_get_process_summary_detail,
  staff_record_count,
  partnership_record_count,
  batch_manager_confirm_staff_record,
  staff_record_count_same_group
}
