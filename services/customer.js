/**
 * 封装客户相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 获取客户标签配置
 */
function get_client_tag_names (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.customer.get_client_tag_names.url,
      api.customer.get_client_tag_names.method,
      obj
    )
      .then(res => {
        wx.setStorageSync('clientTag', res.data)
        resolve(res)
      })
      .catch(err => {
        setStatus(that, false)
        reject(err)
      })
  })
}

/**
 * 客户标签自动补全
 */
function client_tags_auto_complete (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.customer.client_tags_auto_complete.url,
      api.customer.client_tags_auto_complete.method,
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
 * 添加客户信息
 */
function add_client (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(api.customer.add_client.url, api.customer.add_client.method, obj)
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
 * 条件查询客户信息
 */
function filter_client (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.customer.filter_client.url,
      api.customer.filter_client.method,
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
 * 删除客户信息
 */
function delete_client_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.customer.delete_client_by_id.url,
      api.customer.delete_client_by_id.method,
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
 * 修改客户信息
 */
function edit_client_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.customer.edit_client_by_id.url,
      api.customer.edit_client_by_id.method,
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
  get_client_tag_names,
  client_tags_auto_complete,
  add_client,
  filter_client,
  delete_client_by_id,
  edit_client_by_id
}
