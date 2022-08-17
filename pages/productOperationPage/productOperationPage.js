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
import {
  add_product,
  product_tags_auto_complete,
  filter_product,
  edit_product_by_id,
  filter_component,
  get_supplier_goods,
  get_supplier_goods_price
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import {
  generate_year_month_sequence_number
} from "../../services/otherUtilityClasses.js";
import {
  material_tags_auto_complete,
  filter_warehouse_material
} from "../../services/warehouseProcurement.js";
import {
  auto_complete_supplier_for_product_material
} from "../../services/supplier.js";
import regeneratorRuntime from '../../utils/runtime.js';
import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
import api from '../../config/api';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面模式 addProduct（添加产品），lookOver（查看产品），editProduct（编辑产品）
    mode: '',
    form: null,
    // 获取焦点的产品标签标签输入框的 标签值列表（比如楦型的所有值）
    product_suggest_value_list: [],
    // 产品标签输入框 获取焦点的标签名称(比如 楦型)
    productTagKeyFocus: '',
    // 该产品的部位详情
    partsList: [],
    // 获取焦点的物料标签输入框的 标签值列表（比如 材料类型的所有值）
    material_suggest_value_list: [],
    // 物料标签输入框 获取焦点的标签名称(比如 材料类型)
    materialTagKeyFocus: '',
    // 当前操作的部位索引
    curOperationPartIndex: 0,
    // 供应商名称输入框是否获取了焦点
    supplierNameFocus: false,
    // 全部的部位
    allParts: [],
    // 部位名称是否获取了焦点
    partNameFocus: false,
    // 部位名称输入框的 filter值列表（比如 大底，里皮...）
    part_suggest_value_list: [],

    // 供应商物料名称是否获取了焦点
    supplierMaterialNameFocus: false,
    // 供应商物料名称输入框的 filter值列表
    supplierMaterialName_suggest_value_list: [],


    floorstatus: false,
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },
  // 查看图片放大
  previewImage(e) {
    let that = this;
    var array = []
    if (!isEmpty(that.data.form['产品图片列表'][0])) {
      array.push(that.data.form['产品图片列表'][0])
      wx.previewImage({
        urls: array
      })
    }
  },
  // 标题的初始化
  titleInitialization(options) {
    let that = this
    if (!isEmpty(options) && options.mode === 'addProduct') {
      wx.setNavigationBarTitle({
        title: '添加产品'
      })
    } else if (!isEmpty(options) && options.mode === 'lookOver') {
      wx.setNavigationBarTitle({
        title: '查看产品'
      })
    } else if (!isEmpty(options) && options.mode === 'editProduct') {
      wx.setNavigationBarTitle({
        title: '编辑产品'
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
    return new Promise(function (resolve, reject) {
      if (that.data.mode === 'addProduct') {
        var form = deepClone(app.globalData['空的产品结构'])
        // 1.先给标签赋值
        var product_tag_names = app.globalData.productTag()
        var product_tag_filter = {}
        for (var index in product_tag_names) {
          product_tag_filter[product_tag_names[index]] = ''
        }
        form.tags = product_tag_filter
        that.setData({
          form: form
        })
        // 2.初始化部位详情
        that.initPartDetail()
        resolve(true)
      } else if (that.data.mode === 'lookOver') {
        // 1.先给标签赋值
        var form = deepClone(app.globalData.productDetails)
        that.setData({
          form: form
        })
        // 2.初始化部位详情
        that.initPartDetail()
        resolve(true)
      } else if (that.data.mode === 'editProduct') {
        // 1.先给标签赋值
        var form = deepClone(app.globalData.productDetails)
        that.setData({
          form: form
        })
        // 2.初始化部位详情
        that.initPartDetail()
        resolve(true)
      }
    })
  },

  // 初始化部位详情
  initPartDetail: async function () {
    let that = this
    var res = await filter_component({
      login_token: app.globalData.login_token()
    })
    var 全部的部位 = res.data
    if (!isEmpty(that.data.form['部位详情'])) {
      that.setData({
        partsList: that.data.form['部位详情'],
        allParts: 全部的部位
      })
    } else {
      var partsList = []
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i]
        var tags = {}
        var tagsOfMaterials = app.globalData.tagsOfMaterials()
        for (let j = 0; j < tagsOfMaterials.length; j++) {
          const tag = tagsOfMaterials[j]
          tags[tag] = ''
        }
        var theEmptyPartElementOfTheProduct = deepClone(app.globalData.产品的空部位元素)
        theEmptyPartElementOfTheProduct.unique_id = element.unique_id
        theEmptyPartElementOfTheProduct.部位名称 = element.部位名称
        theEmptyPartElementOfTheProduct.使用物料.tags = tags
        theEmptyPartElementOfTheProduct.使用物料.所选供应商信息 = deepClone(app.globalData.物料的空的供应商信息)
        partsList.push(theEmptyPartElementOfTheProduct)
      }
      that.setData({
        partsList: partsList,
        allParts: 全部的部位
      })
    }
  },
  onTapProductTag(e) {
    let that = this
    if (that.data.mode === 'editProduct' || that.data.mode === "lookOver") {
      markedWords('暂未开放编辑产品标签的功能。')
    }
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      productTagKeyFocus: '',
      materialTagKeyFocus: '',
      supplierNameFocus: false,
      partNameFocus: false,
      supplierMaterialNameFocus: false
    })
  },

  // 产品标签获取焦点的时候
  onFocusProductTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.form.tags,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      product_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          product_suggest_value_list: res.data,
          productTagKeyFocus: res.data.length === 0 ? '' : e.currentTarget.dataset.tagname,
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 产品标签输入的时候触发
  onInputProductTag: function (e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.form.tags[tagname] = value
    // 1.继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.form.tags,
      target_tag_name: tagname
    }
    product_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        product_suggest_value_list: res.data,
        productTagKeyFocus: res.data.length === 0 ? '' : that.data.productTagKeyFocus,
      })
      // 2. 查询产品处理
      that.queryProductHandling().then(res => {


        that.initPartDetail()
        that.setData({
          isRequestIng: false
        })


      })
    })
  },

  // 进行产品标签值选择的时候回调
  onProductTagValueSelect: async function (e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    that.data.form.tags[tagname] = tagvalue
    await that.queryProductHandling()
    // that.initPartDetail()
    that.setData({
      productTagKeyFocus: '',
      isRequestIng: false
    })
  },
  // 查询产品处理
  queryProductHandling() {
    let that = this
    return new Promise(function (resolve, reject) {
      //1.查询产品
      var post_data = {
        login_token: app.globalData.login_token(),
        tags: that.data.form.tags
      }
      return filter_product(post_data, that).then(response => {
        var data = response.data
        var 产品图片列表 = that.data.form['产品图片列表']
        // 如果查询结果长度 大于0,那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有那么选中它
        if (!isEmpty(data) || data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            var element = data[i]
            if (compareObj(element.tags, that.data.form.tags)) {
              element['产品图片列表'] = 产品图片列表
              that.setData({
                form: element
              })
              resolve(true)
              return
            }
          }
        }
        // 如果没有找到完全相等的那么 创建新的
        var tags = that.data.form.tags
        var form = deepClone(app.globalData['空的产品结构'])
        form['产品图片列表']=产品图片列表
        var post_data = {
          login_token: app.globalData.login_token(),
          流水单分组: 'CPD'
        }
        return generate_year_month_sequence_number(post_data, that).then(res_a => {
          var code = res_a.data['流水号']
          const unique_id = code
          form.unique_id = unique_id
          form.产品编号 = unique_id
          form.tags = tags
          that.setData({
            form: form
          })
          resolve(true)
        })
      })
    })
  },

  //图片上传
  uploadImage: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1, //最多可以选择的图片总数
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        //启动上传等待中...
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 1000
        })
        var mode = e.currentTarget.id;
        wx.uploadFile({
          url: api.otherUtilityClasses.upload_file.url,
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'login_token': app.globalData.login_token()
          },
          success: function (res) {
            console.log(res);
            var data = JSON.parse(res.data);
            if (data.status === 'OK') {
              if (mode == "productIcon") {
                that.setData({
                  'form.产品图片列表[0]': data.url
                })
              }
            } else if (data.status === 'TOKEN_FAIL') {
              setStatus(that, false);
              processingTokenFailure(data.msg);
            } else {
              setStatus(that, false);
              markedWords(data.msg);
              reject(false)
            }
          },
          fail: function (res) {
            wx.hideToast();
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function (res) {}
            })
          }
        });
      }
    });
  },

  // 物料标签获取焦点的时候
  onFocusMaterialTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: e.currentTarget.dataset.tags,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      material_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          material_suggest_value_list: res.data,
          materialTagKeyFocus: res.data.length === 0 ? '' : e.currentTarget.dataset.tagname,
          productTagKeyFocus: '',
          supplierNameFocus: false,
          curOperationPartIndex: e.currentTarget.dataset.curoperationpartindex,
          isRequestIng: false
        })
      })
    }, 200)
  },

  // 物料标签输入的时候
  onInputmaterialTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    var curOperationPartIndex = that.data.curOperationPartIndex
    that.data.partsList[curOperationPartIndex]['使用物料'].tags[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.partsList[curOperationPartIndex]['使用物料'].tags,
      target_tag_name: tagname
    }
    material_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        material_suggest_value_list: res.data,
        materialTagKeyFocus: res.data.length === 0 ? '' : that.data.materialTagKeyFocus,
      })
      // 标签输入后的处理
      that.materialLabelInputAfterProcessing(curOperationPartIndex).then(res => {
        setStatus(that, false)
      })
    })
  },

  // 进行物料标签值选择的时候回调
  onMaterialTagValueSelect(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.currentTarget.dataset.tagvalue
    var curOperationPartIndex = that.data.curOperationPartIndex
    that.data.partsList[curOperationPartIndex]['使用物料'].tags[tagname] = value
    that.setData({
      partsList: that.data.partsList,
      materialTagKeyFocus: ''
    })

    // 标签输入后的处理
    that.materialLabelInputAfterProcessing(curOperationPartIndex).then(res => {
      setStatus(that, false)
    })
  },

  // 物料标签输入后的处理逻辑
  materialLabelInputAfterProcessing(index) {
    let that = this
    return new Promise(function (resolve, reject) {
      that.data.partsList[index].使用物料.unique_id = ''
      that.data.partsList[index].使用物料.物料编号 = ''
      // 先判断 如果标签没有全部输满，那么不做查询请求直接退
      if (!objectWhetherAllKeysHaveNoNullValue(that.data.partsList[index].使用物料.tags)) {
        that.setData({
          partsList: that.data.partsList
        })
        resolve()
        return
      }
      var post_data = {
        login_token: app.globalData.login_token(),
        tags: that.data.partsList[index].使用物料.tags,
        sort: {
          更新时间: -1
        }
      }
      return filter_warehouse_material(post_data, that).then(response => {
        const data = response.data
        // 如果查询结果长度大于0,那么遍历所有的物料，查找是否有和我输入的标签完全一致如果有那么选中它
        if (!isEmpty(data) || data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            const element = data[i]
            if (isObjectValueEqual(element.tags, that.data.partsList[index].使用物料.tags)) {
              that.data.partsList[index].使用物料.tags = element.tags
              that.data.partsList[index].使用物料.unique_id = element.unique_id
              that.data.partsList[index].使用物料.单位 = element.单位
              that.data.partsList[index].使用物料.备注 = element.备注
              that.data.partsList[index].使用物料.物料编号 = element.物料编号
              that.setData({
                partsList: that.data.partsList
              })
              resolve()
              return
            }
          }
        }
        // 判断如果查询结果为0，或者没有找到和输入标签一模一样的，那么生成物料编号
        var post_data = {
          login_token: app.globalData.login_token(),
          流水单分组: 'CPD'
        }
        const res_a = generate_year_month_sequence_number(post_data, that).then(res_a => {
          var code = res_a.data['流水号']
          var unique_id = code
          that.data.partsList[index].使用物料.unique_id = unique_id
          that.data.partsList[index].使用物料.物料编号 = unique_id
          that.setData({
            partsList: that.data.partsList
          })
          resolve()
          return
        })
      })
    })
  },

  // 部位名称获取焦点的时候
  onFocusPartName(e) {
    let that = this
    var part_suggest_value_list = e.detail.value ? that.data.allParts.filter((item) => {
      return (item.部位名称.toLowerCase().indexOf(e.detail.value.toLowerCase()) === 0)
    }) : that.data.allParts
    setTimeout(() => {
      that.setData({
        partNameFocus: true,
        materialTagKeyFocus: '',
        productTagKeyFocus: '',
        supplierNameFocus: false,
        curOperationPartIndex: e.currentTarget.dataset.curoperationpartindex,
        part_suggest_value_list: part_suggest_value_list
      })
    }, 200)
  },
  // 部位名称输入的时候
  onInputPartName(e) {
    let that = this
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return

    var value = e.detail.value
    var curOperationPartIndex = that.data.curOperationPartIndex
    that.data.partsList[curOperationPartIndex]['部位名称'] = value
    that.data.partsList[curOperationPartIndex]['unique_id'] = value

    var part_suggest_value_list = e.detail.value ? that.data.allParts.filter((item) => {
      return (item.部位名称.toLowerCase().indexOf(e.detail.value.toLowerCase()) === 0)
    }) : that.data.allParts

    that.setData({
      part_suggest_value_list: part_suggest_value_list,
      partNameFocus: part_suggest_value_list.length === 0 ? false : true,
    })
  },
  // 部位名称进行选择的时候
  onPartNameSelect(e) {
    let that = this
    var partvalue = e.currentTarget.dataset.partvalue
    var curOperationPartIndex = that.data.curOperationPartIndex
    that.data.partsList[curOperationPartIndex]['部位名称'] = partvalue
    that.data.partsList[curOperationPartIndex]['unique_id'] = partvalue
    that.setData({
      partsList: that.data.partsList,
      partNameFocus: false
    })
  },


  // 物料信息输入框获取焦点后（物料数量,市场单价，单位....）
  onFocusmaterialInfo(e) {
    let that = this
    var mode = e.currentTarget.id
    var curoperationpartindex = Number(e.currentTarget.dataset.curoperationpartindex)
    if (mode === '物料数量') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.partsList[curoperationpartindex]['物料数量'] = value === 0 ? '' : value
    } else if (mode === '参考市场单价') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.partsList[curoperationpartindex]['使用物料']['参考市场单价'] = value === 0 ? '' : value
    } else {
      return
    }
    that.setData({
      curOperationPartIndex: curoperationpartindex,
      partsList: that.data.partsList
    })
  },

  // 物料信息输入框失去焦点后（物料数量,市场单价，单位....）
  onBlurmaterialInfo(e) {
    let that = this
    var mode = e.currentTarget.id
    var curoperationpartindex = Number(e.currentTarget.dataset.curoperationpartindex)
    if (mode === '物料数量') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.partsList[curoperationpartindex]['物料数量'] = value
    } else if (mode === '参考市场单价') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.partsList[curoperationpartindex]['使用物料']['参考市场单价'] = value
    } else if (mode === '单位') {
      var value = e.detail.value
      that.data.partsList[curoperationpartindex]['使用物料']['单位'] = value
    } else if (mode === '备注') {
      var value = e.detail.value
      that.data.partsList[curoperationpartindex]['使用物料']['备注'] = value
    } else {
      return
    }
    that.setData({
      curOperationPartIndex: curoperationpartindex,
      partsList: that.data.partsList
    })
  },

  // 供应商名称获取焦点的时候
  onFocusSupplierName(e) {
    let that = this
    var curoperationpartindex = e.currentTarget.dataset.curoperationpartindex
    var login_token = app.globalData.login_token()
    var value = e.detail.value
    var post_data = {
      login_token: login_token,
      "供应商名称": value,
      "物料unique_id": that.data.partsList[curoperationpartindex]['使用物料']['物料编号']
    }
    auto_complete_supplier_for_product_material(post_data, that).then(response => {
      var suggest_value_list = []
      var 供应商 = response.data.其他供应商.供应商
      for (let i = 0; i < 供应商.length; i++) {
        suggest_value_list.push(供应商[i])
      }
      var 已有的供应商 = response.data.已有的供应商
      for (let j = 0; j < 已有的供应商.length; j++) {
        suggest_value_list.push(已有的供应商[j])
      }
      that.data.partsList[curoperationpartindex]['使用物料']['供应商列表'] = suggest_value_list
      that.setData({
        partsList: that.data.partsList,
        supplierNameFocus: true,
        productTagKeyFocus: '',
        materialTagKeyFocus: '',
        curOperationPartIndex: curoperationpartindex,
        isRequestIng: false
      })
    })
  },
  // 供应商名称输入的时候
  onInputSupplierName(e) {
    let that = this
    // 不允许输入只允许点选
    var curOperationPartIndex = that.data.curOperationPartIndex
    that.data.partsList[curOperationPartIndex]['使用物料']['所选供应商信息'] = deepClone(app.globalData.物料的空的供应商信息)
    var post_data = {
      login_token: app.globalData.login_token(),
      "供应商名称": '',
      "物料unique_id": that.data.partsList[curOperationPartIndex]['使用物料']['物料编号']
    }
    auto_complete_supplier_for_product_material(post_data, that).then(response => {
      var suggest_value_list = []
      var 供应商 = response.data.其他供应商.供应商
      for (let i = 0; i < 供应商.length; i++) {
        suggest_value_list.push(供应商[i])
      }
      var 已有的供应商 = response.data.已有的供应商
      for (let j = 0; j < 已有的供应商.length; j++) {
        suggest_value_list.push(已有的供应商[j])
      }
      that.data.partsList[curOperationPartIndex]['使用物料']['供应商列表'] = suggest_value_list
      that.setData({
        partsList: that.data.partsList,
        isRequestIng: false
      })
    })
  },
  // 供应商名称选择的时候
  onSupplierNameSelect(e) {
    let that = this
    var curOperationPartIndex = that.data.curOperationPartIndex
    var supplier = e.currentTarget.dataset.supplier
    var row = that.data.partsList[curOperationPartIndex]
    console.log('打印选中的供应商和当前行数据')
    console.log(supplier)
    console.log(row)
    row['使用物料']['所选供应商信息'].unique_id = supplier.unique_id
    row['使用物料']['所选供应商信息']['仓库剩余数量'] = supplier.hasOwnProperty('仓库剩余数量') ? Number(supplier['仓库剩余数量']) : 0
    row['使用物料']['所选供应商信息']['供应商价格'] = supplier.hasOwnProperty('供应商价格') ? Number(supplier['供应商价格']) : 0
    row['使用物料']['所选供应商信息']['供应商物料名称'] = supplier.hasOwnProperty('供应商物料名称') ? supplier['供应商物料名称'] : ''
    row['使用物料']['所选供应商信息']['名称'] = supplier['名称']
    row['使用物料']['所选供应商信息']['更新时间'] = supplier['更新时间']
    row['使用物料']['所选供应商信息']['说明'] = supplier.hasOwnProperty('说明') ? supplier['说明'] : ''
    that.setData({
      partsList: that.data.partsList,
      supplierNameFocus: false
    })
  },

  // 供应商物料名称获取焦点的时候
  onFocusSupplierMaterialName(e) {
    let that = this
    var curoperationpartindex = e.currentTarget.dataset.curoperationpartindex
    var value = e.detail.value
    var post_data = {
      login_token: app.globalData.login_token(),
      supplier_unique_id: that.data.partsList[curoperationpartindex]['使用物料']['所选供应商信息'].unique_id
    }
    get_supplier_goods(post_data, that).then(response => {
      that.setData({
        supplierMaterialName_suggest_value_list: response.data,
        supplierMaterialNameFocus: true,
        partNameFocus: false,
        supplierNameFocus: false,
        productTagKeyFocus: '',
        materialTagKeyFocus: '',
        curOperationPartIndex: curoperationpartindex,
        isRequestIng: false
      })
    })
  },
  // 供应商物料名称输入的时候
  onInputSupplierMaterialName(e) {
    let that = this
    // 不允许输入只允许点选
    var curOperationPartIndex = that.data.curOperationPartIndex
    that.data.partsList[curOperationPartIndex]['使用物料']['所选供应商信息']['供应商物料名称'] = e.detail.value
    that.setData({
      partsList: that.data.partsList
    })
  },
  // 供应商物料名称选择的时候
  onSupplierMaterialNameSelect(e) {
    let that = this
    // console.log(e)
    var post_data = {
      login_token: app.globalData.login_token(),
      goods_name: e.currentTarget.dataset.suppliermaterialname,
      supplier_unique_id: that.data.partsList[that.data.curOperationPartIndex]['使用物料']['所选供应商信息'].unique_id
    }
    get_supplier_goods_price(post_data, that).then(res => {
      var data = res.data
      that.data.partsList[that.data.curOperationPartIndex]['使用物料']['所选供应商信息']['供应商物料名称'] = e.currentTarget.dataset.suppliermaterialname
      that.data.partsList[that.data.curOperationPartIndex]['使用物料']['所选供应商信息']['供应商价格'] = data.goods_price
      that.data.partsList[that.data.curOperationPartIndex]['使用物料']['所选供应商信息']['说明'] = data.emarks
      that.setData({
        partsList: that.data.partsList,
        isRequestIng: false,
        supplierMaterialNameFocus: false
      })
    })
  },

  // 供应商信息输入框失去焦点后（物料数量,市场单价，单位....）
  onBlurSupplierInfo(e) {
    let that = this
    var mode = e.currentTarget.id
    var curoperationpartindex = Number(e.currentTarget.dataset.curoperationpartindex)
    if (mode === '供应商物料名称') {
      var value = e.detail.value
      that.data.partsList[curoperationpartindex]['使用物料']['所选供应商信息']['供应商物料名称'] = value
    } else if (mode === '供应商价格') {
      var value = Number(Number(e.detail.value).toFixed(2))
      that.data.partsList[curoperationpartindex]['使用物料']['所选供应商信息']['供应商价格'] = value
    } else if (mode === '说明') {
      var value = e.detail.value
      that.data.partsList[curoperationpartindex]['使用物料']['所选供应商信息']['说明'] = value
    } else {
      return
    }
    that.setData({
      curOperationPartIndex: curoperationpartindex,
      partsList: that.data.partsList
    })
  },

  // 清空部位的方法
  clearPart(e) {
    let that = this
    var curoperationpartindex = Number(e.currentTarget.dataset.curoperationpartindex)
    var tags = {}
    var tagsOfMaterials = app.globalData.tagsOfMaterials()
    for (let j = 0; j < tagsOfMaterials.length; j++) {
      const tag = tagsOfMaterials[j]
      tags[tag] = ''
    }

    var 产品的空部位元素 = deepClone(app.globalData.产品的空部位元素)
    产品的空部位元素.unique_id = ''
    产品的空部位元素.部位名称 = ''
    产品的空部位元素['使用物料'].tags = tags
    产品的空部位元素.使用物料.所选供应商信息 = deepClone(app.globalData.物料的空的供应商信息)
    that.data.partsList[curoperationpartindex] = 产品的空部位元素
    that.setData({
      partsList: that.data.partsList
    })
  },
  // 删除部位
  removePart(e) {
    let that = this
    var curoperationpartindex = Number(e.currentTarget.dataset.curoperationpartindex)
    if (that.data.partsList.length <= 1) {
      markedWords('至少得包含一个部位！！！')
      return
    }
    that.data.partsList.splice(curoperationpartindex, 1)
    that.setData({
      partsList: that.data.partsList
    })
  },
  // 继续添加部位
  continueAdd(e) {
    let that = this
    var curoperationpartindex = Number(e.currentTarget.dataset.curoperationpartindex)
    if (!that.checkPartsDetail()) return
    var theEmptyPartElementOfTheProduct = deepClone(app.globalData.产品的空部位元素)
    var tags = {}
    var tagsOfMaterials = app.globalData.tagsOfMaterials()
    for (let j = 0; j < tagsOfMaterials.length; j++) {
      const tag = tagsOfMaterials[j]
      tags[tag] = ''
    }

    theEmptyPartElementOfTheProduct.unique_id = ''
    theEmptyPartElementOfTheProduct.部位名称 = ''
    theEmptyPartElementOfTheProduct.使用物料.tags = tags
    theEmptyPartElementOfTheProduct.使用物料.所选供应商信息 = deepClone(app.globalData.物料的空的供应商信息)
    that.data.partsList.splice(curoperationpartindex + 1, 0, theEmptyPartElementOfTheProduct)
    that.setData({
      partsList: that.data.partsList
    })
  },

  // 检查 部位详情数组中的元素  数据结构是否正常
  checkPartsDetail() {
    let that = this
    for (let r = 0; r < that.data.partsList.length; r++) {
      const element_wai = that.data.partsList[r]

      // 如果部位名称为空那么，提示请选择一个部位
      if (isEmpty(element_wai.部位名称) || isEmpty(element_wai.unique_id)) {
        setStatus(that, false)
        markedWords(`第${r + 1}行，部位名称是必须填项目。`)
        return false
      }

      // 如果至少输入了一条物料标签，但是还没有生成编号，提示如果要填写物料必须4个标签全部填写
      if (objectHasAtLeastOneKeyWhoseValueIsNotNull(element_wai.使用物料.tags)) {
        if (isEmpty(element_wai.使用物料.unique_id) || isEmpty(element_wai.使用物料.物料编号)) {
          setStatus(that, false)
          markedWords(`第${r + 1}个部位，缺少物料编号，要生成物料编号必须填写全部的物料信息。`)
          return false
        }
      }

      // 如果用户没有输入供应商名称，但是却输入了供应商其他信息 ，也不允许提交
      if (
        isEmpty(element_wai['使用物料']['所选供应商信息']['名称']) && objectHasAtLeastOneKeyWhoseValueIsNotNull(
          element_wai['使用物料']['所选供应商信息']
        )
      ) {
        setStatus(that, false)
        markedWords(`第${r + 1}个部位，如果要填写供应商其他信息，那么首先供应商名称是必填的。`)
        return false
      }

      for (let c = r + 1; c < that.data.partsList.length; c++) {
        const element_nei = that.data.partsList[c]
        // 如果有重复的部位那么也不允许提交
        if (element_wai.部位名称 === element_nei.部位名称 || element_wai.unique_id === element_nei.unique_id) {
          setStatus(that, false)
          markedWords(`第${r + 1}行，第${c + 1}行，一个产品不允许有重复的部位。`)
          return false
        }
        // 如果两个标签不相同，但是他们的编号相同(说明在延迟查询的这两秒里面他在快速点击，也不允许提交)
        if (!compareObj(element_wai.使用物料.tags, element_nei.使用物料.tags) &&
          element_wai.使用物料.物料编号 === element_nei.使用物料.物料编号 && !isEmpty(element_wai.使用物料.物料编号) &&
          !isEmpty(element_nei.使用物料.物料编号)
        ) {
          setStatus(that, false)
          markedWords(`正在生成新编号，稍等两秒在提交！`)
          return false
        }
      }
    }
    return true
  },

  formSubmit: async function (e) {
    let that = this
    that.onTap()
    if (!app.globalData.theirOwnRights()['产品资料可写']) {
      markedWords("无此操作权限")
      return
    }
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (that.data.mode === 'addProduct') {
      // 1.先查询该产品是否在数据库存在
      var post_data_a = {
        login_token: app.globalData.login_token(),
        tags: that.data.form.tags
      }
      const response_a = await filter_product(post_data_a, that)
      const data = response_a.data
      // 如果查询结果长度不为0，那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有 那么退出方法
      if (!isEmpty(response_a.data) && response_a.data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          var element = data[i]
          if (isObjectValueEqual(element.tags, that.data.form.tags)) {
            console.log(1111)
            console.log(element)
            setStatus(that, false)
            markedWords('该产品已经存在于产品库,只能编辑,不可重复添加')
            return
          }
        }
      }
      // 2.给form赋值 部位详情
      if (!that.checkPartsDetail()) return
      that.data.form['部位详情'] = that.data.partsList
      that.data.form['备注'] = e.detail.value['产品备注']
      // 3.开始真正的添加产品
      var post_data_b = {
        login_token: app.globalData.login_token(),
        data: that.data.form
      }
      const response_b = await add_product(post_data_b, that)
      setStatus(that, false)
      markedWords(response_b.msg)
      that.formReset()
    } else if (that.data.mode === 'editProduct') {
      // 2.给form赋值 部位详情
      if (!that.checkPartsDetail()) return
      that.data.form['部位详情'] = that.data.partsList
      that.data.form['备注'] = e.detail.value['产品备注']
      var post_data = {
        login_token: app.globalData.login_token(),
        unique_id: that.data.form.unique_id,
        update_data: that.data.form
      }

      // 调用api
      var response = await edit_product_by_id(post_data, that)
      setStatus(that, false)
      markedWords(response.msg)
    }
  },
  formReset: function () {
    let that = this
    that.onTap()
    console.log('form发生了reset事件')
    // 页面初始化流程
    that.initializationForm()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.productDebouncedHandleSearch = debounce(that.onInputProductTag, 1000)
    this.materialDebouncedHandleSearch = debounce(this.onInputmaterialTag, 1000)
    this.supplierNameDebouncedHandleSearch = debounce(this.onInputSupplierName, 1000)
    this.supplierMaterialNameDebouncedHandleSearch = debounce(this.onInputSupplierMaterialName, 1000)
    this.partNameDebouncedHandleSearch = debounce(this.onInputPartName, 1000)

    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, {
      leading: true,
      trailing: false
    })


    that.titleInitialization(options)
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