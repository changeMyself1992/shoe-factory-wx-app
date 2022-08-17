const app = getApp();
import {
  noDataProcessingLogic,
  isEmpty,
  markedWords,
  parseTime,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  deepClone,
  setStatus,
  isObjectValueEqual,
  compareObj
} from "../../utils/util.js";
import {
  edit_supplier_transaction_by_id
} from "../../services/supplier.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: null,
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 初始化form
  initializationForm() {
    let that = this
    return new Promise(function (resolve, reject) {
      that.setData({
        form: deepClone(app.globalData.deliverNoteDetails)
      })
      resolve()
    })
  },


  formSubmit: function (e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    that.data.form['备注'] = e.detail.value['备注']
    var parameter = {
      login_token: app.globalData.login_token(),
      unique_id: that.data.form.unique_id,
      update_data: that.data.form
    }
    edit_supplier_transaction_by_id(parameter, that).then(res => {
      setStatus(that, false)
      markedWords('修改备注成功～')
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      prevPage.setData({
        editNoteBack: '是'
      })
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 1500)
      // markedWords(res.msg, 'none', 2000)
    })

  },
  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
    // 页面初始化流程
    that.setData({
      "form.备注": app.globalData.deliverNoteDetails['备注']
    })
  },


  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // 页面初始化流程
    that.initializationForm()
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