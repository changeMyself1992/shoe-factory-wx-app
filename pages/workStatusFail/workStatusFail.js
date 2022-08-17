// pages/workStatusFail/workStatusFail.js
const app = getApp();
import {
  send_account_activation_request
} from "../../services/loginAndLogoutTool.js"
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus
} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  showStatusFial() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '您目前是离职状态，无法进行后续操作。请选择是否激活',
      showCancel: true,
      cancelText: '不了',
      cancelColor: '#000',
      confirmText: '激活',
      confirmColor: '#00bb72',
      success: function(res) {
        if (res.confirm) {
          return new Promise(function(resolve, reject) {
            var parameter = {
              login_token: wx.getStorageSync('login_token')
            }
            send_account_activation_request(parameter, that).then(res => {
              console.log(res)
              if (res.status === 'OK') {
                markedWords('激活成功，等待管理员确认～')
                var thisUrl = that.route
                console.log(thisUrl)
                if (thisUrl != 'pages/login/login') {
                  setTimeout(function() {
                    wx.clearStorage({
                      success(res) {
                        //跳转登录页面
                        wx.reLaunch({
                          url: '/pages/login/login'
                        })
                      }
                    })
                  }, 1500)
                }
              }
            })
          })
        } else {
          // 如果不是在登陆页跳去登陆页面
          var thisUrl = that.route
          console.log(thisUrl)
          if (thisUrl != 'pages/login/login') {
            wx.clearStorage({
              success(res) {
                //跳转登录页面
                wx.reLaunch({
                  url: '/pages/login/login'
                })
              }
            })
          }
        }
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.showStatusFial()
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