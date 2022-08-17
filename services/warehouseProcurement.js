/**
 * 封装 仓库采购   相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 获取物料标签配置
 */
function get_material_tag_names (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.get_material_tag_names.url,
      api.warehouseProcurement.get_material_tag_names.method,
      obj
    )
      .then(res => {
        wx.setStorageSync('tagsOfMaterials', res.data)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 物料标签自动补全
 */
function material_tags_auto_complete (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.material_tags_auto_complete.url,
      api.warehouseProcurement.material_tags_auto_complete.method,
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
 * 条件查询物料库存
 */
function filter_warehouse_material (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.filter_warehouse_material.url,
      api.warehouseProcurement.filter_warehouse_material.method,
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
 * 添加物料库存信息
 */
function add_warehouse_matetial (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.add_warehouse_matetial.url,
      api.warehouseProcurement.add_warehouse_matetial.method,
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
 * 修改物料库存信息
 */
function edit_warehouse_material_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.edit_warehouse_material_by_id.url,
      api.warehouseProcurement.edit_warehouse_material_by_id.method,
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
 * 提交入库事件
 */
function inventory_change_via_operation (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.inventory_change_via_operation.url,
      api.warehouseProcurement.inventory_change_via_operation.method,
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
 * 删除物料库存信息
 */
function delete_warehouse_material_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.delete_warehouse_material_by_id.url,
      api.warehouseProcurement.delete_warehouse_material_by_id.method,
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
 * 条件查询库存操作事件记录
 */
function filter_warehouse_material_event (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.filter_warehouse_material_event.url,
      api.warehouseProcurement.filter_warehouse_material_event.method,
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
 * 删除物料操作事件记录
 */
function delete_warehouse_material_event_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.delete_warehouse_material_event_by_id.url,
      api.warehouseProcurement.delete_warehouse_material_event_by_id.method,
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
 * 获取物料库存信息详情
 */
function get_warehouse_material_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.get_warehouse_material_by_id.url,
      api.warehouseProcurement.get_warehouse_material_by_id.method,
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
 * 根据采购单生成入库API的输入值
 */
function generate_enter_inventory_by_purchase_note (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.generate_enter_inventory_by_purchase_note.url,
      api.warehouseProcurement.generate_enter_inventory_by_purchase_note.method,
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
 * 条件查询采购单
 */
function filter_purchase_note (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.filter_purchase_note.url,
      api.warehouseProcurement.filter_purchase_note.method,
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
 * 修改采购单
 */
function edit_purchase_note_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.edit_purchase_note_by_id.url,
      api.warehouseProcurement.edit_purchase_note_by_id.method,
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
 *  根据生产单生成出库API的输入值
 */
function generate_exit_inventory_by_product_note (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.generate_exit_inventory_by_product_note.url,
      api.warehouseProcurement.generate_exit_inventory_by_product_note.method,
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
 *  添加采购单
 */
function add_purchase_note (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.add_purchase_note.url,
      api.warehouseProcurement.add_purchase_note.method,
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
 *  删除采购单
 */
function delete_purchase_note (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.delete_purchase_note.url,
      api.warehouseProcurement.delete_purchase_note.method,
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
 *  采购单详情
 */
function detail_purchase_note (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.detail_purchase_note.url,
      api.warehouseProcurement.detail_purchase_note.method,
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
 *  通过未排产订单列表生成“添加采购单”的API输入
 */
function generate_purchase_note_input_by_order_list (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.warehouseProcurement.generate_purchase_note_input_by_order_list.url,
      api.warehouseProcurement.generate_purchase_note_input_by_order_list
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

module.exports = {
  get_material_tag_names,
  material_tags_auto_complete,
  filter_warehouse_material,
  add_warehouse_matetial,
  inventory_change_via_operation,
  delete_warehouse_material_by_id,
  filter_warehouse_material_event,
  delete_warehouse_material_event_by_id,
  get_warehouse_material_by_id,
  generate_enter_inventory_by_purchase_note,
  filter_purchase_note,
  edit_purchase_note_by_id,
  generate_exit_inventory_by_product_note,
  add_purchase_note,
  delete_purchase_note,
  detail_purchase_note,
  generate_purchase_note_input_by_order_list,
  edit_warehouse_material_by_id
}
