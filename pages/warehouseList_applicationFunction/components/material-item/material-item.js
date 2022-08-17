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
    materialInfo: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isRequestIng:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 查看按钮点击
    onLookBtnClick(e) {
      if (!app.globalData.theirOwnRights()['仓库物料信息可读']) {
        markedWords("无此操作权限")
        return
      }
      app.globalData.materialDetails = this.data.materialInfo
      wx.navigateTo({
        url: '/pages/materialOperationPage/materialOperationPage?mode=lookOver',
      })
    },
    // 编辑按钮点击
    onEditBtnClick(e) {
      if (!app.globalData.theirOwnRights()['仓库物料信息可写']){
        markedWords("无此操作权限")
        return
      }
      app.globalData.materialDetails = this.data.materialInfo
      wx.navigateTo({
        url: '/pages/materialOperationPage/materialOperationPage?mode=editMaterial',
      })
    },
    // 复制添加按钮点击
    onCopyAddBtnClick(e) {
      if (!app.globalData.theirOwnRights()['仓库物料信息可写']) {
        markedWords("无此操作权限")
        return
      }
      app.globalData.materialDetails = this.data.materialInfo
      wx.navigateTo({
        url: '/pages/materialOperationPage/materialOperationPage?mode=copyAddMaterial',
      })
    },
    // 添加按钮点击
    // onAddBtnClick(e){
    //   if (!app.globalData.theirOwnRights()['仓库物料信息可写']) {
    //     markedWords("无此操作权限")
    //     return
    //   }
    //   app.globalData.materialDetails = this.data.materialInfo
    //   wx.navigateTo({
    //     url: '/pages/materialOperationPage/materialOperationPage?mode=addMaterial',
    //   })
    // },
   
    // 拒绝/删除按钮点击
    onRejectBtnClick(e) {
      let that = this
      if (!app.globalData.theirOwnRights()['仓库物料信息可写']) {
        markedWords("无此操作权限")
        return
      }
      var materialInfo = this.data.materialInfo
      wx.showModal({
        title: '提示',
        content: `确认要删除产品${materialInfo['物料编号']}吗？`,
        success(res) {
          if (res.confirm) {
            var post_data = {
              login_token: app.globalData.login_token(),
              unique_id: materialInfo['unique_id']
            }
            delete_warehouse_material_by_id(post_data, that).then(res => {
              that.setData({
                isRequestIng:false
              })
              markedWords(res.msg)
              that.triggerEvent('callbackAfterDeletion', {
                materialInfo: materialInfo
              })
            })
          }
        }
      })
    }
  },

})