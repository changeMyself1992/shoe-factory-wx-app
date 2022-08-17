// pages/returnSupplierNote/returnSupplierNote.js
import {
  isEmpty,
  markedWords,
  deepClone,
  setStatus,
} from "../../utils/util.js";
import {
  warehouse_add_return_goods_note,
  warehouse_return_goods_list
} from "../../services/returnSupplierGoods.js";
import {
  filter_supplier
} from "../../services/supplier.js";
import debounce from "../../utils/lodash/debounce.js";
import {
  checkLogin,
  programInitialization
} from '../../utils/user.js'
import regeneratorRuntime from '../../utils/runtime.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: null,
    loading: false,
    // 按关键词搜索到的名称及列表 操作项
    nameAndSpecificationList: [],
    // 名称及规格输入框是否获取了焦点
    nameAndSpecificationFocus: false,
    // 工厂名称输入框是否获取了焦点
    factoryNmaeFocus: false,
    // 工厂信息列表
    factoryInformationList: [],
    // 当前操作的货单索引
    curOperationInvoiceIndex: 0,
    //是否正在发起请求
    isRequestIng: false,
    //是否显示回到顶部图标
    floorstatus: false,
    keyFocus: null
  },

  // 初始化form
  initializationForm() {
    let that = this
    var form = deepClone(app.globalData['空的供应商送货单'])
    form['工厂unique_id'] = app.globalData.chooseedEnterpriseId()
    form['工厂名称'] = app.globalData.chooseedEnterpriseName()

    form['送货单位经手人手机'] = app.globalData.userInfo()['绑定手机号']

    form['送货单'].push(deepClone(app.globalData['空的供应商送货单元素']))
    form['送货单'][0]['最大可退货数量'] = ''
    that.setData({
      form: form,
      sumPrice: 0,
    })
    console.log(that.data.form)
  },

  onTap() {
    let that = this
    that.setData({
      nameAndSpecificationFocus: false,
      factoryNmaeFocus: false
    })
  },

  // 货物信息输入框失去焦点后（货号,名称及规格，，单位....）
  onBlurElementsInfo(e) {
    let that = this
    var mode = e.currentTarget.id
    var curOperationItemIndex = Number(e.currentTarget.dataset.curoperationitemindex)

    setTimeout(() => {
      if (mode === '货号') {
        var value = e.detail.value
        that.data.form['送货单'][curOperationItemIndex]['货号'] = value
      } else if (mode === '名称及规格') {
        var value = e.detail.value
        that.data.form['送货单'][curOperationItemIndex]['名称及规格'] = value
      } else if (mode === '单位') {
        var value = e.detail.value
        that.data.form['送货单'][curOperationItemIndex]['单位'] = value
      } else if (mode === '数量') {
        if (e.detail.value != '') {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
        } else {
          var value = e.detail.value
        }
        // 如果是数量得话 总价格=数量*单价
        that.data.form['送货单'][curOperationItemIndex]['数量'] = value
        that.data.form['送货单'][curOperationItemIndex]['总价格'] =
          Number(parseFloat(value * that.data.form['送货单'][curOperationItemIndex]['单价']).toFixed(2))
        if (that.data.form['送货单'][curOperationItemIndex]['总价格']) {
          that.sunPrice()
        }
        if (that.data.form['送货单'][curOperationItemIndex]['数量'] == 0) {
          that.sunPrice()
        }
      } else if (mode === '单价') {
        if (e.detail.value != '') {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
        } else {
          var value = e.detail.value
        }
        // 如果是单价得话 总价格=数量*单价
        that.data.form['送货单'][curOperationItemIndex]['单价'] = value
        that.data.form['送货单'][curOperationItemIndex]['总价格'] =
          Number(parseFloat(value * that.data.form['送货单'][curOperationItemIndex]['数量']).toFixed(2))
        if (that.data.form['送货单'][curOperationItemIndex]['总价格']) {
          that.sunPrice()
        }
        if (that.data.form['送货单'][curOperationItemIndex]['单价'] == 0) {
          that.sunPrice()
        }
      } else if (mode === '总价格') {
        if (e.detail.value != '') {
          var value = Number(parseFloat(e.detail.value).toFixed(2))
        } else {
          var value = e.detail.value
        }
        that.data.form['送货单'][curOperationItemIndex]['总价格'] = value
        // 如果单价不为0 那么计算数量
        if (that.data.form['送货单'][curOperationItemIndex]['单价'] !== 0) {
          that.data.form['送货单'][curOperationItemIndex]['数量'] =
            Number(parseFloat(value / that.data.form['送货单'][curOperationItemIndex]['单价']).toFixed(2))
        }
        // 如果数量不为0 那么计算单价
        else if (that.data.form['送货单'][curOperationItemIndex]['数量'] !== 0) {
          that.data.form['送货单'][curOperationItemIndex]['单价'] =
            Number(parseFloat(value / that.data.form['送货单'][curOperationItemIndex]['数量']).toFixed(2))
        } else {
          markedWords('数量和单价至少要输入一项')
        }
        if (that.data.form['送货单'][curOperationItemIndex]['总价格']) {
          that.sunPrice()
        }
        if (that.data.form['送货单'][curOperationItemIndex]['总价格'] == 0) {
          that.sunPrice()
        }
      } else if (mode === '备注') {
        var value = e.detail.value
        that.data.form['送货单'][curOperationItemIndex]['备注'] = value
      }

      that.setData({
        curOperationItemIndex: curOperationItemIndex,
        form: that.data.form
      })
    }, 50)

  },

  // 货物信息输入框获取焦点后（货号,名称及规格，，单位....）
  onFocusElementsInfo(e) {
    let that = this
    that.onTap()
    var mode = e.currentTarget.id
    var value = Number(e.detail.value)
    var curOperationItemIndex = Number(e.currentTarget.dataset.curoperationitemindex)


    if (mode === '数量' && value === 0) {
      that.data.form['送货单'][curOperationItemIndex]['数量'] = ""
    } else if (mode === '单价' && value === 0) {
      that.data.form['送货单'][curOperationItemIndex]['单价'] = ""
    } else if (mode === '总价格' && value === 0) {
      that.data.form['送货单'][curOperationItemIndex]['总价格'] = ""
    }



    that.setData({
      curOperationItemIndex: curOperationItemIndex,
      form: that.data.form
    })
  },

  // 删除送货单中的元素
  removeElementsFromList(e) {
    let that = this
    var index = e.currentTarget.dataset.curoperationitemindex
    if (that.data.form['送货单'].length <= 1) {
      that.data.form['送货单'][0] = deepClone(app.globalData['空的供应商送货单元素'])
      that.setData({
        'form.送货单[0]': that.data.form['送货单'][0],
        sumPrice: 0
      })
      return
    }
    that.data.form['送货单'].splice(index, 1)
    that.setData({
      form: that.data.form
    })
    that.sunPrice()
  },

  // 继续添加货物
  addElementsOfGoods() {
    let that = this
    // 等待一下先让失去焦点的逻辑处理完
    setTimeout(() => {
      if (!that.continueToAddGoodsJudgmentCriteria()) return
      var emptyElement = deepClone(app.globalData['空的供应商送货单元素'])
      emptyElement['最大可退货数量'] = ''
      that.data.form['送货单'].push(emptyElement)
      that.setData({
        form: that.data.form
      })
      console.log(that.data.form['送货单'])
    }, 100);
  },

  // 继续添加货物的时候，判断form.送货单
  continueToAddGoodsJudgmentCriteria() {
    let that = this
    that.sunPrice()
    for (let r = 0; r < that.data.form['送货单'].length; r++) {
      const element_wai = that.data.form['送货单'][r]
      if (isEmpty(element_wai.名称及规格)) {
        markedWords(`退货单第${r + 1}行，名称及规格是必填项！`)
        return false
      }
      if (isEmpty(element_wai.单位)) {
        markedWords(`退货单第${r + 1}行，单位是必填项！`)
        return false
      }
      if (isEmpty(element_wai.数量) || isEmpty(element_wai.单价)) {
        markedWords(`退货单第${r + 1}行，数量和单价必须输入！`)
        return false
      }
      if (isEmpty(element_wai.总价格)) {
        markedWords(`退货单第${r + 1}行，总价格是必填项！`)
        return false
      }
      if (element_wai.数量 > element_wai.最大可退货数量) {
        markedWords(`退货单第${r + 1}行，数量不能大于最大退货数量！`)
        return false
      }
      for (let c = r + 1; c < that.data.form['送货单'].length; c++) {
        // 如果找到重复的名称或者是完全一样的unique_id，那么也不合规
        const element_nei = that.data.form['送货单'][c]
        if (element_nei.名称及规格 === element_wai.名称及规格) {
          markedWords('退货单中不允许出现重复的名称及规格')
          return false
        }
      }
    }
    return true
  },

  // 求和
  sunPrice() {
    let that = this
    var sumPrice = 0
    for (let r = 0; r < that.data.form['送货单'].length; r++) {
      sumPrice = sumPrice + that.data.form['送货单'][r].总价格
    }
    // 判断超过两位小数则需要保留
    var pointNum = String(sumPrice).indexOf(".") + 1
    console.log(sumPrice)
    console.log(pointNum)
    if (pointNum >= 2) {
      sumPrice = sumPrice.toFixed(2)
    }
    that.setData({
      sumPrice: sumPrice
    })
  },

  // 当名称及规格获取焦点的时候
  onFocusNameAndSpecification(e) {
    let that = this
    var curOperationInvoiceIndex = e.currentTarget.dataset.curoperationinvoiceindex
    that.setData({
      keyFocus: curOperationInvoiceIndex,
      curOperationInvoiceIndex: curOperationInvoiceIndex
    })
  },

  // 当名称及规格进行选择的时候
  onNameAndSpecificationSelect(e) {
    let that = this
    var name = e.currentTarget.dataset.name
    var curOperationInvoiceIndex = that.data.curOperationInvoiceIndex
    var item = that.data.returnhuodanList.find((item) => {
      return item.名称及规格 === name
    })
    console.log(that.data.form)
    that.data.form['送货单'][curOperationInvoiceIndex].名称及规格 = item.名称及规格
    that.data.form['送货单'][curOperationInvoiceIndex].单位 = item.单位
    that.data.form['送货单'][curOperationInvoiceIndex].单价 = item.单价
    that.data.form['送货单'][curOperationInvoiceIndex].最大可退货数量 = item.sum_count
    that.setData({
      form: that.data.form,
      keyFocus: null
    })
  },

  // 当工厂名称获取焦点的时候
  onFocusFactoryName(e) {
    let that = this
    var value = e.detail.value
    var paramter = {
      名称: value,
      login_token: app.globalData.login_token()
    }
    filter_supplier(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        factoryInformationList: res.data,
        factoryNmaeFocus: res.data.length > 0 ? true : false,
        nameAndSpecificationFocus: false
      })
    })
  },

  // 当工厂名称输入的时候
  onInputFactorName(e) {
    let that = this
    var value = e.detail.value
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.data.form['供应商unique_id'] = ''
    that.data.form['供应商名称'] = value
    var paramter = {
      名称: value,
      login_token: app.globalData.login_token()
    }

    filter_supplier(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        factoryInformationList: res.data,
        factoryNmaeFocus: res.data.length > 0 ? true : false
      })
      that.theProcessingLogicAfterTheFactoryNameIsEntered()
    })
  },

  // 工厂名称进行选择的时候
  onFactoryNameSelect(e) {
    let that = this
    var factory = e.currentTarget.dataset.factory
    that.data.form['供应商名称'] = factory['名称']
    that.setData({
      factoryNmaeFocus: false
    })
    that.theProcessingLogicAfterTheFactoryNameIsEntered()
  },

  // 工厂名称输入后的处理逻辑
  theProcessingLogicAfterTheFactoryNameIsEntered() {
    let that = this
    // 1.判断当前工厂名称 是否能在factoryInformationList中能找到
    var factorName = that.data.form['供应商名称']
    var i = that.data.factoryInformationList.findIndex(item => {
      return item['名称'] === factorName
    })
    if (i !== -1) {
      // 如果找到了 
      that.data.form['供应商名称'] = that.data.factoryInformationList[i]['名称']
      that.data.form['供应商unique_id'] = that.data.factoryInformationList[i]['unique_id']
    } else {
      return
    }
    that.setData({
      form: that.data.form
    })
    var paramter = {
      供应商unique_id: that.data.form['供应商unique_id'],
      login_token: app.globalData.login_token()
    }
    warehouse_return_goods_list(paramter, that).then(res => {
      setStatus(that, false)
      // 判断 returnhuodanList
      // that.data.form['送货单'].push(emptyElement)
      if (res.data.length===0){
        var emptyElement = deepClone(app.globalData['空的供应商送货单元素'])
        emptyElement['最大可退货数量'] = ''
        that.data.form['送货单']=[]
        that.data.form['送货单'].push(emptyElement)
      }
      that.setData({
        returnhuodanList: res.data,
        form: that.data.form
      })
    })
  },

  formSubmit: function (e) {
    setTimeout(() => {
    let that = this
    if (that.data.loading) return
    that.setData({
      loading: true
    })
    if (!that.continueToAddGoodsJudgmentCriteria()) {
      that.setData({
        loading: false
      })
      return
    }
    if (isEmpty(that.data.form['供应商名称']) || isEmpty(that.data.form['供应商unique_id'])) {
      that.setData({
        loading: false
      })
      markedWords('不存在的供应商无法提交货单！')
      return
    }
    var paramter = {}
    paramter.login_token = app.globalData.login_token()
    paramter.供应商unique_id = that.data.form.供应商unique_id
    paramter.退货单 = []
    for (let index = 0; index < that.data.form.送货单.length; index++) {
      const element = that.data.form.送货单[index]
      var item = {
        名称及规格: element.名称及规格,
        单位: element.单位,
        数量: element.数量,
        单价: element.单价,
        总价格: element.总价格,
        货号: element.货号,
        备注: element.备注
      }
      paramter.退货单.push(item)
    }
    console.log(paramter)
    warehouse_add_return_goods_note(paramter, that).then(res => {
      setStatus(that, false)
      that.setData({
        loading: false
      })
      that.formReset()
      markedWords('提交退货单成功～')
    }).catch(err => {
      that.setData({
        loading: false
      })
    })
    }, 200);
  },

  formReset: function () {
    let that = this
    console.log('form发生了reset事件')
    // 页面初始化流程
    that.initializationForm()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    // 先判断是不是扫码进入，如果是那么要进行登录检查
    if (!isEmpty(options.q)) {
      //检查登录
      await checkLogin()
      //小程序初始化
      await programInitialization(app)
    }
    this.factoryNameDebouncedHandleSearch = debounce(this.onInputFactorName, 1000)
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
    that.setData({
      floorstatus: true
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onTabItemTap(item) {
    let that = this
    that.initializationForm()
  },
  /************页面事件*************************************end*********************** */
})