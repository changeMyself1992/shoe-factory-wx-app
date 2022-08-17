import {
  checkLogin,
  programInitialization
} from '../../utils/user.js';
import {
  get_user_info_by_login_token
} from "../../services/loginAndLogoutTool.js"
import {
  noDataProcessingLogic,
  parseQueryString,
  isEmpty,
  setStatus,
  markedWords
} from "../../utils/util.js";

import {
  get_production_note_by_id,
  finish_production_note_by_id,
  get_order_by_id,
  get_same_batches_production_note_by_unique_id,
  get_same_batches_production_note_by_unique_id_for_staff
} from "../../services/ordersForProductionScheduling.js";
import {
  get_product_by_id
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import regeneratorRuntime from "../../utils/runtime.js";
import throttle from "../../utils/lodash/throttle.js";

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //生产单详情
    productionOrderDetails: {},
    //排产的产品详情
    productDetail: {},
    //订单详情
    orderDetail: {},
    //客户产品编号
    customerProductNumber: '',
    //是否正在发起请求
    isRequestIng: false,
    //权限列表
    theirOwnRights: {},
    //是否展示回到首页按钮
    backToTheHomePageBtnStatus: false,
    // 该角色负责的工序列表
    responsibleProcessList: [
      //'开料',
      //'打码',
      //.....
    ],
    // 在这个生产单中 该用户 负责的所有工序结构
    processInformationComesFromProductionOrder: [],
    // 该生产单一共有多少个未确认记录
    totalNumberOfUnconfirmedRecords: 0
  },

  /**
   * 详情按钮点击
   */
  onDetailsBtnClick(even) {
    //传递过来的工序索引
    var name = even.target.dataset.name;
    app.globalData.processName = name
    wx.navigateTo({
      url: '/pages/processDetails/processDetails'
    })
  },

  /**
   * 强制完成生产单
   */
  onCompleteBtnClick() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定完成生产单子?',
      success(res) {
        if (res.confirm) {
          var parameter = {
            login_token: app.globalData.login_token(),
            "生产单unique_id": app.globalData.productionOrderDetails.unique_id
          };
          finish_production_note_by_id(parameter, that).then(res => {
            // 跳回生产单列表 并指定为 已完成选项
            wx.reLaunch({
              url: '/pages/productionOrder/productionOrder?curSelectIndex=1'
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 点击无权限的工序显示弹窗
  huiSeDisable() {
    var that = this
    wx.showModal({
      title: '权限提示',
      content: '当前工序您没有操作权限，请联系管理员添加该工序权限！',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#00bb72',
      success: function(res) {
        if (res.confirm) {}
      },
    })
  },
  /**
   * 回到首页
   */
  backToTheHomePage() {
    wx.switchTab({
      url: '/pages/productionOrder/productionOrder?curSelectIndex=0'
    })
  },
  // 产品详情
  viewProductDetail() {
    var that = this
    var id = that.data.productionOrderDetails['排产产品']['产品信息']['产品编号']
    wx.navigateTo({
      url: '/pages/produceAndOrderToProductDetail/produceAndOrderToProductDetail?id=' + id,
    })
  },

  // 同批次操作
  batchOperation() {
    let that = this
    var parameter = {
      login_token: app.globalData.login_token(),
      "unique_id": app.globalData.productionOrderDetails.unique_id
    };

    app.globalData.productNoteRelevantInfo = {
      productDetail: that.data.productDetail,
      customerProductNumber: that.data.customerProductNumber,
      brand: that.data.brand,
      orderDetail: that.data.orderDetail
    }
    // 代表是管理员要进行同批次操作
    if (app.globalData.theirOwnRights()['生产单详情可写'] && app.globalData.theirOwnRights()['生产单列表可读']) {
      get_same_batches_production_note_by_unique_id(parameter, that).then(res => {
        setStatus(that, false)
        var data = res.data
        if (!data || data.length == 0) {
          noDataProcessingLogic(that, '没有跟该生产单同批次的其他生产单!');
          return
        }
        data = data.map(item => {
          item.checked = true
          return item
        })
        app.globalData.productNoteList = data
        wx.navigateTo({
          url: '/pages/sameBatchOperationProductNote/sameBatchOperationProductNote'
        })
      })
    }
    // 代表是员工要进行同批次操作
    else if (app.globalData.theirOwnRights()['生产单列表可读'] && !app.globalData.theirOwnRights()['生产单详情可写']) {
      get_same_batches_production_note_by_unique_id_for_staff(parameter,that).then(res=>{
        setStatus(that, false)
        var data = res.data
        if (!data || data.length == 0) {
          noDataProcessingLogic(that, '没有同批次的申请记录!');
          return
        }
        data = data.map(item => {
          item.checked = true
          return item
        })
        app.globalData.productNoteList = data
        wx.navigateTo({
          url: '/pages/sameBatchOperationProductNote/sameBatchOperationProductNote'
        })
      })
    } else {
      markedWords("无此操作权限")
      return
    }
    
  },


  /**
   * 加载数据
   * unique_id(生产单编号)
   */
  loadData(unique_id) {
    let that = this;
    return new Promise(function(resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token(),
        unique_id: unique_id,
        "返回确认管理者姓名": true
      };
      //1.查询生产单详情
      get_production_note_by_id(parameter, that).then(res => {
        app.globalData.productionOrderDetails = res.data;
        // 把生成单中 属于我负责的工序提取出来
        var processInformationComesFromProductionOrder = []
        var totalNumberOfUnconfirmedRecords = 0
        for (var i = 0; i < that.data.responsibleProcessList.length; i++) {
          var name = that.data.responsibleProcessList[i]
          var processInfo = res.data['生产单工序信息'].find((item) => {
            return item.工序信息.工序名称 === name
          })
          if (isEmpty(processInfo)) continue
          // 遍历员工计件查找是否需要确认的员工
          var 员工计件 = processInfo['员工计件']
          var isNecessaryConfirm = false
          for (let i = 0; i < 员工计件.length; i++) {
            const element = 员工计件[i];
            if (element['记录确认'] === false) {
              isNecessaryConfirm = true
              totalNumberOfUnconfirmedRecords += 1
            }
          }
          processInfo['工序是否需要确认记录'] = isNecessaryConfirm
          processInformationComesFromProductionOrder.push(processInfo)
        }

        var partProductOrderListGongXu = []
        for (var i = 0; i < processInformationComesFromProductionOrder.length; i++) {
          partProductOrderListGongXu[i] = processInformationComesFromProductionOrder[i]
        }
        // 有权限工序列表
        var restProductOrderListGongXu = []
        for (var i = 0; i < res.data['生产单工序信息'].length; i++) {
          if (partProductOrderListGongXu.indexOf(res.data['生产单工序信息'][i]) == -1) {
            restProductOrderListGongXu.push(res.data['生产单工序信息'][i])
          }
        }
        // 无权限但生产单有的工序列表
        console.log(restProductOrderListGongXu)



        that.setData({
          productionOrderDetails: res.data,
          processInformationComesFromProductionOrder: processInformationComesFromProductionOrder,
          totalNumberOfUnconfirmedRecords: totalNumberOfUnconfirmedRecords,
          restProductOrderListGongXu: restProductOrderListGongXu
        });

        // 2.查询产品详情
        var parameter = {
          login_token: app.globalData.login_token(),
          unique_id: that.data.productionOrderDetails['排产产品']['产品信息']['产品编号']
        };
        get_product_by_id(parameter, that).then(res => {
          that.setData({
            productDetail: res.data,
          });
          var parameter = {
            login_token: app.globalData.login_token(),
            unique_id: that.data.productionOrderDetails['对应订单'].unique_id
          };
          // 3.查询订单详情
          get_order_by_id(parameter, that).then(res => {
            that.setData({
              orderDetail: res.data
            });
            that.returnsTheCustomerProductNumber();
            that.returnsTheCustomerBrand();
            resolve()
          })
        })
      })
    })
  },
  // 返回客户产品编号
  returnsTheCustomerProductNumber() {
    var 包含的产品 = this.data.orderDetail.包含的产品
    for (let i = 0; i < 包含的产品.length; i++) {
      const element = 包含的产品[i]
      if (
        element.产品信息.unique_id ===
        this.data.productionOrderDetails.排产产品.产品信息.unique_id
      ) {
        this.setData({
          customerProductNumber: element.客户产品编号 ? element.客户产品编号 : '暂无数据'
        })
        return
      }
    }
  },
  // 返回客户产品品牌
  returnsTheCustomerBrand() {
    var 包含的产品 = this.data.orderDetail.包含的产品
    for (let i = 0; i < 包含的产品.length; i++) {
      const element = 包含的产品[i]
      if (
        element.产品信息.unique_id ===
        this.data.productionOrderDetails.排产产品.产品信息.unique_id
      ) {
        this.setData({
          brand: element.品牌 ? element.品牌 : '暂无数据'
        })
        return
      }
    }
  },
  // 生产单图片放大
  previewImage1(e) {
    let that = this;
    console.log(e)
    if (e.currentTarget.dataset.url) {
      var array = []
      array.push(e.currentTarget.dataset.url)
      wx.previewImage({
        urls: array
      })
    }
  },
  // 二维码放大
  previewImage2(e) {
    let that = this;
    console.log(e)
    if (e.currentTarget.dataset.url) {
      var array = []
      array.push(e.currentTarget.dataset.url)
      wx.previewImage({
        urls: array
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    let that = this;
    this.detailsThrottleHandle = throttle(this.onDetailsBtnClick, 3000, {
      leading: true,
      trailing: false
    })
    this.batchOperationThrottleHandle = throttle(this.batchOperation, 3000, {
      leading: true,
      trailing: false
    })
    this.viewProductDetailThrottleHandle = throttle(this.viewProductDetail, 3000, {
      leading: true,
      trailing: false
    })


    const url = decodeURIComponent(options.q);
    const query = parseQueryString(url);
    if ("id" in query) {
      console.log("通过扫码进入生产单详情页！");
      setStatus(that, true)
      //1.检查登录
      await checkLogin()
      //2.小程序初始化
      await programInitialization(app)
      //3.获取权限负责的工序
      that.setData({
        theirOwnRights: app.globalData.theirOwnRights(),
        responsibleProcessList: app.globalData.userInfo()['负责工序'],
        backToTheHomePageBtnStatus: true
      })
      //4.加载数据
      await that.loadData(query.id)
      setStatus(that, false)
    } else {
      console.log("正常点击进入生产单详情页！");
      that.setData({
        backToTheHomePageBtnStatus: false,
        theirOwnRights: app.globalData.theirOwnRights(),
        responsibleProcessList: app.globalData.userInfo()['负责工序']
      })
    }
  },


  // 更新个人权限
  updataUserinfoAccess() {
    let that = this;
    return new Promise(function(resolve, reject) {
      //1.获取用户信息
      var obj_b = {
        login_token: app.globalData.login_token()
      }
      return get_user_info_by_login_token(obj_b, that).then(res => {
        //设置个人信息
        that.setData({
          backToTheHomePageBtnStatus: false,
          theirOwnRights: app.globalData.theirOwnRights(),
          responsibleProcessList: app.globalData.userInfo()['负责工序'],
          isRequestIng: false
        })
        resolve()
      });
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this
    that.updataUserinfoAccess()
    if (app.globalData.productionOrderDetails.unique_id) {
      that.loadData(app.globalData.productionOrderDetails.unique_id).then(res => {
        setStatus(that, false)
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this
    that.updataUserinfoAccess()
    that.loadData(app.globalData.productionOrderDetails.unique_id).then(res => {
      setStatus(that, false)
      wx.stopPullDownRefresh()
    }).catch(err => {
      wx.stopPullDownRefresh()
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})