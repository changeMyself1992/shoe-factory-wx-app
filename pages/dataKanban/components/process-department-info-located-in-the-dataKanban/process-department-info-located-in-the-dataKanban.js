import {
  markedWords
} from "../../../../utils/util.js";
import {
  filter_process
} from "../../../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import throttle from "../../../../utils/lodash/throttle.js";

// components/component-tag-name.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    // 工厂全部的工序
    allProcessList:[]
  },

  attached: function () {
    this.processListBtnThrottleHandle = throttle(this.processListBtnClick, 3000, { leading: true, trailing: false })
    this.processBtnThrottleHandle = throttle(this.onProcessBtnClick, 3000, { leading: true, trailing: false })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //查看部门列表按钮点击
    processListBtnClick(even) {
      wx.navigateTo({
        url: '/pages/processDepartmentList/processDepartmentList',
      })
    },
    // 工序按钮点击的时候
    onProcessBtnClick(e){
      var process = e.currentTarget.dataset.process
      if (!process['是否和自身绑定']){
        markedWords('您暂无权限查看该部门数据。如需查看，请联系管理员。')
        return
      }
      app.globalData.processDepartmentName = process['工序名称']
      wx.navigateTo({
        url: '/pages/processDepartmentDetail/processDepartmentDetail',
      })
    },
    initResponsibleProcessList(){
      filter_process({login_token:app.globalData.login_token()}).then(res=>{
        var allProcess=res.data
        var responsibleProcess = app.globalData.userInfo()['负责工序']
        var allProcessList = []
        for (let i = 0; i < allProcess.length; i++) {
          const element = allProcess[i];
          // allProcessList.push(element['工序名称'])
          allProcessList.push({
            工序名称: element['工序名称'],
            是否和自身绑定: responsibleProcess.includes(element['工序名称']) ? true : false
          })
        }
        this.setData({
          allProcessList: allProcessList
        })  
      })
     
    }
  },

})