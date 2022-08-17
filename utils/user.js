import {
  checkUserAuthorization,
  markedWords,
  deepClone
} from "./util.js";

import {
  bind_company_after_login,
  get_user_info_by_login_token,
  get_company_list_by_login_token
} from '../services/loginAndLogoutTool.js'

import {
  get_role_authority_by_id
} from '../services/personnelAndAuthorityManagement.js'

import {
  get_product_tag_names,
  filter_process,
  filter_component
} from "../services/maintenanceOfProcessPartsOfProductLibrary.js";
import {
  get_order_tag_names,
  get_size_config_info
} from "../services/ordersForProductionScheduling.js";
import {
  get_client_tag_names
} from "../services/customer.js";
import {
  get_material_tag_names
} from "../services/warehouseProcurement.js";
var app = getApp();

/**
 * 判断用户是否登录
 */
function checkLogin() {
  return new Promise(function(resolve, reject) {
    //1.检查缓存
    if (wx.getStorageSync('login_token') && wx.getStorageSync('enterpriseIdList') && wx.getStorageSync('enterpriseNameList') &&
      wx.getStorageSync('chooseedEnterpriseId') && wx.getStorageSync('chooseedEnterpriseName') &&
      wx.getStorageSync('userInfo')) {
      resolve();
    } else {
      markedWords('没有检测到缓存，前往登录页面重走登录流程！')
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/login/login"
        });
      }, 3000)
    }
  });
}

/**
 * 进入小程序数据更新流程
 * that app的实例
 */
function programInitialization(that = null) {
  var login_token = that.globalData.login_token()
  return new Promise((resolve, reject) => {
    //1.更新企业列以及当前选中的企业
    var parameter_a = {
      login_token: login_token
    }
    return get_company_list_by_login_token(parameter_a).then(res => {
      //2.登陆后绑定企业信息
      var parameter_b = {
        login_token: login_token,
        "对应企业unique_id": that.globalData.chooseedEnterpriseId()
      }
      var enterprise = {
        id: res.data["对应企业unique_id列表"][0],
        name: res.data["对应企业名称列表"][0]
      }
      return bind_company_after_login(parameter_b, enterprise).then(res => {
        //3.更新用户信息
        var parameter_c = {
          login_token: login_token
        }
        return get_user_info_by_login_token(parameter_c).then(res => {
          //4.获取权限
          var parameter_d = {
            login_token: login_token,
            unique_id: that.globalData.userInfo().unique_id
          }
          return get_role_authority_by_id(parameter_d).then(res => {
            //5. 工厂配置的初始化
            return initializationOfFactoryConfiguration(that).then(res => {

              /**此处专门打印小程序的权限配置，给智能制造control panel工程使用******************start */
              // var administrativePrivileges = deepClone(that.globalData.administrativePrivileges) 
              // var permissionMap={}
              // var 全部的细分权限_小程序=[]
              // var count=0
              // administrativePrivileges= administrativePrivileges.map(item=>{
              //   var newitem={}
              //   newitem.label = item.title
              //   count+=1
              //   newitem.id = count
              //   var permissions = item.permission
              //   permissions= permissions.map(permission=>{
              //     var newPermission={}
              //     count+=1
              //     newPermission.id = count
              //     newPermission.label = permission.name
              //     newPermission.parentLabel = item.title
              //     newPermission.permission = permission.value

              //     permissionMap[String(count)] = permission.value
              //     if (!全部的细分权限_小程序.includes(permission.value)){
              //       全部的细分权限_小程序.push(permission.value)
              //     }
              //     return newPermission
              //   })
              //   newitem.children = permissions
              //   return newitem
              // })
              // console.log('工厂小程序的权限结构表')
              // console.log(JSON.stringify(administrativePrivileges))
              // console.log('工厂小程序的权限map')
              // console.log(JSON.stringify(permissionMap))
              // console.log('工厂小程序全部的细分权限')
              // console.log(JSON.stringify(全部的细分权限_小程序))
              /**此处专门打印小程序的工厂配置，给智能制造control panel工程使用******************end */




              console.log("小程序数据初始化成功！")
              resolve()
            })
          })
        })
      })
    }).catch(err => {
      markedWords("网络原因导致程序初始化失败，前往登录页重走登录流程！");
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/login/login"
        });
      }, 3000)
    })
  })
}

/**
 * 工厂配置的初始化
 * that app的实例
 */
function initializationOfFactoryConfiguration(that = null) {
  var login_token = that.globalData.login_token()
  var request = []
  return new Promise((resolve, reject) => {
    //1 保存工厂产品的标签
    var parameter_a = {
      login_token: login_token
    }
    request.push(get_product_tag_names(parameter_a))
    //2 保存订单的标签
    request.push(get_order_tag_names(parameter_a))
    // 3.获取配码配置信息
    request.push(get_size_config_info(parameter_a))
    // 4.保存客户的标签
    request.push(get_client_tag_names(parameter_a))
    // 5.获取物料的标签
    request.push(get_material_tag_names(parameter_a))
    return Promise.all(request).then(res=>{
      resolve()
    }).catch(err => {
      reject(err)
    })
    
  })
}

module.exports = {
  checkLogin,
  programInitialization,
  initializationOfFactoryConfiguration
};