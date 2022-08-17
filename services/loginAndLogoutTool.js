/**
 * 封装 登录登出   相关api
 */
import api from '../config/api'
import {
  request,
  
  setStatus
} from '../utils/util.js'

/**
 * 获取验证码
 */
function request_verification_message (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.request_verification_message.url,
      api.loginAndLogoutTool.request_verification_message.method,
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
 * 验证验证码信息(登录)
 */
function check_verification_message (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.check_verification_message.url,
      api.loginAndLogoutTool.check_verification_message.method,
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
 * 提示用户是否申请激活账户，如申请，请求账户激活接口
 */
function send_account_activation_request (parameter, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.send_account_activation_request.url,
      api.loginAndLogoutTool.send_account_activation_request.method,
      parameter
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
 * 生成login token
 */
function generate_login_token (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.generate_login_token.url,
      api.loginAndLogoutTool.generate_login_token.method,
      obj
    )
      .then(res => {
        if (res.status === 'OK') {
          console.log('生成login_token:' + res.data.login_token)
          wx.setStorageSync('login_token', res.data.login_token)

          console.log(
            '生成 对应企业unique_id列表:' + res.data['对应企业unique_id列表']
          )
          wx.setStorageSync(
            'enterpriseIdList',
            res.data['对应企业unique_id列表']
          )

          console.log('生成 对应企业名称列表:' + res.data['对应企业名称列表'])
          wx.setStorageSync('enterpriseNameList', res.data['对应企业名称列表'])
          resolve(res)
        }
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 微信登录生成token
 */
function generate_login_token_by_wx_encrypted_data (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.generate_login_token_by_wx_encrypted_data.url,
      api.loginAndLogoutTool.generate_login_token_by_wx_encrypted_data.method,
      obj
    )
      .then(res => {
        if (res.status === 'OK') {
          console.log('生成login_token:' + res.data.login_token)
          wx.setStorageSync('login_token', res.data.login_token)

          console.log(
            '生成 对应企业unique_id列表:' + res.data['对应企业unique_id列表']
          )
          wx.setStorageSync(
            'enterpriseIdList',
            res.data['对应企业unique_id列表']
          )

          console.log('生成 对应企业名称列表:' + res.data['对应企业名称列表'])
          wx.setStorageSync('enterpriseNameList', res.data['对应企业名称列表'])
          resolve(res)
        }
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 登陆后绑定企业信息
 */
function bind_company_after_login (obj, enterprise, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.bind_company_after_login.url,
      api.loginAndLogoutTool.bind_company_after_login.method,
      obj
    )
      .then(res => {
        wx.setStorageSync('chooseedEnterpriseId', enterprise.id)
        wx.setStorageSync('chooseedEnterpriseName', enterprise.name)
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 登录后获取用户信息
 */
function get_user_info_by_login_token (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.get_user_info_by_login_token.url,
      api.loginAndLogoutTool.get_user_info_by_login_token.method,
      obj
    )
      .then(res => {
        wx.setStorageSync('userInfo', res.data)
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 更新企业列表
 */
function get_company_list_by_login_token (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.get_company_list_by_login_token.url,
      api.loginAndLogoutTool.get_company_list_by_login_token.method,
      obj
    )
      .then(res => {
        console.log(
          '更新 对应企业unique_id列表:' + res.data['对应企业unique_id列表']
        )
        wx.setStorageSync('enterpriseIdList', res.data['对应企业unique_id列表'])

        console.log('更新 对应企业名称列表:' + res.data['对应企业名称列表'])
        wx.setStorageSync('enterpriseNameList', res.data['对应企业名称列表'])

        console.log(
          '更新当前选中的企业ID:' + res.data['对应企业unique_id列表'][0]
        )
        wx.setStorageSync(
          'chooseedEnterpriseId',
          res.data['对应企业unique_id列表'][0]
        )

        console.log('更新当前选中的企业名称:' + res.data['对应企业名称列表'][0])
        wx.setStorageSync(
          'chooseedEnterpriseName',
          res.data['对应企业名称列表'][0]
        )
        resolve(res)
      })
      .catch(err => {
        reject(err)
        setStatus(that, false)
      })
  })
}

/**
 * 使用微信login_code生成login-token
 */
function wx_login (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.wx_login.url,
      api.loginAndLogoutTool.wx_login.method,
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
 * 小程序端扫码确认登录
 */
function confirm_login_by_qrcode_token (obj, that = null) {
  setStatus(that, true)
  return new Promise((resolve, reject) => {
    request(
      api.loginAndLogoutTool.confirm_login_by_qrcode_token.url,
      api.loginAndLogoutTool.confirm_login_by_qrcode_token.method,
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
  request_verification_message,
  check_verification_message,
  generate_login_token,
  bind_company_after_login,
  get_user_info_by_login_token,
  get_company_list_by_login_token,
  send_account_activation_request,
  wx_login,
  generate_login_token_by_wx_encrypted_data,
  confirm_login_by_qrcode_token
}
