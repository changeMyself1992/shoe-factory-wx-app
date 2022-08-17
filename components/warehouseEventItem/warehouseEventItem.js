import {
  delete_supplier_transaction_by_id,
  confirm_supplier_transaction_by_id,
  settle_supplier_transaction_by_id
} from "../../services/supplier.js"
import {
  markedWords
} from "../../utils/util.js";
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

  },

  observers: {
    'info': function(info) {
      let that = this
      var delivery = []
      delivery.push({
        name: info.unique_id,
        value: info.unique_id,
        checked: false
      })
      that.setData({
        delivery: delivery
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      wx.showModal({
        title: '提示',
        content: `确认要删除流水单${that.data.info['名称及规格']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: that.data.info.unique_id
            }
            delete_supplier_transaction_by_id(post_data, that).then(res => {
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

    // 结算按钮点击
    onSettleBtnClick(e) {
      let that = this
      var post_data = {
        login_token: app.globalData.login_token(),
        unique_id: that.data.info.unique_id
      }
      settle_supplier_transaction_by_id(post_data, that).then(res => {
        that.setData({
          isRequestIng: false
        })
        that.triggerEvent('callbackAfterOption', {
          msg: res.msg
        })
      })
    },

    // 确认按钮点击
    onAffirmBtnClick(e) {
      let that = this
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