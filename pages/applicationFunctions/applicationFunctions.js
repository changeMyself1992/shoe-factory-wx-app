const app = getApp();
import {
  production_control_filter_unconfirmed_staff_record
} from "../../services/ordersForProductionScheduling.js";
import {
  filter_supplier_transactions
} from "../../services/supplier.js";
import {
  filter_user
} from "../../services/personnelAndAuthorityManagement.js"
import {
  confirm_login_by_qrcode_token
} from "../../services/loginAndLogoutTool.js"
import {
  markedWords,
  parseQueryString,
  setStatus,
  deepClone
} from "../../utils/util.js"
import {
  programInitialization
} from '../../utils/user.js'
import throttle from "../../utils/lodash/throttle.js";
import regeneratorRuntime from "../../utils/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigationBar: null,
    // 需要进行记录确认的全部生产单
    total_count_product_note_List: 0,
    // 需要进行记录确认的全部送货单
    total_count_supplier_note_List: 0,
    // 需要进行确认的全部待审核员工
    total_count_user: 0,
    // cardBox的上边距需动态计算
    marginTop: "0px",
    isRequestIng: false
  },

  // 允许从相机和相册扫码
  getScancode() {
    let that = this
    wx.scanCode({
      success(res) {
        var result = res.result
        if (result.includes('https://mes.westmatrix.cn/production_note?id=')) {
          result = encodeURIComponent(result)
          wx.navigateTo({
            url: "/pages/productionOrderDetails/productionOrderDetails?q=" + result
          })
        } else if (result.includes('https://mes.westmatrix.cn/wx_login?token=')) {
          const query = parseQueryString(result);
          wx.showModal({
            title: '登录提示',
            content: '是否同意使用小程序登录',
            success(res) {
              if (res.confirm) {
                var paramter = {
                  qrcode_token: query.token,
                  login_token: app.globalData.login_token(),
                }
                wx.showLoading({
                  title: '登录中...',
                })
                confirm_login_by_qrcode_token(paramter).then(res => {
                  setTimeout(() => {
                    wx.hideLoading()
                    // 倒计时俩秒
                    markedWords(res.msg)
                  }, 2000)
                }).catch(err=>{
                  wx.hideLoading()
                })
              }
            }
          })
        }
      }
    })
  },

  // 生产记录待确认 按钮点击
  clickTheButtonToConfirmPieceRecord(e) {
    let that = this
    // 跳转生产单快捷操作
    wx.navigateTo({
      url: '/pages/productOrderQuickOperation/productOrderQuickOperation?curSelectIndex=1'
    })
  },
  // 送货记录按钮点击
  clickTheDeliveryRecordButton(e) {
    let that = this
    app.globalData.isItAJumpFromTheSearchPage = true
    app.globalData.searchCondition = {
      "是否只搜索需要确认的流水单": "是的",
    }
    // curSelectIndex=0代表在送货单下搜索未确认状态的
    wx.navigateTo({
      url: '/pages/supplierDeliveryNote_applicationFunction/supplierDeliveryNote_applicationFunction?curSelectIndex=0'
    })
  },
  // 员工审核记录按钮点击
  employeeAuditRecordButtonClick(e) {
    wx.navigateTo({
      url: '/pages/addNewStaff_applicationFunction/addNewStaff_applicationFunction'
    })
  },

  // 查询生产单
  filterProductionNote() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 1
      },
    }
    return new Promise(function (resolve, reject) {
      return production_control_filter_unconfirmed_staff_record(parameter, that).then(res => {
        that.setData({
          total_count_product_note_List: res.data.pagination.total
        })
        resolve()
      })
    })
  },

  //条件查询供应商送货单
  filterSupplierTransactions() {
    let that = this
    var login_token = app.globalData.login_token()
    var parameter = {
      login_token: login_token,
      交易状态: ['未确认'],
      pagination: {
        page: 1,
        limit: 1
      },
      sort: {
        更新时间: -1
      },
    }
    return new Promise(function (resolve, reject) {
      return filter_supplier_transactions(parameter, that).then(res => {
        that.setData({
          total_count_supplier_note_List: res.total_count
        })
        resolve()
      })
    })
  },

  // 查询待确认的员工
  filterApplyUser() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      pagination: {
        page: 1,
        limit: 1
      },
      sort: {
        更新时间: -1
      },
      '工作状态': ['待确认']
    }
    return new Promise(function (resolve, reject) {
      filter_user(parameter, that).then(res => {
        that.setData({
          total_count_user: res.total_count
        })
        resolve()
      })
    })
  },

  // 设置marginTop
  setMarginTop() {
    // 需要获取固定定位的高度，来设置module-b 的margin-top
    let that = this
    wx.createSelectorQuery().select('#info-card-box').boundingClientRect(function (rect) {
      if (rect) {
        // rect.height // 节点的高度
        var marginTop = rect.height + 10
        that.setData({
          marginTop: marginTop + "px"
        })
      }

    }).exec()
  },

  tabControlClick(e) {
    var item = e.currentTarget.dataset.item
    if (!item.dispark) {
      markedWords('该功能暂未开放.', 'none', 2000)
      return
    } else if (!item.jurisdiction) {
      markedWords('您无此模块权限.', 'none', 2000)
      return
    }
    wx.navigateTo({
      url: item.url
    })
  },

  setNavigationBar() {
    let that = this
    var navigationBar = [{
        title: "人员及权限",
        moduls: {
          '添加新员工': {
            icon: 'tjxyg.png',
            url: '/pages/addNewStaff_applicationFunction/addNewStaff_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['人员管理可写'] || app.globalData.theirOwnRights()['人员管理列表可读']
          },
          '人员列表': {
            icon: 'rylb.png',
            url: '/pages/personnelList_applicationFunction/personnelList_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['人员管理可写'] || app.globalData.theirOwnRights()['人员管理列表可读']
          },
          '权限管理': {
            icon: 'quanxian.png',
            url: '/pages/rightsManagement_applicationFunction/rightsManagement_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['权限管理列表可读'] || app.globalData.theirOwnRights()['权限管理可写'] //是否有本模块权限
          }
        },
        jurisdiction: false,
      },
      {
        title: "订单",
        moduls: {
          '添加新订单': {
            icon: 'tjxdd.png',
            url: '/pages/orderOperationPage/orderOperationPage?mode=addOrder',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['订单管理可写'] //是否有本模块权限
          },
          '订单列表': {
            icon: 'ddlb.png',
            url: '/pages/orderList_applicationFunction/orderList_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['订单列表可读'] || app.globalData.theirOwnRights()['订单管理可写'] //是否有本模块权限
          }
        },
        jurisdiction: false,
      },
      {
        title: "客户",
        moduls: {
          '添加客户信息': {
            icon: 'tjkhxx.png',
            url: '/pages/clientOperationPage/clientOperationPage?mode=addClient',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['客户管理可写'] //是否有本模块权限
          },
          '客户信息列表': {
            icon: 'khxxlb.png',
            url: '/pages/clientList_applicationFunction/clientList_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['客户列表可读'] || app.globalData.theirOwnRights()['客户管理可写'] //是否有本模块权限
          }
        },
        jurisdiction: false,
      },
      {
        title: "生产排产",
        moduls: {
          '待排产订单列表': {
            icon: 'dpcddlb.png',
            url: '/pages/arrangedOrderList_applicationFunction/arrangedOrderList_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['生产单列表可读'] || app.globalData.theirOwnRights()['生产单详情可写'] //是否有本模块权限
          }
        },
        jurisdiction: false,
      },
      {
        title: "产品",
        moduls: {
          '添加新产品': {
            icon: 'tjxcp.png',
            url: '/pages/productOperationPage/productOperationPage?mode=addProduct',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['产品资料可写'] //是否有本模块权限
          },
          '产品列表': {
            icon: 'cplb.png',
            url: '/pages/productList_applicationFunction/productList_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['产品资料可读'] || app.globalData.theirOwnRights()['产品资料可写'] //是否有本模块权限
          }
        },
        jurisdiction: false,
      },
      {
        title: "仓库",
        moduls: {
          '仓库入库': {
            icon: 'tjrk.png',
            url: '/pages/warehouseImport_applicationFunction/warehouseImport_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['仓库入库可读'] || app.globalData.theirOwnRights()['仓库入库可写']
          },
          '仓库出库': {
            icon: 'tjck.png',
            url: '/pages/warehouseExport_applicationFunction/warehouseExport_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['仓库出库可读'] || app.globalData.theirOwnRights()['仓库出库可写']
          },
          '仓库报表': {
            icon: 'ckbb.png',
            url: '/pages/warehouseList_applicationFunction/warehouseList_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['仓库物料信息可读'] || app.globalData.theirOwnRights()['仓库物料信息可写'] //是否有本模块权限
          }
        },
        jurisdiction: false,
      },
      {
        title: "财务",
        moduls: {
          '员工工资': {
            icon: 'yggz.png',
            url: '/pages/salarySettle_applicationFunction/salarySettle_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['员工工资列表可读'] ||
             app.globalData.theirOwnRights()['部门工资列表可读']||
             app.globalData.theirOwnRights()['工资抵扣']
          },
          '供应商流水单': {
            icon: 'gysdz.png',
            url: '/pages/supplierDeliveryNote_applicationFunction/supplierDeliveryNote_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['供应商流水单列表可读'] || app.globalData.theirOwnRights()['确认送货单'] ||
              app.globalData.theirOwnRights()['编辑流水单'] || app.globalData.theirOwnRights()['确认退货单'] ||
              app.globalData.theirOwnRights()['退货作废退货单'] || app.globalData.theirOwnRights()['确认退货作废退货单'] ||
              app.globalData.theirOwnRights()['添加退货单']
          },
          '订单结算': {
            icon: 'khdz.png',
            url: '/pages/orderSettle_applicationFunction/orderSettle_applicationFunction',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['订单结算列表可读'] || app.globalData.theirOwnRights()['订单结算管理可写']
          }
        },
        jurisdiction: true, //本模块权限在小程序端放开
      },
      {
        title: "采购",
        moduls: {
          '添加采购单': {
            icon: 'tjcgd.png',
            url: '/pages/purchaseOrderAddPage/purchaseOrderAddPage',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['采购单详情可写'] //是否有本模块权限
          },
          '采购单列表': {
            icon: 'cgdlb.png',
            url: '/pages/purchaseOrderList/purchaseOrderList',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['采购单详情可写'] || app.globalData.theirOwnRights()['采购单列表可读']
          }
        },
        jurisdiction: false,
      },
      {
        title: "供应商",
        moduls: {
          '添加供应商': {
            icon: 'tjgys.png',
            url: '/pages/supplierOperationPage/supplierOperationPage',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['供应商信息可写']
          },
          '供应商管理': {
            icon: 'gysgl.png',
            url: '/pages/supplierManagement/supplierManagement',
            dispark: true, // 该功能是否开通
            jurisdiction: app.globalData.theirOwnRights()['供应商信息可读']
          }
        },
        jurisdiction: false,
      }
    ]
    navigationBar = navigationBar.map(item => {
      var moduls = item.moduls
      var bool = false
      for (const key in moduls) {
        const element = moduls[key]
        if (element.jurisdiction) {
          bool = true
          break
        }
      }
      item.jurisdiction = bool
      return item
    })
    that.setData({
      navigationBar: navigationBar
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.pieceRecordThrottleHandle = throttle(this.clickTheButtonToConfirmPieceRecord, 3000, {
      leading: true,
      trailing: false
    })
    this.deliveryRecordThrottleHandle = throttle(this.clickTheDeliveryRecordButton, 3000, {
      leading: true,
      trailing: false
    })
    this.employeeAuditRecordThrottleHandle = throttle(this.employeeAuditRecordButtonClick, 3000, {
      leading: true,
      trailing: false
    })
    this.tabControlThrottleHandle = throttle(this.tabControlClick, 3000, {
      leading: true,
      trailing: false
    })
    if (options.q) {
      const url = decodeURIComponent(options.q);
      const query = parseQueryString(url);
      app.globalData.query = deepClone(query)
      wx.showModal({
        title: '登录提示',
        content: '是否同意使用小程序登录',
        success(res) {
          if (res.confirm) {
            var paramter = {
              qrcode_token: query.token,
              login_token: app.globalData.login_token(),
            }
            wx.showLoading({title: '登录中...'})
            confirm_login_by_qrcode_token(paramter).then(res => {
              setTimeout(() => {
                wx.hideLoading()
                markedWords(res.msg)
              }, 2000)
              app.globalData.query = null
            }).catch(err=>{
              wx.hideLoading()
            })
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let that = this
    that.setNavigationBar()

    if (app.globalData.theirOwnRights()['生产单列表可读'] && app.globalData.theirOwnRights()['生产单详情可写']) {
      that.filterProductionNote().then(res => {
        setStatus(that, false)
      })
    } else {
      that.setData({
        total_count_product_note_List: 0
      })
    }

    // 供应商流水单权限在小程序都放开，特殊处理
    if (app.globalData.theirOwnRights()['供应商流水单列表可读'] && app.globalData.theirOwnRights()['确认送货单']) {
      that.filterSupplierTransactions().then(res => {
        setStatus(that, false)
      })
    } else {
      that.setData({
        total_count_supplier_note_List: 0
      })
    }


    if (app.globalData.theirOwnRights()['人员管理列表可读'] && app.globalData.theirOwnRights()['人员管理可写']) {
      that.filterApplyUser().then(res => {
        setStatus(that, false)
      })
    } else {
      that.setData({
        total_count_user: 0
      })
    }
    that.setMarginTop()
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
  onPullDownRefresh: async function () {
    //重置数据
    let that = this;
    setStatus(that, true)

    await programInitialization(app)
    that.setNavigationBar()


    if (app.globalData.theirOwnRights()['生产单列表可读'] && app.globalData.theirOwnRights()['生产单详情可写']) {
      await that.filterProductionNote()
    } else {
      that.setData({
        total_count_product_note_List: 0
      })
    }

    // 供应商流水单权限在小程序都放开，特殊处理
    if (app.globalData.theirOwnRights()['供应商流水单列表可读'] && app.globalData.theirOwnRights()['确认送货单']) {
      await that.filterSupplierTransactions()
    } else {
      that.setData({
        total_count_supplier_note_List: 0
      })
    }

    if (app.globalData.theirOwnRights()['人员管理列表可读'] && app.globalData.theirOwnRights()['人员管理可写']) {
      await that.filterApplyUser()
    } else {
      that.setData({
        total_count_user: 0
      })
    }


    setStatus(that, false)
    wx.stopPullDownRefresh()
    that.setMarginTop()
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
})