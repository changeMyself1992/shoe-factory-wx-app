// pages/warehouseHandMoveImportAndExport/warehouseHandMoveImportAndExport.js
const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  material_tags_auto_complete,
  filter_warehouse_material,
  inventory_change_via_operation
} from "../../services/warehouseProcurement.js";

import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    material_tag_filter: {},
    // 获取焦点的那个物料标签输入框的 标签值列表（比如裆口的所有值）
    material_suggest_value_list: [],
    // 物料标签输入框 获取焦点的标签名称
    materialTagKeyFocus: '',

    //是否正在发起请求
    isRequestIng: false,

    // 物料搜索结果列表
    materialSearchList:[],
    // 被选物料对应供应商列表
    checkedSupplierList:[],
    // 让所有的选项都成为未选中状态
    currentindex: -1
  },
  // 点击选项卡时的js
  chooseItem: function (e) {
    //记录当前点击的对象的序号
    var currentindex = e.currentTarget.dataset.index;
    this.setData({
      currentindex: currentindex,
      materialSearchListItem: this.data.materialSearchList[currentindex]
    })
    var checkedSupplierList = this.data.materialSearchList[currentindex]['供应商列表']
    if (checkedSupplierList.length==0) {
      markedWords('当前选择物料暂无供应商，请重新选择')
    } else{
      this.setData({
        checkedSupplierList: checkedSupplierList
      })
    }
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      materialTagKeyFocus: ''
    })
  },

  // 结算状态选择后调用
  bindPickerChange: function (e) {
    this.setData({
      materialStatusIndex: e.detail.value
    })
  },

  // 获取物料标签
  getmaterialTagNames() {
    let that = this
    var material_tag_names = app.globalData.tagsOfMaterials()
    var material_tag_filter = {}
    for (var index in material_tag_names) {
      material_tag_filter[material_tag_names[index]] = ''
    }
    that.setData({
      material_tag_filter: material_tag_filter
    })
  },

  // 物料标签获取焦点的时候
  onFocusMaterialTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.material_tag_filter,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      material_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          material_suggest_value_list: res.data,
          materialTagKeyFocus: e.currentTarget.dataset.tagname,
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 物料标签输入的时候触发
  onInputmaterialTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode)) return
    that.data.material_tag_filter[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.material_tag_filter,
      target_tag_name: tagname
    }
    material_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        material_suggest_value_list: res.data,
        isRequestIng: false
      })
    })
  },
  // 进行物料标签值选择的时候回调
  onMaterialTagValueSelect(e) {
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    for (const key in this.data.material_tag_filter) {
      if (key === tagname) {
        this.data.material_tag_filter[key] = tagvalue
      }
    }
    this.setData({
      material_tag_filter: this.data.material_tag_filter,
      materialTagKeyFocus: ''
    })
  },



// 物料搜索
  formSubmitSearch: function (e) {
    let that = this
    that.onTap()
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 500
      },
      sort: {
        更新时间: -1
      }
    }
    if (!isEmpty(e.detail.value['物料编号'])) {
      parameter['物料编号'] = e.detail.value['物料编号']
    }
    parameter.tags = that.data.material_tag_filter
    filter_warehouse_material(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        console.log(res.data)
        that.setData({
          materialSearchList: res.data
        })
      }
    })
  },
  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
    that.onTap()
  },

  // 提交入库
  formSubmitInOutStock: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var that = this
    var checkedSupplierList = that.data.checkedSupplierList
    var materialSearchListItem = that.data.materialSearchListItem
    var parameter = {
      login_token: app.globalData.login_token(),
      备注: e.detail.value['备注']
    }
    if (that.data.type == 'import') {
      parameter['事件类型'] = '入库'
    } else if (that.data.type == 'export') {
      parameter['事件类型'] = '出库'
    }
    var 物料变更列表 = []
    for (var i = 0; i < checkedSupplierList.length;i++) {
      var item = {
        unique_id: materialSearchListItem.unique_id,
        物料编号: materialSearchListItem['物料编号'],
        tags: materialSearchListItem.tags,
        单位: materialSearchListItem['单位'],
        供应商信息: checkedSupplierList[i]
      }
      if (that.data.type == 'import') {
        item['该物料变更数量'] = parseFloat(e.detail.value['stocknum' + i])
      } else if (that.data.type == 'export') {
        item['该物料变更数量'] = parseFloat(-(e.detail.value['stocknum' + i]))
      }
      物料变更列表.push(item)
    }
    for (var i = 0; i < 物料变更列表.length;i++) {
      if (物料变更列表[i]['供应商信息']['仓库剩余数量'] !== 0 && 物料变更列表[i]['该物料变更数量'] === 0 && that.data.type == 'import') {
        markedWords('入库数量不能为0')
        return false
      }
      if (物料变更列表[i]['供应商信息']['仓库剩余数量'] !== 0 && 物料变更列表[i]['该物料变更数量'] === 0 && that.data.type == 'export') {
        markedWords('出库数量不能为0')
        return false
      }
    }
    parameter['物料变更列表'] = 物料变更列表
    console.log(parameter['物料变更列表'])
    inventory_change_via_operation(parameter, that).then(res => {
      setStatus(that, false)
      if (res.status === 'OK') {
        if (that.data.type == 'import') {
          markedWords('入库成功~', 'succes', 1500)
          setTimeout(function () {
            wx.navigateBack()
          }, 1500)
        } else if (that.data.type == 'export') {
          markedWords('出库成功~', 'succes', 1500)
          setTimeout(function () {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var type = options.type
    if (type == 'import') {
      wx.setNavigationBarTitle({
        title: '物料手动入库'
      })
    } else if (type == 'export') {
      wx.setNavigationBarTitle({
        title: '物料手动出库'
      })
    }
    that.setData({
      type: type
    })
    this.materialDebouncedHandleSearch = debounce(this.onInputmaterialTag, 1500)
    // 获取物料标签
    that.getmaterialTagNames()
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