import {
  filter_warehouse_material_event,
  get_warehouse_material_by_id,
  delete_warehouse_material_by_id
} from "../../services/warehouseProcurement.js"
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
    isClickIng: false

  },

  observers: {
    'info': function(info) {
      let that = this
      // console.log(info)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 查看或修改
    viewAndEditClick(e) {
      let that = this
      console.log(e)

      app.globalData.importAndExportDetailInfo = that.data.info
      if (that.data.info['事件类型'] == '入库') {
        wx.navigateTo({
          url: '/pages/warehouseImportAndExportDetail/warehouseImportAndExportDetail?type=import',
        })
      } else if (that.data.info['事件类型'] == '出库') {
        wx.navigateTo({
          url: '/pages/warehouseImportAndExportDetail/warehouseImportAndExportDetail?type=export',
        })
      }
      
    },
    // 删除
    deleteClick(e) {
      let that = this
      var unique_id = e.currentTarget.dataset.uniqueid
      wx.showModal({
        title: '提示',
        content: '确认要删除吗？',
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: unique_id
            }
            delete_warehouse_material_by_id(post_data, that).then(res => {
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
    }
  }
})