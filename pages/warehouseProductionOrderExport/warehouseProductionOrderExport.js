// pages/warehouseProductionOrderExport/warehouseProductionOrderExport.js
const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  generate_exit_inventory_by_product_note,
  inventory_change_via_operation
} from "../../services/warehouseProcurement.js";
import {
  filter_production_note
} from "../../services/ordersForProductionScheduling.js";

import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //是否正在发起请求
    isRequestIng: false,
    // 搜索的生产单编号
    orderNumID: '',

    // 生产单列表
    productionOrderList: [],
    // 被选生产单对应数据
    exportData: [],
    // 被选生产单的物料变更列表
    productMaterialList:[],
    // 被选中的生产单号index
    orderIndex: null,
    // checkbox
    ischeck: false,
    // 定义选过的生产单数组
    orderIdArr:[]
  },
  // 复选框选择生产单
  checkboxChange: function (e) {
    var that = this
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    var orderid = e.detail.value
    // 定义选过的生产单数组
    var orderIdArr = that.data.orderIdArr
    if (orderid.length > 0) {
      // 若已存在则返回
      var user = orderIdArr.findIndex((item) => {
        return item === orderid[0]
      })
      console.log(user)
      if (user == -1) {
        orderIdArr.push(orderid[0])
        that.updataPurchaseOrder(orderid[0])
        that.setData({
          orderIdArr: orderIdArr
        })
      }
    }
  },

  // 生产单搜索
  searchOrderNum() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: { page: 1, limit: 200 },
      sort: { 更新时间: -1 },
      preview_flag: true,
      生产单编号: that.data.orderNumID,
      多个生产单状态: ["新生产单", "生产中"]
    }
    filter_production_note(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        console.log(res.data)
        that.setData({
          productionOrderList: res.data
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

  // 删除物料清单某一项
  deleteMaterialListItem(e){
    var that = this
    var currentindex = e.currentTarget.dataset.index;
    var productMaterialList = that.data.productMaterialList
    var exportData = that.data.exportData
    // 先删除生产单ID数组中的
    var orderIdArr = that.data.orderIdArr
    var index = orderIdArr.findIndex((item) => {
      return item === exportData[currentindex]['关联生产单'].unique_id
    })
    if (index!=-1){
      orderIdArr.splice(index, 1)
      that.setData({
        orderIdArr: orderIdArr
      })
    }

    // 再移除物料清单中的item
    productMaterialList.splice(currentindex, 1)
    exportData.splice(currentindex,1)
    that.setData({
      productMaterialList: productMaterialList,
      exportData: exportData
    })
  },
  // 根据生产单生成出库API成功
  updataPurchaseOrder(orderid) {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      生产单编号: orderid
    }
    generate_exit_inventory_by_product_note(parameter, that).then(res => {
      setStatus(that, false)
      for (var i = 0; i < res.data['物料变更列表'].length;i++){
        res.data['物料变更列表'][i]['该物料变更数量'] = Math.abs(res.data['物料变更列表'][i]['该物料变更数量'])
      }
      that.setData({
        exportData: that.data.exportData.concat(res.data),
        productMaterialList: that.data.productMaterialList.concat(res.data['物料变更列表']),
      })
    })
  },
  // 提交入库
  formSubmitInOutStock: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var that = this
    var productMaterialList = that.data.productMaterialList
    for (var i = 0; i < productMaterialList.length; i++) {
      productMaterialList[i]['该物料变更数量'] = parseFloat(-(e.detail.value['stocknum' + i]))
    }
    for (var i = 0; i < productMaterialList.length; i++) {
      if (parseFloat(e.detail.value['stocknum' + i]) > productMaterialList[i]['供应商信息']['仓库剩余数量']) {
        markedWords(`物料编号: ${productMaterialList[i].物料编号}，该物料领取数量不得多余该物料在库数量`)
      }
    }
    var parameter = {
      login_token: app.globalData.login_token(),
      事件类型: '出库',
      关联生产单: that.data.exportData[0]['关联生产单'],
      物料变更列表: productMaterialList
    }
    inventory_change_via_operation(parameter, that).then(res => {
      setStatus(that, false)
      if (res.status === 'OK') {
        markedWords('出库成功~', 'succes', 1500)
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