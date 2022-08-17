/**
 * 封装 人员及权限管理  相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 获取自身权限
 */
function get_role_authority_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.get_role_authority_by_id.url,
      api.personnelAndAuthorityManagement.get_role_authority_by_id.method,
      obj
    )
      .then(res => {
        wx.setStorageSync('theirOwnRights', res.data['管理权限'])
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 通过id获取用户信息
 */
function get_user_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.get_user_by_id.url,
      api.personnelAndAuthorityManagement.get_user_by_id.method,
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
 * 添加员工
 */
function add_user (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.add_user.url,
      api.personnelAndAuthorityManagement.add_user.method,
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
 * 通过id编辑员工
 */
function edit_user_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.edit_user_by_id.url,
      api.personnelAndAuthorityManagement.edit_user_by_id.method,
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
 * 条件查询管理角色
 */
function filter_role_authority (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.filter_role_authority.url,
      api.personnelAndAuthorityManagement.filter_role_authority.method,
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
 * 条件查询管理角色
 */
function edit_role_authority_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.edit_role_authority_by_id.url,
      api.personnelAndAuthorityManagement.edit_role_authority_by_id.method,
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
 * 添加角色
 */
function add_role_authority (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.add_role_authority.url,
      api.personnelAndAuthorityManagement.add_role_authority.method,
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
 * delete角色
 */
function delete_role_authority_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.delete_role_authority_by_id.url,
      api.personnelAndAuthorityManagement.delete_role_authority_by_id.method,
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
 * 通过公司名查询管理角色
 */
function get_role_authority_names (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.get_role_authority_names.url,
      api.personnelAndAuthorityManagement.get_role_authority_names.method,
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
 * 员工注册
 */
function add_user_unconfirmed (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.add_user_unconfirmed.url,
      api.personnelAndAuthorityManagement.add_user_unconfirmed.method,
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
 * 条件查询人员信息
 */
function filter_user (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.filter_user.url,
      api.personnelAndAuthorityManagement.filter_user.method,
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
 * 删除人员信息
 */
function delete_user_by_id (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.personnelAndAuthorityManagement.delete_user_by_id.url,
      api.personnelAndAuthorityManagement.delete_user_by_id.method,
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
  get_role_authority_by_id,
  get_user_by_id,
  add_user,
  edit_user_by_id,
  filter_role_authority,
  edit_role_authority_by_id,
  add_role_authority,
  delete_role_authority_by_id,
  filter_user,
  get_role_authority_names,
  add_user_unconfirmed,
  delete_user_by_id
}
