// pages/purchaseOrderOperationPage/purchaseOrderOperationPage.js
const app = getApp();
import {
  noDataProcessingLogic,
  isEmpty,
  markedWords,
  parseTime,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  deepClone,
  setStatus,
  isObjectValueEqual,
  compareObj,
  objectWhetherAllKeysHaveNoNullValue,
  processingTokenFailure
} from "../../utils/util.js";
import regeneratorRuntime from "../../utils/runtime.js";
import {
  detail_purchase_note,
  edit_purchase_note_by_id
} from "../../services/warehouseProcurement.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: null,
    // edit为修改模式
    type:'',
    // 修改购买数量
    buynumber:'',
    // 采购单基本信息
    list1: {},
    // 采购单对应物料信息
    list2: {},
    floorstatus: false,
    isRequestIng: false,
    // 回到首页按钮
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 初始化form，从globalData货物采购单详情
  initializationForm() {
    let that = this
    var unique_id = app.globalData.purchaseDetails.unique_id
    console.log(unique_id)
    var parameter = {
      unique_id: unique_id,
      login_token: app.globalData.login_token(),
    }
    detail_purchase_note(parameter, that).then(res => {
      console.log(res)
      var form = res.data
      // 取出组合信息
      var list1 = []
      list1 = {
        采购单编号: form['采购单编号'],
        采购单日期: form['采购单日期'],
        备注: form['备注'] == '' ? '暂无' : form['备注']
      }
      console.log(list1)
      var list2 = []
      for (let i = 0; i < form['物料列表'].length; i++) {
        var element = form['物料列表'][i]
        var list_item = {}
        list_item['物料编号'] = element['物料编号']
        list_item['材料类型'] = element.tags['材料类型']
        list_item['材质'] = element.tags['材质']
        list_item['颜色'] = element.tags['颜色']
        list_item['物料名称'] = element.tags['物料名称']
        list_item['仓库多余数量'] = element['仓库多余数量']
        list_item['单位'] = element['单位']
        // 
        list_item['供应商名称'] = element['供应商列表'][0]['名称']
        list_item['供应商价格'] = element['供应商列表'][0]['供应商价格']
        list_item['供应商物料名称'] = element['供应商列表'][0]['供应商物料名称']
        list_item['仓库剩余数量'] = Number((element['供应商列表'][0]['仓库剩余数量']).toFixed(2))
        list_item['说明'] = element['供应商列表'][0]['说明']
        // 
        list_item['目标购买数量'] = element['目标购买数量']
        list_item['总价格'] = ((element['供应商列表'][0]['供应商价格']) * (element['目标购买数量'])).toFixed(2)

        list2.push(list_item)
      }
      console.log(list2)
      //list2返回‘’的显示暂无
      for (let j = 0; j < list2.length; j++){
        for (var item in list2[j]) {
          if (list2[j][item]==='') {
            list2[j][item] = '暂无'
          }
        }
      }
      that.setData({
        list1: list1,
        list2: list2,
        originData: res.data
      })
      setStatus(that, false)
    })
  },

  // 确认修改
  formSubmit: async function (e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var unique_id = app.globalData.purchaseDetails.unique_id
    var eleData = that.data.originData['物料列表']
    for (var i = 0; i < eleData.length;i++){
      eleData[i]['目标购买数量'] = parseFloat(e.detail.value['buynum' + i])
    }
    var requestItem = that.data.originData
    // 不循环发请求了
    var respose_a = await that.editPurchaseNoteById(requestItem)
    // for (var i = 0; i < eleData.length; i++) {
    //   var requestItem = eleData[i]
    //   var respose_a = await that.editPurchaseNoteById(requestItem)
    // }
    that.setData({
      isRequestIng: false
    })
    markedWords('修改成功~', 'succes', 1500)
    setTimeout(function () {
      wx.navigateBack()
    }, 1500)
  },
  editPurchaseNoteById(requestItem) {
    var that = this
    return new Promise(function (resolve, reject) {
      var unique_id = app.globalData.purchaseDetails.unique_id
      var parameter = {
        unique_id: unique_id,
        login_token: app.globalData.login_token(),
        update_data: requestItem
      }
      edit_purchase_note_by_id(parameter, that).then(res => {
        if (res.status == 'OK') {
          // that.setData({
          //   isRequestIng: false
          // });
        }
        resolve(res.msg)
      })
    })
  },
  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var type = options.type
    that.setData({
      type: type
    })
    // 页面初始化流程
    that.initializationForm()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  /************页面事件*************************************end*********************** */
})