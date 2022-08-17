// pages/warehouseExport_applicationFunction/warehouseExport_applicationFunction.js
const app = getApp();
import {
  filter_warehouse_material_event
} from "../../services/warehouseProcurement.js"
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus
} from "../../utils/util.js";
import regeneratorRuntime from "../../utils/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //跳转链接 出库
    skipLinks: '/pages/warehouseImportAndExportSearchPage/warehouseImportAndExportSearchPage?type=export',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有出库事件',

    // 仓库事件列表
    warehouseEventList: [],
    // 选中的流水单unique_ids
    multipleSelection: [],
    page_num: 1,
    page_size: 16,

    isSwitch: false,
    // module-b 的margin-top
    marginTop: "0px",

    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false
  },

  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.data.warehouseEventList = []
  },

  /**
   * 加载数据
   */
  loadData() {
    let that = this;
    return new Promise(function (resolve, reject) {
      if (app.globalData.isItAJumpFromTheSearchPage) {
        // 代表是按条件联合搜索跳转回来的。。数据已经拿到
        that.setData({
          warehouseEventList: app.globalData.warehouseEventList,
          searchCondition: app.globalData.searchCondition,
          whetherToDisplayAConditionBox: true
        })
        resolve()
      } else {
        var parameter = {
          login_token: app.globalData.login_token(),
          pagination: {
            page: that.data.page_num,
            limit: that.data.page_size
          },
          sort: {
            事件时间: -1
          },
          事件类型: '出库',
          是否返回物料详细信息: true
        }
        //真正的查数据
        filter_warehouse_material_event(parameter, that).then(res => {
          var list = res.data;
          if (!list || list.length == 0) {
            noDataProcessingLogic(that);
            return resolve('没有更多数据了')
          } else {
            var material_event_items = []
            for (var i = 0; i < res.data.length; i++) {
              var data_item = res.data[i]
              // // 如果入库数量0 跳转下一次循环
              // if (Math.abs(data_item['物料变更列表'][j]['该物料变更数量']) === 0)
              //   continue
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
              if (data_item['物料变更']['供应商信息']) {
                process_item['供应商名称'] = data_item['物料变更']['供应商信息']['名称']
                process_item['供应商物料名称'] = data_item['物料变更']['供应商信息']['供应商物料名称']
              }
              material_event_items.push(process_item)
            }
            that.setData({
              warehouseEventList: that.data.warehouseEventList.concat(material_event_items),
            });
            resolve(res.msg)
          }
        })
      }
    })
  },

  // 操作流水单之后回调（确认，删除,结算）
  callbackAfterOption: async function (e) {
    let that = this
    if (app.globalData.isItAJumpFromTheSearchPage) {
      that.initData()
      that.loadData().then(res => {
        setStatus(that, false)
        that.setMarginTop()
      })
    } else {
      that.data.warehouseEventList = []
      var b = 1
      const page_num = that.data.page_num
      for (var i = 1; i <= page_num; i++) {
        that.data.page_num = i
        await that.loadData()
        if (b === page_num) {
          setStatus(that, false)
        }
        b++;
      }
      markedWords(e.detail.msg)
    }
  },

  // 流水单选择之后回调
  callbackAfterSelect(e) {
    let that = this
    var selectInfo = e.detail.selectInfo
    var multipleSelection = that.data.multipleSelection
    if (selectInfo.mode === 'selected') {
      multipleSelection.push(selectInfo.unique_id)
    } else {
      multipleSelection = multipleSelection.filter(unique_id => {
        return unique_id !== selectInfo.unique_id
      })
    }
    that.setData({
      multipleSelection: multipleSelection
    })
  },

  // 清空搜索条件后回调
  clearingSearchCallback() {
    let that = this
    that.setData({
      whetherToDisplayAConditionBox: false
    })
    app.globalData.isItAJumpFromTheSearchPage = false
    that.initData()
    that.loadData().then(res => {
      setStatus(that, false)
    })
    that.setMarginTop()
  },

  // 手动出库
  handInStock(e) {
    let that = this
    wx.navigateTo({
      url: '/pages/warehouseHandMoveImportAndExport/warehouseHandMoveImportAndExport?type=export',
    })
  },
  // 生产单出库
  orderInStock(e) {
    let that = this
    wx.navigateTo({
      url: '/pages/warehouseProductionOrderExport/warehouseProductionOrderExport',
    })
  },

  // 设置marginTop
  setMarginTop() {
    // 需要获取固定定位的高度，来设置module-b 的margin-top
    let that = this
    wx.createSelectorQuery().select('#fixedBatch').boundingClientRect(function (rect) {
      // rect.height // 节点的高度
      var marginTop = rect.height + 10
      that.setData({
        marginTop: marginTop + "px"
      })
    }).exec()
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
    let that = this
    that.setMarginTop()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function (options) {
    let that = this;
    if (app.globalData.isItAJumpFromTheSearchPage) {
      // 代表是从搜索页面跳回来的
      that.initData()
      that.loadData().then(res => {
        setStatus(that, false)
        that.setMarginTop()
      })
    } else {
      // 代表是从其他页面跳回来的 需要把warehouseEventList 还原为原来的数据
      that.data.warehouseEventList = []
      var b = 1
      const page_num = that.data.page_num
      for (var i = 1; i <= page_num; i++) {
        that.data.page_num = i
        await that.loadData()
        if (b === page_num) {
          setStatus(that, false)
        }
        b++;
      }
    }
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
    //重置数据
    let that = this;
    that.initData();
    that.loadData().then(res => {
      wx.stopPullDownRefresh();
      setStatus(that, false)
    }).catch(err => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    // 如果正在发起请求，或者是从搜索页面回来的 那么直接退
    if (that.data.isRequestIng || app.globalData.isItAJumpFromTheSearchPage) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
      page_num: that.data.page_num + 1
    });
    that.loadData().then(res => {
      if (res === '没有更多数据了') {
        that.data.page_num = that.data.page_num - 1
      } else {
        setStatus(that, false)
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  /************页面事件*************************************end*********************** */
})