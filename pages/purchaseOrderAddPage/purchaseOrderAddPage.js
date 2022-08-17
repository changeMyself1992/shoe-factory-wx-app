// pages/purchaseOrderAddPage/purchaseOrderAddPage.js
const app = getApp();
import {
  isEmpty,
  markedWords,
  parseTime,
  setStatus,
} from "../../utils/util.js";
import {
  add_purchase_note,
  material_tags_auto_complete,
  filter_warehouse_material
} from "../../services/warehouseProcurement.js";
import {
  generate_year_month_sequence_number
} from "../../services/otherUtilityClasses.js";
import debounce from "../../utils/lodash/debounce.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: null,
    // 获取焦点的物料标签输入框的 标签值列表（比如楦型的所有值）
    material_suggest_value_list: [],
    // 物料标签输入框 获取焦点的标签名称(比如 楦型)
    materialTagKeyFocus: '',

    // 采购单选中的包含物料详细信息的列表
    materialDetailList: [],
    // checkbox
    ischeck:false,
    // 点击供应商获取下啦供应商列表
    supplier_suggest_value_list: [],
    // 供应商输入框
    supplierTagKeyFocus: false,
    // 被选中的供应商index
    supplierIndex:null,
    keyFocus:null
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      thisdate: e.detail.value
    })
  },
  checkboxChange: function (e) {
    var that = this
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    // 搜索结果中选中的ID数组中取最后一个
    if (e.detail.value.length>0){
      // 通过materialsearchListUniqueIdArr选中的物料获取物料详情，放入采购单包含的物料中，若已存在则返回
      for (let i = 0; i < that.data.materialDetailList.length; i++){
        var ele = that.data.materialDetailList[i]
        if (ele['物料编号'] == e.detail.value[0]){
          return false
        }
      }
      // 
      var materialitem = that.data.materialsearchList.find((item) => {
        return item.unique_id === e.detail.value[0]
      })
      if (materialitem['供应商列表'].length == 0) {
        markedWords('该物料暂无供应商')
        return false
      }
      materialitem['目标购买数量'] = 1
      that.data.materialDetailList.push(materialitem)
    }
    that.setData({
      materialDetailList: that.data.materialDetailList
    })
  },

  // 初始化采购单单号
  initializationForm() {
    let that = this
    var tagsOfMaterialsArr = {}
    for (let i = 0; i < app.globalData.tagsOfMaterials().length; i++){
      var ele = app.globalData.tagsOfMaterials()[i]
      tagsOfMaterialsArr[ele] = ''
    }
    console.log(tagsOfMaterialsArr)
    return new Promise(function (resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token(),
        流水单分组: 'CGD'
      }
      return generate_year_month_sequence_number(parameter, that).then(res => {
        console.log(res.data)
        that.setData({
          cgdId: res.data['流水号'],
          tagsOfMaterialsArr: tagsOfMaterialsArr
        })
        resolve(true)
      })
    })
  },
  // 物料tag标签获取焦点的时候,弹出下拉菜单
  onFocusProductTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.tagsOfMaterialsArr,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      material_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          material_suggest_value_list: res.data,
          materialTagKeyFocus: res.data.length === 0 ? '' : e.currentTarget.dataset.tagname,
          isRequestIng: false
        })
      })
    }, 200)
  },
  // 点击下拉菜单的时候回调
  onProductTagValueSelect(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    that.data.tagsOfMaterialsArr[tagname] = tagvalue
    that.setData({
      materialTagKeyFocus: '',
      tagsOfMaterialsArr: that.data.tagsOfMaterialsArr,
      isRequestIng: false
    })
  },
  // 物料标签输入的时候触发
  onInputProductTag: function (e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.tagsOfMaterialsArr[tagname] = value
    // 1.继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.tagsOfMaterialsArr,
      target_tag_name: tagname
    }
    material_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        material_suggest_value_list: res.data,
        materialTagKeyFocus: res.data.length === 0 ? '' : that.data.materialTagKeyFocus,
        isRequestIng: false
      })
    })
  },
  // 搜索物料
  searchMaterial(){
    let that = this
    // 首先所有checkbox取消选中
    that.setData({
      ischeck:false
    })
    var login_token = app.globalData.login_token()
    //验证是否有搜索物料词
    var tagsOfMaterialsArrItem = that.data.tagsOfMaterialsArr
    if (tagsOfMaterialsArrItem['材料类型'] == '' && tagsOfMaterialsArrItem['材质'] == '' && tagsOfMaterialsArrItem['颜色'] == '' && tagsOfMaterialsArrItem['物料名称'] == '') {
      markedWords('请选择物料搜索')
      return false
    }
    var post_data = {
      login_token: login_token,
      sort: { 更新时间: -1 },
      tags: that.data.tagsOfMaterialsArr
    }
    filter_warehouse_material(post_data, that).then(res => {
      if (res.data.length==0){
        markedWords('无法查到该标签相应的物料！')
        return false
      }
      var materialsearchList = []
      for (var i = 0; i < res.data.length; i++) {
        var item = res.data[i]
        materialsearchList.push(item)
      }
      that.setData({
        materialsearchList: materialsearchList
      })
    })
  },
  // 删除物料
  removeElementsFromList(e) {
    let that = this
    var index = e.currentTarget.dataset.curoperationitemindex
    that.data.materialDetailList.splice(index, 1)
    that.setData({
      materialDetailList: that.data.materialDetailList
    })
  },
  // 选择供应商
  supplierHandle(e) {
    let that = this
    var index = e.currentTarget.dataset.supplierindex
    that.data.supplier_suggest_value_list =  that.data.materialDetailList[index]['供应商列表']
    that.setData({
      keyFocus: index,
      supplierIndex: index,
      supplier_suggest_value_list: that.data.supplier_suggest_value_list
    })
  },
  // 点击选择供应商
  supplierHandleSelect(e) {
    let that = this
    var suppliername = e.currentTarget.dataset.suppliername
    var supplieruniqueid = e.currentTarget.dataset.supplieruniqueid
    var gysList = that.data.materialDetailList[that.data.supplierIndex]['供应商列表']
    var itemgys = gysList.find((item) => {
      return item.unique_id === supplieruniqueid
    })
    // 选中的供应商列表item与第一个交换位置
    gysList.splice(0, 1, ...gysList.splice(that.data.supplierIndex - 1, 1, gysList[0]))

    that.setData({
      materialDetailList: that.data.materialDetailList,
      keyFocus: null,
    })
  },
  // 提交表单
  formSubmit: function (e) {
    let that = this
    console.log(that.data.materialDetailList)
    console.log(e.detail.value)
    var data = {}
    data['采购单编号'] = that.data.cgdId
    data['采购单日期'] = that.data.thisdate
    data['备注'] = e.detail.value['产品备注']
    for (var i = 0; i < that.data.materialDetailList.length;i++){
      var ele = that.data.materialDetailList[i]
      ele['供应商信息'] = ele['供应商列表'][0]
    }
    data['物料列表'] = that.data.materialDetailList
    for (var i = 0; i < data['物料列表'].length; i++) {
      data['物料列表'][i]['目标购买数量'] = parseFloat(e.detail.value['buynum' + i])
    }
    var parameter = {
      data: data,
      login_token: app.globalData.login_token(),
    }
    add_purchase_note(parameter, that).then(res => {
      console.log(res)
      setStatus(that, false)
      if (res.status === 'OK') {
        markedWords('添加成功~', 'succes', 1500)
        setTimeout(function () {
          wx.navigateBack()
        }, 1500)
      }
    })
  },
  formReset: function () {
    let that = this
    var tagsOfMaterialsArr = {}
    for (let i = 0; i < app.globalData.tagsOfMaterials().length; i++) {
      var ele = app.globalData.tagsOfMaterials()[i]
      tagsOfMaterialsArr[ele] = ''
    }
    // 清空那几个数组
    that.setData({
      materialDetailList: [],
      materialsearchList:[],
      tagsOfMaterialsArr: tagsOfMaterialsArr
    })
    
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var date = new Date()
    var thisdate = parseTime(date)
    that.setData({
      thisdate: thisdate
    })
    this.productDebouncedHandleSearch = debounce(that.onInputProductTag, 1500)
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
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  /************页面事件*************************************end*********************** */
})