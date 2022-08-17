// pages/factoryLinkSupplier/factoryLinkSupplier.js
// pages/cashMoneySupplierNote/cashMoneySupplierNote.js
import {
  isEmpty,
  markedWords,
  deepClone,
  setStatus,
} from "../../utils/util.js";
import {
  filter_suplier_all,
  relate_company_to_supplier,
  generate_unified_match_qr_code
} from "../../services/supplier.js";
import debounce from "../../utils/lodash/debounce.js";
import regeneratorRuntime from '../../utils/runtime.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: null,
    codeimg:'',
    uniqueid:'',
    gysname:'',

    // 工厂名称输入框是否获取了焦点
    factoryNmaeFocus: false,
    // 工厂信息列表
    factoryInformationList: [],

    //是否正在发起请求
    isRequestIng: false,

    form:{
      供应商名称: '',
      供应商电话: '',
      地址: '',
      备注: '',
      供应商unique_id:'',
    }
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },

  onTap() {
    let that = this
    that.setData({
      factoryNmaeFocus: false
    })
  },


  // 当工厂名称获取焦点的时候
  onFocusFactoryName(e) {
    let that = this
    var value = e.detail.value
    var paramter = {
      名称: value,
      工厂unique_id: app.globalData.chooseedEnterpriseId(),
      login_token: app.globalData.login_token()
    }
    filter_suplier_all(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        factoryInformationList: res.data,
        factoryNmaeFocus: res.data.length > 0 ? true : false
      })
    })
  },

  // 当工厂名称输入的时候
  onInputFactorName(e) {
    let that = this
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.form['供应商名称'] = value
    var paramter = {
      名称: value,
      工厂unique_id: app.globalData.chooseedEnterpriseId(),
      login_token: app.globalData.login_token()
    }

    filter_suplier_all(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        factoryInformationList: res.data,
        factoryNmaeFocus: res.data.length > 0 ? true : false
      })
      that.theProcessingLogicAfterTheFactoryNameIsEntered()
    })
  },

  // 工厂名称进行选择的时候
  onFactoryNameSelect(e) {
    let that = this
    var factory = e.currentTarget.dataset.factory
    that.data.form['供应商名称'] = factory['名称']
    that.setData({
      factoryNmaeFocus: false
    })
    that.theProcessingLogicAfterTheFactoryNameIsEntered()
  },

  // 工厂名称输入后的处理逻辑
  theProcessingLogicAfterTheFactoryNameIsEntered() {
    let that = this
    // 1.判断当前工厂名称 是否能在factoryInformationList中能找到
    var factorName = that.data.form['供应商名称']
    var i = that.data.factoryInformationList.findIndex(item => {
      return item['名称'] === factorName
    })
    if (i !== -1) {
      // 如果找到了 
      that.data.form['供应商名称'] = that.data.factoryInformationList[i]['名称']
      that.data.form['供应商unique_id'] = that.data.factoryInformationList[i]['unique_id']
      that.data.form['供应商电话'] = that.data.factoryInformationList[i]['联系电话']
      that.data.form['地址'] = that.data.factoryInformationList[i]['地址']
      that.data.form['备注'] = that.data.factoryInformationList[i]['备注']
    }
    that.setData({
      form: that.data.form
    })
  },

  sureLink: function (e) {
    var that = this
    if (that.data.form['供应商unique_id'] == '') {
      markedWords('请选择一个供应商关联')
      return false
    }
    console.log(that.data.form)
    var paramter = {
      login_token: app.globalData.login_token(),
      供应商unique_id: that.data.form['供应商unique_id'],
      供应商在本工厂的名称: that.data.gysname
    }
    // debugger
    relate_company_to_supplier(paramter, that).then(res => {
      setStatus(that, false)
      markedWords(res.msg)
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)
    })
  },
  back() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 获取关联码
  generateUnifiedMatchQrCode() {
    var that = this
    var uniqueid = that.data.uniqueid
    var post_data = {
      login_token: app.globalData.login_token(),
      工厂内部供应商unique_id: uniqueid
    }
    generate_unified_match_qr_code(post_data, that).then(res => {
      setStatus(that, false)
      that.setData({
        codeimg: res.data['二维码']
      })
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    that.setData({
      uniqueid: options.uniqueid,
      gysname: options.gysname
    })
    that.generateUnifiedMatchQrCode()
    this.factoryNameDebouncedHandleSearch = debounce(this.onInputFactorName, 1000)
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

  },
  /************页面事件*************************************end*********************** */
})