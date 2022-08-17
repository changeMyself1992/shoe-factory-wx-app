const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
  deepClone
} from "../../utils/util.js"

import {
  get_supplier_transaction_info_by_key_word,
  filter_supplier_transactions
} from "../../services/supplier.js";
import throttle from "../../utils/lodash/throttle.js";
import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 记录时间下限
    recordTime_floor: '',
    // 记录时间上限
    recordTime_upper: '',
    // 交易状态选项
    // 送货单状态
    transactionStatusOptions0: [
      { name: '未确认', value: '未确认' },
      { name: '已确认', value: '已确认' },
      { name: '已结算', value: '已结算' },
      { name: '待作废', value: '待作废' },
      { name: '已作废', value: '已作废' }
    ],
    // 退货单状态
    transactionStatusOptions1: [
      { name: '待退货', value: '待退货' },
      { name: '已退货', value: '已退货' },
      { name: '待作废', value: '待作废' },
      { name: '已作废', value: '已作废' }
    ],
    // 现结单状态
    transactionStatusOptions2: [
      { name: '未结算', value: '未结算' },
      { name: '已结算', value: '已结算' }
    ],
    // 流水单类型
    curSelectIndex: null,
    curType:null,
    // 名称及规格
    nameAndSpecification: '',
    // 按关键词搜索到的名称及列表 操作项
    nameAndSpecificationList: [],
    // 名称及列表输入框是否获取了焦点
    nameAndSpecificationFocus: false,
    //搜索成功后的跳转链接
    searchForJumpLinksAfterSuccess: "/pages/supplierDeliveryNote_applicationFunction/supplierDeliveryNote_applicationFunction",


    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  initData() {
    let that = this
    that.setData({
      recordTime_floor: '',
      recordTime_upper: '',
      nameAndSpecification: ''
    })
  },

  //日期选择
  bindDateChange: function(e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '记录时间_下限') {
      this.setData({
        recordTime_floor: e.detail.value
      })
    } else if (mode === '记录时间_上限') {
      this.setData({
        recordTime_upper: e.detail.value
      })
    }
  },

  // 当名称及规格获取焦点的时候
  onFocusNameAndSpecification(e) {
    let that = this
    setTimeout(() => {
      var value = e.detail.value
      var paramter = {
        关键字: value,
        login_token: app.globalData.login_token()
      }
      get_supplier_transaction_info_by_key_word(paramter, that).then(res => {
        setStatus(that, false)
        that.setData({
          nameAndSpecificationList: res.data['送货单信息列表'],
          nameAndSpecificationFocus: true
        })
      })
    }, 200);
  },

  // 当名称及规格失去焦点的时候
  onBlurNameAndSpecification(e) {
    setTimeout(() => {
      this.setData({
        nameAndSpecificationFocus: false
      })
    }, 100);
  },

  // 当名称及规格输入的时候
  onInputNameAndSpecification(e) {
    let that = this
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode)) return
    that.data.nameAndSpecification = value
    var paramter = {
      关键字: value,
      login_token: app.globalData.login_token()
    }

    get_supplier_transaction_info_by_key_word(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        nameAndSpecificationList: res.data['送货单信息列表'],
        nameAndSpecificationFocus: res.data['送货单信息列表'].length === 0 ? false : true
      })
    })
  },

  // 当名称及规格进行选择的时候
  onNameAndSpecificationSelect(e) {
    let that = this
    var value = e.currentTarget.dataset.name
    that.setData({
      nameAndSpecificationFocus: false,
      nameAndSpecification: value
    })
  },

  formSubmit: function(e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 16
      },
      流水单类型: that.data.curType,
      sort: {
        更新时间: -1
      }
    }
    if (!isEmpty(e.detail.value['货号'])) {
      parameter['货号'] = e.detail.value['货号']
    }
    if (!isEmpty(e.detail.value['送货单位经手人手机'])) {
      parameter['送货单位经手人手机'] = e.detail.value['送货单位经手人手机']
    }
    if (!isEmpty(e.detail.value['收货单位经手人手机'])) {
      parameter['收货单位经手人手机'] = e.detail.value['收货单位经手人手机']
    }
    if (!isEmpty(e.detail.value['名称及规格'])) {
      parameter['名称及规格'] = e.detail.value['名称及规格']
    }
    if (!isEmpty(e.detail.value['记录时间_下限']) && !isEmpty(e.detail.value['记录时间_上限'])) {
      if (new Date(e.detail.value['记录时间_下限']) >= new Date(e.detail.value['记录时间_上限'])) {
        markedWords('下限时间必须小于上限时间')
        return
      }
      parameter['记录时间_下限'] = e.detail.value['记录时间_下限']
      parameter['记录时间_上限'] = e.detail.value['记录时间_上限']
    }
    if (!isEmpty(e.detail.value['交易状态'])) {
      parameter['交易状态'] = e.detail.value['交易状态']
    }
    app.globalData.parameter = parameter
    filter_supplier_transactions(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.deliveryNoteList = res.data
        var new_parameter = deepClone(parameter)
        new_parameter['记录时间_起'] = new_parameter['记录时间_下限']
        new_parameter['记录时间_止'] = new_parameter['记录时间_上限']
        delete new_parameter.login_token
        delete new_parameter.sort
        delete new_parameter.pagination
        delete new_parameter['记录时间_下限']
        delete new_parameter['记录时间_上限']
        console.log(new_parameter)
        var searchCondition = {
          ...new_parameter
        }
        app.globalData.searchCondition = searchCondition
        app.globalData.isItAJumpFromTheSearchPage = true
        // 跳回待排产物料列表并指定为 不选中任何状态
        wx.navigateBack({
          url: that.data.searchForJumpLinksAfterSuccess
        })
      }
    })
  },
  formReset: function() {
    let that = this
    console.log('form发生了reset事件')
    that.initData()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.nameAndSpecificationDebouncedHandleSearch = debounce(this.onInputNameAndSpecification, 1000)
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, { leading: true, trailing: false })
    if (!isEmpty(options) && options.curSelectIndex) {
      if (Number(options.curSelectIndex) == 0) {
        that.setData({
          curType: ["送货单"],
          curSelectIndex: 0
        })
        wx.setNavigationBarTitle({
          title: '条件搜索送货单',
        })
      } else if (Number(options.curSelectIndex) == 1) {
        that.setData({
          curType: ["退货单"],
          curSelectIndex: 1
        })
        wx.setNavigationBarTitle({
          title: '条件搜索退货单',
        })
      } else if (Number(options.curSelectIndex) == 2) {
        that.setData({
          curType: ["现结单"],
          curSelectIndex: 2
        })
        wx.setNavigationBarTitle({
          title: '条件搜索现结单',
        })
      }
    }
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