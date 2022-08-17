import {
  delete_order_by_id,
  filter_production_note
} from "../../../../services/ordersForProductionScheduling.js"
import {
  markedWords
} from "../../../../utils/util.js";
import throttle from "../../../../utils/lodash/throttle.js";
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderInfo: {
      type: Object
    },
    // //目标总数
    // productCount:{
    //   type:Number
    // },
    // // 已排产总数
    // haveCompletedSeveral:{
    //   type:Number
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng:false,
  },

  attached: function () {
    this.lookerProductNoteThrottleHandle = throttle(this.onLookerProductNoteBtnClick, 3000, { leading: true, trailing: false })
    this.editThrottleHandle = throttle(this.onEditBtnClick, 3000, { leading: true, trailing: false })
    this.lookThrottleHandle = throttle(this.onLookBtnClick, 3000, { leading: true, trailing: false })
  },


  /**
   * 组件的方法列表
   */
  methods: {
    //当查看生产单按钮点击
    onLookerProductNoteBtnClick(e){
      let that = this
      var login_token = app.globalData.login_token()
      var parameter = {
        login_token: login_token,
        "对应订单.订单编号": that.data.orderInfo['订单编号'],
        preview_flag: true,
        sort: {
          更新时间: -1
        },
      }
      filter_production_note(parameter, that).then(res => {
        that.setData({
          isRequestIng: false
        })
        if (res.data.length === 0) {
          markedWords('没有搜索到任何数据')
        } else {
          app.globalData.productNoteList = res.data
          app.globalData.searchCondition = {
            '对应的订单编号': that.data.orderInfo['订单编号']
          }
          // 跳回生产单列表并指定为 不选中任何状态
          wx.reLaunch({
            url: '/pages/productionOrder/productionOrder?curSelectIndex=2'
          })
        }
      })
    },
    // 编辑按钮点击
    onEditBtnClick(e) {
      if (!app.globalData.theirOwnRights()['订单管理可写']){
        markedWords("无此操作权限")
        return
      }
      app.globalData.orderDetails = this.data.orderInfo
      wx.navigateTo({
        url: '/pages/orderOperationPage/orderOperationPage?mode=editOrder',
      })
    },
    // 查看按钮点击
    onLookBtnClick(e){
      app.globalData.orderDetails = this.data.orderInfo
      wx.navigateTo({
        url: '/pages/orderOperationPage/orderOperationPage?mode=lookOver',
      })
    },
    // 分享点击
    onShare(e) {
      let that = this
      app.globalData.orderDetails = this.data.orderInfo
      wx.navigateTo({
        url: '/pages/orderSharePage/orderSharePage',
      })
    },
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['订单管理可写']) {
        markedWords("无此操作权限")
        return
      }
      var orderInfo = e.currentTarget.dataset.orderinfo
      wx.showModal({
        title: '提示',
        content: `确认要删除订单${orderInfo['订单编号']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: orderInfo['unique_id']
            }
            // 调用api 删除相应的产品
            delete_order_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng:false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                orderInfo: orderInfo
              })
            })
          }
        }
      })
    }
  },

})