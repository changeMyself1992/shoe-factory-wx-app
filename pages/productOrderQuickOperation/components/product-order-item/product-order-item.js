// components/component-tag-name.js
const app = getApp();
import {
  production_control_batch_manager_confirm_staff_record
} from "../../../../services/ordersForProductionScheduling.js";
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus
} from "../../../../utils/util.js";
import throttle from "../../../../utils/lodash/throttle.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    product: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},
  attached: function () {
    this.itemClickThrottleHandle = throttle(this.onProductItemClick, 3000, { leading: true, trailing: false })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onProductItemClick: function(event) {
      let that = this;
      app.globalData.productionOrderDetails = that.data.product;
      // 通过ID获取详情传过去
      wx.navigateTo({
        url: '/pages/productionOrderDetails/productionOrderDetails'
      })
    },
    // 阻止checkbox的冒泡
    catchtap() {
      console.log('此处指向一个空函数')
    },
    // 对于生产单的复选
    checkboxChangeItem: function (e) {
      var that = this
      console.log('checkboxItem发生change事件，携带value值为：', e.detail.value)
      var product = that.data.product
      product.ischeck = !product.ischeck
      that.setData({
        product: product
      })
      that.triggerEvent('callbackIscheck', {
        product: product
      })
    },
    // 提交单个生产单的所选工序
    submitItemGX: function () {
      let that = this;
      var product = that.data.product
      return new Promise(function (resolve, reject) {
        var parameter = {
          login_token: app.globalData.login_token(),
          员工计件记录: [{
            生产单unique_id: that.data.product.unique_id,
            工序unique_id: that.data.product['生产单工序信息']['工序信息']['unique_id'],
            员工unique_id: that.data.product['生产单工序信息']['员工计件']['unique_id'],
          }],
        }
        console.log(parameter)
        production_control_batch_manager_confirm_staff_record(parameter, that).then(res => {
          console.log(res.data)
          markedWords(res.msg)
          that.triggerEvent('callbackAfterDeletion', {
            product: product
          })
          resolve(true)
        })
      })
    },
  },

})