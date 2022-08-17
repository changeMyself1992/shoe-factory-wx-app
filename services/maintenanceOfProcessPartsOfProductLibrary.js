/**
 * 封装产品库/工艺/部位维护   相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 获取产品标签信息
 */
function get_product_tag_names (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.get_product_tag_names.url,
      api.maintenanceOfProcessPartsOfProductLibrary.get_product_tag_names
        .method,
      obj
    )
      .then(res => {
        wx.setStorageSync('productTag', res.data)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 产品标签自动补全
 */
function product_tags_auto_complete (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.product_tags_auto_complete
        .url,
      api.maintenanceOfProcessPartsOfProductLibrary.product_tags_auto_complete
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
 * 条件查询产品信息
 */
function filter_product (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.filter_product.url,
      api.maintenanceOfProcessPartsOfProductLibrary.filter_product.method,
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
 * 条件查询产品信息
 */
function delete_product_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.delete_product_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.delete_product_by_id.method,
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
 * 获得产品信息详情
 */
function get_product_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.get_product_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.get_product_by_id.method,
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
 * 条件查询工序信息
 */
function filter_process (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.filter_process.url,
      api.maintenanceOfProcessPartsOfProductLibrary.filter_process.method,
      obj
    )
      .then(res => {
        wx.setStorageSync('allProcess', res.data)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 条件查询部位信息
 */
function filter_component (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.filter_component.url,
      api.maintenanceOfProcessPartsOfProductLibrary.filter_component.method,
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
 * 修改产品信息
 */
function edit_product_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.edit_product_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.edit_product_by_id.method,
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
 * 添加产品信息
 */
function add_product (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.add_product.url,
      api.maintenanceOfProcessPartsOfProductLibrary.add_product.method,
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
 * 添加工序信息
 */
function add_process (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.add_process.url,
      api.maintenanceOfProcessPartsOfProductLibrary.add_process.method,
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
 * 提高工序排名
 */
function increase_process_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.increase_process_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.increase_process_by_id
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
 * 降低工序排名
 */
function decrease_process_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.decrease_process_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.decrease_process_by_id
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
 * 删除工序信息
 */
function delete_process_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.delete_process_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.delete_process_by_id.method,
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
 * 添加部位信息
 */
function add_component (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.add_component.url,
      api.maintenanceOfProcessPartsOfProductLibrary.add_component.method,
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
 * 删除部位信息
 */
function delete_component_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.delete_component_by_id.url,
      api.maintenanceOfProcessPartsOfProductLibrary.delete_component_by_id
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
 *  提高部位排名
 */
function increase_component_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.increase_component_by_id
        .url,
      api.maintenanceOfProcessPartsOfProductLibrary.increase_component_by_id
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
 *  降低部位排名
 */
function decrease_component_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.decrease_component_by_id
        .url,
      api.maintenanceOfProcessPartsOfProductLibrary.decrease_component_by_id
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
 *  返回给该供应商送货单中的产品名称
 */
function get_supplier_goods (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.get_supplier_goods.url,
      api.maintenanceOfProcessPartsOfProductLibrary.get_supplier_goods.method,
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
 *  获得企业对应供应商的产品的价格
 */
function get_supplier_goods_price (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.maintenanceOfProcessPartsOfProductLibrary.get_supplier_goods_price
        .url,
      api.maintenanceOfProcessPartsOfProductLibrary.get_supplier_goods_price
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
  get_product_tag_names,
  product_tags_auto_complete,
  filter_product,
  delete_product_by_id,
  get_product_by_id,
  filter_process,
  filter_component,
  edit_product_by_id,
  add_product,
  add_process,
  increase_process_by_id,
  decrease_process_by_id,
  delete_process_by_id,
  add_component,
  delete_component_by_id,
  increase_component_by_id,
  decrease_component_by_id,
  get_supplier_goods,
  get_supplier_goods_price
}
