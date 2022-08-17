// pages/login/login.js

import {
  detectMobilePhoneNumber,
  markedWords,
  setStatus,
  login,
} from "../../utils/util.js"

import {
  initializationOfFactoryConfiguration
} from "../../utils/user.js"

import {
  request_verification_message,
  check_verification_message,
  generate_login_token,
  bind_company_after_login,
  get_user_info_by_login_token,
  wx_login,
  generate_login_token_by_wx_encrypted_data,
  confirm_login_by_qrcode_token
} from "../../services/loginAndLogoutTool.js"

import {
  get_role_authority_by_id
} from "../../services/personnelAndAuthorityManagement.js"
import regeneratorRuntime from "../../utils/runtime.js";
import throttle from "../../utils/lodash/throttle.js";
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //要提交的数据
    form: {
      "手机号": "",
      "验证码": ""
    },
    // 选择企业模块是否显示
    selectWhetherTheEnterpriseModuleIsDisplayed: false,
    // 登录按钮是否显示
    whetherTheLoginButtonIsDisplayed: false,
    //验证码是否冷却中
    isPhoneCodeDisabled: false,
    //一分钟倒计时
    time: 0,
    //企业列表
    enterprises: [
      // {
      //   id: 'zxsc',
      //   name: '中信双创'
      // }
    ],
    isRequestIng: false,
    // 微信登录的token
    token: '',
    // 微信手机号
    weChartPhoneNumber:''
  },

  //手机号输入时调用
  onPhoneInput(e) {
    this.data.form["手机号"] = e.detail.value;
  },

  // 获取手机验证码
  onGetPhoneCode(e) {
    let that = this
    if (!detectMobilePhoneNumber(this.data.form["手机号"])) {
      markedWords("手机号码有误，请重新输入！");
      return
    }
    if (this.data.isPhoneCodeDisabled) return
    that.setData({
      isPhoneCodeDisabled:true
    })
    //设置倒计时
    this.setData({
      time: 60
    });
    var timer = setInterval(() => {
      if (this.data.time) {
        this.setData({
          time: this.data.time - 1
        })
      } else {
        that.setData({
          isPhoneCodeDisabled:false
        })
        clearInterval(timer)
      }
    }, 1000);

    var paramter = {
      "手机号": this.data.form["手机号"]
    }
    //发送验证码
    request_verification_message(paramter, that).then(res => {
      setStatus(that, false);
      markedWords(res.msg);
    });
  },

  //验证码输入时调用
  onPhoneCodeInput: function (e) {
    let that = this
    that.data.form["验证码"] = e.detail.value;
    if (this.data.form["验证码"].length === 4) {
      // 1.获取企业列表
      that.getBusinessList().then(res=>{
        // 2.绑定企业
        that.checkboxChange({detail:{value:0}}).then(res=>{
          setStatus(that, false)
          that.setData({
            whetherTheLoginButtonIsDisplayed:true
          })
        })
      })
    }
  },



  // 获取企业列表
  getBusinessList: function (e) {
    let that = this
    return new Promise(function (resolve, reject) {
      if (!detectMobilePhoneNumber(that.data.form["手机号"])) {
        markedWords('请输入正确的手机号')
        reject()
        return
      }
      if (!that.data.form["验证码"] || that.data.form["验证码"].length != 4) {
        markedWords('请输入正确的验证码')
        reject()
        return
      }
      // 1.先验证from表单
      return check_verification_message(that.data.form, that).then(res => {
        // 2.生成token以及企业列表
        return generate_login_token(that.data.form, that).then(res => {
          // 初始化 enterprises
          var enterprises = [];
          var enterpriseIdList = app.globalData.enterpriseIdList();
          var enterpriseNameList = app.globalData.enterpriseNameList();
          for (var i = 0; i < enterpriseIdList.length; i++) {
            var item = {}
            item.id = enterpriseIdList[i];
            item.name = enterpriseNameList[i];
            item.checked = i === 0 ? true : false;
            enterprises.push(item);
          }
          that.setData({
            enterprises: enterprises,
            selectWhetherTheEnterpriseModuleIsDisplayed: true,
          });
          resolve()
        })
      })
    })
  },

  //选择企业的时候触发
  checkboxChange:  function (e) {
    let that = this;
    const index = e.detail.value
    return new Promise(function (resolve, reject){
      // 绑定企业
      var obj_a = {
        login_token: app.globalData.login_token(),
        "对应企业unique_id": that.data.enterprises[index].id
      }
      return bind_company_after_login(obj_a, that.data.enterprises[index], that).then(res=>{
        setStatus(that, false)
        resolve()
      })
    })
  },

  //from提交
  formSubmit(e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    //1.获取用户信息
    var parameter_b = {
      login_token: app.globalData.login_token()
    }
    get_user_info_by_login_token(parameter_b, that).then(res => {
      // 判断用户是否为离职状态
      console.log(res)
      // 2.获取用户权限
      var parameter_c = {
        login_token: app.globalData.login_token(),
        unique_id: app.globalData.userInfo().unique_id
      }
      get_role_authority_by_id(parameter_c, that).then(res => {
        // 3.工厂配置初始化
        initializationOfFactoryConfiguration(app).then(res => {
          this.setData({
            isRequestIng: false
          })
          // 4.手机号保存到缓存
          wx.setStorageSync("phoneNumberMemory", that.data.form.手机号)
          // 如果数微信扫码导致的重新登录，那么把pc端的登录请求也同意了
          if (app.globalData.query) {
            var paramter = {
              qrcode_token: app.globalData.query.token,
              login_token: app.globalData.login_token(),
            }
            confirm_login_by_qrcode_token(paramter).then(res=>{
              app.globalData.query=null
            })
          }
          // 5.跳转到企业选择页面
          wx.reLaunch({
            url: '/pages/personalSetting/personalSetting',
          });
        })
      })
    });
  },


  // 微信登录
  weChatLogin() {
    let that = this
    // 1.获取微信登录码
    login().then(res => {
      var code = res.code
      // 2.使用微信login_code生成login-token
      var parameter = {
        login_code: code
      }
      return wx_login(parameter, that).then(res => {
        setStatus(that, false)
        // 3.设置为微信登录模式
        that.setData({
          token: res.data.token
        })
      })
    }).catch(err => {
      markedWords('无法使用微信登录，请用手机号加验证码的登录方式')
    })
  },


  // 获取微信手机号
  getTheWechatPhoneNumber(e) {
    let that = this
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      // 1.先获取微信手机号
      var encryptedData = e.detail.encryptedData
      var iv = e.detail.iv
      var parameter = {
        token: that.data.token,
        iv: iv,
        encrypted_data: encryptedData
      }
      // 2.获取企业列表
      generate_login_token_by_wx_encrypted_data(parameter, that).then(res => {
        // 初始化 enterprises
        var enterprises = [];
        var enterpriseIdList = app.globalData.enterpriseIdList();
        var enterpriseNameList = app.globalData.enterpriseNameList();
        for (var i = 0; i < enterpriseIdList.length; i++) {
          var item = {}
          item.id = enterpriseIdList[i];
          item.name = enterpriseNameList[i];
          item.checked = i === 0 ? true : false;
          enterprises.push(item);
        }
        that.setData({
          enterprises: enterprises,
          selectWhetherTheEnterpriseModuleIsDisplayed: true,
          weChartPhoneNumber:res.data['手机号']
        });
        //3. 绑定企业
        that.checkboxChange({detail:{value:0}}).then(res=>{
          that.setData({
            whetherTheLoginButtonIsDisplayed:true
          })
          setStatus(that, false)
        })
      })
    } else {
      markedWords('无法使用微信登录，请用手机号加验证码的登录方式')
    }
  },

  //注册试用
  registrationTrial(){
    wx.navigateTo({
      url: "/pages/registrationTrial/registrationTrial",
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.getBusinessListThrottleHandle = throttle(this.getBusinessList, 3000, {
      leading: true,
      trailing: false
    })
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, {
      leading: true,
      trailing: false
    })

    // 1.判断有没有手机号缓存
    if (wx.getStorageSync('phoneNumberMemory')) {
      that.setData({
        'form.手机号': app.globalData.phoneNumberMemory()
      })
    }
    // 2.获取微信登录token
    that.weChatLogin()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})