import {
  delete_user_by_id,
  edit_user_by_id
} from "../../services/personnelAndAuthorityManagement.js"
import {
  markedWords
} from "../../utils/util.js";
import throttle from "../../utils/lodash/throttle.js";
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 员工信息
    employees: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng:false
  },

  ready: function () {
    this.editBtnThrottleHandle = throttle(this.onEditBtnClick, 3000, { leading: true, trailing:false})
  },


  /**
   * 组件的方法列表
   */
  methods: {
    // 编辑按钮点击
    onEditBtnClick(e) {
      if (!app.globalData.theirOwnRights()['人员管理可写']){
        markedWords("无此操作权限")
        return
      }
      if (!this.data.employees['个人信息']['出生日期']) {
        this.data.employees['个人信息']['出生日期'] = ''
      }
      app.globalData.curOperationStaffObj = this.data.employees
      wx.navigateTo({
        url: '/pages/personnelEditPage/personnelEditPage',
      })
    },
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['人员管理可写']) {
        markedWords("无此操作权限")
        return
      }
      var employees = e.currentTarget.dataset.employees
      wx.showModal({
        title: '提示',
        content: `确认要删除用户${employees['个人信息']['姓名']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: employees['unique_id']
            }
            // 调用api 删除相应的产品
            delete_user_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng:false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                employees: employees
              })
            })
          }
        }
      })
    }
  },

})