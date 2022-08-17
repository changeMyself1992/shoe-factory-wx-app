// pages/warehousePurchaseOrderImport/warehousePurchaseOrderImport.js
const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  filter_purchase_note,
  edit_purchase_note_by_id,
  inventory_change_via_operation
} from "../../services/warehouseProcurement.js";

import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //是否正在发起请求
    isRequestIng: false,
    // 搜索的采购单编号
    orderNumID:'',

    // 采购单列表
    pucharseOrderList: [],
    // 被选采购单对应数据
    checkedSupplierList: [],
    // 让所有的选项都成为未选中状态
    currentindex: -1
  },
  // 点击选项卡时的js
  chooseItem: function (e) {
    //记录当前点击的对象的序号
    var currentindex = e.currentTarget.dataset.index;
    this.setData({
      currentindex: currentindex,
      pucharseOrderListItem: this.data.pucharseOrderList[currentindex]
    })
    var checkedSupplierList = this.data.pucharseOrderList[currentindex]['物料列表']
    this.setData({
      checkedSupplierList: checkedSupplierList
    })
  },

  // 物料搜索
  searchOrderNum() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: { page: 1, limit: 100 },
      采购单状态: "等待",
      sort: { 采购单日期: -1 },
      采购单编号: that.data.orderNumID
    }
    filter_purchase_note(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        console.log(res.data)
        that.setData({
          pucharseOrderList: res.data
        })
      }
    })
  },
  inputOrderNum(e) {
    let that = this
    that.setData({
      orderNumID: e.detail.value
    })
  },
  // 更新采购单状态
  updataPurchaseOrder(){
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      unique_id: that.data.pucharseOrderListItem.unique_id,
      update_data: { 采购单状态: "完成" }
    }
    edit_purchase_note_by_id(parameter, that).then(res => {
      setStatus(that, false)
    })
  },
  // 提交入库
  formSubmitInOutStock: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var that = this
    var checkedSupplierList = that.data.checkedSupplierList
    var pucharseOrderListItem = that.data.pucharseOrderListItem
    var parameter = {
      login_token: app.globalData.login_token(),
      事件类型: '入库',
      关联采购单:{
        unique_id: pucharseOrderListItem.unique_id,
        采购单编号: pucharseOrderListItem['采购单编号'],
        采购单日期: pucharseOrderListItem['采购单日期']
      }
    }
    var 物料变更列表 = []
    for (var i = 0; i < checkedSupplierList.length; i++) {
      var item = {
        unique_id: checkedSupplierList[i].unique_id,
        物料编号: checkedSupplierList[i]['物料编号'],
        tags: checkedSupplierList[i].tags,
        该物料变更数量: parseFloat(e.detail.value['stocknum' + i]),
        单位: checkedSupplierList[i]['单位'],
        供应商信息: checkedSupplierList[i]['供应商信息']
      }
      物料变更列表.push(item)
    }
    for (var i = 0; i < 物料变更列表.length; i++) {
      if (物料变更列表[i]['供应商信息']['仓库剩余数量'] !== 0 && 物料变更列表[i]['该物料变更数量'] === 0) {
        markedWords('入库数量不能为0')
        return false
      }
    }
    parameter['物料变更列表'] = 物料变更列表
    console.log(parameter['物料变更列表'])
    inventory_change_via_operation(parameter, that).then(res => {
      setStatus(that, false)
      if (res.status === 'OK') {
        that.updataPurchaseOrder()
        markedWords('入库成功~', 'succes', 1500)
        setTimeout(function () {
          wx.navigateBack()
        }, 1500)
      }
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    
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