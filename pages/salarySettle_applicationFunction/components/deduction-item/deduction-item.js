import {
  manager_delete_staff_costs_by_unique_id
} from "../../../../services/employeeDeductionInformation.js"
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
    // 是否展开已作废货单
    unfold:-1,
  },

  attached: function () {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 拒绝/删除按钮点击
    onDelCostsBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['工资抵扣']) {
        markedWords("无此操作权限")
        return
      }
      var info = e.currentTarget.dataset.info
      wx.showModal({
        title: '提示',
        content: `确认要作废${info['员工姓名']}的工资抵扣吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: info['unique_id']
            }
            // 调用api 
            manager_delete_staff_costs_by_unique_id(post_data, that).then(res => {
              that.setData({
                isRequestIng: false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackDelCostsDeletion', {
                info: info
              })
            })
          }
        }
      })
    },
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
  },

})