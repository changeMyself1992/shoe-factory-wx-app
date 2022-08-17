import {
  delete_client_by_id
} from "../../../../services/customer.js"
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
    // 员工信息
    clientInfo: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng:false,
    //目标总数
    productCount:0,
    // 已排产总数
    haveCompletedSeveral:0,
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
      if (!app.globalData.theirOwnRights()['客户管理可写']){
        markedWords("无此操作权限")
        return
      }
      app.globalData.clientDetails = this.data.clientInfo
      wx.navigateTo({
        url: '/pages/clientOperationPage/clientOperationPage?mode=editClient',
      })
    },
    // 查看按钮点击
    onLookBtnClick(e){
      app.globalData.clientDetails = this.data.clientInfo
      wx.navigateTo({
        url: '/pages/clientOperationPage/clientOperationPage?mode=lookOver',
      })
    },
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['客户管理可写']) {
        markedWords("无此操作权限")
        return
      }
      var clientInfo = e.currentTarget.dataset.clientinfo
      wx.showModal({
        title: '提示',
        content: `确认要删除客户${clientInfo['名称']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: clientInfo['unique_id']
            }
            delete_client_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng:false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                clientInfo: clientInfo
              })
            })
          }
        }
      })
    }
  },

})