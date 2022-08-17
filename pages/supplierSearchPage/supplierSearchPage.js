// pages/supplierSearchPage/supplierSearchPage.js
const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  filter_supplier
} from "../../services/supplier.js"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    updateTimeStart: '',
    updateTimeEnd: '',

    //搜索成功后的跳转链接
    searchForJumpLinksAfterSuccess: "/pages/supplierManagement/supplierManagement",

    //是否正在发起请求
    isRequestIng: false,
    // 供应商关联状态
    transactionStatusOptions: [
      { name: '是', value: '是', checked:true },
      { name: '否', value: '否', checked: true }
    ],
  },

  //日期选择
  bindDateChange: function (e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '更新时间段开始') {
      this.setData({
        updateTimeStart: e.detail.value
      })
    } else if (mode === '更新时间段截止') {
      this.setData({
        updateTimeEnd: e.detail.value
      })
    }
  },

  formSubmit: function (e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 16
      },
      sort: {
        更新时间: -1
      }
    }
    if (!isEmpty(e.detail.value['供应商名称'])) {
      parameter['名称'] = e.detail.value['供应商名称']
    }
    if (!isEmpty(e.detail.value['供应商电话'])) {
      parameter['联系电话'] = e.detail.value['供应商电话']
    }
    if (!isEmpty(e.detail.value['供应商地址'])) {
      parameter['地址'] = e.detail.value['供应商地址']
    }
    if (!isEmpty(e.detail.value['供应商关联状态'])) {
      console.log(e.detail.value['供应商关联状态'])
      var 认证状态 = []
      if (e.detail.value['供应商关联状态'][0] === '是'){
        认证状态.push(true)
      }
      if (e.detail.value['供应商关联状态'][0] === '否') {
        认证状态.push(false)
      }
      if (e.detail.value['供应商关联状态'][1] === '是') {
        认证状态.push(true)
      }
      if (e.detail.value['供应商关联状态'][1] === '否') {
        认证状态.push(false)
      }
      parameter['认证状态'] = 认证状态
    }
    if (!isEmpty(e.detail.value['更新时间段开始']) && !isEmpty(e.detail.value['更新时间段截止'])) {
      if (new Date(e.detail.value['更新时间段开始']) >= new Date(e.detail.value['更新时间段截止'])) {
        markedWords('开始时间必须小于截止时间')
        return
      }
      parameter['更新时间_下限'] = e.detail.value['更新时间段开始']
      parameter['更新时间_上限'] = e.detail.value['更新时间段截止']
    }
    app.globalData.parameter = parameter
    filter_supplier(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.suplierList = res.data
        var searchCondition = {
          名称: e.detail.value['供应商名称'],
          联系电话: e.detail.value['供应商电话'],
          联系电话: e.detail.value['供应商电话'],
          地址: e.detail.value['供应商地址'],
          认证状态: e.detail.value['供应商关联状态'],
          更新时间段开始: e.detail.value['更新时间段开始'],
          更新时间段截止: e.detail.value['更新时间段截止']
        }
        app.globalData.isItAJumpFromTheSearchPage = true
        app.globalData.searchCondition = searchCondition
        // 跳回供应商列表并指定为 不选中任何状态
        wx.navigateBack({
          url: that.data.searchForJumpLinksAfterSuccess
        })
      }
    })
  },
  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
    that.setData({
      updateTimeStart: '',
      updateTimeEnd: '',
    })
  },

  /************页面事件*************************************start*********************** */
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
  /************页面事件*************************************end*********************** */
})