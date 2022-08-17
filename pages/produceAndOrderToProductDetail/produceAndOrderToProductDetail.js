// pages/produceAndOrderToProductDetail/produceAndOrderToProductDetail.js
const app = getApp();
import {
  isEmpty,
  markedWords,
  deepClone,
  setStatus
} from "../../utils/util.js";
import {
  get_product_by_id
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import regeneratorRuntime from '../../utils/runtime.js';
import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    floorstatus: false,
    isRequestIng: false,
    positionStr: 'top: 10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },
  getProductById() {
    var that = this
    var post_data = {
      login_token: app.globalData.login_token(),
      unique_id: that.data.id
    }
    get_product_by_id(post_data, that).then(res => {
      console.log(res)
      if (typeof res.data['成本估算'] == 'number'){
        res.data['成本估算'] = Number(res.data['成本估算']).toFixed(2)
      }
      that.setData({
        form: res.data,
        isRequestIng: false,
      })
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var id = options.id
    that.setData({
      id:id
    })
    that.getProductById()
    var isBoolean = app.globalData.theirOwnRights()['产品资料可读']
    that.setData({
      isBoolean: isBoolean
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
    let that = this;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  /************页面事件*************************************end*********************** */
})