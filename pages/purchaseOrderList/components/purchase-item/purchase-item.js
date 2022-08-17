import {
  delete_purchase_note
} from "../../../../services/warehouseProcurement.js"
import {
  markedWords
} from "../../../../utils/util.js";
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    purchaseInfo: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 查看按钮点击
    onLookBtnClick(e) {
      app.globalData.purchaseDetails = this.data.purchaseInfo
      wx.navigateTo({
        url: '/pages/purchaseOrderOperationPage/purchaseOrderOperationPage',
      })
    },
    // 修改
    editClick(e) {
      app.globalData.purchaseDetails = this.data.purchaseInfo
      wx.navigateTo({
        url: '/pages/purchaseOrderOperationPage/purchaseOrderOperationPage?type=edit',
      })
    },
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['采购单详情可写']) {
        markedWords("无此操作权限")
        return
      }
      var purchaseInfo = e.currentTarget.dataset.purchaseinfo
      wx.showModal({
        title: '提示',
        content: `确认要删除采购单${purchaseInfo['unique_id']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: purchaseInfo['unique_id']
            }
            delete_purchase_note(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                purchaseInfo: purchaseInfo
              })
            })
          }
        }
      })
    }
  },

})