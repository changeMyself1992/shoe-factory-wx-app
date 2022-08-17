const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
  deepClone
} from "../../utils/util.js"

import {
  order_tags_auto_complete,
  filter_order,
  order_settle_stats,
  order_settle_filter_items,
  filter_need_schedule_order
} from "../../services/ordersForProductionScheduling.js";

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
    // 订单状态索引
    orderStatusIndex: -1,
    orderStartDate: '',
    orderEndDate: '',
    deliveryStartDate: '',
    deliveryEndDate: '',


    order_tag_filter: {},
    product_tag_filter: {},
    // 获取焦点的那个订单标签输入框的 标签值列表（比如裆口的所有值）
    order_suggest_value_list: [],
    // 订单标签输入框 获取焦点的标签名称
    orderTagKeyFocus: '',
    // 获取焦点的那个产品标签标签输入框的 标签值列表（比如楦型的所有值）
    product_suggest_value_list: [],
    // 产品标签输入框 获取焦点的标签名称(比如 楦型)
    productTagKeyFocus: '',

    // orderAndSettlement(订单结算查询模式)，pendingProductionOrder（待排产订单查询模式），orderList（订单列表查询模式）
    mode: 'orderAndSettlement',
    settlementStatusOptions: [{
        name: '未发货',
        value: '未发货'
      },
      {
        name: '发货中',
        value: '发货中',
      },
      {
        name: '已发货',
        value: '已发货'
      },
      {
        name: '结算中',
        value: '结算中'
      },
      {
        name: '已结算',
        value: '已结算'
      },
      {
        name: '订单取消',
        value: '订单取消'
      },
      {
        name: '订单无法收款',
        value: '订单无法收款'
      }
    ],
    orderStatusOptions: [{
        name: '新订单',
        value: '新订单',
      },
      {
        name: '排产中',
        value: '排产中',
      },
      {
        name: '完成',
        value: '完成',
      }
    ],
    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 状态选择后调用
  bindPickerChange: function (e) {
    this.setData({
      orderStatusIndex: Number(e.detail.value)
    })
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      orderTagKeyFocus: '',
      productTagKeyFocus: ''
    })
  },

  //日期选择
  bindDateChange: function (e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '订单开始日期') {
      this.setData({
        orderStartDate: e.detail.value
      })
    } else if (mode === '订单结束日期') {
      this.setData({
        orderEndDate: e.detail.value
      })
    } else if (mode === '交货开始日期') {
      this.setData({
        deliveryStartDate: e.detail.value
      })
    } else if (mode === '交货结束日期') {
      this.setData({
        deliveryEndDate: e.detail.value
      })
    }
  },

  // 获取订单标签
  getOrderTagNames() {
    let that = this
    var order_tag_names = app.globalData.orderTag()
    var order_tag_filter = {}
    for (var index in order_tag_names) {
      order_tag_filter[order_tag_names[index]] = ''
    }
    that.setData({
      order_tag_filter: order_tag_filter
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
          orderTagKeyFocus: res.data.length > 0 ? e.currentTarget.dataset.tagname : '',
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
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.product_tag_filter,
      target_tag_name: e.currentTarget.dataset.tagname
    }
    product_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        product_suggest_value_list: res.data,
        productTagKeyFocus: res.data.length > 0 ? e.currentTarget.dataset.tagname : '',
        orderTagKeyFocus: '',
        isRequestIng: false
      })
    })

  },

  // 产品标签输入的时候触发
  onInputProductTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
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

  formSubmit: function (e) {
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
    if (!isEmpty(e.detail.value['订单编号'])) {
      parameter['订单编号'] = e.detail.value['订单编号']
    }
    if (!isEmpty(e.detail.value['订单开始日期'])) {
      parameter['订单日期_下限'] = e.detail.value['订单开始日期']
    }
    if (!isEmpty(e.detail.value['订单结束日期'])) {
      parameter['订单日期_上限'] = e.detail.value['订单结束日期']
    }
    if (!isEmpty(e.detail.value['交货开始日期'])) {
      parameter['交货日期_下限'] = e.detail.value['交货开始日期']
    }
    if (!isEmpty(e.detail.value['交货结束日期'])) {
      parameter['交货日期_上限'] = e.detail.value['交货结束日期']
    }
    if (!isEmpty(e.detail.value['结算状态'])) {
      parameter['结算状态'] = e.detail.value['结算状态']
    }
    if (!isEmpty(e.detail.value['订单状态'])) {
      parameter['订单状态'] = e.detail.value['订单状态']
    }
    parameter.tags = that.data.order_tag_filter
    parameter['产品tags'] = that.data.product_tag_filter
    // 如果是订单列表查询模式
    if (that.data.mode === 'orderList') {
      app.globalData.parameter = parameter
      filter_order(parameter, that).then(res => {
        setStatus(that, false)
        if (res.data.length === 0) {
          markedWords('没有搜索到任何数据')
        } else {
          app.globalData.orderList = res.data
          var searchCondition = {
            订单编号: e.detail.value['订单编号'],
            订单状态: isEmpty(e.detail.value['订单状态']) ? null : e.detail.value['订单状态'],
            结算状态: isEmpty(e.detail.value['结算状态']) ? null : e.detail.value['结算状态'],
            订单开始日期: e.detail.value['订单开始日期'],
            订单结束日期: e.detail.value['订单结束日期'],
            交货开始日期: e.detail.value['交货开始日期'],
            交货结束日期: e.detail.value['交货结束日期'],
            ...that.data.order_tag_filter,
            ...that.data.product_tag_filter
          }
          app.globalData.searchCondition = searchCondition
          app.globalData.isItAJumpFromTheSearchPage = true
          // 跳回订单列表并指定为 不选中任何状态
          wx.navigateBack({
            url: '/pages/orderList_applicationFunction/orderList_applicationFunction'
          })
        }
      })
    }
    // 如果是 待排产订单查询模式
    else if (that.data.mode === 'pendingProductionOrder') {
      app.globalData.parameter = parameter
      filter_need_schedule_order(parameter, that).then(res => {
        setStatus(that, false)
        if (res.data.length === 0) {
          markedWords('没有搜索到任何数据')
        } else {
          app.globalData.orderList = res.data
          var searchCondition = {
            订单编号: e.detail.value['订单编号'],
            订单状态: isEmpty(e.detail.value['订单状态']) ? null : e.detail.value['订单状态'],
            结算状态: isEmpty(e.detail.value['结算状态']) ? null : e.detail.value['结算状态'],
            订单开始日期: e.detail.value['订单开始日期'],
            订单结束日期: e.detail.value['订单结束日期'],
            交货开始日期: e.detail.value['交货开始日期'],
            交货结束日期: e.detail.value['交货结束日期'],
            ...that.data.order_tag_filter,
            ...that.data.product_tag_filter
          }
          app.globalData.searchCondition = searchCondition
          app.globalData.isItAJumpFromTheSearchPage = true
          // 跳回订单列表并指定为 不选中任何状态
          wx.navigateBack({
            url: '/pages/arrangedOrderList_applicationFunction/arrangedOrderList_applicationFunction'
          })
        }
      })
    }
    // 如果是 订单结算查询模式
    else if (that.data.mode === 'orderAndSettlement') {
      var parameter_a = deepClone(parameter)
      delete parameter_a.pagination
      delete parameter_a.sort
      app.globalData.parameter_a = parameter_a
      order_settle_stats(parameter_a, that).then(res => {
        var 结算统计 = res
        var parameter_b = deepClone(parameter)
        parameter_b.pagination.limit = 5
        order_settle_filter_items(parameter_b, that).then(res => {
          setStatus(that, false)
          var list = res.data['结算记录列表'];
          if (!list || list.length == 0) {
            markedWords('没有搜索到任何数据')
          } else {
            app.globalData.parameter_b = parameter_b
            app.globalData.订单结算统计数据 = 结算统计
            app.globalData.订单结算条目数据 = res
            var searchCondition = {
              订单编号: e.detail.value['订单编号'],
              订单状态: isEmpty(e.detail.value['订单状态']) ? null : e.detail.value['订单状态'],
              结算状态: isEmpty(e.detail.value['结算状态']) ? null : e.detail.value['结算状态'],
              订单开始日期: e.detail.value['订单开始日期'],
              订单结束日期: e.detail.value['订单结束日期'],
              交货开始日期: e.detail.value['交货开始日期'],
              交货结束日期: e.detail.value['交货结束日期'],
              ...that.data.order_tag_filter,
              ...that.data.product_tag_filter
            }
            app.globalData.searchCondition = searchCondition
            app.globalData.isItAJumpFromTheSearchPage = true
            // 跳回订单结算列表
            wx.navigateBack({
              url: '/pages/orderSettle_applicationFunction/orderSettle_applicationFunction'
            })
          }
        })
      })

    }
  },
  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
    this.initData()
  },

  initData() {
    let that = this
    // pendingProductionOrder（待排产订单查询模式）
    if (that.data.mode === 'pendingProductionOrder') {
      that.setData({
        orderStatusOptions: [{
            name: '新订单',
            value: '新订单',
          },
          {
            name: '排产中',
            value: '排产中',
          }
        ]
      })
    }

    that.setData({
      orderTagKeyFocus: '',
      productTagKeyFocus: '',
      orderStartDate: '',
      orderEndDate: '',
      deliveryStartDate: '',
      deliveryEndDate: ''
    })

    // 获取订单标签
    that.getOrderTagNames()
    //获取产品标签
    that.getProductTagNames()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.orderDebouncedHandleSearch = debounce(this.onInputOrderTag, 1500)
    this.productDebouncedHandleSearch = debounce(this.onInputProductTag, 1500)
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, {
      leading: true,
      trailing: false
    })
    // 获取订单标签
    that.getOrderTagNames()
    //获取产品标签
    that.getProductTagNames()

    // 设置订单搜索模式
    if (!isEmpty(options) && options.mode) {
      that.setData({
        mode: options.mode
      })
    }
    // 根据订单搜索模式初始化订单选中状态
    var orderStatusOptions = that.data.orderStatusOptions
    // pendingProductionOrder（待排产订单查询模式）
    if (that.data.mode === 'pendingProductionOrder') {
      that.setData({
        orderStatusOptions: [{
            name: '新订单',
            value: '新订单',
          },
          {
            name: '排产中',
            value: '排产中',
          }
        ]
      })
    }
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