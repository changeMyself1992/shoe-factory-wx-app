import {
  delete_order_by_id,
  filter_production_note
} from "../../services/ordersForProductionScheduling.js"
import {
  markedWords
} from "../../utils/util.js";
import throttle from "../../utils/lodash/throttle.js";
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 员工信息
    orderInfo: {
      type: Object
    },
    // 是否展示按钮框
    whetherToShowTheButtonBox:{
      type:Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng: false,
    //目标总数
    productCount: 0,
    // 已排产总数
    haveCompletedSeveral: 0,
    // 订单是否已完成排产
    whetherOrNotFinished: false,
    // 是否展示按钮框
    whetherToShowTheButtonBox: true
  },

  attached: function () {
    this.arrangeThrottleHandle = throttle(this.onArrangeBtnClick, 3000, { leading: true, trailing: false })
  },

  observers: {
    'orderInfo': function (orderInfo) {
      let that = this
      that.calculateTheTargetTotalForTheOrder(orderInfo)
      that.calculateTheTotalNumberOfScheduledOrders(orderInfo)
      that.calculateWhetherTheOrderHasbeenFinished()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击进行排产xiaocxv
    onArrangeBtnClick(e) {
      if (!app.globalData.theirOwnRights()['生产单详情可写']) {
        markedWords("无此操作权限")
        return
      }
      app.globalData.orderDetails = this.data.orderInfo
      wx.navigateTo({
        url: '/pages/generateProductNote/generateProductNote',
      })
    },
    // 计算订单的目标总数
    calculateTheTargetTotalForTheOrder(orderInfo) {
      let that = this
      var count = 0
      orderInfo['包含的产品'].forEach(item => {
        count += item['配码数量']['总数']
      })
      that.setData({
        productCount: count
      })
    },
    // 计算订单的已排产总数
    calculateTheTotalNumberOfScheduledOrders(orderInfo) {
      let that = this
      var count = 0
      orderInfo['包含的产品'].forEach(item => {
        count += item['配码数量']['已经排产数量']
      })
      that.setData({
        haveCompletedSeveral: count
      })
    },
    // 计算订单是否已完成排产
    calculateWhetherTheOrderHasbeenFinished() {
      let that = this
      if (that.data.haveCompletedSeveral >= that.data.productCount) {
        that.setData({
          whetherOrNotFinished: true
        })
      } else {
        that.setData({
          whetherOrNotFinished: false
        })
      }
    }
  },

})