const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  filter_product
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";

import {
  product_tags_auto_complete
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    updateTimeStartDate: '',
    updateTimeEndDate: '',
    product_tag_filter: {},
    // 获取焦点的那个产品标签标签输入框的 标签值列表（比如楦型的所有值）
    product_suggest_value_list: [],
    // 产品标签输入框 获取焦点的标签名称(比如 楦型)
    productTagKeyFocus: '',

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      productTagKeyFocus: ''
    })
  },

  //日期选择
  bindDateChange: function(e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '更新时间段开始') {
      this.setData({
        updateTimeStartDate: e.detail.value
      })
    } else if (mode === '更新时间段结束') {
      this.setData({
        updateTimeEndDate: e.detail.value
      })
    }
  },

  //获取产品标签
  getProductTagNames() {
    let that = this
    var product_tag_names = app.globalData.productTag()
    var product_tag_filter = {}
    for (var index in product_tag_names) {
      product_tag_filter[product_tag_names[index]] = ''
    }
    that.setData({
      product_tag_filter: product_tag_filter
    })
  },

  // 产品标签获取焦点的时候
  onFocusProductTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.product_tag_filter,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      product_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          product_suggest_value_list: res.data,
          productTagKeyFocus: e.currentTarget.dataset.tagname,
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 产品标签输入的时候触发
  onInputProductTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
     // 手机端点选的时候会触发input事件，所以我们要做判断
     if (isEmpty(e.detail.keyCode))return
    that.data.product_tag_filter[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.product_tag_filter,
      target_tag_name: tagname
    }
    product_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        product_suggest_value_list: res.data,
        isRequestIng: false
      })
    })
  },
  // 进行产品标签值选择的时候回调
  onProductTagValueSelect(e) {
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    for (const key in this.data.product_tag_filter) {
      if (key === tagname) {
        this.data.product_tag_filter[key] = tagvalue
      }
    }
    this.setData({
      product_tag_filter: this.data.product_tag_filter,
      productTagKeyFocus: ''
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
    if (!isEmpty(e.detail.value['产品编号'])) {
      parameter['产品编号'] = e.detail.value['产品编号']
    }
    // 如果俩个时间都输入了那么作比较
    if (!isEmpty(e.detail.value['更新时间段开始']) && !isEmpty(e.detail.value['更新时间段结束'])) {
      parameter['更新时间_下限'] = e.detail.value['更新时间段开始']
      parameter['更新时间_上限'] = e.detail.value['更新时间段结束']
      if (new Date(parameter['更新时间_下限']) > new Date(parameter['更新时间_上限'])) {
        markedWords("开始时间必须小于结束时间！")
        return
      }
    } else if (!isEmpty(e.detail.value['更新时间段开始']) && isEmpty(e.detail.value['更新时间段结束'])) {
      markedWords("更新时间段是个范围，开始和结束时间都要选择！")
      return
    } else if (isEmpty(e.detail.value['更新时间段开始']) && !isEmpty(e.detail.value['更新时间段结束'])) {
      markedWords("更新时间段是个范围，开始和结束时间都要选择！")
      return
    }
    parameter['tags'] = that.data.product_tag_filter
    app.globalData.parameter = parameter
    filter_product(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.productList = res.data
        var searchCondition = {
          产品编号: e.detail.value['产品编号'],
          更新时间段开始: e.detail.value['更新时间段开始'],
          更新时间段结束: e.detail.value['更新时间段结束'],
          ...that.data.product_tag_filter
        }
        app.globalData.searchCondition = searchCondition
        app.globalData.isItAJumpFromTheSearchPage = true
        // 跳回待排产物料列表并指定为 不选中任何状态
        wx.navigateBack({
          url: '/pages/productList_applicationFunction/productList_applicationFunction'
        })
      }
    })
  },
  formReset: function() {
    let that = this
    that.onTap()
    console.log('form发生了reset事件')
    that.getProductTagNames()
    that.setData({
      updateTimeStartDate: '',
      updateTimeEndDate: ''
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.productDebouncedHandleSearch = debounce(this.onInputProductTag, 1500)
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, { leading: true, trailing: false })
    //获取产品标签
    that.getProductTagNames()

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