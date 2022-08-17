const app = getApp();

import {
  noDataProcessingLogic,
  isEmpty,
  setStatus
} from "../../utils/util.js";
import {
  get_production_notes_process,
  get_production_notes_process_for_staff
} from "../../services/ordersForProductionScheduling.js";
import {
  get_user_info_by_login_token
} from "../../services/loginAndLogoutTool.js"
import throttle from "../../utils/lodash/throttle.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //权限列表
    theirOwnRights: {},

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: 10px;right: 20px;',
    tabBarUrl: '/pages/productionOrder/productionOrder'
  },

  /**
   * 详情按钮点击
   */
  onDetailsBtnClick(even) {
    app.globalData['同批次操作选中的工序详情'] = even.target.dataset.item
    wx.navigateTo({
      url: '/pages/processDetailsB/processDetailsB'
    })
  },
  // 点击无权限的工序显示弹窗
  huiSeDisable() {
    var that = this
    wx.showModal({
      title: '权限提示',
      content: '当前工序您没有操作权限，请联系管理员添加该工序权限！',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#00bb72',
      success: function(res) {
        if (res.confirm) {}
      },
    })
  },

  /**
   * 获取工序计件信息
   */
  getProductionNotesProcess() {
    let that = this;
    var parameter = {
      login_token: app.globalData.login_token(),
      unique_ids: that.data.productNoteUniqueIds,
    };
    return new Promise(function(resolve, reject) {
      // 代表是管理员要 生产单总的工序计件信息
      if (app.globalData.theirOwnRights()['生产单详情可写'] && app.globalData.theirOwnRights()['生产单列表可读']) {
        return get_production_notes_process(parameter, that).then(res => {
          that.setData({
            processInformationComesFromProductionOrder: res.data['有权限'],
            restProductOrderListGongXu: res.data['无权限'],
          })
          resolve()
        }).catch(err => {
          reject()
        })
      }
      // 代表是员工要 生产单总的工序计件信息
      else {
        return get_production_notes_process_for_staff(parameter, that).then(res => {
          that.setData({
            processInformationComesFromProductionOrder: res.data['有权限'],
            restProductOrderListGongXu: res.data['无权限'],
          })
          resolve()
        }).catch(err => {
          reject()
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.detailsThrottleHandle = throttle(this.onDetailsBtnClick, 3000, {
      leading: true,
      trailing: false
    })

    that.setData({
      theirOwnRights: app.globalData.theirOwnRights()
    })
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
    var productNoteRelevantInfo = app.globalData.productNoteRelevantInfo
    that.setData({
      ...productNoteRelevantInfo,
      productNoteUniqueIds: app.globalData.productNoteUniqueIds,
    })
    that.getProductionNotesProcess().then(res => {
      setStatus(that, false)
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
    let that = this
    that.getProductionNotesProcess().then(res => {
      setStatus(that, false)
      wx.stopPullDownRefresh()
    }).catch(err => {
      wx.stopPullDownRefresh()
    })

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