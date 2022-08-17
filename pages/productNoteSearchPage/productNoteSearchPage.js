import {
  get_order_tag_names,
  order_tags_auto_complete,
  filter_production_note
} from "../../services/ordersForProductionScheduling.js";

import {
  product_tags_auto_complete
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
import {
  markedWords,
  isEmpty
} from "../../utils/util.js";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    order_tag_names: [],
    order_tag_filter: {},
    product_tag_names: [],
    product_tag_filter: {},
    // 是否正在发起请求
    isRequestIng: false,
    // 生产单编号
    productUniqueId: '',
    // 生产单状态
    multipleProductionNoteState: ['新生产单', '生产中'],
    array: [{
        name: "新生产单",
        value: "新生产单",
        checked: true,
      },
      {
        name: "生产中",
        value: "生产中",
        checked: true,
      },
      {
        name: "完成",
        value: "完成",
        checked: false,
      }
    ],
    // 获取焦点的那个订单标签输入框的 标签值列表（比如裆口的所有值）
    order_suggest_value_list: [],
    // 订单标签输入框 获取焦点的标签名称
    orderTagKeyFocus: '',
    // 获取焦点的那个产品标签标签输入框的 标签值列表（比如楦型的所有值）
    product_suggest_value_list: [],
    // 产品标签输入框 获取焦点的标签名称(比如 楦型)
    productTagKeyFocus: '',
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      orderTagKeyFocus: '',
      productTagKeyFocus: ''
    })
  },


  checkboxChange: function(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    this.setData({
      multipleProductionNoteState: e.detail.value
    })
  },

  // 获取订单标签
  getOrderTagNames() {
    let that = this
    return new Promise(function(resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token()
      }
      get_order_tag_names(parameter, that).then(res => {
        var order_tag_names = res.data
        var order_tag_filter = {}
        for (var index in order_tag_names) {
          order_tag_filter[order_tag_names[index]] = ''
        }
        that.setData({
          order_tag_filter: order_tag_filter
        })
        that.data.order_tag_names = order_tag_names
        resolve(true)
      })
    })
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
    that.data.product_tag_names = product_tag_names
  },

  // 输入生产单编号触发
  onInputProductUniqueId(e) {
    this.data.productUniqueId = e.detail.value
  },

  // 订单标签获取焦点的时候
  onFocusOrderTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.order_tag_filter,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      order_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          order_suggest_value_list: res.data,
          orderTagKeyFocus: e.currentTarget.dataset.tagname,
          productTagKeyFocus: '',
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 订单标签输入的时候触发
  onInputOrderTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.order_tag_filter[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.order_tag_filter,
      target_tag_name: tagname
    }
    order_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        order_suggest_value_list: res.data,
        isRequestIng: false
      })
    })
  },

  // 进行订单标签值选择的时候回调
  onOrderTagValueSelect(e) {
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    for (const key in this.data.order_tag_filter) {
      if (key === tagname) {
        this.data.order_tag_filter[key] = tagvalue
      }
    }
    this.setData({
      order_tag_filter: this.data.order_tag_filter,
      orderTagKeyFocus: ''
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
          orderTagKeyFocus: '',
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
    if (isEmpty(e.detail.keyCode)) return
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




  /**
   * 点击进行搜索的时候
   */
  onSubmit() {
    let that = this
    that.onTap()
    var login_token = app.globalData.login_token()
    var parameter = {
      login_token: login_token,
      生产单编号: that.data.productUniqueId,
      多个生产单状态: that.data.multipleProductionNoteState,
      '对应订单.tags': that.data.order_tag_filter,
      '排产产品.产品信息.tags': that.data.product_tag_filter,
      preview_flag: true,
      returned_fields: ['unique_id', '完成百分比', '对应订单', '排产产品', '生产单时间', '生产单状态', '生产单编号'],
      pagination: {
        page: 1,
        limit: 16
      },
      sort: {
        更新时间: -1
      },
    }
    app.globalData.parameter = parameter
    filter_production_note(parameter, that).then(res => {
      that.setData({
        isRequestIng: false
      })
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.productNoteList = res.data
        var 生产单状态_str = ''
        for (let i = 0; i < that.data.multipleProductionNoteState.length; i++) {
          生产单状态_str += that.data.multipleProductionNoteState[i] + (i === that.data.multipleProductionNoteState.length - 1 ? '' : '，');
        }
        app.globalData.searchCondition = {
          生产单编号: that.data.productUniqueId,
          生产单状态: 生产单状态_str,
          ...that.data.order_tag_filter,
          ...that.data.order_tag_filter,
          ...that.data.product_tag_filter
        }
        // 跳回生产单列表并指定为 不选中任何状态
        wx.reLaunch({
          url: '/pages/productionOrder/productionOrder?curSelectIndex=2'
        })
      }
    })
  },

  // 清空搜索条件
  onClear() {
    let that = this
    that.onTap()
    for (const key in this.data.order_tag_filter) {
      this.data.order_tag_filter[key] = ''
    }
    for (const key in this.data.product_tag_filter) {
      this.data.product_tag_filter[key] = ''
    }

    that.setData({
      order_tag_filter: this.data.order_tag_filter,
      product_tag_filter: this.data.product_tag_filter,
      productUniqueId: '',
      order_suggest_value_list: [],
      orderTagKeyFocus: '',
      product_suggest_value_list: [],
      productTagKeyFocus: ''
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.orderDebouncedHandleSearch = debounce(this.onInputOrderTag, 1500)
    this.productDebouncedHandleSearch = debounce(this.onInputProductTag, 1500)
    this.submitThrottleHandle = throttle(this.onSubmit, 3000, { leading: true, trailing: false })
    // 获取订单标签
    that.getOrderTagNames().then(res => {
      //获取产品标签
      that.getProductTagNames()
      that.setData({
        isRequestIng: false
      })
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
})