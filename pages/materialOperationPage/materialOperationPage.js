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
  compareObj
} from "../../utils/util.js";
import {
  get_material_tag_names,
  material_tags_auto_complete,
  add_warehouse_matetial,
  edit_warehouse_material_by_id
} from "../../services/warehouseProcurement.js";
import {
  filter_supplier
} from "../../services/supplier.js";
import {
  generate_year_month_sequence_number
} from "../../services/otherUtilityClasses.js";
import debounce from "../../utils/lodash/debounce.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面模式 addMaterial（添加物料），lookOver（查看物料），editMaterial（编辑物料），copyAddMaterial(复制添加)
    mode: '',
    form: null,
    // 获取焦点的那个物料标签输入框的 标签值列表（比如裆口的所有值）
    material_suggest_value_list: [],
    // 物料标签输入框 获取焦点的标签名称
    materialTagKeyFocus: '',
    // 空物料数据结构
    emptyMaterial: {},

    // 供应商名称 选择列表
    supplier_suggest_value_list: [],
    // 供应商名称是否获取了焦点
    supplierTagKeyFocus: false,
    // 当前操作的供应商索引
    curOperationSupplierIndex: 0,
    // 所有的供应商列表
    allSuppliers: [],
    loading: false,


    floorstatus: false,
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 标题的初始化
  titleInitialization(options) {
    let that = this
    if (!isEmpty(options) && options.mode === 'addMaterial') {
      wx.setNavigationBarTitle({
        title: '添加物料'
      })
    } else if (!isEmpty(options) && options.mode === 'lookOver') {
      wx.setNavigationBarTitle({
        title: '查看物料'
      })
    } else if (!isEmpty(options) && options.mode === 'editMaterial') {
      wx.setNavigationBarTitle({
        title: '编辑物料'
      })
    } else if (!isEmpty(options) && options.mode === 'copyAddMaterial') {
      wx.setNavigationBarTitle({
        title: '复制添加物料'
      })
    } else {
      return
    }
    that.setData({
      mode: options.mode
    })
  },

  // 初始化form
  initializationForm() {
    let that = this
    return new Promise(function(resolve, reject) {
      if (that.data.mode === 'addMaterial') {
        var form = deepClone(app.globalData['空的物料结构'])
        // 1.先给标签赋值
        var material_tag_names = app.globalData.tagsOfMaterials()
        var material_tag_filter = {}
        for (var index in material_tag_names) {
          material_tag_filter[material_tag_names[index]] = ''
        }
        form.tags = material_tag_filter
        // 2.生成物料编号
        var login_token = app.globalData.login_token()
        var post_data = {
          login_token: login_token,
          流水单分组: 'WLD',
        }
        return generate_year_month_sequence_number(post_data, that).then(res => {
          var code = res.data['流水号']
          form.物料编号 = code
          form.unique_id = code
          form.仓库剩余数量 = 0
          //3. 组合供应商列表给form
          var supplierList = []
          supplierList.push(deepClone(app.globalData['物料的空的供应商信息']))
          form['供应商列表'] = supplierList
          that.setData({
            form: form
          })
          resolve()
        })
      } else if (that.data.mode === 'lookOver') {
        var form = deepClone(app.globalData.materialDetails)
        that.setData({
          form: form
        })
        resolve()
      } else if (that.data.mode === 'editMaterial') {
        var form = deepClone(app.globalData.materialDetails)
        that.setData({
          form: form
        })
        resolve()
      } else if (that.data.mode === 'copyAddMaterial') {
        var form = deepClone(app.globalData.materialDetails)
        // 2.生成物料编号
        var login_token = app.globalData.login_token()
        var post_data = {
          login_token: login_token,
          流水单分组: 'WLD',
        }
        return generate_year_month_sequence_number(post_data, that).then(res => {
          var code = res.data['流水号']
          form.物料编号 = code
          form.unique_id = code
          that.setData({
            form: form
          })
          resolve()
        })
      }
    })
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      materialTagKeyFocus: '',
      supplierTagKeyFocus:''
    })
  },

  // 查询数据库全部的供应商
  checkAllSuppliers() {
    let that = this
    var post_data = {
      login_token: app.globalData.login_token()
    }
    return new Promise(function(resolve, reject) {
      return filter_supplier(post_data, that).then(res => {
        that.data.allSuppliers = res.data
        resolve()
      })
    })
  },

  // 物料基础信息输入的时候
  onBlurMaterialBaseInfo(e) {
    let that = this
    var mode = e.currentTarget.id
    if (mode === '单位') {
      that.data.form['单位'] = e.detail.value.trim()
    } else if (mode === '备注') {
      that.data.form['备注'] = e.detail.value.trim()
    }
  },

  // 物料标签获取焦点的时候
  onFocusMaterialTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.form.tags,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      material_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          material_suggest_value_list: res.data,
          materialTagKeyFocus: res.data.length>0? e.currentTarget.dataset.tagname:'',
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 物料标签输入的时候触发
  onInputMaterialTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode))return
    that.data.form.tags[tagname] = value
    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.form.tags,
      target_tag_name: tagname
    }
    material_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        material_suggest_value_list: res.data,
        isRequestIng: false,
      })
    })
  },
  // 进行物料标签值选择的时候回调
  onmaterialTagValueSelect(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    for (const key in that.data.form.tags) {
      if (key === tagname) {
        that.data.form.tags[key] = tagvalue
      }
    }
    this.setData({
      'form.tags': that.data.form.tags,
      materialTagKeyFocus: ''
    })
  },

  // 供应商名称获取焦点的时候
  onFocusSupplierTag(e) {
    let that = this
    setTimeout(() => {
      var suggest_value_list = []
      var value = e.detail.value
      for (var index in that.data.allSuppliers) {
        if (value === '') {
          suggest_value_list.push(that.data.allSuppliers[index]['名称'])
        } else {
          if (that.data.allSuppliers[index]['名称'].includes(value)) {
            suggest_value_list.push(that.data.allSuppliers[index]['名称'])
          }
        }
      }
      that.setData({
        supplier_suggest_value_list: suggest_value_list,
        supplierTagKeyFocus: true,
        curOperationSupplierIndex: e.currentTarget.dataset.curoperationsupplierindex,
      })
    }, 200);

  },


  // 供应商名称输入的时候
  onInputSupplierTag(e) {
    let that = this
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode))return
    var curOperationSupplierIndex = e.currentTarget.dataset.curoperationsupplierindex
    that.data.form['供应商列表'][curOperationSupplierIndex]['名称'] = value
    var post_data = {
      名称: value,
      login_token: app.globalData.login_token(),
      sort: {
        更新时间: -1
      }
    }
    filter_supplier(post_data, that).then(response => {
      var suggest_value_list = []
      for (var index in response.data) {
        suggest_value_list.push(response.data[index]['名称'])
      }
      that.setData({
        supplier_suggest_value_list: suggest_value_list,
        curOperationSupplierIndex: curOperationSupplierIndex,
        isRequestIng: false
      })
      that.theProcessingLogicAfterTheSupplierNameIsEntered(curOperationSupplierIndex)
    })
  },

  // 进行供应商名称值选择的时候回调
  onSupplierTagValueSelect(e) {
    let that = this
    var value = e.currentTarget.dataset.tagvalue
    var curOperationSupplierIndex = that.data.curOperationSupplierIndex
    that.data.form['供应商列表'][curOperationSupplierIndex]['名称'] = value

    that.setData({
      supplierTagKeyFocus: false
    })
    that.theProcessingLogicAfterTheSupplierNameIsEntered(curOperationSupplierIndex)
  },

  // 供应商名称输入后的处理逻辑
  theProcessingLogicAfterTheSupplierNameIsEntered(index) {
    let that = this
    // 1.根据索引 判断 form.供应商列表的指定对象的名称 是否能在 全部的供应商列表中能找到
    var supplier = that.data.form['供应商列表'][index]
    var i = that.data.allSuppliers.findIndex(item => {
      return item['名称'] === supplier['名称']
    })
    if (i === -1) {
      // 如果没找到 要删除unique_id
      supplier.unique_id = ''
      supplier['更新时间'] = ''
    } else {
      // 如果找到了 
      supplier.unique_id = that.data.allSuppliers[i].unique_id
      supplier.名称 = that.data.allSuppliers[i].名称
      supplier.供应商价格 = 0
      supplier.仓库剩余数量 = 0
      supplier.更新时间 = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
    }
    that.setData({
      form: that.data.form
    })
  },

  // 供应商信息输入框失去焦点后（供应商价格,仓库剩余数量，供应商物料名称，说明....）
  onBlurSupplierInfo(e) {
    let that = this
    var mode = e.currentTarget.id
    var curoperationsupplierindex = Number(e.currentTarget.dataset.curoperationsupplierindex)
    if (mode === '供应商价格') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.form['供应商列表'][curoperationsupplierindex]['供应商价格'] = value
    } else if (mode === '仓库剩余数量') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.form['供应商列表'][curoperationsupplierindex]['仓库剩余数量'] = value
    } else if (mode === '供应商物料名称') {
      var value = e.detail.value
      that.data.form['供应商列表'][curoperationsupplierindex]['供应商物料名称'] = value
    } else if (mode === '说明') {
      var value = e.detail.value
      that.data.form['供应商列表'][curoperationsupplierindex]['说明'] = value
    } else {
      return
    }

    that.calculateWarehouseSurplus()
    that.setData({
      curOperationSupplierIndex: curoperationsupplierindex,
      form: that.data.form
    })
  },

  // 添加供应商
  addSupplier() {
    let that = this
    // 等待一下先让失去焦点的逻辑处理完
    setTimeout(() => {
      if (!that.continueToAddVendorJudgmentCriteria()) return
      var emptySupplier = deepClone(that.data.form['供应商列表'][that.data.form['供应商列表'].length - 1])
      emptySupplier.unique_id = ''
      emptySupplier.名称 = ''
      emptySupplier.更新时间 = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
      that.data.form['供应商列表'].push(emptySupplier)
      that.calculateWarehouseSurplus()
      that.setData({
        form: that.data.form
      })
    }, 100);
  },

  // 删除供应商列表中的元素
  removeSupplierFromList(e) {
    let that = this
    var index = e.currentTarget.dataset.curoperationsupplierindex
    if (that.data.form['供应商列表'].length <= 1) {
      that.data.form['供应商列表'][0] = deepClone(app.globalData['物料的空的供应商信息'])
      that.setData({
        'form.供应商列表[0]': that.data.form['供应商列表'][0]
      })
      return
    }
    that.data.form['供应商列表'].splice(index, 1)
    that.calculateWarehouseSurplus()
    that.setData({
      form: that.data.form
    })
  },

  // 继续添加供应商的时候，判断form.供应商列表
  continueToAddVendorJudgmentCriteria() {
    let that = this
    for (let r = 0; r < that.data.form['供应商列表'].length; r++) {
      const element_wai = that.data.form['供应商列表'][r]
      //1.如果没有输入供应商名称，那么不允许继续添加
      if (isEmpty(element_wai.名称)) {
        markedWords(`供应商列表第${r + 1}行，供应商数据缺少名称！`)
        return false
      }
      var index = that.data.allSuppliers.findIndex(item => {
        return item.名称 === element_wai.名称
      })
      // 2.如果供应商名称不是真实存在的，那么不允许继续添加
      if (index === -1) {
        markedWords(`供应商列表第${r + 1}行，不允许添加不存在的供应商！`)
        return false
      }
      if (isEmpty(element_wai.unique_id)) {
        markedWords(`供应商列表第${r + 1}行，供应商数据缺少unique_id！`)
        return false
      }

      for (let c = r + 1; c < that.data.form['供应商列表'].length; c++) {
        // 如果找到重复的名称或者是完全一样的unique_id，那么也不合规
        const element_nei = that.data.form['供应商列表'][c]
        if (element_nei.unique_id === element_wai.unique_id || element_nei.名称 === element_wai.名称) {
          markedWords('供应商列表中不允许出现重复的供应商名称和unique_id')
          return false
        }
      }
    }
    return true
  },

  // 计算仓库剩余量
  calculateWarehouseSurplus() {
    let that = this
    var 仓库剩余数量 = 0
    for (let i = 0; i < that.data.form.供应商列表.length; i++) {
      const element = that.data.form.供应商列表[i]
      仓库剩余数量 += Number(element.仓库剩余数量)
    }
    that.data.form.仓库剩余数量 = 仓库剩余数量
  },

  // 确认添加或者编辑物料的时候判断form.供应商列表
  determineConditionsWhenAddingOrEditingMaterials() {
    let that = this
    for (let r = 0; r < that.data.form['供应商列表'].length; r++) {
      const element_wai = that.data.form['供应商列表'][r]
      //1.如果它输入了供应商名称,那么就必须保证该 供应商名称真实存在
      if (!isEmpty(element_wai.名称)) {
        var index = that.data.allSuppliers.findIndex(item => {
          return item.名称 === element_wai.名称
        })
        if (index === -1) {
          markedWords(`供应商列表第${r + 1}行，只要你输入了供应商名称那就必须保证它真实的存在！`)
          return false
        }
      }
      for (let c = r + 1; c < that.data.form['供应商列表'].length; c++) {
        // 2. 如果找到重复的名称或者是完全一样的unique_id，那么也不合规
        const element_nei = that.data.form['供应商列表'][c]
        if (element_nei.unique_id === element_wai.unique_id || element_nei.名称 === element_wai.名称) {
          markedWords('供应商列表中不允许出现重复的供应商名称和unique_id')
          return false
        }
      }
    }
    return true
  },

  formSubmit: function(e) {
    let that = this
    that.onTap()
    that.setData({
      loading: true
    })
    // 等上两秒在提交。应为可能会有延迟搜索
    setTimeout(() => {
      that.setData({
        loading: false
      })
      console.log('form发生了submit事件，携带数据为：', e.detail.value)
      if (!objectHasAtLeastOneKeyWhoseValueIsNotNull(that.data.form.tags)) {
        markedWords('物料基本信息至少应该输入一个标签！')
        return
      }
      if (isEmpty(that.data.form['单位'])) {
        markedWords('物料单位是必选项！')
        return
      }
      if (!that.determineConditionsWhenAddingOrEditingMaterials()) {
        return
      }

      if (that.data.mode === 'addMaterial') {
        var parameter = {
          login_token: app.globalData.login_token(),
          data: that.data.form
        }
        add_warehouse_matetial(parameter, that).then(res => {
          setStatus(that, false)
          markedWords('添加物料成功', 'none')
          setTimeout(function () {
            wx.navigateBack()
          }, 1500)
        })
      } else if (that.data.mode === 'editMaterial') {
        const parameter = {
          login_token: app.globalData.login_token(),
          unique_id: that.data.form['物料编号'],
          update_data: that.data.form
        }
        edit_warehouse_material_by_id(parameter, that).then(res => {
          setStatus(that, false)
          markedWords(res.msg, 'none')
          setTimeout(function () {
            wx.navigateBack()
          }, 1500)
        })
      }
    }, 1200)


  },
  formReset: function() {
    let that = this
    that.onTap()
    console.log('form发生了reset事件')
    // 页面初始化流程
    that.initializationForm().then(res => {
      setStatus(that, false)
    })
  },


  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.materialDebouncedHandleSearch = debounce(this.onInputMaterialTag, 1000)
    this.supplierDebouncedHandleSearch = debounce(this.onInputSupplierTag, 1000)
    that.titleInitialization(options)

    // 页面初始化流程
    that.initializationForm().then(res => {
      that.checkAllSuppliers().then(res => {
        setStatus(that, false)
      })
    })
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