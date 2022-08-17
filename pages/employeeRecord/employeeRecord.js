// pages/employeeRecord/employeeRecord.js
import {
  production_control_filter_unconfirmed_staff_record
} from "../../services/ordersForProductionScheduling.js";
import throttle from "../../utils/lodash/throttle.js";
import {
  markedWords
} from "../../utils/util.js";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 是否正在发起请求
    isRequestIng: false,
    // 生产单编号
    productUniqueId: '',
    productStaffName: '',
    productStaffTel: '',
    productName: '',
  },
  productUniqueIdClick(e){
    var that = this
    var productUniqueId = e.detail.value
    that.setData({
      productUniqueId: productUniqueId
    })
  },
  productNameClick(e) {
    var that = this
    var productName = e.detail.value
    that.setData({
      productName: productName
    })
  },
  productStaffNameClick(e) {
    var that = this
    console.log(e)
    var productStaffName = e.detail.value
    that.setData({
      productStaffName: productStaffName
    })
  },
  productStaffTelClick(e) {
    var that = this
    var productStaffTel = e.detail.value
    that.setData({
      productStaffTel: productStaffTel
    })
  },
  /**
   * 点击进行搜索的时候
   */

  onSubmit() {
    let that = this
    var login_token = app.globalData.login_token()
    console.log(that.data.productName)
    console.log(that.data.productUniqueId)
    console.log(that.data.productStaffName)
    console.log(that.data.productStaffTel)
    var parameter = {
      login_token: app.globalData.login_token(),
      '生产单编号': that.data.productUniqueId ? that.data.productUniqueId:'',
      '员工姓名': that.data.productStaffName ? that.data.productStaffName : '',
      '员工手机': that.data.productStaffTel ? that.data.productStaffTel : '',
      '工序': that.data.productName ? that.data.productName : '',
      pagination: {
        page: 1,
        limit: 16
      }
    }
    app.globalData.parameter = parameter
    production_control_filter_unconfirmed_staff_record(parameter, that).then(res => {
      that.setData({
        isRequestIng: false
      })
      if (res.data.items.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        console.log(res.data.items)
        app.globalData.productionOrderList = res.data
        app.globalData.searchCondition = {
          生产单编号: that.data.productUniqueId,
          员工姓名: that.data.productStaffName,
          员工手机: that.data.productStaffTel,
          工序: that.data.productName,
        }
        app.globalData.isItAJumpFromTheSearchPage = true
        // 跳回生产单列表并指定为 不选中任何状态
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          curSelectIndex: 2
        })
        wx.navigateBack({
          url: '/pages/productOrderQuickOperation/productOrderQuickOperation?curSelectIndex=2'
        })
      }
    })
  },

  // 清空搜索条件
  onClear() {
    let that = this
    that.setData({
      productUniqueId: '',
      productStaffName: '',
      productStaffTel: '',
      productName: ''
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.submitThrottleHandle = throttle(this.onSubmit, 3000, { leading: true, trailing: false })
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