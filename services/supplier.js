/**
 * 封装 供应商   相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 获取供应商标签配置
 */
function get_supplier_tag_names (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.get_supplier_tag_names.url,
      api.supplier.get_supplier_tag_names.method,
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
 * 供应商标签自动补全
 */
function supplier_tags_auto_complete (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.supplier_tags_auto_complete.url,
      api.supplier.supplier_tags_auto_complete.method,
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
 * 条件查询供应商信息
 */
function filter_supplier (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.filter_supplier.url,
      api.supplier.filter_supplier.method,
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
 * 为产品的物料选择供应商，提供名字直接补全
 */
function auto_complete_supplier_for_product_material (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.auto_complete_supplier_for_product_material.url,
      api.supplier.auto_complete_supplier_for_product_material.method,
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
 * 添加供应商
 */
function add_supplier (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.add_supplier.url,
      api.supplier.add_supplier.method,
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
 * 编辑供应商信息
 */
function edit_supplier_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.edit_supplier_by_id.url,
      api.supplier.edit_supplier_by_id.method,
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
 * 获取供应商送货单录入微信跳转二维码
 */
function generate_wx_qr_code (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.generate_wx_qr_code.url,
      api.supplier.generate_wx_qr_code.method,
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
 * 条件查询供应商送货单
 */
function filter_supplier_transactions (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.filter_supplier_transactions.url,
      api.supplier.filter_supplier_transactions.method,
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
 * 通过关键字匹配N条最新添加的供应商送货单信息
 */
function get_supplier_transaction_info_by_key_word (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.get_supplier_transaction_info_by_key_word.url,
      api.supplier.get_supplier_transaction_info_by_key_word.method,
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
 * 删除作废供应商送货单
 */
function delete_supplier_transaction_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.delete_supplier_transaction_by_id.url,
      api.supplier.delete_supplier_transaction_by_id.method,
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
 * 确认供应商送货单
 */
function confirm_supplier_transaction_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.confirm_supplier_transaction_by_id.url,
      api.supplier.confirm_supplier_transaction_by_id.method,
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
 * 结算供应商货单
 */
function settle_supplier_transaction_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.settle_supplier_transaction_by_id.url,
      api.supplier.settle_supplier_transaction_by_id.method,
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
 * 修改供应商送货单
 */
function edit_supplier_transaction_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.edit_supplier_transaction_by_id.url,
      api.supplier.edit_supplier_transaction_by_id.method,
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
 * 批量确认供应商货单信息
 */
function batch_confirm_supplier_transaction_by_ids (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.batch_confirm_supplier_transaction_by_ids.url,
      api.supplier.batch_confirm_supplier_transaction_by_ids.method,
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
 * 批量结算货单信息
 */
function batch_settle_supplier_transaction_by_ids (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.batch_settle_supplier_transaction_by_ids.url,
      api.supplier.batch_settle_supplier_transaction_by_ids.method,
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
 * 工厂端 通过关键字获取该匹配某一供应商最新的6条报价单信息
 */
function get_supplier_quotation_info_by_key_word(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.get_supplier_quotation_info_by_key_word.url,
      api.supplier.get_supplier_quotation_info_by_key_word.method,
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
 * 工厂端添加现结单
 */
function add_cash_supplier_transaction(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.add_cash_supplier_transaction.url,
      api.supplier.add_cash_supplier_transaction.method,
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
 * 工厂端结算现结单
 */
function settle_cash_supplier_transaction(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.settle_cash_supplier_transaction.url,
      api.supplier.settle_cash_supplier_transaction.method,
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
 * 工厂端作废现结单
 */
function delete_cash_supplier_transaction_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.delete_cash_supplier_transaction_by_id.url,
      api.supplier.delete_cash_supplier_transaction_by_id.method,
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
 * 删除供应商信息
 */
function delete_supplier_by_id(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.delete_supplier_by_id.url,
      api.supplier.delete_supplier_by_id.method,
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
 * 通过关键字匹配并检测6条供应商信息列表
 */
function check_supplier_info_by_key_word(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.check_supplier_info_by_key_word.url,
      api.supplier.check_supplier_info_by_key_word.method,
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
 * 条件查询供应商报价单
 */
function filter_supplier_quotations(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.filter_supplier_quotations.url,
      api.supplier.filter_supplier_quotations.method,
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
 * 工厂生成关联二维码
 */
function generate_unified_match_qr_code(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.generate_unified_match_qr_code.url,
      api.supplier.generate_unified_match_qr_code.method,
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
 * 查询系统内所有的供应商
 */
function filter_suplier_all(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.filter_suplier_all.url,
      api.supplier.filter_suplier_all.method,
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
 * 工厂关联供应商
 */
function relate_company_to_supplier(obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.supplier.relate_company_to_supplier.url,
      api.supplier.relate_company_to_supplier.method,
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
module.exports = {
  get_supplier_tag_names,
  supplier_tags_auto_complete,
  filter_supplier,
  auto_complete_supplier_for_product_material,
  add_supplier,
  edit_supplier_by_id,
  generate_wx_qr_code,
  filter_supplier_transactions,
  get_supplier_transaction_info_by_key_word,
  delete_supplier_transaction_by_id,
  confirm_supplier_transaction_by_id,
  settle_supplier_transaction_by_id,
  edit_supplier_transaction_by_id,
  batch_confirm_supplier_transaction_by_ids,
  batch_settle_supplier_transaction_by_ids,
  get_supplier_quotation_info_by_key_word,
  add_cash_supplier_transaction,
  settle_cash_supplier_transaction,
  delete_cash_supplier_transaction_by_id,
  delete_supplier_by_id,
  check_supplier_info_by_key_word,
  filter_supplier_quotations,
  generate_unified_match_qr_code,
  filter_suplier_all,
  relate_company_to_supplier
}
