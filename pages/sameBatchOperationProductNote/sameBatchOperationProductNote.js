const app = getApp();

import {
  noDataProcessingLogic,
  isEmpty,
  setStatus,
  markedWords
} from "../../utils/util.js";
import throttle from "../../utils/lodash/throttle.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productNoteList: [],
    // 全选切换状态记录
    allSwitct: true,

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: 10px;right: 20px;',
    tabBarUrl: '/pages/productionOrder/productionOrder'
  },

  // 全选切换按钮点击
  futureGenerationsToSwitch(e) {
    let that = this
    that.data.allSwitct = !this.data.allSwitct
    var productNoteList = that.data.productNoteList
    if (this.data.allSwitct) {
      productNoteList = productNoteList.map(item => {
        item.checked = true
        return item
      })
    } else {
      productNoteList = productNoteList.map(item => {
        item.checked = false
        return item
      })
    }
    that.setData({
      productNoteList: productNoteList,
      allSwitct: that.data.allSwitct
    })
  },
  checkboxChange: function (e) {
    let that=this
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value.length === that.data.productNoteList.length){
      that.setData({
        allSwitct:true
      })
    }else{
      that.setData({
        allSwitct: false
      })
    }
  },

  formSubmit: function(e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (e.detail.value['全部选中的生产单号'].length===0) {
      markedWords('至少要选择一个生产单子！')
      return
    }
    app.globalData.productNoteUniqueIds = e.detail.value['全部选中的生产单号']
    wx.navigateTo({
      url: '/pages/productionNoteDetailList/productionNoteDetailList',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, {
      leading: true,
      trailing: false
    })

    var productNoteRelevantInfo = app.globalData.productNoteRelevantInfo
    that.setData({
      ...productNoteRelevantInfo,
      productNoteList: app.globalData.productNoteList
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})