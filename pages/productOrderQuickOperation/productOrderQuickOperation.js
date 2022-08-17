// pages/productOrderQuickOperation/productOrderQuickOperation.js
import {
  production_control_filter_unconfirmed_staff_record,
  production_control_batch_manager_confirm_staff_record,
  all_unconfirmed_staff_record,
  production_control_batch_manager_confirm_staff_record_No_Loading
} from "../../services/ordersForProductionScheduling.js";
import {
  noDataProcessingLogic,
  isEmpty,
  deepClone,
  markedWords
} from "../../utils/util.js";
import regeneratorRuntime from "../../utils/runtime.js";
import {
  programInitialization
} from '../../utils/user.js'
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //跳转链接
    skipLinks: '/pages/employeeRecord/employeeRecord',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有生产单',
    // 是否显示扫码
    whetherToShowScanIcon: true,
    //生产单列表
    productionOrderList: [],
    //当前请求的页数
    page_num: 1,
    //当前要请求的商品数
    page_size: 16,
    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false,
    // 本页全选还是取消
    checkText: '取消全选',
    // 全部全选还是取消
    allCheckText: '全部全选',
    // 底部提交按钮的激活(是否存在一个选中)
    isSomeCheck: true,
    // 本页全选时的计数
    pageNumSum:0,
    // 进度条
    percentageOfProgressSubmitted:0,
    isProgress:false,
    // 进度条显示与否
    isRequestIngIng:false
  },

  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.setData({
      productionOrderList: []
    });
  },
  // 生产单列表  本页全选
  allCheck() {
    var that = this
    var productionOrderList = that.data.productionOrderList
    if (productionOrderList.length<16){
      that.setData({
        numSum: productionOrderList.length
      })
    }
    var checkText = that.data.checkText
    if (checkText == '本页全选') {
      for (let i = 0; i < productionOrderList.length; i++) {
        var ele = productionOrderList[i]
        ele.ischeck = true
      }
      if (that.data.pageSum>1){
        that.setData({
          checkText: '取消全选'
        })
      }else{
        that.setData({
          checkText: '取消全选',
          allCheckText: '取消全选',
        })
      }
    } else if (checkText == '取消全选') {
      for (let i = 0; i < productionOrderList.length; i++) {
        var ele = productionOrderList[i]
        ele.ischeck = false
      }
      that.setData({
        checkText: '本页全选',
        allCheckText: '全部全选'
      })
    }
    // 
    var isSomeCheck = that.data.isSomeCheck
    var b = productionOrderList.some(function(x) {
      return x.ischeck == true;
    })
    that.setData({
      productionOrderList: productionOrderList,
      isSomeCheck: b
    })
  },
  // 本页全部 提交
  allSubmit: async function (){
    var that = this
    if (!that.data.isSomeCheck) {
      markedWords('请选择生产单！')
      return false
    }
    if (that.data.allCheckText == '取消全选') {
      wx.showModal({
        title: '提示',
        content: '是否批量确认所有员工计件记录？',
        success(res) {
          if (res.confirm) {
            // 此处走全部全选的逻辑
            that.allItemSubmit()
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: `是否批量确认当前选择的${that.data.pageNumSum}条员工计件记录？`,
        success: async function (res) {
          if (res.confirm) {
            // 此处走当前全选的逻辑
            var staffPieceNoteArr = []
            var productionOrderList = that.data.productionOrderList
            for (let i = 0; i < productionOrderList.length; i++) {
              if (productionOrderList[i].ischeck) {
                var item = {
                  生产单unique_id: productionOrderList[i].unique_id,
                  工序unique_id: productionOrderList[i]['生产单工序信息']['工序信息']['unique_id'],
                  员工unique_id: productionOrderList[i]['生产单工序信息']['员工计件']['unique_id'],
                }
                staffPieceNoteArr.push(item)
              }
            }
            console.log(staffPieceNoteArr)
            // 根据请求数据量判断是否需要显示进度条
            if (staffPieceNoteArr.length > 10) {
              // 需要进度条分批请求
              that.setData({
                // isProgress: true,
                percentageOfProgressSubmitted: 0,
                isRequestIngIng: true
              })
              // 需要进度条分批请求
              var requestItem = deepClone(staffPieceNoteArr)
              var remainder = requestItem.length % 5
              console.log(remainder)
              var consult = Math.floor(requestItem.length / 5)
              console.log(consult)
              var count = 0
              for (let a = 0; a < consult; a++) {
                var startIndex = a * 5
                var endIndex = (a + 1) * 5
                if (a === consult - 1 && remainder !== 0) {
                  endIndex = endIndex + remainder
                }
                console.log(startIndex)
                console.log(endIndex)
                requestItem = staffPieceNoteArr.slice(startIndex, endIndex)
                console.log(requestItem)
                var respose_a = await that.batchManagerConfirm(requestItem)
                count += requestItem.length
                that.data.percentageOfProgressSubmitted = Number(parseFloat(count / staffPieceNoteArr.length).toFixed(2)) * 100
                that.setData({
                  percentageOfProgressSubmitted: that.data.percentageOfProgressSubmitted
                })
              }
              that.setData({
                // isProgress: false,
                pageNumSum: 0,
                isRequestIngIng: false
              })
              that.initData();
              that.loadData().then(res => {
                that.setData({
                  isRequestIng: false
                });
              })
            } else {
              return new Promise(function (resolve, reject) {
                var parameter = {
                  login_token: app.globalData.login_token(),
                  员工计件记录: staffPieceNoteArr,
                }
                production_control_batch_manager_confirm_staff_record(parameter, that).then(res => {
                  markedWords(res.msg)
                  if (res.status == 'OK') {
                    that.setData({
                      pageNumSum: 0
                    });
                    that.initData();
                    that.loadData().then(res => {
                      that.setData({
                        isRequestIng: false
                      });
                    })
                  }
                  resolve(true)
                })
              })
            }
          }
        }
      })
    }
  },


  // 生产单列表  全部全选
  allPageCheck() {
    var that = this
    var allCheckText = that.data.allCheckText
    var productionOrderList = that.data.productionOrderList
    that.setData({
      numSum: that.data.pagination.total
    });
    if (allCheckText == '全部全选') {
      for (let i = 0; i < productionOrderList.length; i++) {
        var ele = productionOrderList[i]
        ele.ischeck = true
      }
      that.setData({
        allCheckText: '取消全选',
        checkText: '取消全选'
      })
    } else if (allCheckText == '取消全选') {
      for (let i = 0; i < productionOrderList.length; i++) {
        var ele = productionOrderList[i]
        ele.ischeck = false
      }
      that.setData({
        allCheckText: '全部全选',
        checkText: '本页全选',
      })
    }
    // 
    var isSomeCheck = that.data.isSomeCheck
    var b = productionOrderList.some(function(x) {
      return x.ischeck == true;
    })
    that.setData({
      productionOrderList: productionOrderList,
      isSomeCheck: b
    })
  },
  // 获取全部计件记录
  getAllItem(){
    var that = this
    return new Promise(function (resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token()
      }
      all_unconfirmed_staff_record(parameter, that).then(res => {
        if (res.status == 'OK') {
          var allItems = res.data.items
          that.setData({
            allItems: allItems,
            isRequestIng: false
          });
        }
        resolve(allItems)
      })
    })
  },
  // 全部全选 提交
  allItemSubmit: async function(){
    var that = this
    var allItems = await that.getAllItem()
    console.log(allItems)
    // 根据请求数据量判断是否需要显示进度条
    if (allItems.length>15){
      that.setData({
        // isProgress: true,
        percentageOfProgressSubmitted: 0,
        isRequestIngIng: false
      })
      // 需要进度条分批请求
      var requestItem = deepClone(allItems)
      var remainder = requestItem.length % 5
      var consult = Math.floor(requestItem.length / 5)
      var count = 0
      for (let a = 0; a < consult; a++) {
        var startIndex = a * 5
        var endIndex = (a + 1) * 5
        if (a === consult - 1 && remainder !== 0) {
          endIndex = endIndex + remainder
        }
        requestItem = allItems.slice(startIndex, endIndex)
        console.log(requestItem)
        var respose_a = await that.batchManagerConfirm(requestItem)
        count += requestItem.length
        that.data.percentageOfProgressSubmitted = Number(parseFloat(count / allItems.length).toFixed(2)) * 100
        that.setData({
          percentageOfProgressSubmitted: that.data.percentageOfProgressSubmitted
        })
      }
      that.setData({
        // isProgress: false,
        isRequestIngIng: false
      })
      that.initData();
      that.loadData().then(res => {
        var pagination = { page: 1, total: 0 }
        that.setData({
          isRequestIng: false,
          isSomeCheck: false,
          checkText: '本页全选',
          allCheckText: '全部全选',
          pageSum: 1,
          pagination: pagination,
        });
      })
    } else {
      return new Promise(function (resolve, reject) {
        var parameter = {
          login_token: app.globalData.login_token(),
          员工计件记录: allItems,
        }
        production_control_batch_manager_confirm_staff_record(parameter, that).then(res => {
          markedWords(res.msg)
          if (res.status == 'OK') {
            that.initData();
            that.loadData().then(res => {
              var pagination = { page: 1, total: 0 }
              that.setData({
                isRequestIng: false,
                isSomeCheck: false,
                checkText: '本页全选',
                allCheckText: '全部全选',
                pageSum: 1,
                pagination: pagination,
              });
            })
          }
          resolve(true)
        })
      })
    }
  },
  // 分批提交的await
  batchManagerConfirm(requestItem){
    var that = this
    return new Promise(function (resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token(),
        员工计件记录: requestItem,
      }
      production_control_batch_manager_confirm_staff_record_No_Loading(parameter, that).then(res => {
        if (res.status == 'OK') {
          // that.setData({
          //   isRequestIng: false
          // });
        }
        resolve(res.msg)
      })
    })
  },

  // 清空搜索条件后回调
  clearingSearchCallback() {
    let that = this
    that.setData({
      whetherToDisplayAConditionBox: false
    })
    app.globalData.isItAJumpFromTheSearchPage = false
    app.globalData.parameter = {}
    that.setData({
      pageNumSum:0,
      allCheckText: '全部全选'
    })
    that.initData()
    that.loadData().then(res => {
      that.setData({
        isRequestIng: false
      });
    })
  },
  // 产品确认之后回调
  callbackAfterDeletion(e) {
    let that = this
    that.setData({
      pageNumSum: 0,
      allCheckText: '全部全选'
    })
    that.initData()
    that.loadData().then(res => {
      that.setData({
        isRequestIng: false
      });
    })
    // 延时判断
    setTimeout(function () { 
      if (that.data.productionOrderList.length == 0) {
        var pagination = { page: 1, total: 0 }
        that.setData({
          isSomeCheck: false,
          checkText: '本页全选',
          allCheckText: '全部全选',
          pageSum: 1,
          pagination: pagination,
        });
      } 
    }, 500)
  },
  // 子组件复选之后回调
  callbackIscheck(e) {
    let that = this
    var product = e.detail.product
    var productionOrderList = that.data.productionOrderList
    var index = productionOrderList.findIndex(item => {
      return (item['生产单工序信息']['工序信息']['unique_id'] === product['生产单工序信息']['工序信息']['unique_id']) && (item.unique_id === product.unique_id)
    })
    console.log(index)
    if (index !== -1) {
      productionOrderList.splice(index, 1, product)
      console.log(productionOrderList)
      that.setData({
        productionOrderList: productionOrderList
      })
    }
    // 批量确认是否激活
    var isSomeCheck = that.data.isSomeCheck
    var b = productionOrderList.some(function(x) {
      return x.ischeck == true;
    })
    that.setData({
      isSomeCheck: b
    })
    // 全部全选是否激活
    var c = productionOrderList.some(function (x) {
      return x.ischeck == false;
    })
    if(c){
      that.setData({
        allCheckText: '全部全选',
        checkText: '本页全选',
      })
    }else{
      that.setData({
        allCheckText: '取消全选',
        checkText: '取消全选',
      })
    }
    // 计算 本页 选中的item的数量
    var thisNum = 0
    // 计算 全部 未选中的item的数量
    var thisNumNoCheck = 0
    for (let j = 0; j<productionOrderList.length;j++){
      if (productionOrderList[j].ischeck){
        thisNum++
      } else{
        thisNumNoCheck++
      }
    }
    console.log(thisNum)
    // 计算 全部 选中的item的数量
    var numSumThis = that.data.pagination.total - thisNumNoCheck
    that.setData({
      pageNumSum: thisNum,
      numSum: numSumThis
    })
  },

  /**
   * 加载数据
   * parameter(请求的参数)
   * isPullDownRefresh（是否是下拉刷新函数在调用）
   * isReach(是否是上拉触底函数在调用)
   */
  loadData() {
    let that = this;
    return new Promise(function(resolve, reject) {
      // 如果是从搜索页面跳转回来的
      if (app.globalData.isItAJumpFromTheSearchPage) {
        var list = deepClone(app.globalData.productionOrderList.items)
        for (let i = 0; i < list.length; i++) {
          list[i].ischeck = true
        }
        console.log(list)
        for (let i = 0; i < list.length; i++) {
          list[i].ischeck = true
        }
        var pageSum = Math.ceil(app.globalData.productionOrderList.pagination.total / 16);
        if (pageSum == 0) {
          pageSum = 1
        }
        console.log(pageSum)
        var pageNumSum = list.length
        that.setData({
          pageSum: pageSum,
          pageNumSum: pageNumSum
        })
        that.setData({
          productionOrderList: that.data.productionOrderList.concat(list),
          pagination: app.globalData.productionOrderList.pagination,
          searchCondition: app.globalData.searchCondition,
          whetherToDisplayAConditionBox: true
        });
        return resolve('加载信息成功！！')
      }
      var parameter = {
        login_token: app.globalData.login_token(),
        pagination: {
          page: that.data.page_num,
          limit: that.data.page_size
        }
      }
      console.log(!isEmpty(app.globalData.parameter))
      if (!isEmpty(app.globalData.parameter)) {
        parameter['生产单编号'] = app.globalData.parameter['生产单编号']
        parameter['员工姓名'] = app.globalData.parameter['员工姓名']
        parameter['员工手机'] = app.globalData.parameter['员工手机']
        parameter['工序'] = app.globalData.parameter['工序']
      }
      //真正的查数据
      production_control_filter_unconfirmed_staff_record(parameter, that).then(res => {
        console.log(res.data)
        var list = deepClone(res.data.items)
        for (let i = 0; i < list.length; i++) {
          list[i].ischeck = true
        }
        var pageSum = Math.ceil(res.data.pagination.total / 16);
        if (pageSum == 1) {
          pageSum = 1
        }
        that.setData({
          pageSum: pageSum
        })
        if (!list || list.length == 0) {
          noDataProcessingLogic(that);
          return resolve('没有更多数据了')
        } else {
          var pageNumSum = that.data.pageNumSum
          pageNumSum += list.length
          that.setData({
            productionOrderList: that.data.productionOrderList.concat(list),
            pagination: res.data.pagination,
            pageNumSum: pageNumSum
          });
          resolve(true)
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    var curSelectIndex = options.curSelectIndex
    if (!isEmpty(options) && options.curSelectIndex) {
      that.setData({
        curSelectIndex: curSelectIndex,
        whetherToDisplayAConditionBox: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    let that = this;
    if (that.data.curSelectIndex == 1) {
      // 代表是从悬浮跳过来的
      console.log('代表是从悬浮跳过来的')
      app.globalData.parameter = {}
      // 初始化
      that.setData({
        pageNumSum: 0,
        isSomeCheck:true,
        // 本页全选还是取消
        checkText: '取消全选'
      })
      that.initData();
      that.loadData().then(res => {
        that.setData({
          isRequestIng: false
        });
      })
    } else if (that.data.curSelectIndex == 2) {
      // 代表是从搜索页面跳回来的
      console.log('代表是从搜索页面跳回来的')
      that.setData({
        allCheckText:'全部全选'
      })
      that.setData({
        pageNumSum: 0,
        isSomeCheck: true,
        // 本页全选还是取消
        checkText: '取消全选'
      })
      that.initData();
      that.loadData().then(res => {
        that.setData({
          isRequestIng: false
        });
      })
    }
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
    //重置数据
    let that = this;
    that.setData({
      isRequestIng: true,
      pageNumSum: 0
    })
    programInitialization(app).then(res => {
      that.initData();
      that.loadData().then(res => {
        wx.stopPullDownRefresh();
        that.setData({
          isRequestIng: false
        });
      }).catch(err => {
        wx.stopPullDownRefresh();
      });
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    // 如果正在发起请求，或者是从搜索页面回来的 那么直接退
    // if (that.data.isRequestIng || app.globalData.isItAJumpFromTheSearchPage) return;
    app.globalData.isItAJumpFromTheSearchPage = false
    if (that.data.isRequestIng) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
      page_num: that.data.page_num + 1
    });
    that.loadData().then(res => {
      if (res === '没有更多数据了') {
        that.data.page_num = that.data.page_num - 1
      } else {
        that.setData({
          isRequestIng: false
        });
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})