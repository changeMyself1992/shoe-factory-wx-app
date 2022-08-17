// pages/purchaseOrderSearch/purchaseOrderSearch.js
import {
  filter_purchase_note
} from "../../services/warehouseProcurement.js";
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus
} from "../../utils/util.js";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 是否正在发起请求
    isRequestIng: false,
    updateTimeStartDate: '',
    updateTimeEndDate: '',
    采购单状态: [],
    items: [
      { name: '等待', value: '等待' },
      { name: '完成', value: '完成' },
      { name: '作废', value: '作废' },
    ]
  },
  checkboxChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      采购单状态: e.detail.value
    })
    console.log(this.data.采购单状态)
  },
  caigoudan: function (e) {
    console.log(e.detail.value)
    this.setData({
      caigoudan: e.detail.value
    })
  },
  dingdan: function (e) {
    console.log(e.detail.value)
    this.setData({
      dingdan: e.detail.value
    })
  },
  shengchandan: function (e) {
    console.log(e.detail.value)
    this.setData({
      shengchandan: e.detail.value
    })
  },
  //日期选择
  bindDateChange: function (e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '更新时间段开始') {
      this.setData({
        updateTimeStartDate: e.detail.value
      })
    } else if (mode === '更新时间段结束') {
      this.setData({
        updateTimeEndDate: e.detail.value
      })
    }
  },
  /**
   * 点击进行搜索的时候
   */
  onSubmit() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 50
      },
      sort: { 采购单日期: -1 }
    }
    if (!isEmpty(that.data.采购单状态)) {
      parameter['采购单状态'] = that.data.采购单状态
    }
    if (!isEmpty(that.data.caigoudan)) {
      parameter['采购单编号'] = that.data.caigoudan
    }
    if (!isEmpty(that.data.dingdan)) {
      parameter['订单编号'] = that.data.dingdan
    }
    if (!isEmpty(that.data.shengchandan)) {
      parameter['生产单编号'] = that.data.shengchandan
    }
    if (!isEmpty(that.data.updateTimeStartDate)) {
      parameter['更新时间_下限'] = that.data.updateTimeStartDate
    }
    if (!isEmpty(that.data.updateTimeEndDate)) {
      parameter['更新时间_上限'] = that.data.updateTimeEndDate
    }
    // 如果俩个时间都输入了那么作比较
    if (!isEmpty(that.data.updateTimeStartDate) && !isEmpty(that.data.updateTimeEndDate)) {
      if (new Date(that.data.updateTimeStartDate) > new Date(that.data.updateTimeEndDate)) {
        markedWords("开始时间必须小于结束时间！")
        return
      }
    } else if (!isEmpty(that.data.updateTimeStartDate) && isEmpty(that.data.updateTimeEndDate)) {
      markedWords("更新时间段是个范围，开始和结束时间都要选择！")
      return
    } else if (isEmpty(that.data.updateTimeStartDate) && !isEmpty(that.data.updateTimeEndDate)) {
      markedWords("更新时间段是个范围，开始和结束时间都要选择！")
      return
    }
    filter_purchase_note(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.purchaseList = res.data
        var searchCondition = {
          采购单状态: that.data.采购单状态,
          采购单编号: that.data.caigoudan ? that.data.caigoudan : '',
          关联订单编号: that.data.dingdan ? that.data.dingdan : '',
          关联生产单编号: that.data.shengchandan ? that.data.shengchandan : '',
          更新时间_下限: that.data.updateTimeStartDate ? that.data.updateTimeStartDate : '',
          更新时间_上限: that.data.updateTimeEndDate ? that.data.updateTimeEndDate : ''
        }
        app.globalData.searchCondition = searchCondition
        app.globalData.isItAJumpFromTheSearchPage = true
        // 跳回待排产物料列表并指定为 不选中任何状态
        wx.navigateBack({
          url: '/pages/purchaseOrderList/purchaseOrderList'
        })
      }
    })
  },

  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
    // 清空时间
    that.setData({
      updateTimeStartDate: '',
      updateTimeEndDate: ''
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
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