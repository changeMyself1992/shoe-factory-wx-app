import {
  delete_product_by_id
} from "../../../../services/maintenanceOfProcessPartsOfProductLibrary.js"
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
    productInfo: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng:false
  },

  attached: function () {
    this.editThrottleHandle = throttle(this.onEditBtnClick, 3000, { leading: true, trailing: false })
    this.lookThrottleHandle = throttle(this.onLookBtnClick, 3000, { leading: true, trailing: false })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 编辑按钮点击
    onEditBtnClick(e) {
      if (!app.globalData.theirOwnRights()['产品资料可写']){
        markedWords("无此操作权限")
        return
      }
      app.globalData.productDetails = this.data.productInfo
      wx.navigateTo({
        url: '/pages/productOperationPage/productOperationPage?mode=editProduct',
      })
    },
    // 查看按钮点击
    onLookBtnClick(e){
      if (!app.globalData.theirOwnRights()['产品资料可读']) {
        markedWords("无此操作权限")
        return
      }
      app.globalData.productDetails = this.data.productInfo
      wx.navigateTo({
        url: '/pages/productOperationPage/productOperationPage?mode=lookOver',
      })
    },
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['产品资料可写']) {
        markedWords("无此操作权限")
        return
      }
      var productInfo = e.currentTarget.dataset.productinfo
      wx.showModal({
        title: '提示',
        content: `确认要删除产品${productInfo['产品编号']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: productInfo['unique_id']
            }
            delete_product_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng:false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                productInfo: productInfo
              })
            })
          }
        }
      })
    }
  },

})