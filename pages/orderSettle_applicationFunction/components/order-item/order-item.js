import {
  markedWords,
  setStatus,
  isEmpty,
  deepClone
} from "../../../../utils/util.js";
import regeneratorRuntime from '../../../../utils/runtime.js'
import {
  order_settle_edit,
  match_recent_product_settle_info_by_product_info
} from "../../../../services/ordersForProductionScheduling.js"
import throttle from "../../../../utils/lodash/throttle.js";
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 结算记录索引
    settlementRecordsIndex: {
      type: Number
    },
    orderInfo: {
      type: Object
    },
    orderTag: {
      type: Array
    },
    productTag: {
      type: Array
    },
    // 结算状态可编辑的行数
    theSettlementStatusEditableRows: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng: false,
    statusOptions: ['未发货', '发货中', '已发货', '结算中', '已结算','订单取消','订单无法收款'],
    statusIndex: 0,
    // 原始数据
    origindatainfo: null,
    // 鞋子配码
    shoesSize: []
  },

  observers: {
    'orderInfo': function (orderInfo) {
      let that = this
      var shoesSize = []
      for (const key in that.data.orderInfo) {
        if (/^[3|4]{1}[0-9]{1}$/.test(key)) {
          shoesSize.push(key)
        }
      }
      that.setData({
        shoesSize: shoesSize
      })
    }
  },


  attached: function () {
    this.editThrottleHandle = throttle(this.onEditSettlementInfo, 3000, {
      leading: true,
      trailing: false
    })
    this.submitThrottleHandle = throttle(this.handleSubmit, 3000, {
      leading: true,
      trailing: false
    })
    this.submitAllThrottleHandle = throttle(this.handleAllSubmit, 3000, {
      leading: true,
      trailing: false
    })
  },


  /**
   * 组件的方法列表
   */
  methods: {
    // 清空日期
    deletedateclick() {
      this.setData({
        'orderInfo.包含的产品_结算情况_发货时间': ''
      })
    },
    // 当进行结算信息 编辑的时候
    onEditSettlementInfo(e) {
      let that = this
      console.log('发生结算状态编辑 id为：' + e.currentTarget.id)
      console.log(e)
      var orderInfo = that.data.orderInfo
      if (e.currentTarget.id === '产品单价') {
        // 如果输入的是产品单价,那么要计算产品应收入。总数x产品单价=产品应收款
        if (!isEmpty(e.detail.value)) {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
          var count = Number(parseFloat(orderInfo['包含的产品_配码数量_总数'] * value).toFixed(2))
          orderInfo['包含的产品_结算情况_产品单价'] = value
          orderInfo['包含的产品_结算情况_产品订单应收'] = count
        } else {
          orderInfo['包含的产品_结算情况_产品单价'] = 0
          orderInfo['包含的产品_结算情况_产品订单应收'] = 0
        }
      } else if (e.currentTarget.id === '发货数量') {
        // 如果输入的发货数量，那么不允许超过配码总数
        if (!isEmpty(e.detail.value)) {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
          value = value > orderInfo['包含的产品_配码数量_总数'] ? orderInfo['包含的产品_配码数量_总数'] : value
          orderInfo['包含的产品_结算情况_发货数量'] = value
        } else {
          orderInfo['包含的产品_结算情况_发货数量'] = 0
        }
      } else if (e.currentTarget.id === '产品订单应收') {
        // 如果输入的是产品应收，那么计算产品单价. 产品应收款/总数=产品单价
        if (!isEmpty(e.detail.value)) {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
          orderInfo['包含的产品_结算情况_产品单价'] = Number(parseFloat(value / orderInfo['包含的产品_配码数量_总数']).toFixed(2))
        } else {
          orderInfo['包含的产品_结算情况_产品单价'] = 0
          orderInfo['包含的产品_结算情况_产品订单应收'] = 0
        }
      } else if (e.currentTarget.id === '产品订单实收') {
        // 实收要小于应收
        if (!isEmpty(e.detail.value)) {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
          value = value > orderInfo['包含的产品_结算情况_产品订单应收'] ? orderInfo['包含的产品_结算情况_产品订单应收'] : value
          orderInfo['包含的产品_结算情况_产品订单实收'] = value
        } else {
          orderInfo['包含的产品_结算情况_产品订单实收'] = 0
        }
      } else if (e.currentTarget.id === '发货时间') {
        var value = e.detail.value
        orderInfo['包含的产品_结算情况_发货时间'] = value
      } else if (e.currentTarget.id === '备注') {
        var value = e.detail.value
        orderInfo['包含的产品_结算情况_备注'] = value
      } else if (e.currentTarget.id === '结算状态') {
        var statusIndex = Number(e.detail.value)
        orderInfo['包含的产品_结算情况_结算状态'] = that.data.statusOptions[statusIndex]
        that.data.statusIndex = statusIndex
      }
      that.setData({
        orderInfo: orderInfo
      })
      // 回调父组件方法 更新父组件结算记录列表
      var parameter = {
        settlementRecordInfo: that.data.orderInfo,
        settlementRecordsIndex: that.data.settlementRecordsIndex
      }
      that.triggerEvent('settlementDataUpdate', parameter)
    },

    // 编辑按钮点击
    handleEdit(row) {
      let that = this
      if (!app.globalData.theirOwnRights()['订单结算管理可写']) {
        markedWords("无此操作权限")
        return
      }
      // 编辑前存下原始数据，以便点击取消恢复之前数据
      that.data.origindatainfo = deepClone(that.data.orderInfo)
      that.setData({
        "orderInfo.结算状态是否可编辑": true
      })
      if (that.data.orderInfo['包含的产品_结算情况_产品单价'] === 0 &&
        that.data.orderInfo['包含的产品_结算情况_产品订单实收'] === 0 &&
        that.data.orderInfo['包含的产品_结算情况_产品订单应收'] === 0 &&
        that.data.orderInfo['包含的产品_结算情况_发货数量'] === 0) {
        var settlementRecordInfo = that.data.orderInfo
        console.log(settlementRecordInfo)
        var parameter = {
          login_token: app.globalData.login_token(),
          data: {
            产品信息: {
              unique_id: settlementRecordInfo.产品unique_id,
              tags: {
                '楦型': settlementRecordInfo['包含的产品_产品信息_tags_楦型'],
                '款号': settlementRecordInfo['包含的产品_产品信息_tags_款号'],
                '材质': settlementRecordInfo['包含的产品_产品信息_tags_材质'],
                '颜色': settlementRecordInfo['包含的产品_产品信息_tags_颜色'],
                '内里/垫脚': settlementRecordInfo['包含的产品_产品信息_tags_内里/垫脚'],
                '产品名称': settlementRecordInfo['包含的产品_产品信息_tags_产品名称']
              },
              产品编号: ''
            }
          }
        };
        match_recent_product_settle_info_by_product_info(parameter, that).then(res => {
          var resdata = res
          setStatus(that, false)
          var pricenum = resdata.data['结算情况']['产品单价']
          var sendnum = resdata.data['结算情况']['发货数量']
          // 如果结算情况有，则显示弹窗自动补全
          if (!isEmpty(resdata.data['结算情况'])) {
            // 弹窗显示自动补全
            wx.showModal({
              title: '提示',
              content: `系统智能补全该订单产品单价为${pricenum}元 和 发货数量为${sendnum}，是否自动填入？`,
              success(res) {
                if (res.confirm) {
                  settlementRecordInfo['包含的产品_结算情况_产品单价'] = resdata.data['结算情况']['产品单价']
                  settlementRecordInfo['包含的产品_结算情况_发货数量'] = resdata.data['结算情况']['发货数量']
                  settlementRecordInfo['包含的产品_结算情况_产品订单应收'] = Number((resdata.data['结算情况']['产品单价']) * (settlementRecordInfo['包含的产品_配码数量_总数'])).toFixed(2)
                  that.setData({
                    orderInfo: settlementRecordInfo
                  })
                  // 回调父组件方法 更新父组件结算记录列表
                  var parameter = {
                    settlementRecordInfo: that.data.orderInfo,
                    settlementRecordsIndex: that.data.settlementRecordsIndex
                  }
                  that.triggerEvent('settlementDataUpdate', parameter)
                }
              }
            })
          }
        })
      }
      // 回调父组件方法 更新父组件结算记录列表
      var parameter = {
        settlementRecordInfo: that.data.orderInfo,
        settlementRecordsIndex: that.data.settlementRecordsIndex
      }
      that.triggerEvent('callbackAfterEdit', parameter)
    },

    // 取消按钮点击
    cancelQuxiao(row) {
      let that = this
      setTimeout(() => {
        that.setData({
          orderInfo: deepClone(that.data.origindatainfo)
        })
        // 回调父组件方法 更新父组件结算记录列表
        var parameter = {
          settlementRecordInfo: that.data.orderInfo,
          settlementRecordsIndex: that.data.settlementRecordsIndex
        }
        that.triggerEvent('callbackAfterEdit', parameter)
      }, 100)
    },

    // 提交按钮点击
    handleSubmit() {
      let that = this
      setTimeout(async () => {
        var parameter = {
          login_token: app.globalData.login_token(),
          "订单unique_id": that.data.orderInfo['订单编号'],
          "产品unique_id": that.data.orderInfo['产品unique_id'],
          结算情况: {
            结算状态: that.data.orderInfo['包含的产品_结算情况_结算状态'],
            产品单价: that.data.orderInfo['包含的产品_结算情况_产品单价'],
            产品订单应收: that.data.orderInfo['包含的产品_结算情况_产品订单应收'],
            产品订单实收: that.data.orderInfo['包含的产品_结算情况_产品订单实收'],
            发货数量: that.data.orderInfo['包含的产品_结算情况_发货数量'],
            发货时间: that.data.orderInfo['包含的产品_结算情况_发货时间'],
            备注: that.data.orderInfo['包含的产品_结算情况_备注']
          }
        }
        await order_settle_edit(parameter)
        // 更新父组件数据
        that.triggerEvent('updateData', {
          'callback': (that) => {
            setStatus(that, false)
          }
        })
      }, 100)
    },
    // 全部提交按钮点击
    handleAllSubmit() {
      let that = this
      setTimeout(() => {
        // 全部提交要调用父组件的方法
        that.triggerEvent('callbacksAfterAllCommits', {})
      }, 100)
    },

    // 配码展开开关
    kindToggle: function (even) {
      let that = this
      var curOperationProcutIndex = Number(even.currentTarget.dataset.curoperationprocutindex)
      that.data.orderInfo['配码数量是否展开'] = !that.data.orderInfo['配码数量是否展开']
      this.setData({
        orderInfo: that.data.orderInfo
      });
    },

    // 更新theSettlementStatusEditableRows
    updateTheSettlementStatusEditableRows(num) {
      let that = this
      that.setData({
        theSettlementStatusEditableRows: num
      })
    }
  },

})