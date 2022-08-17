// pages/processDepartmentDetail/processDepartmentDetail.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    // 部门工资详情
    departmentalWageDetails: null,
    // 是否展开工序人员
    whetherToStartProcessPersonnel: false,
    isRequestIng: false,
    floorstatus: false,
    // 累加总件数
    totalNumOfPieces: 0,
    // 累加总金额
    totalNumOfMoney: 0,
    positionStr: 'top: 7px;right: 20px;',
    tabBarUrl: '/pages/dataKanban/dataKanban'
  },


  // 工序人员展开切换
  processPeopleToggle() {
    this.setData({
      whetherToStartProcessPersonnel: !this.data.whetherToStartProcessPersonnel
    })
  },
  // 产品标签展开切换
  productTagToggle(e) {
    let that = this
    var index = e.currentTarget.dataset.index
    var item = that.data.departmentalWageDetails['相关信息'][index]
    if (item.whetherToExpandTheProductLabel) item.whetherToExpandTheProductLabel = false
    else item.whetherToExpandTheProductLabel = true
    this.setData({
      departmentalWageDetails: that.data.departmentalWageDetails
    })
  },
  // 子组件查询之后回调此方法
  callbackAfterConditionQuery(e) {
    let that = this
    that.setData({
      departmentalWageDetails: e.detail.departmentalWageDetails
    })
    that.addUpTheTotalNumberOfPieces(that.data.departmentalWageDetails['相关信息'])
  },
  // 累加
  addUpTheTotalNumberOfPieces(array) {
    let that = this
    var totalNumOfPieces = 0
    var totalNumOfMoney = 0
    for (var i = 0; i < array.length; i++) {
      var element = array[i];
      totalNumOfPieces += element['总件数']
      totalNumOfMoney += element['总金额']
    }
    that.setData({
      totalNumOfPieces: totalNumOfPieces,
      totalNumOfMoney: totalNumOfMoney
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    wx.setNavigationBarTitle({
      title: app.globalData.processDepartmentName + "详情"
    })
    that.setData({
      title: app.globalData.processDepartmentName
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
    setTimeout(() => {
    //获取部门信息搜索组件,并调用它的搜索方法
    var process_department_search = that.selectComponent('#process-department-search')
    process_department_search.obtainDetailedDepartmentSalaryStatisticsFromEmployees().then(res => {
      that.setData({
        departmentalWageDetails: res
      })
      that.addUpTheTotalNumberOfPieces(that.data.departmentalWageDetails['相关信息'])
    })
    }, 500);

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