const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  client_tags_auto_complete,
  filter_client
} from "../../services/customer.js";

import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    client_tag_filter: {},
    // 获取焦点的那个客户标签输入框的 标签值列表（比如裆口的所有值）
    client_suggest_value_list: [],
    // 客户标签输入框 获取焦点的标签名称
    clientTagKeyFocus: '',

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      clientTagKeyFocus: ''
    })
  },


  // 获取客户标签
  getclientTagNames() {
    let that = this
    var client_tag_names = app.globalData.clientTag()
    var client_tag_filter = {}
    for (var index in client_tag_names) {
      client_tag_filter[client_tag_names[index]] = ''
    }
    that.setData({
      client_tag_filter: client_tag_filter
    })
  },

  // 客户标签获取焦点的时候
  onFocusClientTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.client_tag_filter,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      client_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          client_suggest_value_list: res.data,
          clientTagKeyFocus: e.currentTarget.dataset.tagname,
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 客户标签输入的时候触发
  onInputClientTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode))return
    that.data.client_tag_filter[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.client_tag_filter,
      target_tag_name: tagname
    }
    client_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        client_suggest_value_list: res.data,
        isRequestIng: false
      })
    })
  },
  // 进行客户标签值选择的时候回调
  onClientTagValueSelect(e) {
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    for (const key in this.data.client_tag_filter) {
      if (key === tagname) {
        this.data.client_tag_filter[key] = tagvalue
      }
    }
    this.setData({
      client_tag_filter: this.data.client_tag_filter,
      clientTagKeyFocus: ''
    })
  },


  formSubmit: function(e) {
    let that = this
    that.onTap()
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 16
      },
      sort: {
        更新时间: -1
      }
    }
    if (!isEmpty(e.detail.value['名称'])) {
      parameter['名称'] = e.detail.value['名称']
    }
    if (!isEmpty(e.detail.value['地址'])) {
      parameter['地址'] = e.detail.value['地址']
    }
    if (!isEmpty(e.detail.value['电话'])) {
      parameter['电话'] = e.detail.value['电话']
    }
    parameter['tags'] = that.data.client_tag_filter

    app.globalData.parameter = parameter
    filter_client(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.clientList = res.data
        app.globalData.isItAJumpFromTheSearchPage = true
        app.globalData.searchCondition = {
          名称: e.detail.value['名称'],
          电话: e.detail.value['电话'],
          地址: e.detail.value['地址'],
          ...that.data.client_tag_filter
        }
        // 跳回客户列表并指定为 不选中任何状态
        wx.navigateBack({
          url: '/pages/clientList_applicationFunction/clientList_applicationFunction'
        })
      }
    })
  },
  formReset: function() {
    let that = this
    console.log('form发生了reset事件')
    that.onTap()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.clientDebouncedHandleSearch = debounce(this.onInputClientTag, 1500)
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, { leading: true, trailing: false })
    // 获取客户标签
    that.getclientTagNames()
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
  /************页面事件*************************************end*********************** */
})