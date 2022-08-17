const app = getApp();
import {
  filter_user
} from "../../services/personnelAndAuthorityManagement.js"
import {
  isEmpty,
  noDataProcessingLogic
} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //企业的员工注册码
    qrCodeForRegistration: '',
    // 待确认的员工列表
    listOfEmployeesToBeConfirmed: [],
    //当前请求的页数
    page_num: 1,
    //当前要请求的商品数
    page_size: 16,
    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false
  },

  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.data.listOfEmployeesToBeConfirmed = []
  },

  // 查看二维码详情
  previewImage(e) {
    let that = this;
    if (isEmpty(that.data.qrCodeForRegistration)) return
    var array = []
    array.push(that.data.qrCodeForRegistration)
    wx.previewImage({
      urls: array
    })
  },

  // 删除之后回调
  callbackAfterDeletion(e) {
    let that = this
    var employees = e.detail.employees
    var index = that.data.listOfEmployeesToBeConfirmed.findIndex(item => {
      return item.unique_id === employees.unique_id
    })
    if (index !== -1) {
      that.data.listOfEmployeesToBeConfirmed.splice(index, 1)
      that.setData({
        listOfEmployeesToBeConfirmed: that.data.listOfEmployeesToBeConfirmed
      })
    }
  },

  // 查询待确认的员工
  filterApplyUser() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: that.data.page_num,
        limit: that.data.page_size
      },
      sort: {
        更新时间: -1
      },
      '工作状态': ['待确认']
    }
    return new Promise(function(resolve, reject) {
      filter_user(parameter, that).then(res => {
        var list = res.data;
        if (list.length == 0) {
          noDataProcessingLogic(that);
          that.setData({
            listOfEmployeesToBeConfirmed: that.data.listOfEmployeesToBeConfirmed,
          });
          return resolve('没有更多数据了')
        } else {
          that.setData({
            listOfEmployeesToBeConfirmed: that.data.listOfEmployeesToBeConfirmed.concat(list),
          });
          resolve(res.msg)
        }
      })
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    that.setData({
      qrCodeForRegistration: app.globalData.userInfo().企业二维码,
    });
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
    that.initData();
    that.filterApplyUser().then(res => {
      that.setData({
        isRequestIng: false
      })
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
    //重置数据
    let that = this;
    that.initData();
    that.filterApplyUser().then(res => {
      wx.stopPullDownRefresh();
      that.setData({
        isRequestIng: false
      });
    }).catch(err => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    // 如果正在发起请求,直接退
    if (that.data.isRequestIng) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
      page_num: that.data.page_num + 1
    });
    that.filterApplyUser().then(res => {
      if (res === '没有更多数据了') {
        that.data.page_num = that.data.page_num - 1
      }
      that.setData({
        isRequestIng: false
      });
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
  /************页面事件*************************************end*********************** */
})