import {
  delete_warehouse_material_by_id
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
    info: {
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 查看按钮点击
    onLookBtnClick(e) {
      app.globalData.materialDetails = this.data.info
      wx.navigateTo({
        url: '/pages/materialOperationPage/materialOperationPage?mode=lookOver',
      })
    }
  },

})