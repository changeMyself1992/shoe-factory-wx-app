// pages/supplierOperationPage/supplierOperationPage.js
const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
  isValidSpecialPlane,
  deepClone
} from "../../utils/util.js"

import {
  add_supplier,
  check_supplier_info_by_key_word
} from "../../services/supplier.js";
import regeneratorRuntime from '../../utils/runtime.js'
import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    form: {
      名称: '',
      地址: '',
      联系电话: '',
      备注: '',
      tags: []
    },
    // 工厂名称输入框是否获取了焦点
    factoryNmaeFocus: false,
    // 工厂信息列表
    factoryInformationList: [],
    //是否正在发起请求
    isRequestIng: false
  },
  // 当工厂名称获取焦点的时候
  onFocusFactoryName(e) {
    let that = this
    var value = e.detail.value
    var paramter = {
      关键字: value,
      login_token: app.globalData.login_token()
    }
    check_supplier_info_by_key_word(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        factoryInformationList: res.data['供应商信息列表'],
        factoryNmaeFocus: res.data['供应商信息列表'].length > 0 ? true : false,
        nameAndSpecificationFocus: false
      })
    })
  },

  // 当工厂名称输入的时候
  onInputFactorName(e) {
    let that = this
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.form['名称'] = value
    var paramter = {
      关键字: value,
      login_token: app.globalData.login_token()
    }

    check_supplier_info_by_key_word(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        factoryInformationList: res.data['供应商信息列表'],
        factoryNmaeFocus: res.data['供应商信息列表'].length > 0 ? true : false
      })
      that.theProcessingLogicAfterTheFactoryNameIsEntered()
    })
  },

  // 工厂名称进行选择的时候
  onFactoryNameSelect(e) {
    let that = this
    var factory = e.currentTarget.dataset.factory
    that.data.form['名称'] = factory['名称']
    that.setData({
      factoryNmaeFocus: false
    })
    that.theProcessingLogicAfterTheFactoryNameIsEntered()
  },

  // 工厂名称输入后的处理逻辑
  theProcessingLogicAfterTheFactoryNameIsEntered() {
    let that = this
    // 1.判断当前工厂名称 是否能在factoryInformationList中能找到
    var factorName = that.data.form['名称']
    var i = that.data.factoryInformationList.findIndex(item => {
      return item['名称'] === factorName
    })
    if (i !== -1) {
      // 如果找到了 
      that.data.form['名称'] = that.data.factoryInformationList[i]['名称']
      that.data.form['地址'] = that.data.factoryInformationList[i]['地址']
      that.data.form['联系电话'] = that.data.factoryInformationList[i]['联系电话']
    } else {
      return
    }
    that.setData({
      form: that.data.form
    })
  },
  // 地址和电话失去焦点
  addressblur(e) {
    let that = this
    var address = e.detail.value
    that.data.form['地址'] = address
  },
  telblur(e) {
    let that = this
    var tel = e.detail.value
    that.data.form['联系电话'] = tel
  },
  formSubmit: function(e) {
    setTimeout(() => {
      let that = this
      if (!app.globalData.theirOwnRights()['供应商信息可写']) {
        markedWords("无此操作权限")
        return
      }
      console.log('form发生了submit事件，携带数据为：', e.detail.value)
      var form = that.data.form
      if (form['地址'] == '') {
        markedWords('供应商地址不能为空')
        return false
      }
      if (form['名称'] == '') {
        markedWords('供应商名称不能为空')
        return false
      }
      if (form['联系电话'] == '') {
        markedWords('供应商联系电话不能为空')
        return false
      }
      var post_data = {
        login_token: app.globalData.login_token(),
        data: form
      }
      post_data.data['备注'] = e.detail.value['备注']
      var factoryInformationList = that.data.factoryInformationList
      if (factoryInformationList.length == 0) {
        wx.showModal({
          title: '提示',
          content: '是否添加一个全新的供应商?',
          success(res) {
            if (res.confirm) {
              // 添加供应商信息
              add_supplier(post_data, that).then(res => {
                setStatus(that, false)
                markedWords(res.msg)
                that.setData({
                  form: {
                    名称: '',
                    地址: '',
                    联系电话: '',
                    备注: '',
                    tags: []
                  }
                })
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        // 添加供应商信息
        add_supplier(post_data, that).then(res => {
          setStatus(that, false)
          markedWords(res.msg)
          that.setData({
            form: {
              名称: '',
              地址: '',
              联系电话: '',
              备注: '',
              tags: []
            }
          })
        })
      }
    }, 200)
  },
  formReset: function() {
    let that = this
    console.log('form发生了reset事件')
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.factoryNameDebouncedHandleSearch = debounce(this.onInputFactorName, 1000)
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