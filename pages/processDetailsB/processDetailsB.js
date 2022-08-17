// pages/processDetails/processDetails.js
import {
  get_sum_process_detail,
  get_sum_process_detail_for_staff
} from "../../services/ordersForProductionScheduling.js";
import {
  markedWords,
  isEmpty,
  setStatus
} from "../../utils/util.js"
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //权限列表
    theirOwnRights: null,
    //同批次操作选中的工序详情（员工数据）
    processDetailsSelectedForTheSameBatchOfOperation: {},
    // 同批次下某工序汇总详情(管理员数据)
    processDetail: {},
    // 是否展开
    whetherTheFolding:false,
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/productionOrder/productionOrder'
  },

  // 配码展开开关
  kindToggle: function (even) {
    let that = this
    this.setData({
      whetherTheFolding: !that.data.whetherTheFolding
    });
  },

  /**
   * 获取同一批次下某工序汇总详情页（管理员调用）
   */
  getSumProcessDetail(e) {
    let that = this;
    return new Promise(function(resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token(),
        "工序unique_id": that.data.processDetailsSelectedForTheSameBatchOfOperation['工序信息'],
        unique_ids: that.data.processDetailsSelectedForTheSameBatchOfOperation['生产单unique_ids']
      };

      // 代表是管理员要 获取同一批次下某工序汇总详情页
      if (app.globalData.theirOwnRights()['生产单详情可写'] && app.globalData.theirOwnRights()['生产单列表可读']) {
        return get_sum_process_detail(parameter, that).then(res => {
          that.setData({
            processDetail: res.data
          })
          if (e && e.detail && e.detail.callBack) {
            setStatus(that, false)
            e.detail.callBack()
          }
          return resolve()
        })
      } else {
        // 代表是员工要 获取同一批次下某工序汇总详情页
        return get_sum_process_detail_for_staff(parameter, that).then(res => {
          that.setData({
            processDetail: res.data
          })
          if (e && e.detail && e.detail.callBack) {
            setStatus(that, false)
            e.detail.callBack()
          }
          return resolve()
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
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
    that.setData({
      productionOrderDetails: app.globalData.productionOrderDetails,
      processDetailsSelectedForTheSameBatchOfOperation: app.globalData['同批次操作选中的工序详情']
    })
    that.getSumProcessDetail().then(res => {
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