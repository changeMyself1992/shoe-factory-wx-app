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
    // 部门统计信息
    processDepartment: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  attached: function () {
    this.processDepartmentDetailThrottleHandle = throttle(this.processDepartmentDetailClick, 3000, { leading: true, trailing: false })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //详情按钮点击
    processDepartmentDetailClick(even) {
      if (!this.data.processDepartment['是否和自身绑定']){
        markedWords('您暂无权限查看该部门数据。如需查看，请联系管理员。')
        return
      }
      app.globalData.processDepartmentName = this.data.processDepartment['部门名称']
      wx.navigateTo({
        url: '/pages/processDepartmentDetail/processDepartmentDetail',
      })
    },
  },

})