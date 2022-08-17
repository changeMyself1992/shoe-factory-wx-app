const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"

import {
  material_tags_auto_complete,
  filter_warehouse_material
} from "../../services/warehouseProcurement.js";

import debounce from "../../utils/lodash/debounce.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    updateTimeStart: '',
    updateTimeEnd: '',

    material_tag_filter: {},
    // 获取焦点的那个物料标签输入框的 标签值列表（比如裆口的所有值）
    material_suggest_value_list: [],
    // 物料标签输入框 获取焦点的标签名称
    materialTagKeyFocus: '',

    //搜索成功后的跳转链接
    searchForJumpLinksAfterSuccess: "/pages/warehouseList_applicationFunction/warehouseList_applicationFunction",

    //是否正在发起请求
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },


  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      materialTagKeyFocus: ''
    })
  },

  // 结算状态选择后调用
  bindPickerChange: function(e) {
    this.setData({
      materialStatusIndex: e.detail.value
    })
  },

  //日期选择
  bindDateChange: function(e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '更新时间段开始') {
      this.setData({
        updateTimeStart: e.detail.value
      })
    } else if (mode === '更新时间段截止') {
      this.setData({
        updateTimeEnd: e.detail.value
      })
    }
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
    if (isEmpty(e.detail.keyCode))return
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




  formSubmit: function(e) {
    let that = this
    that.onTap()
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 16
      },
      sort: {
        更新时间: -1
      }
    }
    if (!isEmpty(e.detail.value['物料编号'])) {
      parameter['物料编号'] = e.detail.value['物料编号']
    }

    if (!isEmpty(e.detail.value['更新时间段开始']) && !isEmpty(e.detail.value['更新时间段截止'])) {
      if (new Date(e.detail.value['更新时间段开始']) >= new Date(e.detail.value['更新时间段截止'])) {
        markedWords('开始时间必须小于截止时间')
        return
      }
      parameter['更新时间_下限'] = e.detail.value['更新时间段开始']
      parameter['更新时间_上限'] = e.detail.value['更新时间段截止']
    }
    parameter.tags = that.data.material_tag_filter
    app.globalData.parameter = parameter
    filter_warehouse_material(parameter, that).then(res => {
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.materialList = res.data
        var searchCondition = {
          物料编号: e.detail.value['物料编号'],
          更新时间段开始: e.detail.value['更新时间段开始'],
          更新时间段截止: e.detail.value['更新时间段截止'],
          ...that.data.material_tag_filter
        }
        app.globalData.isItAJumpFromTheSearchPage = true
        app.globalData.searchCondition = searchCondition
        // 跳回待排产物料列表并指定为 不选中任何状态
        wx.navigateBack({
          url: that.data.searchForJumpLinksAfterSuccess
        })
      }
    })
  },
  formReset: function() {
    let that = this
    console.log('form发生了reset事件')
    that.setData({
      updateTimeStart: '',
      updateTimeEnd: '',
    })
    that.getmaterialTagNames()
    that.onTap()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this

    this.materialDebouncedHandleSearch = debounce(this.onInputmaterialTag, 1500)
    // 获取物料标签
    that.getmaterialTagNames()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
  /************页面事件*************************************end*********************** */
})