const app = getApp();
import {
  filter_order
} from "../../services/ordersForProductionScheduling.js"
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
    //跳转链接
    skipLinks: '/pages/orderSearchPage/orderSearchPage?mode=orderList',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有订单',

    // 订单列表
    orderList: [],
    page_num: 1,
    page_size: 16,

    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false,

    // 交货日期排序样式
    deliveryDateSortStyle: 'iconfont icon-shangxiajiantou',
    // 订单日期排序样式
    orderDateSortStyle: 'iconfont icon-shangxiajiantou',
    // 更新时间排序样式  icon-triangle-bottom icon-triangle-top
    updateTheTimeSortStyle: 'iconfont icon-triangle-bottom selected',
    // 三种排序方式 0不排序 1升序 -1降序
    daindex1: 0, // 交货日期
    daindex2: 0, // 订单日期
    daindex3: -1, // 更新时间
  },


  choosesort1: function (e) {
    let that = this
    if (that.data.daindex1 == 0) {
      that.setData({
        deliveryDateSortStyle: "iconfont icon-triangle-top selected",
        daindex1: 1
      })
    } else if (that.data.daindex1 == 1) {
      that.setData({
        deliveryDateSortStyle: "iconfont icon-triangle-bottom selected",
        daindex1: -1
      })
    } else if (that.data.daindex1 == -1) {
      that.setData({
        deliveryDateSortStyle: "iconfont icon-shangxiajiantou",
        daindex1: 0
      })
    }
    that.initData()
    that.loadData(app.globalData.parameter, false, false, true).then(res => {
      setStatus(that, false)
    })
  },
  choosesort2: function (e) {
    let that = this
    if (that.data.daindex2 == 0) {
      that.setData({
        orderDateSortStyle: "iconfont icon-triangle-top selected",
        daindex2: 1
      })
    } else if (that.data.daindex2 == 1) {
      that.setData({
        orderDateSortStyle: "iconfont icon-triangle-bottom selected",
        daindex2: -1
      })
    } else if (that.data.daindex2 == -1) {
      that.setData({
        orderDateSortStyle: "iconfont icon-shangxiajiantou",
        daindex2: 0
      })
    }
    that.initData()
    that.loadData(app.globalData.parameter, false, false, true).then(res => {
      setStatus(that, false)
    })
  },
  choosesort3: function (e) {
    let that = this
    if (that.data.daindex3 == 0) {
      that.setData({
        updateTheTimeSortStyle: "iconfont icon-triangle-top selected",
        daindex3: 1
      })
    } else if (that.data.daindex3 == 1) {
      that.setData({
        updateTheTimeSortStyle: "iconfont icon-triangle-bottom selected",
        daindex3: -1
      })
    } else if (that.data.daindex3 == -1) {
      that.setData({
        updateTheTimeSortStyle: "iconfont icon-shangxiajiantou",
        daindex3: 0
      })
    }
    that.initData()
    that.loadData(app.globalData.parameter, false, false, true).then(res => {
      setStatus(that, false)
    })
  },


  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.data.orderList = []
  },

  /**
   * 加载数据
   * parameter(请求的参数)
   * isPullDownRefresh（是否是下拉刷新函数在调用）
   * isReach(是否是上拉触底函数在调用)
   * isSort(是否是排序条件触发的)
   */
  loadData(parameter = null, isPullDownRefresh = false, isReach = false, isSort = false) {
    let that = this;
    return new Promise(function (resolve, reject) {
      if (app.globalData.isItAJumpFromTheSearchPage && !isPullDownRefresh && !isReach && !isSort) {
        // 代表是按条件联合搜索跳转回来的。。数据已经拿到
        that.combinedOrderList(app.globalData.orderList)
        that.setData({
          orderList: that.data.orderList.concat(app.globalData.orderList),
          searchCondition: app.globalData.searchCondition,
          whetherToDisplayAConditionBox: true
        });
        return resolve('加载订单单信息成功！！')
      } else if (app.globalData.isItAJumpFromTheSearchPage && isPullDownRefresh && !isReach && !isSort) {
        // 代表是按条件联合搜索跳转回来的。。要进行下拉刷新
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
      } else if (app.globalData.isItAJumpFromTheSearchPage && !isPullDownRefresh && isReach && !isSort) {
        // 代表是按条件联合搜索跳转回来的。。要进行上拉加载
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
      } else if (app.globalData.isItAJumpFromTheSearchPage && isSort) {
        // 代表是按条件联合搜索跳转回来的。并且更改过排序方式 要用我们当前的排序方式
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
        parameter.sort = {}
        if (that.data.daindex1 != 0) {
          parameter.sort['交货日期'] = that.data.daindex1
        }
        if (that.data.daindex2 != 0) {
          parameter.sort['订单日期'] = that.data.daindex2
        }
        if (that.data.daindex3 != 0) {
          parameter.sort['更新时间'] = that.data.daindex3
        }
      } else {
        parameter = {
          login_token: app.globalData.login_token(),
          pagination: {
            page: that.data.page_num,
            limit: that.data.page_size
          },
          sort: {}
        }
        if (that.data.daindex1 != 0) {
          parameter.sort['交货日期'] = that.data.daindex1
        }
        if (that.data.daindex2 != 0) {
          parameter.sort['订单日期'] = that.data.daindex2
        }
        if (that.data.daindex3 != 0) {
          parameter.sort['更新时间'] = that.data.daindex3
        }
      }
      //真正的查数据
      filter_order(parameter, that).then(res => {
        var list = res.data;
        if (!list || list.length == 0) {
          noDataProcessingLogic(that);
          that.setData({
            orderList: that.data.orderList
          });
          return resolve('没有更多数据了')
        } else {
          // 组合list的数据
          that.combinedOrderList(list)
          that.setData({
            orderList: that.data.orderList.concat(list),
          });
          resolve(res.msg)
        }
      })
    })
  },

  // 组合orderList
  combinedOrderList(list) {
    for (let i = 0; i < list.length; i++) {
      var element = list[i];
      // 计算订单的目标总数
      var count = 0
      element['包含的产品'].forEach(item => {
        count += item['配码数量']['总数']
      })
      element.productCount = count
      // 计算订单的已排产总数
      count = 0
      element['包含的产品'].forEach(item => {
        count += item['配码数量']['已经排产数量']
      })
      element.haveCompletedSeveral = count
      // 计算总进度
      element["订单完成总进度"] = Number((parseFloat(element['订单完成百分比']) * 100).toFixed(2))
    }
  },

  // 订单删除之后回调
  callbackAfterDeletion(e) {
    let that = this
    var orderInfo = e.detail.orderInfo
    var index = that.data.orderList.findIndex(item => {
      return item.unique_id === orderInfo.unique_id
    })
    if (index !== -1) {
      that.data.orderList.splice(index, 1)
      that.setData({
        orderList: that.data.orderList
      })
    }
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
  onShow: async function () {
    let that = this;
    if (app.globalData.isItAJumpFromTheSearchPage) {
      // 代表是从搜索页面跳回来的
      that.initData();
      that.loadData()
    } else {
      // 代表是从其他页面跳回来的 需要把orderList 还原为原来的数据
      that.data.orderList = []
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
    that.loadData(app.globalData.parameter, true, false).then(res => {
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
    if (that.data.isRequestIng) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true
    });
    that.data.page_num = that.data.page_num + 1
    that.loadData(app.globalData.parameter, false, true).then(res => {
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