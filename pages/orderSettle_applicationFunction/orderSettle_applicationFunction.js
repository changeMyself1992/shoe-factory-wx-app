const app = getApp();
import {
  order_settle_stats,
  order_settle_filter_items,
  order_settle_edit
} from "../../services/ordersForProductionScheduling.js"
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus,
  deepClone
} from "../../utils/util.js";
import regeneratorRuntime from '../../utils/runtime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //跳转链接
    skipLinks: '/pages/orderSearchPage/orderSearchPage?mode=orderAndSettlement',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有订单结算记录',

    // 结算记录列表
    listOfSettlementRecords: [],
    // 订单结算的响应
    orderSettleResponse: {},
    // 结算状态可编辑的行数字
    theSettlementStatusEditableRows: 0,

    orderTag: [],
    productTag: [],

    page_num: 1,
    page_size: 5,
    // 订单结算数据总量
    total_count: 0,
    // 最大页数(传递给分页器)
    maxPage: 1,
    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false
  },

  initData() {
    let that = this;
    that.setData({
      page_num: 1,
      page_size: 5
    })
    that.data.listOfSettlementRecords = []
  },

  /**
   * 加载数据
   */
  loadData: function (e) {
    let that = this;
    return new Promise(async function (resolve, reject) {
      var parameter_a = {}
      var parameter_b = {}
      // 如果是从搜索页面跳转回来的
      if (app.globalData.isItAJumpFromTheSearchPage) {
        if (app.globalData.订单结算统计数据 && app.globalData.订单结算条目数据) {
          // 如果是第一次从搜索页面跳转回来,代表已经拿到了数据
          that.setData({
            whetherToDisplayAConditionBox: true,
            searchCondition: app.globalData.searchCondition
          });
          that.callbackAfterConditionQuery(app.globalData.订单结算统计数据.data, app.globalData.订单结算条目数据.data['结算记录列表'], app.globalData.订单结算条目数据.total_count)
          app.globalData.订单结算统计数据 = null
          app.globalData.订单结算条目数据 = null
          return resolve()
        } else {
          // 使用搜索页面保存下来的查询参数重新去请求数据了
          parameter_a = app.globalData.parameter_a
          parameter_b = app.globalData.parameter_b
          parameter_b.pagination.page = that.data.page_num
          parameter_b.pagination.limit = that.data.page_size
        }
      } else {
        parameter_a = {
          login_token: app.globalData.login_token()
        }
        parameter_b = {
          login_token: app.globalData.login_token(),
          pagination: {
            page: that.data.page_num,
            limit: that.data.page_size
          },
          sort: {
            更新时间: -1
          }
        }
      }
      // 查结算统计
      var res_a = await order_settle_stats(parameter_a, that)
      //查 结算记录列表
      var res_b = await order_settle_filter_items(parameter_b, that)
      for (var i = 0; i < res_b.data['结算记录列表'].length;i++){
        var ele = res_b.data['结算记录列表'][i]['包含的产品_结算情况_发货时间']
        if (!ele && typeof (ele) != 'undefined' && ele != 0) {
          console.log('123')
          res_b.data['结算记录列表'][i]['包含的产品_结算情况_发货时间'] = ''
        }
      }
      var list = res_b.data['结算记录列表'];
      if (!list || list.length == 0) {
        noDataProcessingLogic(that);
        resolve('没有更多数据了')
      } else {
        that.callbackAfterConditionQuery(res_a.data, res_b.data.结算记录列表, res_b.total_count)
        if (e && e.detail.callback) {
          e.detail.callback(that)
        }
        resolve()
      }
    })
  },

  // 条件查询之后回调
  callbackAfterConditionQuery(结算统计, 结算记录列表, total_count) {
    let that = this
    for (let i = 0; i < 结算记录列表.length; i++) {
      var element = 结算记录列表[i]
      element['结算状态是否可编辑'] = false
      element['配码数量是否展开'] = false
      element['订单完成百分比'] = Number(parseFloat(element['订单完成百分比']).toFixed(2))
    }

    that.setData({
      orderSettleResponse: 结算统计,
      listOfSettlementRecords: 结算记录列表,
      total_count: total_count,
      maxPage: Math.ceil(total_count / that.data.page_size),
    })
  },

  // 子组件更新自身结算记录后回调
  settlementDataUpdate(info) {
    let that = this
    // 1.更新listOfSettlementRecords
    // 子组件传递过来的 结算记录元素
    var settlementRecordInfo = info.detail.settlementRecordInfo
    // 子组件传递过来的 结算记录元素在listOfSettlementRecords中的索引
    var settlementRecordsIndex = info.detail.settlementRecordsIndex
    var listOfSettlementRecords = that.data.listOfSettlementRecords
    listOfSettlementRecords[settlementRecordsIndex] = settlementRecordInfo
    that.setData({
      listOfSettlementRecords: listOfSettlementRecords
    })
  },

  // 子组件点击编辑后回调
  callbackAfterEdit(info) {
    let that = this
    // 1.更新listOfSettlementRecords
    // 子组件传递过来的 结算记录元素
    var settlementRecordInfo = info.detail.settlementRecordInfo
    // 子组件传递过来的 结算记录元素在listOfSettlementRecords中的索引
    var settlementRecordsIndex = info.detail.settlementRecordsIndex
    var listOfSettlementRecords = that.data.listOfSettlementRecords
    listOfSettlementRecords[settlementRecordsIndex] = settlementRecordInfo
    that.setData({
      listOfSettlementRecords: listOfSettlementRecords
    })

    //2. 计算 结算记录列表，是否只有一行的结算状态是否可编辑
    var count = 0
    for (let i = 0; i < listOfSettlementRecords.length; i++) {
      const element = listOfSettlementRecords[i]
      if (element['结算状态是否可编辑']) {
        count += 1
      }
    }
    that.setData({
      theSettlementStatusEditableRows: count
    })
    // 3. 把这个bool值通知到所有子组件
    var list = that.selectAllComponents("#order-item");
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      element.updateTheSettlementStatusEditableRows(that.data.theSettlementStatusEditableRows)
    }
  },

  // 子组件点击全部提交后回调
  async callbacksAfterAllCommits() {
    let that = this
    var listOfSettlementRecords = that.data.listOfSettlementRecords
    // 1.把需要提交的行全部找出来
    var rows = listOfSettlementRecords.filter(item => {
      return item['结算状态是否可编辑'] === true
    })
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      var parameter = {
        login_token: app.globalData.login_token(),
        订单unique_id: row.订单编号,
        产品unique_id: row.产品unique_id,
        结算情况: {
          结算状态: row['包含的产品_结算情况_结算状态'],
          产品单价: row['包含的产品_结算情况_产品单价'],
          产品订单应收: row['包含的产品_结算情况_产品订单应收'],
          产品订单实收: row['包含的产品_结算情况_产品订单实收'],
          发货数量: row['包含的产品_结算情况_发货数量'],
          发货时间: row['包含的产品_结算情况_发货时间'],
          备注: row['包含的产品_结算情况_备注']
        }
      }
      await order_settle_edit(parameter, that)
    }
    // 重新查询
    await that.loadData()
    setStatus(that, false)
    markedWords('订单的结算状态全部修改成功！！')
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
  },

  // 分页点击事件
  selectPage(e) {
    let that = this
    var value = Number(e.detail)
    console.log('分页选择事件回调：', value)
    that.setData({
      page_num: value
    })
    that.loadData().then(res => {
      setStatus(that, false)
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({

      orderTag: app.globalData.orderTag(),
      productTag: app.globalData.productTag()
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
    let that = this;
    if (app.globalData.isItAJumpFromTheSearchPage) {
      // 代表是从搜索页面跳回来的
      that.initData();
      that.loadData().then(res => {
        setStatus(that, false)
      })
    } else {
      that.loadData().then(res => {
        setStatus(that, false)
      })
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
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  /************页面事件*************************************end*********************** */
})