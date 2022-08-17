const app = getApp();
import {
  noDataProcessingLogic,
  isEmpty,
  markedWords,
  parseTime,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  deepClone,
  setStatus,
  compareObj,
  processingTokenFailure,
  isRepeat
} from "../../utils/util.js";
import {
  get_order_tag_names,
  order_tags_auto_complete,
  add_order,
  edit_order_by_id
} from "../../services/ordersForProductionScheduling.js";
import {
  product_tags_auto_complete,
  filter_product
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import {
  generate_year_month_sequence_number
} from "../../services/otherUtilityClasses.js";
import {
  filter_client
} from "../../services/customer.js";
import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
import isEqual from "../../utils/lodash/isEqual.js";
import api from '../../config/api';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    配码数组: [],
    // 页面模式 addOrder（添加订单），lookOver（查看订单），editOrder（编辑订单）
    mode: '',
    form: null,
    // 获取焦点的那个订单标签输入框的 标签值列表（比如裆口的所有值）
    order_suggest_value_list: [],
    // 订单标签输入框 获取焦点的标签名称
    orderTagKeyFocus: '',
    // 获取焦点的那个产品标签标签输入框的 标签值列表（比如楦型的所有值）
    product_suggest_value_list: [],
    // 产品标签输入框 获取焦点的标签名称(比如 楦型)
    productTagKeyFocus: '',
    // 品牌输入框是否获取了焦点
    brandFocus: false,
    // 品牌列表
    brands: [],
    clientList: [],
    //客户下拉选项
    clientOptions: [],
    // 选中的客户下拉选项的索引
    clientIndex: -1,
    // 订单下拉选项
    orderOptions: ['新订单', '排产中', '完成'],
    // 选中的订单状态索引
    orderStatusIndex: 0,
    // 空产品数据结构
    emptyProduct: {},
    product_tag_names: [
      // '楦型',
      // '款号',
      // .....
    ],
    // 当前操作的产品索引
    curOperationProcutIndex: 0,
    // 产品列表每个产品元素的配码数量是否展开
    productPeiMaUnfold: [],
    floorstatus: false,
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },
  viewProductDetail(e) {
    var that = this
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/produceAndOrderToProductDetail/produceAndOrderToProductDetail?id=' + id,
    })
  },
  
  // 查看图片详情
  previewImage(e) {
    let that = this;
    var array = []
    if (e.target.id === '上传纸质订单' && !isEmpty(that.data.form['上传图片列表'][0])) {
      array.push(that.data.form['上传图片列表'][0])
      wx.previewImage({
        urls: array
      })
    } else if (e.target.id === '上传样品图片' && !isEmpty(that.data.form['上传图片列表'][1])) {
      array.push(that.data.form['上传图片列表'][1])
      wx.previewImage({
        urls: array
      })
    }
  },

  // 标题的初始化
  titleInitialization(options) {
    let that = this
    if (!isEmpty(options) && options.mode === 'addOrder') {
      wx.setNavigationBarTitle({
        title: '添加订单'
      })
    } else if (!isEmpty(options) && options.mode === 'lookOver') {
      wx.setNavigationBarTitle({
        title: '查看订单'
      })
    } else if (!isEmpty(options) && options.mode === 'editOrder') {
      wx.setNavigationBarTitle({
        title: '编辑订单'
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
      if (that.data.mode === 'addOrder') {
        var form = deepClone(app.globalData['空订单结构'])
        // 1.先给标签赋值
        var order_tag_names = app.globalData.orderTag()
        var order_tag_filter = {}
        for (var index in order_tag_names) {
          order_tag_filter[order_tag_names[index]] = ''
        }
        form.tags = order_tag_filter
        // 2.生成订单编号
        var login_token = app.globalData.login_token()
        var post_data = {
          login_token: login_token,
          流水单分组: 'DD',
        }
        return generate_year_month_sequence_number(post_data, that).then(res => {
          var code = res.data['流水号']
          form.unique_id = code
          form.订单编号 = code
          // 3.获取客户列表
          return that.filterClient().then(res => {
            // 4. 生成订单日期
            var orderDate = parseTime(new Date(), '{y}-{m}-{d}')
            form['订单日期'] = orderDate
            that.setData({
              form: form,
              orderStatusIndex: 0
            })
            resolve(true)
          })
        })
      } else if (that.data.mode === 'lookOver' || that.data.mode === 'editOrder') {
        if (that.data.mode === 'lookOver') {
          that.setData({
            form: deepClone(app.globalData.orderDetails)
          })
        }
        if (that.data.mode === 'editOrder') {
          that.setData({
            form: deepClone(app.globalData.orderDetails)
          })
        }
        // 1.设置订单状态
        var orderStatusIndex = that.data.orderOptions.findIndex(item => {
          return item === that.data.form['订单状态']
        })
        that.setData({
          orderStatusIndex: orderStatusIndex
        })
        // 2.获取客户列表
        return that.filterClient().then(res => {
          // 如果当前订单的客户信息不为空
          if (!isEmpty(that.data.form['客户信息'])) {
            // 遍历客户列表，获取当前订单在客户列表中的索引
            var clientIndex = that.data.clientList.findIndex(client => {
              return client.unique_id === that.data.form['客户信息'].unique_id
            })
            that.setData({
              clientIndex: clientIndex
            })
          }
          resolve(true)
        })
      }
    })
  },

  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      orderTagKeyFocus: '',
      productTagKeyFocus: '',
      brandFocus: false
    })
  },

  // 初始化 emptyProduct
  initializeEmptyProduct() {
    let that = this
    var 配码 = []
    that.data.配码数组.forEach(element => {
      var item = {
        国标码: element.gjm,
        尺码: element.size,
        已排产数量: 0,
        目标数量: 0
      }
      配码.push(item)
    })
    that.data.emptyProduct = deepClone(app.globalData['订单包含的产品空元素'])
    that.data.emptyProduct.配码数量.件数 = 1
    that.data.emptyProduct['配码数量']['配码'] = 配码
  },

  // 初始化productList
  initProductList() {
    let that = this
    var emptyProduct = deepClone(that.data.emptyProduct)
    that.data.productList = []
    var 包含的产品 = that.data.form['包含的产品']
    if (包含的产品.length === 0) {
      var tags = {}
      for (let i = 0; i < that.data.product_tag_names.length; i++) {
        const element = that.data.product_tag_names[i]
        tags[element] = ''
      }
      emptyProduct.产品信息.tags = tags
      that.data.productList.push(emptyProduct)
      that.setData({
        productList: that.data.productList
      })
    } else {
      // 如果父组件传递产品列表信息过来那么自己组合 使用父组件数据
      for (let i = 0; i < 包含的产品.length; i++) {
        var element = 包含的产品[i]
        element['配码数量是否展开'] = false
        if (!element) return
        that.data.productList.push(element)
      }
      that.setData({
        productList: that.data.productList
      })
    }
  },
  // 初始化配码数组
  initializesTheCollocationArray() {
    if (this.data.mode === 'addOrder') {
      this.data.配码数组 = deepClone(app.globalData.withCodeArray())
    } else {
      var 配码 = this.data.form['包含的产品'][0]['配码数量']['配码']
      this.data.配码数组 = 配码.map(item => {
        return {
          gjm: String(item['国标码']),
          size: String(item['尺码'])
        }
      })
    }
  },

  // 获取配置中对产品的tags数组，确保先载入
  getProductTagName() {
    let that = this
    that.data.product_tag_names = app.globalData.productTag()
  },

  // 订单标签获取焦点的时候
  onFocusOrderTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.form.tags,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      order_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          order_suggest_value_list: res.data,
          orderTagKeyFocus: res.data.length === 0 ? '' : e.currentTarget.dataset.tagname,
          productTagKeyFocus: '',
          isRequestIng: false
        })
      })
    }, 200)
  },
  // 订单标签失去焦点的时候
  onBlurOrderTag(e) {
    let that = this
    if (e.currentTarget.dataset.tagname === '品牌') {

      setTimeout(() => {
        var brands = that.data.brands
        if (!brands.includes(that.data.form.tags.品牌) && !isEmpty(that.data.form.tags.品牌)) {
          brands.push(that.data.form.tags.品牌)
          that.setData({
            brands: brands
          })
        }
      }, 200)
    }
  },

  // 订单标签输入的时候触发
  onInputOrderTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.form.tags[tagname] = value
    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: that.data.form.tags,
      target_tag_name: tagname
    }
    order_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        order_suggest_value_list: res.data,
        orderTagKeyFocus: res.data.length === 0 ? '' : tagname,
        isRequestIng: false
      })
    })
  },

  // 进行订单标签值选择的时候回调
  onOrderTagValueSelect(e) {
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
      orderTagKeyFocus: ''
    })
  },

  // 产品标签获取焦点的时候
  onFocusProductTag(e) {
    let that = this
    setTimeout(() => {
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: e.currentTarget.dataset.tags,
        target_tag_name: e.currentTarget.dataset.tagname
      }
      product_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          product_suggest_value_list: res.data,
          productTagKeyFocus: res.data.length === 0 ? '' : e.currentTarget.dataset.tagname,
          orderTagKeyFocus: '',
          curOperationProcutIndex: e.currentTarget.dataset.curoperationprocutindex,
          isRequestIng: false,
          brandFocus: false
        })
      })
    }, 200)
  },

  // 产品标签输入的时候触发
  onInputProductTag(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var value = e.detail.value
    if (isEmpty(e.detail.keyCode)) return
    var curOperationProcutIndex = that.data.curOperationProcutIndex
    that.data.productList[curOperationProcutIndex]['产品信息'].tags[tagname] = value

    // 继续自动补全标签
    var login_token = app.globalData.login_token()
    var post_data = {
      login_token: login_token,
      base_tags: e.currentTarget.dataset.tags,
      target_tag_name: tagname
    }
    product_tags_auto_complete(post_data, that).then(res => {
      that.setData({
        product_suggest_value_list: res.data,
        productList: that.data.productList
      })
      that.generateANumberBasedOnTheLabel(curOperationProcutIndex).then(res => {
        setStatus(that, false)
      })
    })
  },

  // 进行产品标签值选择的时候回调
  onProductTagValueSelect(e) {
    let that = this
    var tagname = e.currentTarget.dataset.tagname
    var tagvalue = e.currentTarget.dataset.tagvalue
    var curOperationProcutIndex = that.data.curOperationProcutIndex
    for (const key in that.data.productList[curOperationProcutIndex]['产品信息'].tags) {
      if (key === tagname) {
        that.data.productList[curOperationProcutIndex]['产品信息'].tags[key] = tagvalue
      }
    }
    that.setData({
      productList: that.data.productList,
      productTagKeyFocus: ''
    })
    that.generateANumberBasedOnTheLabel(curOperationProcutIndex).then(res => {
      setStatus(that, false)
    })
  },

  // 根据某个产品的标签来生成产品编号
  generateANumberBasedOnTheLabel(product_index) {
    let that = this
    var login_token = app.globalData.login_token()
    return new Promise(function (resolve, reject) {
      var post_data_a = {
        login_token: login_token,
        流水单分组: 'CPD'
      }
      return generate_year_month_sequence_number(post_data_a, that).then(res => {
        var code = res.data['流水号']
        var tags = deepClone(that.data.productList[product_index]['产品信息'].tags)
        var post_data_b = {
          login_token: login_token,
          tags: tags
        }
        // 查询产品
        return filter_product(post_data_b, that).then(res => {
          // 判断 如果查询结果为0，或者查询结果为空 那我们就要生成一个新产品，
          if (isEmpty(res.data) || res.data.length === 0) {
            that.data.productList[product_index].产品信息.产品编号 = code
            that.data.productList[product_index].产品信息.unique_id = code
            that.setData({
              productList: that.data.productList
            })
            resolve(true)
          } else {
            // 如果查询结果长度 大于0,那么遍历所有的产品 查找是否有和我输入的标签完全一致的产品 如果有那么选中它
            for (let i = 0; i < res.data.length; i++) {
              const element = res.data[i]
              if (isEqual(element.tags, tags)) {
                that.data.productList[product_index].产品信息 = element
                that.setData({
                  productList: that.data.productList
                })
                resolve(true)
                return
              }
            }
            // 如果没有找到完全相等的那么 创建新的
            that.data.productList[product_index].产品信息.产品编号 = code
            that.data.productList[product_index].产品信息.unique_id = code
            that.setData({
              productList: that.data.productList
            })
            resolve(true)
          }
        })
      })
    })
  },
  // 获取所有用户信息
  filterClient() {
    let that = this
    var post_data = {
      login_token: app.globalData.login_token()
    }
    return new Promise(function (resolve, reject) {
      filter_client(post_data, that).then(response => {
        that.data.clientList = response.data
        var options = []
        that.data.clientList.forEach((element, index) => {
          options.push(element['名称'])
        })
        that.setData({
          clientOptions: options
        })
        resolve(true)
      })
    })
  },
  // 客户信息选择后调用
  bindPickerChangeClient: function (e) {
    this.setData({
      clientIndex: e.detail.value
    })
  },
  // 清空客户信息
  deletecustompicker() {
    this.setData({
      clientIndex: -1
    })
  },
  // 订单状态选择后回调
  bindPickerChangeOrderStatus: function (e) {
    this.setData({
      orderStatusIndex: e.detail.value
    })
  },
  //日期选择
  bindDateChange: function (e) {
    let that = this
    var mode = e.currentTarget.id
    var value = e.detail.value
    if (mode === '订单日期') {
      this.setData({
        'form.订单日期': e.detail.value
      })
    } else if (mode === '交货日期') {
      this.setData({
        'form.交货日期': e.detail.value
      })
    }
  },

  //图片上传
  uploadImage: function (e) {
    var that = this;
    that.onTap()
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
              if (mode == "paperOrders") {
                that.setData({
                  'form.上传图片列表[0]': data.url
                })
              } else if (mode == "theSampleImages") {
                that.setData({
                  'form.上传图片列表[1]': data.url
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

  // 检查productList数据结构是否正常
  // （无编号， 存在标签完全一样元素，编号重复，这几种情况就是不正常，不可继续添加产品，也不可提交订单）
  checkProductList() {
    let that = this
    for (let r = 0; r < that.data.productList.length; r++) {
      const element_wai = that.data.productList[r]
      // 如果productList 中有产品编号未完成，不可添加，
      if (isEmpty(element_wai.产品信息.产品编号) || isEmpty(element_wai.产品信息.unique_id)) {
        markedWords('每个产品模块必须包含产品编号！')
        return false
      }
      if (isEmpty(element_wai.配码数量.总数)) {
        markedWords('订单的产品总数必须大于0')
        return false
      }
      // 现在允许提交相同产品
      // for (let c = r + 1; c < that.data.productList.length; c++) {
      //   // 如果找到重复的编号或者是完全一样的标签信息，那么也不可添加
      //   const element_nei = that.data.productList[c]
      //   if (
      //     element_nei.产品信息.产品编号 === element_wai.产品信息.产品编号 || element_nei.产品信息.unique_id === element_wai.产品信息.unique_id ||
      //     compareObj(element_nei.产品信息.tags, element_wai.产品信息.tags)
      //   ) {
      //     markedWords('每个产品模块必须包含产品编号，标签或者产品编号不能完全一样')
      //     return false
      //   }
      // }
    }
    return true
  },

  // 添加产品
  addProduct() {
    let that = this
    if (!that.checkProductList()) return
    var product = deepClone(that.data.productList[that.data.productList.length - 1])
    var addProduct = deepClone(that.data.emptyProduct)
    addProduct.产品信息.tags = deepClone(product.产品信息.tags)
    addProduct.产品信息.产品编号 = product.产品信息.产品编号
    addProduct.产品信息.unique_id = product.产品信息.unique_id
    addProduct.品牌 = product.品牌
    addProduct.客户产品编号 = product.客户产品编号
    addProduct.配码数量 = deepClone(product.配码数量)
    that.data.productList.push(addProduct)
    that.setData({
      productList: that.data.productList
    })
  },

  kindToggle: function (even) {
    let that = this
    that.onTap()
    var curOperationProcutIndex = Number(even.currentTarget.dataset.curoperationprocutindex)
    that.data.productList[curOperationProcutIndex]['配码数量是否展开'] = !that.data.productList[curOperationProcutIndex]['配码数量是否展开']
    this.setData({
      curOperationProcutIndex: curOperationProcutIndex,
      productList: that.data.productList
    });
  },

  // 配码编辑数量输入框获取焦点的时候
  peiMaFocus(even) {
    let that = this;
    // 输入的值
    var value = Number(even.detail.value);
    // 当前操作的产品索引
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
    // 当前操作的配码索引
    var peiMaIndex = even.target.dataset.peimaindex;

    // 如果是0，那么直接清空输入框
    if (value === 0) {
      that.data.productList[curOperationProcutIndex]['配码数量']['配码'][peiMaIndex]['目标数量'] = ''
      that.setData({
        productList: that.data.productList
      });
    }

    that.setData({
      curOperationProcutIndex: curOperationProcutIndex
    });
  },

  // 配码编辑数量输入框失去焦点的时候
  codeAfterTheNumberOfEditsCallback(even) {
    let that = this;
    // 输入的值
    var value = Number(even.detail.value);
    // 当前操作的产品索引
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
    // 当前操作的配码索引
    var peiMaIndex = even.target.dataset.peimaindex;

    if (isEmpty(value)) value = 0
    that.data.productList[curOperationProcutIndex]['配码数量']['配码'][peiMaIndex]['目标数量'] = value

    that.setData({
      productList: that.data.productList,
      curOperationProcutIndex: curOperationProcutIndex
    });
    that.totalNumrOfCompleted();
  },

  // 件数输入框获取焦点的时候
  numberOfPieceFocus(even) {
    let that = this;
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
    var value = Number(even.detail.value);
    // 如果是0，那么直接清空输入框
    if (value === 0) {
      that.data.productList[curOperationProcutIndex]['配码数量']['件数'] = ''
      that.setData({
        productList: that.data.productList
      });
    }
    that.setData({
      curOperationProcutIndex: curOperationProcutIndex
    });
  },

  // 件数输入框失去焦点的时候
  numberOfPieceBlur(even) {
    let that = this;
    var value = Number(even.detail.value);
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)

    if (isEmpty(value)) value = 1
    that.data.productList[curOperationProcutIndex]['配码数量']['件数'] = value
    that.setData({
      productList: that.data.productList,
      curOperationProcutIndex: curOperationProcutIndex
    });
    that.totalNumrOfCompleted();
  },

  // 把选中的产品从订单中删除
  removeProductFromOrder(even) {
    let that = this
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)

    if (that.data.productList.length <= 1) {
      markedWords('至少得包含一个产品！！')
      return
    }
    that.data.productList.splice(curOperationProcutIndex, 1)
    that.setData({
      curOperationProcutIndex: curOperationProcutIndex,
      productList: that.data.productList
    })
  },

  // 当品牌获取焦点的时候
  onFocusBrand(even) {
    let that = this
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
    that.setData({
      orderTagKeyFocus: '',
      productTagKeyFocus: '',
      brandFocus: that.data.brands.length > 0 ? true : false,
      curOperationProcutIndex: curOperationProcutIndex
    })
  },
  //当品牌输入的时候
  onInputBrand(even) {
    let that = this
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
    var value = even.detail.value.trim()
    that.data.productList[curOperationProcutIndex]['品牌'] = value
    that.setData({
      curOperationProcutIndex: curOperationProcutIndex
    })
  },
  // 当品牌进行选择的时候
  onBrandSelect(e) {
    let that = this
    var curOperationProcutIndex = that.data.curOperationProcutIndex
    that.data.productList[curOperationProcutIndex]['品牌'] = e.currentTarget.dataset.brand
    that.setData({
      productList: that.data.productList,
      brandFocus: false
    })
  },
  // 当品牌失去焦点的时候
  onBlurBrand(even) {
    let that = this
    setTimeout(() => {
      var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
      if (!that.data.brands.includes(that.data.productList[curOperationProcutIndex]['品牌']) &&
        !isEmpty(that.data.productList[curOperationProcutIndex]['品牌'])) {
        that.data.brands.push(that.data.productList[curOperationProcutIndex]['品牌'])
        that.setData({
          brands: that.data.brands
        })
      }
    }, 200)
  },


  // 当客户产品标号失去焦点
  onBlurCustomerProductNumber(even) {
    let that = this
    var curOperationProcutIndex = Number(even.target.dataset.curoperationprocutindex)
    var value = even.detail.value.trim()
    that.data.productList[curOperationProcutIndex]['客户产品编号'] = value
    that.setData({
      productList: that.data.productList,
      curOperationProcutIndex: curOperationProcutIndex
    })
  },

  /**
   * 实时计算 当前产品的配码数量总数
   */
  totalNumrOfCompleted() {
    let that = this
    var count = 0
    var curOperationProcutIndex = that.data.curOperationProcutIndex
    for (
      let i = 0; i < that.data.productList[curOperationProcutIndex]['配码数量']['配码'].length; i++
    ) {
      const element = that.data.productList[curOperationProcutIndex]['配码数量']['配码'][i]
      count = count + Number(element.目标数量)
    }
    that.data.productList[curOperationProcutIndex]['配码数量']['总数'] =
      Number(parseFloat(count * that.data.productList[curOperationProcutIndex]['配码数量']['件数']).toFixed(0))
    that.setData({
      productList: that.data.productList
    })
  },

  formSubmit: function (e) {
    let that = this
    that.onTap()
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    setTimeout(() => {
      if (!objectHasAtLeastOneKeyWhoseValueIsNotNull(that.data.form.tags)) {
        markedWords('至少应该输入一个标签！')
        return
      }
      if (isEmpty(e.detail.value['交货日期'])) {
        markedWords('交货日期必填！')
        return
      }
      if (new Date(e.detail.value['订单日期']) >= new Date(e.detail.value['交货日期'])) {
        markedWords('订单日期不能超过交货日期！')
        return
      }
      // 检查产品列表是否合法
      if (!that.checkProductList()) {
        return
      }
      var form = {
        tags: that.data.form.tags,
        unique_id: e.detail.value['订单编号'],
        上传图片列表: that.data.form['上传图片列表'],
        交货日期: e.detail.value['交货日期'],
        包含的产品: that.data.productList.map(productItem => {
          productItem['配码数量']['配码'].forEach(element => {
            element.目标数量 = productItem['配码数量']['件数'] * element.目标数量
          })
          productItem['配码数量']['件数'] = 1
          return productItem
        }),
        客户信息: Number(e.detail.value['客户索引']) === -1 ? {} : that.data.clientList[Number(e.detail.value['客户索引'])],
        已排产生产单列表: that.data.form['已排产生产单列表'],
        更新时间: that.data.form['更新时间'],
        订单备注: e.detail.value['订单备注'],
        订单完成百分比: that.data.form['订单完成百分比'],
        订单日期: e.detail.value['订单日期'],
        订单状态: that.data.orderOptions[Number(e.detail.value['订单状态索引'])],
        订单编号: e.detail.value['订单编号']
      }

      // 用产品编号判断是否有多个相同产品以便提示用户
      var productnumid = []
      for (var i = 0; i < that.data.productList.length; i++) {
        var ele = that.data.productList[i]
        productnumid.push(ele['产品信息']['产品编号'])
      }
      if (isRepeat(productnumid)) {
        // 判断是否有多个相同产品以便提示用户
        // 说明有重复值
        wx.showModal({
          title: '提示',
          content: '当前提交订单中包含相同的产品，是否确认提交？',
          success(res) {
            if (res.confirm) {
              if (that.data.mode === 'addOrder') {
                var parameter = {
                  login_token: app.globalData.login_token(),
                  data: form
                }
                add_order(parameter, that).then(res => {
                  setStatus(that, false)
                  markedWords('添加订单成功', 'none', 2000)
                  // setTimeout(() => {
                  //   wx.navigateTo({
                  //     url: '/pages/orderList_applicationFunction/orderList_applicationFunction'
                  //   })
                  // }, 2000);
                  setTimeout(function () {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 1500)
                })
              } else if (that.data.mode === 'editOrder') {
                const parameter = {
                  login_token: app.globalData.login_token(),
                  unique_id: e.detail.value['订单编号'],
                  update_data: form
                }
                edit_order_by_id(parameter, that).then(res => {
                  setStatus(that, false)
                  markedWords(res.msg)
                })
              }
            }
          }
        })
      } else {
        if (that.data.mode === 'addOrder') {
          var parameter = {
            login_token: app.globalData.login_token(),
            data: form
          }
          add_order(parameter, that).then(res => {
            setStatus(that, false)
            markedWords('添加订单成功', 'none', 2000)
            setTimeout(function () {
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          })
        } else if (that.data.mode === 'editOrder') {
          const parameter = {
            login_token: app.globalData.login_token(),
            unique_id: e.detail.value['订单编号'],
            update_data: form
          }
          edit_order_by_id(parameter, that).then(res => {
            setStatus(that, false)
            markedWords(res.msg)
          })
        }
      }
    }, 200);
  },
  formReset: function () {
    let that = this
    that.onTap()
    console.log('form发生了reset事件')
    // 页面初始化流程
    that.initializationForm().then(res => {
      this.deletecustompicker()
      that.initializesTheCollocationArray()
      that.getProductTagName()
      that.initializeEmptyProduct()
      that.initProductList()
      setStatus(that, false)
    })
  },


  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.orderDebouncedHandleSearch = debounce(this.onInputOrderTag, 1000)
    this.productDebouncedHandleSearch = debounce(this.onInputProductTag, 1000)
    this.formSubmitHandle = throttle(this.formSubmit, 3000, {
      leading: true,
      trailing: false
    })
    that.titleInitialization(options)

    // 页面初始化流程
    that.initializationForm().then(res => {
      that.initializesTheCollocationArray()
      that.getProductTagName()
      that.initializeEmptyProduct()
      that.initProductList()
      setStatus(that, false)
    })

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