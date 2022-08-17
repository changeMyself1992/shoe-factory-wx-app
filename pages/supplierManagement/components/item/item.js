import {
  delete_supplier_by_id,
  generate_unified_match_qr_code
} from "../../../../services/supplier.js"
import {
  markedWords
} from "../../../../utils/util.js";
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
    isRequestIng: false,
    info:{}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 更新父组件数据
    getTopPage() {
      let pages = getCurrentPages()
      return pages[pages.length - 1]
    },
    // 关联认证供应商
    showMask(e) {
      var that = this
      // // 显示弹窗
      // var uniqueid = this.data.info['unique_id']
      // var post_data = {
      //   login_token: app.globalData.login_token(),
      //   工厂内部供应商unique_id: uniqueid
      // }
      // generate_unified_match_qr_code(post_data, that).then(res => {
      //   that.setData({
      //     isRequestIng: false
      //   })
      //   that.getTopPage().setData({ // 更新父组件数据
      //     codeimg: res.data['二维码'],
      //     maskCash: true
      //   })
      // })
      var uniqueid = this.data.info['unique_id']
      var gysname = this.data.info['名称']
      wx.navigateTo({
        url: '/pages/factoryLinkSupplier/factoryLinkSupplier?uniqueid=' + uniqueid + '&gysname=' + gysname,
      })
    },
    // 查看报价单
    onLookBtnClick(e) {
      if (!app.globalData.theirOwnRights()['供应商信息可读']) {
        markedWords("无此操作权限")
        return
      }
      var uniqueid = this.data.info['unique_id']
      var supplierinfodata = this.data.info
      wx.navigateTo({
        url: '/pages/supplierPriceList/supplierPriceList?uniqueid=' + uniqueid + '&supplierinfodata=' + JSON.stringify(supplierinfodata),
      })
    },

    // 删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['供应商信息可写']) {
        markedWords("无此操作权限")
        return
      }
      var info = this.data.info
      wx.showModal({
        title: '提示',
        content: `确认要删除供应商${info['名称']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: info['unique_id']
            }
            delete_supplier_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                info: info
              })
            })
          }
        }
      })
    }
  },

})