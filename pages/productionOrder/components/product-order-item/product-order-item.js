// components/component-tag-name.js
const app = getApp();
import {
  review_production_note_by_id
} from "../../../../services/ordersForProductionScheduling.js"
import {
  setStatus,markedWords
} from "../../../../utils/util.js"
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
    this.itemClickThrottleHandle = throttle(this.onProductItemClick, 3000, {
      leading: true,
      trailing: false
    })
    this.handleToReviewThrottleHandle = throttle(this.handleToReview, 3000, {
      leading: true,
      trailing: false
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onProductItemClick: function (event) {
      let that = this;
      app.globalData.productionOrderDetails = that.data.product;
      wx.navigateTo({
        url: '/pages/productionOrderDetails/productionOrderDetails'
      })
    },

    previewImage(e) {
      let that = this;
      if (e.currentTarget.dataset.url) {
        var array = []
        array.push(e.currentTarget.dataset.url)
        wx.previewImage({
          urls: array
        })
      }
    },
    // 重新评估
    handleToReview() {
      let that = this
      var parameter = {
        login_token: app.globalData.login_token(),
        unique_id: that.data.product.unique_id
      }
      wx.showLoading({
        "title": "加载中"
      });
      review_production_note_by_id(parameter).then(res => {
        var opetion = {
          callBack: (parent) => {
            setStatus(parent, false)
            markedWords(res.msg)
          }
        }
        // 回调父组件刷新数据
        that.triggerEvent('updateData', opetion)
      })
    }
  },

})