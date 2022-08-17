// pages/purchaseOrderList/purchaseOrderList.js
const app = getApp();
import {
  filter_purchase_note
} from "../../services/warehouseProcurement.js"
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus
} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //跳转链接
    skipLinks: '/pages/purchaseOrderSearch/purchaseOrderSearch',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有采购单',

    // 采购单列表
    purchaseList: [],
    page_num: 1,
    page_size: 16,

    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false
  },

  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.data.purchaseList = []
  },

  /**
   * 加载数据
   */
  loadData() {
    let that = this;
    return new Promise(function (resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token(),
        pagination: {
          page: that.data.page_num,
          limit: that.data.page_size
        },
        sort: { 采购单提交时间: -1 }
      }
      if (app.globalData.isItAJumpFromTheSearchPage) {
        // 代表是按条件联合搜索跳转回来的。。数据已经拿到
        // 把res.data组合为 关联订单编号 和 所需采购原料 字段，但res.data不变
        var list = [];
        for (let i = 0; i < app.globalData.purchaseList.length; i++) {
          var purchase_note_data = app.globalData.purchaseList[i]
          var list_item = {
            采购单编号: purchase_note_data['采购单编号'],
            采购单日期: purchase_note_data['采购单日期'],
            采购单状态: purchase_note_data['采购单状态']
          }
          // 关联订单编号数组
          var relatedOrderIds = []
          for (var j = 0; j < purchase_note_data['关联订单列表'].length; j++) {
            relatedOrderIds.push(purchase_note_data['关联订单列表'][j])
          }
          list_item['关联订单编号'] = relatedOrderIds.join('; ')
          if (list_item['关联订单编号'].length === 0) {
            list_item['关联订单编号'] = '无关联订单'
          }
          // 所需采购原料
          var needPurchaseMaterial = []
          for (var j = 0; j < purchase_note_data['物料列表'].length; j++) {
            var need_purchase_item = ''
            var 物料的标签 = app.globalData.tagsOfMaterials()
            for (var index in 物料的标签) {
              need_purchase_item = need_purchase_item + purchase_note_data['物料列表'][j].tags[物料的标签[index]] + ' '
            }
            need_purchase_item = need_purchase_item + purchase_note_data['物料列表'][j]['目标购买数量'].toFixed(2) + ' ' + purchase_note_data['物料列表'][j]['单位']
            needPurchaseMaterial.push(need_purchase_item)
          }
          list_item[
            '所需采购原料'
          ] = needPurchaseMaterial.join('; ')
          list_item['unique_id'] = purchase_note_data['unique_id']
          list.push(list_item)
        }
        console.log(list)
        that.setData({
          purchaseList: that.data.purchaseList.concat(list),
          searchCondition: app.globalData.searchCondition,
          whetherToDisplayAConditionBox: true
        });
        return resolve('加载产品单信息成功！！')
      }
      //真正的查数据
      filter_purchase_note(parameter, that).then(res => {
        // 把res.data组合为 关联订单编号 和 所需采购原料 字段，但res.data不变
        var list = [];
        for (let i = 0; i < res.data.length; i++) {
          var purchase_note_data = res.data[i]
          var list_item = {
            采购单编号: purchase_note_data['采购单编号'],
            采购单日期: purchase_note_data['采购单日期'],
            采购单状态: purchase_note_data['采购单状态']
          }
          // 关联订单编号数组
          var relatedOrderIds = []
          for (var j = 0;j < purchase_note_data['关联订单列表'].length;j++) {
            relatedOrderIds.push(purchase_note_data['关联订单列表'][j])
          }
          list_item['关联订单编号'] = relatedOrderIds.join('; ')
          if (list_item['关联订单编号'].length === 0) {
            list_item['关联订单编号'] = '无关联订单'
          }
          // 所需采购原料
          var needPurchaseMaterial = []
          for (var j = 0; j < purchase_note_data['物料列表'].length; j++) {
            var need_purchase_item = ''
            var 物料的标签 = app.globalData.tagsOfMaterials()
            for (var index in 物料的标签) {
              need_purchase_item = need_purchase_item + purchase_note_data['物料列表'][j].tags[物料的标签[index]] + ' '
            }
            need_purchase_item = need_purchase_item + purchase_note_data['物料列表'][j]['目标购买数量'].toFixed(2) + ' ' + purchase_note_data['物料列表'][j]['单位']
            needPurchaseMaterial.push(need_purchase_item)
          }
          list_item[
            '所需采购原料'
          ] = needPurchaseMaterial.join('; ')
          list_item['unique_id'] = purchase_note_data['unique_id']
          list.push(list_item)
        }
        console.log(list)
        if (!list || list.length == 0) {
          noDataProcessingLogic(that);
          return resolve('没有更多数据了')
        } else {
          that.setData({
            purchaseList: that.data.purchaseList.concat(list),
          });
          resolve(res.msg)
        }
      })
    })
  },

  // 产品删除之后回调
  callbackAfterDeletion(e) {
    let that = this
    var purchaseInfo = e.detail.purchaseInfo
    var index = that.data.purchaseList.findIndex(item => {
      return item.unique_id === purchaseInfo.unique_id
    })
    if (index !== -1) {
      that.data.purchaseList.splice(index, 1)
      that.setData({
        purchaseList: that.data.purchaseList
      })
    }
  },

  // 清空搜索条件后回调
  clearingSearchCallback() {
    let that = this
    that.setData({
      whetherToDisplayAConditionBox: false,
    })
    app.globalData.isItAJumpFromTheSearchPage = false
    that.initData()
    that.loadData().then(res => {
      setStatus(that, false)
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
      that.loadData()
    } else {
      // 代表是从其他页面跳回来的 需要把purchaseList 还原为原来的数据
      that.data.purchaseList = []
      var b = 1
      const page_num = that.data.page_num
      for (var i = 1; i <= page_num; i++) {
        that.data.page_num = i
        that.loadData().then(res => {
          if (b === page_num) {
            setStatus(that, false)
          }
          b++;
        })
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
    });
    that.data.page_num = that.data.page_num + 1
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