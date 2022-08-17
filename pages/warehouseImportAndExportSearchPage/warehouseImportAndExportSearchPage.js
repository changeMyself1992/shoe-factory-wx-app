// pages/warehouseImportAndExportSearchPage/warehouseImportAndExportSearchPage.js
const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  filter_warehouse_material_event
} from "../../services/warehouseProcurement.js";

import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 搜索类型 出库export还是入库import
    type:'',
    updateTimeStart: '',
    updateTimeEnd: '',

    //搜索成功后的跳转链接 入库
    searchForJumpLinksAfterSuccessImport: "/pages/warehouseImport_applicationFunction/warehouseImport_applicationFunction",
    //搜索成功后的跳转链接 出库
    searchForJumpLinksAfterSuccessExport: "/pages/warehouseExport_applicationFunction/warehouseExport_applicationFunction",

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  //日期选择
  bindDateChange: function (e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '更新时间段开始') {
      this.setData({
        updateTimeStart: e.detail.value
      })
    } else if (mode === '更新时间段截止') {
      this.setData({
        updateTimeEnd: e.detail.value
      })
    }
  },

  formSubmit: function (e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 16
      },
      sort: {
        更新时间: -1
      },
      是否返回物料详细信息: true
    }

    if (!isEmpty(e.detail.value['更新时间段开始']) && !isEmpty(e.detail.value['更新时间段截止'])) {
      if (new Date(e.detail.value['更新时间段开始']) >= new Date(e.detail.value['更新时间段截止'])) {
        markedWords('开始时间必须小于截止时间')
        return
      }
      parameter['事件时间_下限'] = e.detail.value['更新时间段开始']
      parameter['事件时间_上限'] = e.detail.value['更新时间段截止']
    }
    if (that.data.type == 'export') {
      parameter['事件类型'] = '出库'
    } else if (that.data.type == 'import') {
      parameter['事件类型'] = '入库'
    }
    app.globalData.parameter = parameter
    filter_warehouse_material_event(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        var material_event_items = []
        for (var i = 0; i < res.data.length; i++) {
          var data_item = res.data[i]
          var process_item = {
            unique_id: data_item['unique_id'],
            事件时间: data_item['事件时间'],
            事件类型: data_item['事件类型'],
            登记员: data_item['提交人']['姓名'],
            物料编号: data_item['物料变更']['物料编号'],
            单位: data_item['物料变更']['单位'],
            materialTags: data_item['物料变更']['tags'],
            备注: isEmpty(data_item['备注']) ? '' : data_item['备注'],
            该物料变更数量: Math.abs(data_item['物料变更']['该物料变更数量']),
            变更前仓库数量: Math.abs(data_item['物料变更']['变更前仓库数量']),
            tags: data_item['物料变更'].tags
          }
          material_event_items.push(process_item)
        }
        app.globalData.warehouseEventList = material_event_items
        var searchCondition = {
          更新时间段开始: e.detail.value['更新时间段开始'],
          更新时间段截止: e.detail.value['更新时间段截止']
        }
        app.globalData.isItAJumpFromTheSearchPage = true
        app.globalData.searchCondition = searchCondition
        // 跳回待排产物料列表并指定为 不选中任何状态
        if (that.data.type == 'export') {
          wx.navigateBack({
            url: that.data.searchForJumpLinksAfterSuccessExport
          })
        } else if (that.data.type == 'import') {
          wx.navigateBack({
            url: that.data.searchForJumpLinksAfterSuccessImport
          })
        }
      }
    })
  },
  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var type = options.type
    if (type == 'import') {
      wx.setNavigationBarTitle({
        title: '条件搜索入库事件记录'
      })
    } else if (type == 'export') {
      wx.setNavigationBarTitle({
        title: '条件搜索出库事件记录'
      })
    }
    this.setData({
      type: type
    })
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