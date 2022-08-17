/**
 * 封装 订单 排产  相关api
 */
import api from '../config/api'
import {
  request,

  setStatus
} from '../utils/util.js'

/**
 * 获取订单标签配置
 */
function get_order_tag_names(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_order_tag_names.url,
        api.ordersForProductionScheduling.get_order_tag_names.method,
        obj
      )
      .then(res => {
        wx.setStorageSync('orderTag', res.data)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 订单标签自动补全
 */
function order_tags_auto_complete(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.order_tags_auto_complete.url,
        api.ordersForProductionScheduling.order_tags_auto_complete.method,
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
 * 订单标签自动补全
 */
function add_order(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.add_order.url,
        api.ordersForProductionScheduling.add_order.method,
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
 * 修改订单
 */
function edit_order_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.edit_order_by_id.url,
        api.ordersForProductionScheduling.edit_order_by_id.method,
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
 * 条件查询订单
 */
function filter_order(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.filter_order.url,
        api.ordersForProductionScheduling.filter_order.method,
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
 * 条件查询订单
 */
function delete_order_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.delete_order_by_id.url,
        api.ordersForProductionScheduling.delete_order_by_id.method,
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
 * 获得订单详情
 */
function get_order_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_order_by_id.url,
        api.ordersForProductionScheduling.get_order_by_id.method,
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
 * 添加生产单
 */
function add_production_note(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.add_production_note.url,
        api.ordersForProductionScheduling.add_production_note.method,
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
 * 获取生产单详情
 * that 发起改请求的page对象
 */
function get_production_note_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_production_note_by_id.url,
        api.ordersForProductionScheduling.get_production_note_by_id.method,
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
 * 条件查询生产单
 * that 发起改请求的page对象
 */
function filter_production_note(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.filter_production_note.url,
        api.ordersForProductionScheduling.filter_production_note.method,
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
 * 删除生产单
 */
function delete_production_note_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.delete_production_note_by_id.url,
        api.ordersForProductionScheduling.delete_production_note_by_id.method,
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
 * 强行完成一个生产单
 * that 发起改请求的page对象
 */
function finish_production_note_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.finish_production_note_by_id.url,
        api.ordersForProductionScheduling.finish_production_note_by_id.method,
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
 * 取回进行中的生产单及其生产情况（生产进度管理页面使用）
 */
function list_ongoing_production_notes(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.list_ongoing_production_notes.url,
        api.ordersForProductionScheduling.list_ongoing_production_notes.method,
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
 * 获取配码配置信息
 */
function get_size_config_info(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_size_config_info.url,
        api.ordersForProductionScheduling.get_size_config_info.method,
        obj
      )
      .then(res => {
        wx.setStorageSync('withCodeArray', res.data)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 获取生产单打印配置信息
 */
function get_production_note_print_config_info(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_production_note_print_config_info
        .url,
        api.ordersForProductionScheduling.get_production_note_print_config_info
        .method,
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
 * 编辑生产单
 */
function edit_production_note_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.edit_production_note_by_id.url,
        api.ordersForProductionScheduling.edit_production_note_by_id.method,
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
 * 管理员通过员工的unique_id获得他的工资统计和计件记录
 */
function manager_get_staff_salary_stats_by_unique_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .manager_get_staff_salary_stats_by_unique_id.url,
        api.ordersForProductionScheduling
        .manager_get_staff_salary_stats_by_unique_id.method,
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
 * 管理员通过员工的unique_id获得他的工资统计和计件记录
 */
function generate_salary_list_for_process_by_time_range(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .generate_salary_list_for_process_by_time_range.url,
        api.ordersForProductionScheduling
        .generate_salary_list_for_process_by_time_range.method,
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
 * 批量修改多个生产单的工序工资
 */
function batch_edit_production_note_process_salary_by_ids(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .batch_edit_production_note_process_salary_by_ids.url,
        api.ordersForProductionScheduling
        .batch_edit_production_note_process_salary_by_ids.method,
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
 * 生成所有订单产品的excel数据
 */
function generate_order_list_for_excel(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.generate_order_list_for_excel.url,
        api.ordersForProductionScheduling.generate_order_list_for_excel.method,
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
 * 条件查询用于结算的条目
 */
function order_settle_filter_items(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.order_settle_filter_items.url,
        api.ordersForProductionScheduling.order_settle_filter_items.method,
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
 * 条件查询用于结算统计
 */
function order_settle_stats(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.order_settle_stats.url,
        api.ordersForProductionScheduling.order_settle_stats.method,
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
 * 订单的结算状态修改
 */
function order_settle_edit(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.order_settle_edit.url,
        api.ordersForProductionScheduling.order_settle_edit.method,
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
 * 获取需要确认的员工计件记录
 */
function production_control_filter_unconfirmed_staff_record(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .production_control_filter_unconfirmed_staff_record.url,
        api.ordersForProductionScheduling
        .production_control_filter_unconfirmed_staff_record.method,
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
function production_control_batch_manager_confirm_staff_record(
  obj,
  that = null
) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .production_control_batch_manager_confirm_staff_record.url,
        api.ordersForProductionScheduling
        .production_control_batch_manager_confirm_staff_record.method,
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
 * 管理人员批量确认员工计件 =======不显示loading的
 */
function production_control_batch_manager_confirm_staff_record_No_Loading(
  obj,
  that = null
) {
  // setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .production_control_batch_manager_confirm_staff_record.url,
        api.ordersForProductionScheduling
        .production_control_batch_manager_confirm_staff_record.method,
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
 * 管理员获取同批次生产单
 */
function get_same_batches_production_note_by_unique_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .get_same_batches_production_note_by_unique_id.url,
        api.ordersForProductionScheduling
        .get_same_batches_production_note_by_unique_id.method,
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
 * 员工获取同批次生产单记录的接口
 */
function get_same_batches_production_note_by_unique_id_for_staff(
  obj,
  that = null
) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling
        .get_same_batches_production_note_by_unique_id_for_staff.url,
        api.ordersForProductionScheduling
        .get_same_batches_production_note_by_unique_id_for_staff.method,
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
 * 获取一批生产单总的工序计件信息
 */
function get_production_notes_process(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_production_notes_process.url,
        api.ordersForProductionScheduling.get_production_notes_process.method,
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
 * 员工 获取一批生产单总的工序计件信息
 */
function get_production_notes_process_for_staff(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_production_notes_process_for_staff
        .url,
        api.ordersForProductionScheduling.get_production_notes_process_for_staff
        .method,
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
 * 获取同一批次下某工序汇总详情页（管理员调用）
 */
function get_sum_process_detail(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_sum_process_detail.url,
        api.ordersForProductionScheduling.get_sum_process_detail.method,
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
 * 获取同一批次下某工序汇总详情页（员工调用）
 */
function get_sum_process_detail_for_staff(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.get_sum_process_detail_for_staff.url,
        api.ordersForProductionScheduling.get_sum_process_detail_for_staff.method,
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
 * 获取所有需要确认的员工计件记录
 */
function all_unconfirmed_staff_record(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.all_unconfirmed_staff_record.url,
        api.ordersForProductionScheduling.all_unconfirmed_staff_record.method,
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
 * 条件查询代排产的订单
 */
function filter_need_schedule_order(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
        api.ordersForProductionScheduling.filter_need_schedule_order.url,
        api.ordersForProductionScheduling.filter_need_schedule_order.method,
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
 * 通过产品信息匹配最近此产品的结算信息
 */
function match_recent_product_settle_info_by_product_info(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.ordersForProductionScheduling.match_recent_product_settle_info_by_product_info.url,
      api.ordersForProductionScheduling.match_recent_product_settle_info_by_product_info.method,
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
 * 重新评估一个生产单
 */
function review_production_note_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.ordersForProductionScheduling.review_production_note_by_id.url,
      api.ordersForProductionScheduling.review_production_note_by_id.method,
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
  get_order_tag_names,
  order_tags_auto_complete,
  add_order,
  edit_order_by_id,
  filter_order,
  delete_order_by_id,
  get_order_by_id,
  add_production_note,
  get_production_note_by_id,
  filter_production_note,
  delete_production_note_by_id,
  finish_production_note_by_id,
  list_ongoing_production_notes,
  get_size_config_info,
  get_production_note_print_config_info,
  edit_production_note_by_id,
  manager_get_staff_salary_stats_by_unique_id,
  generate_salary_list_for_process_by_time_range,
  batch_edit_production_note_process_salary_by_ids,
  generate_order_list_for_excel,
  order_settle_filter_items,
  order_settle_stats,
  order_settle_edit,
  get_same_batches_production_note_by_unique_id,
  get_production_notes_process,
  get_sum_process_detail,
  production_control_filter_unconfirmed_staff_record,
  production_control_batch_manager_confirm_staff_record,
  get_same_batches_production_note_by_unique_id_for_staff,
  get_production_notes_process_for_staff,
  get_sum_process_detail_for_staff,
  all_unconfirmed_staff_record,
  production_control_batch_manager_confirm_staff_record_No_Loading,
  filter_need_schedule_order,
  match_recent_product_settle_info_by_product_info,
  review_production_note_by_id
}