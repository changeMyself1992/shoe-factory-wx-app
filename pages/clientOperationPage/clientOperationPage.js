const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
  validateCustomerName,
  detectMobilePhoneNumber,
  isValidSpecialPlane,
  deepClone
} from "../../utils/util.js"

import {
  client_tags_auto_complete,
  edit_client_by_id,
  add_client
} from "../../services/customer.js";
import throttle from "../../utils/lodash/throttle.js";
import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面模式 addClient（添加客户），lookOver（查看客户），editClient（编辑客户）
    mode: '',
    form: null,
    // 获取焦点的那个客户标签输入框的 标签值列表（比如裆口的所有值）
    client_suggest_value_list: [],
    // 客户标签输入框 获取焦点的标签名称
    clientTagKeyFocus: '',

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 标题的初始化
  titleInitialization(options) {
    let that = this
    if (!isEmpty(options) && options.mode === 'addClient') {
      wx.setNavigationBarTitle({
        title: '添加客户'
      })
    } else if (!isEmpty(options) && options.mode === 'lookOver') {
      wx.setNavigationBarTitle({
        title: '查看客户'
      })
    } else if (!isEmpty(options) && options.mode === 'editClient') {
      wx.setNavigationBarTitle({
        title: '编辑客户'
      })
    } else {
      return
    }
    that.setData({
      mode: options.mode
    })
  },

  // 初始化form
  initializationForm() {
    let that = this
    return new Promise(function(resolve, reject) {
      if (that.data.mode === 'addClient') {
        that.setData({
          form: deepClone(app.globalData['空客户结构'])
        })
        // 获取客户标签
        that.getClientTagNames()

      } else if (that.data.mode === 'lookOver') {
        that.setData({
          form:  app.globalData.clientDetails
        })
      } else if (that.data.mode === 'editClient') {
        that.setData({
          form: app.globalData.clientDetails
        })
      }
    })

  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      clientTagKeyFocus: ''
    })
  },


  // 获取客户标签
  getClientTagNames() {
    let that = this
    var client_tag_names = app.globalData.clientTag()
    var client_tag_filter = {}
    for (var index in client_tag_names) {
      client_tag_filter[client_tag_names[index]] = ''
    }
    that.setData({
      'form.tags': client_tag_filter
    })
  },

  // 客户标签获取焦点的时候
  onFocusClientTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.form.tags,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      client_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          client_suggest_value_list: res.data,
          clientTagKeyFocus: e.currentTarget.dataset.tagname,
          isRequestIng: false
        })
      })
    }, 200);
  },

  // 客户标签输入的时候触发
  onInputClientTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode)) return
    that.data.form.tags[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.form.tags,
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
    for (const key in this.data.form.tags) {
      if (key === tagname) {
        this.data.form.tags[key] = tagvalue
      }
    }
    this.setData({
      "form.tags": this.data.form.tags,
      clientTagKeyFocus: ''
    })
  },


  formSubmit: function(e) {
    let that = this
    that.onTap()
    if (!app.globalData.theirOwnRights()['客户管理可写']) {
      markedWords("无此操作权限")
      return
    }
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (!validateCustomerName(e.detail.value['名称'])) {
      markedWords('名称必填，字符限制17位以内，首尾不能有空白！')
      return
    }
    if (e.detail.value['电话'] !== '' && !detectMobilePhoneNumber(e.detail.value['电话']) && !isValidSpecialPlane(e.detail.value['电话'])) {
      markedWords('请输入正确得手机号或者座机')
      return
    }
    // if (isEmpty(e.detail.value['地址'])) {
    //   markedWords('请输入地址！')
    //   return
    // }

    if (that.data.mode === 'addClient') {
      var post_data = {
        login_token: app.globalData.login_token(),
        data: {
          tags: that.data.form.tags,
          名称: e.detail.value['名称'],
          电话: e.detail.value['电话'],
          地址: e.detail.value['地址'],
          备注: e.detail.value['备注']
        }
      }
      // 添加客户信息
      add_client(post_data, that).then(res => {
        setStatus(that, false)
        markedWords(res.msg)
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/clientList_applicationFunction/clientList_applicationFunction'
          })
        }, 2000);
      })

    } else if (that.data.mode === 'editClient') {
      var parameter = {
        login_token: app.globalData.login_token(),
        unique_id: that.data.form.unique_id,
        update_data: {
          tags: that.data.form.tags,
          名称: e.detail.value['名称'],
          电话: e.detail.value['电话'],
          地址: e.detail.value['地址'],
          备注: e.detail.value['备注']
        }
      }
      edit_client_by_id(parameter, that).then(res => {
        setStatus(that, false)
        markedWords('修改成功','success',1500)
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500);
      })
    }
  },
  formReset: function() {
    let that = this
    that.onTap()
    console.log('form发生了reset事件')
    // 页面初始化流程
    that.initializationForm()
  },
  cancelBtnClick: function() {
    let that = this
    wx.navigateBack()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.clientDebouncedHandleSearch = debounce(this.onInputClientTag, 1500)
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, { leading: true, trailing: false })
    that.titleInitialization(options)
    // 页面初始化流程
    that.initializationForm().then(res => {

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