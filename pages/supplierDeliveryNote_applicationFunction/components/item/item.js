import {
  delete_supplier_transaction_by_id,
  confirm_supplier_transaction_by_id,
  settle_supplier_transaction_by_id,
  settle_cash_supplier_transaction,
  delete_cash_supplier_transaction_by_id
} from "../../../../services/supplier.js"
import {
  warehouse_confirm_refund_transaction_by_id,
  warehouse_delete_refund_transaction_by_id
} from "../../../../services/returnSupplierGoods.js"
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
    info: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 是否正在发起请求
    isRequestIng: false,
    // 是否正在点击按钮
    isClickIng: false,
    delivery: [
      // {
      //   name:"123",
      //   value:"123"
      // }
    ],
    // 是否展开已作废货单
    unfold:-1,

    // 是否显示确认按钮
    displayAffirmBtn: false,
    // 是否激活确认按钮
    activeAffirmBtn: false,


    // 是否显示确认退货按钮
    displayReturnBtn: false,
    // 是否显示作废退货单按钮
    displayDelReturnBtn: false,
    // 是否显示确认作废退货单按钮
    displaySureDelReturnBtn: false,

    // 是否激活确认退货按钮
    activeReturnBtn: false,
    // 是否激活作废退货单按钮
    activeDelReturnBtn: false,
    // 是否激活确认作废退货单按钮
    activeSureDelReturnBtn: false,

    //   等待供应商  确认送货按钮
    waitingAffirmBtn: false,
    //   等待供应商  确认退货按钮
    waitingReturnBtn: false,
    //   等待供应商  确认作废退货单按钮
    waitingSureDelReturnBtn: false,
  },

  attached: function () {
    // this.settleThrottleHandle = throttle(this.onSettleBtnClick, 3000, { leading: true, trailing: false })
    this.editThrottleHandle = throttle(this.onEditBtnClick, 3000, { leading: true, trailing: false })
    this.affirmThrottleHandle = throttle(this.onAffirmBtnClick, 3000, { leading: true, trailing: false })
    this.sureReturnThrottleHandle = throttle(this.sureReturnClick, 3000, { leading: true, trailing: false })
    this.delReturnThrottleHandle = throttle(this.delReturnClick, 3000, { leading: true, trailing: false })
    this.sureDelReturnThrottleHandle = throttle(this.sureDelReturnClick, 3000, { leading: true, trailing: false })
    this.delCashThrottleHandle = throttle(this.delCashClick, 3000, { leading: true, trailing: false })
  },

  observers: {
    'info': function(info) {
      let that = this
      this.initData()
      var delivery = []
      delivery.push({
        name: info.unique_id,
        value: info.unique_id,
        checked: false
      })
      // console.log(11111)
      that.setData({
        delivery: delivery
      })
      // console.log(that.data.delivery)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData() {
      let that = this
      that.setData({
        // 送货单按钮为图标
        displayAffirmBtn: that.whetherToDisplayTheActionButton(that.data.info, '确认送货单'),

        // 退货单按钮逻辑
        displayReturnBtn: that.whetherToDisplayTheActionButton(that.data.info, '确认退货单'),
        displayDelReturnBtn: that.whetherToDisplayTheActionButton(that.data.info, '作废退货单'),
        displaySureDelReturnBtn: that.whetherToDisplayTheActionButton(that.data.info, '确认作废退货单'),

        // 现结单按钮逻辑  (确认现结单按钮为图标)
        displayDelCashBtn: that.whetherToDisplayTheActionButton(that.data.info, '作废现结单'),

        // 送货单按钮为图标
        activeAffirmBtn: that.whetherToActivateTheActionButton(that.data.info, '确认送货单'),

        // 退货单按钮逻辑
        activeReturnBtn: that.whetherToActivateTheActionButton(that.data.info, '确认退货单'),
        activeDelReturnBtn: that.whetherToActivateTheActionButton(that.data.info, '作废退货单'),
        activeSureDelReturnBtn: that.whetherToActivateTheActionButton(that.data.info, '确认作废退货单'),

        // 现结单按钮逻辑  (确认现结单按钮为图标)
        activeDelCashBtn: that.whetherToActivateTheActionButton(that.data.info, '作废现结单'),



        waitingAffirmBtn: that.whetherWaitingTheActionButton(that.data.info, '确认送货单'),
        waitingReturnBtn: that.whetherWaitingTheActionButton(that.data.info, '确认退货单'),
        waitingSureDelReturnBtn: that.whetherWaitingTheActionButton(that.data.info, '确认作废退货单'),
      })
    },

    // 拒绝/删除按钮点击
    // onRejectBtnClick(e) {
    //   let that = this
    //   if (!app.globalData.theirOwnRights()['']) {
    //     markedWords("无此操作权限")
    //     return
    //   }
    //   wx.showModal({
    //     title: '提示',
    //     content: `确认要删除流水单${that.data.info['名称及规格']}吗？`,
    //     success(res) {
    //       if (res.confirm) {
    //         var post_data = {
    //           login_token: app.globalData.login_token(),
    //           unique_id: that.data.info.unique_id
    //         }
    //         delete_supplier_transaction_by_id(post_data, that).then(res => {
    //           that.setData({
    //             isRequestIng: false
    //           })
    //           that.triggerEvent('callbackAfterOption', {
    //             msg: res.msg
    //           })
    //         })
    //       }
    //     }
    //   })
    // },
    // 结算按钮点击
    // onSettleBtnClick(e) {
    //   let that = this
    //   if (!app.globalData.theirOwnRights()['']) {
    //     markedWords("无此操作权限")
    //     return
    //   }
    //   var post_data = {
    //     login_token: app.globalData.login_token(),
    //     unique_id: that.data.info.unique_id
    //   }
    //   settle_supplier_transaction_by_id(post_data, that).then(res => {
    //     that.setData({
    //       isRequestIng: false
    //     })
    //     that.triggerEvent('callbackAfterOption', {
    //       msg: res.msg
    //     })
    //   })
    // },

    // 作废单的折叠展开
    openZuofei() {
      var that = this
      if (that.data.unfold === -1) {
        that.setData({
          unfold: that.data.info.unique_id
        })
      } else {
        that.setData({
          unfold: -1
        })
      }
    },

    // 更新父组件数据
    // getTopPage() {
    //   let pages = getCurrentPages()
    //   return pages[pages.length - 1]
    // },
    // 现结单结算事件
    cashStateOrder() {
      let that = this
      if (!app.globalData.theirOwnRights()['结算现结单']) {
        markedWords("无此操作权限")
        return
      }
      // var tel = app.globalData.userInfo()['绑定手机号']
      // var name = app.globalData.userInfo()['个人信息']['姓名']
      // wx.showModal({
      //   title: '提示',
      //   content: `当前结算付款人姓名：${name},电话：${tel},确认结算吗？`,
      //   success(res) {
      //     if (res.confirm) {
      //     }
      //   }
      // })
      // 显示弹窗
      // that.getTopPage().setData({ // 更新父组件数据
      //   maskCash: true
      // })
      wx.showModal({
        title: '提示',
        content: '是否结算该现结单？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id,
              付款人手机: app.globalData.userInfo()['绑定手机号']
            }
            settle_cash_supplier_transaction(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              that.triggerEvent('callbackAfterOption', {
                msg: res.msg
              })
            })
          }
        }
      })
    },

    // 作废现结单
    delCashClick() {
      let that = this
      if (!app.globalData.theirOwnRights()['结算现结单']) {
        markedWords("无此操作权限")
        return
      }
      wx.showModal({
        title: '提示',
        content: '是否作废该现结单？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id
            }
            delete_cash_supplier_transaction_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              that.triggerEvent('callbackAfterOption', {
                msg: res.msg
              })
            })
          }
        }
      })
    },

    // 编辑按钮点击
    onEditBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['编辑流水单']) {
        markedWords("无此操作权限")
        return
      }
      if (that.data.isClickIng) return
      that.data.isClickIng = true
      setTimeout(() => {
        that.data.isClickIng = false
      }, 1000)

      app.globalData.deliverNoteDetails = this.data.info
      wx.navigateTo({
        url: '/pages/deliveryNoteOperationPage/deliveryNoteOperationPage',
      })
    },
    // 确认按钮点击
    onAffirmBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['确认送货单']) {
        markedWords("无此操作权限")
        return
      }
      if (that.data.info['交易状态'] === '已作废') {
        markedWords('已作废的流水单不可再更改状态！')
        return
      }
      wx.showModal({
        title: '提示',
        content: '是否确认该送货单？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id
            }
            confirm_supplier_transaction_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              that.triggerEvent('callbackAfterOption', {
                msg: res.msg
              })
            })
          }
        }
      })
    },


    // 确认退货单
    sureReturnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['确认退货单']) {
        markedWords("无此操作权限")
        return
      }
      wx.showModal({
        title: '提示',
        content: '是否确认该退货单？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id
            }
            warehouse_confirm_refund_transaction_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              that.triggerEvent('callbackAfterOption', {
                msg: res.msg
              })
            })
          }
        }
      })
    },
    // 作废退货单
    delReturnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['退货作废退货单']) {
        markedWords("无此操作权限")
        return
      }
      wx.showModal({
        title: '提示',
        content: '是否作废该退货单？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id,
              订单状态: that.data.info['交易状态']
            }
            warehouse_delete_refund_transaction_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              that.triggerEvent('callbackAfterOption', {
                msg: res.msg
              })
            })
          }
        }
      })
    },
    // 确认作废退货单
    sureDelReturnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['确认退货作废退货单']) {
        markedWords("无此操作权限")
        return
      }
      wx.showModal({
        title: '提示',
        content: '是否作废该退货单？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id,
              订单状态: that.data.info['交易状态']
            }
            warehouse_delete_refund_transaction_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              that.triggerEvent('callbackAfterOption', {
                msg: res.msg
              })
            })
          }
        }
      })
    },
    // 是否显示操作按钮（送货单和退货单）  （现结单在wxml做判断）
    whetherToDisplayTheActionButton(row, btnName) {
      var status = row['交易状态']
      var type = row['流水单类型']
      var addPeople = row['添加送货发起方']
      var delPeople = row['作废送货发起方']
      var addReturnPeople = row['添加退货发起方']
      var delReturnPeople = row['作废退货发起方']
      switch (btnName) {
        case '确认送货单':
          if (status === '未确认' && type === '送货单') return true
          break
        // case '结算送货单':
        //   if (status === '已确认' && type === '送货单') return true
        //   break
        // case '作废送货单':
        //   if (status === '未确认' && type === '送货单') return true
        //   if (status === '已确认' && type === '送货单') return true
        //   if (status === '已结算' && type === '送货单') return true
        //   break
        // case '确认作废送货单':
        //   if (status === '待作废' && type === '送货单') return true
        //   break
        case '确认退货单':
          if (status === '待退货' && type === '退货单') return true
          break
        case '作废退货单':
          if (status === '待退货' && type === '退货单') return true
          if (status === '已退货' && type === '退货单') return true
          break
        case '确认作废退货单':
          if (status === '待作废' && type === '退货单') return true
          break
        case '作废现结单':
          if (status === '未结算' && type === '现结单') return true
          if (status === '已结算' && type === '现结单') return true
          break
        default:
          return false
      }
      return false
    },
    // 是否激活操作按钮 （附加权限判断）
    whetherToActivateTheActionButton(row, btnName) {
      var status = row['交易状态']
      var type = row['流水单类型']
      var row = row
      var addPeople = row['添加送货发起方']
      var delPeople = row['作废送货发起方']
      var addReturnPeople = row['添加退货发起方']
      var delReturnPeople = row['作废退货发起方']
      switch (btnName) {
        case '确认送货单':
          // 【确认送货单】是图标点击
          if (row.hasOwnProperty('添加送货发起方')) {
            if (status === '未确认' && type === '送货单' && addPeople === '供应商' && app.globalData.theirOwnRights()['确认送货单']) return true
          } else {
            if (status === '未确认' && type === '送货单' && app.globalData.theirOwnRights()['确认退货单']) return true
          }
          break
        // case '结算送货单':
          // if (app.globalData.theirOwnRights()['结算送货单']) return true
          // break
        // case '作废送货单':
        //   if (app.globalData.theirOwnRights()['作废送货单']) return true
        //   break
        // case '确认作废送货单':
        //   if (app.globalData.theirOwnRights()['确认作废送货单']) return true
        //   break
        case '确认退货单':
          if (row.hasOwnProperty('添加退货发起方')){
            if (status === '待退货' && type === '退货单' && addReturnPeople === '供应商' && app.globalData.theirOwnRights()['确认退货单']) return true
          } else {
            if (status === '待退货' && type === '退货单' && app.globalData.theirOwnRights()['确认退货单']) return true
          }
          break
        case '作废退货单':
          if (status === '待退货' && type === '退货单' && app.globalData.theirOwnRights()['退货作废退货单']) return true
          if (status === '已退货' && type === '退货单' && app.globalData.theirOwnRights()['退货作废退货单']) return true
          break
        case '确认作废退货单':
          if (row.hasOwnProperty('作废退货发起方')) {
            if (status === '待作废' && type === '退货单' && delReturnPeople === '供应商' && app.globalData.theirOwnRights()['确认退货作废退货单']) return true
          } else {
            if (status === '待作废' && type === '退货单' && app.globalData.theirOwnRights()['确认退货作废退货单']) return true
          }
          break
        case '作废现结单':
          if (status === '未结算' && type === '现结单' && app.globalData.theirOwnRights()['作废现结单']) return true
          if (status === '已结算' && type === '现结单' && app.globalData.theirOwnRights()['作废现结单']) return true
          break
        default:
          return false
      }
      return false
    },
    // 判断是不是显示等待供应商确认
    whetherWaitingTheActionButton(row, btnName) {
      var status = row['交易状态']
      var type = row['流水单类型']
      var row = row
      var addPeople = row['添加送货发起方']
      var delPeople = row['作废送货发起方']
      var addReturnPeople = row['添加退货发起方']
      var delReturnPeople = row['作废退货发起方']
      switch (btnName) {
        case '确认送货单':
          // 【确认送货单】是图标点击
          if (row.hasOwnProperty('添加送货发起方')) {
            if (status === '未确认' && type === '送货单' && addPeople === '供应商') return true
          } else {
            if (status === '未确认' && type === '送货单') return true
          }
          break
        // case '结算送货单':
        // if (app.globalData.theirOwnRights()['结算送货单']) return true
        // break
        // case '作废送货单':
        //   if (app.globalData.theirOwnRights()['作废送货单']) return true
        //   break
        // case '确认作废送货单':
        //   if (app.globalData.theirOwnRights()['确认作废送货单']) return true
        //   break
        case '确认退货单':
          if (row.hasOwnProperty('添加退货发起方')) {
            if (status === '待退货' && type === '退货单') return true
          } else {
            if (status === '待退货' && type === '退货单') return true
          }
          break
        case '作废退货单':
          if (status === '待退货' && type === '退货单') return true
          if (status === '已退货' && type === '退货单') return true
          break
        case '确认作废退货单':
          if (row.hasOwnProperty('作废退货发起方')) {
            if (status === '待作废' && type === '退货单') return true
          } else {
            if (status === '待作废' && type === '退货单') return true
          }
          break
        case '作废现结单':
          if (status === '未结算' && type === '现结单') return true
          if (status === '已结算' && type === '现结单') return true
          break
        default:
          return false
      }
      return false
    },
    checkboxChange: function(e) {
      let that = this
      var paramter = null
      if (e.detail.value.length === 0) {
        paramter = {
          mode: "cancel",
          unique_id: that.data.info.unique_id
        }
        that.setData({
          "delivery[0].checked": false
        })
      } else {
        paramter = {
          mode: "selected",
          unique_id: that.data.info.unique_id
        }
        that.setData({
          "delivery[0].checked": true
        })
      }
      that.triggerEvent('callbackAfterSelect', {
        selectInfo: paramter
      })
    },

    // 设置选中态
    setSelectedState(mode) {
      let that = this
      that.setData({
        "delivery[0].checked": mode
      })
    }
  }
})