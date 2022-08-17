// pages/personalSetting /personalSetting.js
const app = getApp();
import {
  bind_company_after_login,
  get_user_info_by_login_token,
} from "../../services/loginAndLogoutTool.js"

import {
  staff_get_recent_salary_summary
} from "../../services/scheduleManagement.js"
import {
  generate_wx_qr_code
} from "../../services/supplier.js"

import {
  get_role_authority_by_id
} from "../../services/personnelAndAuthorityManagement.js"

import {
  initializationOfFactoryConfiguration
} from "../../utils/user.js"

import {
  getCurrentMonthFirst,
  getCurrentMonthLast,
  isEmpty,
  parseTime,
  setStatus,
  checkUserAuthorization,
  getWechatInfo
} from "../../utils/util.js";
import {
  programInitialization
} from '../../utils/user.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    bindMobilePhoneNumber: "",
    role: "",
    avatar: '',
    qrCodeForRegistration: '', //选中企业的员工注册码
    supplierToEnterTheQrCode: '', // 供应商录入二维码
    //企业列表
    enterprises: [
      // {
      //   id: 'zxsc',
      //   name: '中信双创'
      // }
    ],
    isRequestIng: false,
    //是否显示回到顶部图标
    floorstatus: false,
  },

  //授权回调
  authorizeTheCallback: function(e) {
    let that = this;
    checkUserAuthorization().then((res) => {
      getWechatInfo().then(res => {
        //初始化头像
        that.setData({
          avatar: app.globalData.userInfoFromWeChat().avatarUrl
        });
      })
    })
  },

  //选择企业的时候触发
  checkboxChange: function(e) {
    let that = this;
    const index = e.detail.value
    //1.绑定企业
    var obj_a = {
      login_token: app.globalData.login_token(),
      "对应企业unique_id": that.data.enterprises[index].id
    }
    bind_company_after_login(obj_a, that.data.enterprises[index], that).then(res => {
      //2.获取用户信息
      var obj_b = {
        login_token: app.globalData.login_token()
      }
      get_user_info_by_login_token(obj_b, that).then(res => {
        //设置个人信息
        that.setData({
          name: app.globalData.userInfo().个人信息.姓名,
          bindMobilePhoneNumber: app.globalData.userInfo().绑定手机号,
          role: app.globalData.userInfo().管理角色,
          qrCodeForRegistration: app.globalData.userInfo().企业二维码,
        });
        // 3.获取用户权限
        var parameter_c = {
          login_token: app.globalData.login_token(),
          unique_id: app.globalData.userInfo().unique_id
        }
        get_role_authority_by_id(parameter_c, that).then(res => {
          // 4.工厂配置初始化
          initializationOfFactoryConfiguration(app).then(res => {
            that.setData({
              isRequestIng: false
            })
          })
        })
      });
    })
  },

  // 初始化头像和公司列表
  initializesTheAvatarAndCompanyList() {
    let that = this;
    //初始化头像
    that.setData({
      avatar: app.globalData.userInfoFromWeChat().avatarUrl
    });
    //初始化 enterprises
    var enterprises = [];
    var enterpriseIdList = app.globalData.enterpriseIdList();
    var enterpriseNameList = app.globalData.enterpriseNameList();
    for (var i = 0; i < enterpriseIdList.length; i++) {
      var item = {}
      item.id = enterpriseIdList[i];
      item.name = enterpriseNameList[i];
      if (item.id == app.globalData.chooseedEnterpriseId()) {
        item.checked = true;
      } else {
        item.checked = false;
      }
      enterprises.push(item);
    }
    that.setData({
      enterprises: enterprises
    });
  },

  // 初始化个人数据
  initializePersonalData() {
    let that = this;
    return new Promise(function(resolve, reject) {
      //1.获取用户信息
      var obj_b = {
        login_token: app.globalData.login_token()
      }
      return get_user_info_by_login_token(obj_b, that).then(res => {
        //设置个人信息
        that.setData({
          name: app.globalData.userInfo().个人信息.姓名,
          bindMobilePhoneNumber: app.globalData.userInfo().绑定手机号,
          role: app.globalData.userInfo().管理角色,
          qrCodeForRegistration: app.globalData.userInfo().企业二维码,
        });
        resolve()
      });
    })
  },

  // 初始化送货单录入二维码
  initializeTheDeliveryNoteToEnterTheQrCode() {
    let that = this
    return new Promise(function(resolve, reject) {
      var paramter = {
        login_token: app.globalData.login_token()
      }
      return generate_wx_qr_code(paramter, that).then(res => {
        that.setData({
          supplierToEnterTheQrCode: res.data['二维码']
        })
        resolve()
      })
    })
  },

  //登出按钮
  onLogout(even) {
    //清空所有缓存
    wx.clearStorage({
      success(res) {
        //跳转登录页面
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
    })
  },

  // 查看二维码详情
  previewImage(e) {
    let that = this;
    var array = []
    if (e.target.id === '员工注册码' && !isEmpty(that.data.qrCodeForRegistration)) {
      array.push(that.data.qrCodeForRegistration)
      wx.previewImage({
        urls: array
      })
    } else if (e.target.id === '送货填写码' && !isEmpty(that.data.supplierToEnterTheQrCode)) {
      array.push(that.data.supplierToEnterTheQrCode)
      wx.previewImage({
        urls: array
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.initializesTheAvatarAndCompanyList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this
    that.initializePersonalData().then(res => {
      that.initializeTheDeliveryNoteToEnterTheQrCode().then(res => {
        that.setData({
          isRequestIng: false
        })
      })
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    //重置数据
    let that = this;
    that.setData({
      isRequestIng: true
    })
    programInitialization(app).then(res => {
      that.initializesTheAvatarAndCompanyList()
      that.initializePersonalData().then(res => {
        that.initializeTheDeliveryNoteToEnterTheQrCode().then(res => {
          wx.stopPullDownRefresh();
          setStatus(that, false)
        })
      }).catch(err => {
        wx.stopPullDownRefresh();
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})