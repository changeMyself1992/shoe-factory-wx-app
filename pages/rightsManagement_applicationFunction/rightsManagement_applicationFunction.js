const app = getApp();

import {
  filter_role_authority,
  delete_role_authority_by_id
} from "../../services/personnelAndAuthorityManagement.js"
import {
  get_role_authority_by_id
} from '../../services/personnelAndAuthorityManagement.js'
import {
  isEmpty,
  markedWords,
  setStatus
} from "../../utils/util.js";
import throttle from "../../utils/lodash/throttle.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 全部的角色列表
    rolesList: [],
    // 是否正在发起请求
    isRequestIng: false
  },
  handleAddRole() {
    if (!app.globalData.theirOwnRights()['权限管理可写']) {
      markedWords("无此操作权限")
      return
    }
    wx.navigateTo({
      url: '/pages/roleOperationPage/roleOperationPage?mode=addRole',
    })
  },
  handleEdit(e) {
    let that=this
    var role = e.currentTarget.dataset.role
    app.globalData.curOperationRole = role
    wx.navigateTo({
      url: '/pages/roleOperationPage/roleOperationPage?mode=editRole',
    })
  },
  handleDelete(e) {
    let that = this
    if (!app.globalData.theirOwnRights()['权限管理可写']) {
      markedWords("无此操作权限")
      return
    }
    var role = e.currentTarget.dataset.role

    wx.showModal({
      title: '提示',
      content: `确认要删除用户${role['管理角色']}吗？`,
      success(res) {
        if (res.confirm) {
          var post_data = {
            login_token: app.globalData.login_token(),
            unique_id: role['unique_id']
          }
          delete_role_authority_by_id(post_data, that).then(res => {
            that.setData({
              isRequestIng: false
            })
            markedWords(res.msg)
            // 重新初始化rolesList
            var index = that.data.rolesList.findIndex(item => {
              return item.unique_id === role.unique_id
            })
            if (index !== -1) {
              that.data.rolesList.splice(index, 1)
              that.setData({
                rolesList: that.data.rolesList
              })
            }
          })
        }
      }
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.editThrottleHandle = throttle(this.handleEdit, 3000, { leading: true, trailing: false })
    this.addRoleThrottleHandle = throttle(this.handleAddRole, 3000, { leading: true, trailing: false })


    //获取权限
    var parameter_d = {
      login_token: app.globalData.login_token(),
      unique_id: app.globalData.userInfo().unique_id
    }
    get_role_authority_by_id(parameter_d,that).then(res => {
      setStatus(that, false)
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
    var parameter = {
      login_token: app.globalData.login_token()
    }
    filter_role_authority(parameter, that).then(res => {
      var rolesList = []
      for (var i = 0; i < res.data.length; i++) {
        var description = ''
        Object.keys(res.data[i]['管理权限']).forEach(function(key) {
          if (res.data[i]['管理权限'][key]) {
            description += key + ', '
          }
        })
        res.data[i]['description'] = description
        rolesList.push(res.data[i])
      }
      that.setData({
        rolesList: rolesList,
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
  /************页面事件*************************************end*********************** */
})