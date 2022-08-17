// pages/warehouseImportAndExportDetail/warehouseImportAndExportDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 出入库item详情信息
    importAndExportDetailInfo:{},
    // 出库export还是入库import
    type:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var type = options.type
    if (type =='import') {
      wx.setNavigationBarTitle({
        title: '仓库入库详情'
      })
    } else if (type == 'export') {
      wx.setNavigationBarTitle({
        title: '仓库出库详情'
      })
    }
    var importAndExportDetailInfo = app.globalData.importAndExportDetailInfo
    that.setData({
      importAndExportDetailInfo: importAndExportDetailInfo,
      type: type
    })
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