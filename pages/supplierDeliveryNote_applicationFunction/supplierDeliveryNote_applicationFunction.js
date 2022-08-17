const app = getApp();
import {
  filter_supplier_transactions,
  batch_confirm_supplier_transaction_by_ids,
} from "../../services/supplier.js"
import {
  isEmpty,
  noDataProcessingLogic,
  markedWords,
  setStatus
} from "../../utils/util.js";
import throttle from "../../utils/lodash/throttle.js";
import regeneratorRuntime from "../../utils/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //跳转链接
    skipLinks: '/pages/deliveryNoteSearchPage/deliveryNoteSearchPage?curSelectIndex=0',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有流水单',

    //导航栏信息
    liveNavData: [{
      id: 0,
      isSelect: true,
      c_name: "送货单", //这里其实是 新生产单 和生产中 俩个状态（人家要求就显示一栏）
      status: "送货单",
    },
    {
      id: 1,
      isSelect: false,
      c_name: "退货单",
      status: '退货单'
      },
      {
        id: 2,
        isSelect: false,
        c_name: "现结单",
        status: '现结单'
      }
    ],
    //当前选项卡索引
    curSelectIndex: 0,
    // 当前流水单类型
    curType:['送货单'],

    // 供应商流水单列表
    deliveryNoteList: [],
    // 选中的流水单unique_ids
    multipleSelection: [],
    page_num: 1,
    page_size: 16,

    isSwitch: false,
    // module-b 的margin-top
    marginTop: "0px",

    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false,

    // 是否显示现结单结算框
    // maskCash: false,

    // 是不是编辑备注后返回的
    editNoteBack:'否'
  },

  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.data.deliveryNoteList = []

    that.setData({
      multipleSelection:[]
    })
  },
  // 清空搜索条件后回调
  clearingSearchCallback() {
    let that = this
    that.setData({
      // liveNavData: [{
      //   id: 0,
      //   isSelect: true,
      //   c_name: "送货单",
      //   status: "送货单",
      // },
      // {
      //   id: 1,
      //   isSelect: false,
      //   c_name: "退货单",
      //   status: '退货单'
      //   },
      //   {
      //     id: 2,
      //     isSelect: false,
      //     c_name: "现结单",
      //     status: '现结单'
      //   }
      // ],
      // curSelectIndex: 0,
      // curType: ['送货单'],
      whetherToDisplayAConditionBox: false
    })
    app.globalData.isItAJumpFromTheSearchPage = false
    that.initData()
    that.loadData().then(res => {
      that.setData({
        isRequestIng: false
      });
    })
    that.setMarginTop()
  },
  /*选项卡点击事件*/
  onSelectItemClick: function (event) {
    let that = this
    var curType = null
    if (event.detail.index===0) {
      curType = ['送货单']
    } else if (event.detail.index === 1) {
      curType = ['退货单']
    } else if (event.detail.index === 2) {
      curType = ['现结单']
    }
    // 切换时除掉条件
    if (app.globalData.isItAJumpFromTheSearchPage){
      app.globalData.isItAJumpFromTheSearchPage = false
      that.setData({
        whetherToDisplayAConditionBox: false
      })
    }
    that.setData({
      curSelectIndex: event.detail.index,
      curType: curType,
      skipLinks: '/pages/deliveryNoteSearchPage/deliveryNoteSearchPage?curSelectIndex=' + event.detail.index
    });
    that.initData();
    that.loadData().then(res => {
      that.setData({
        isRequestIng: false
      });
    })
    that.setMarginTop()
  },
  /**
   * 加载数据
   * parameter(请求的参数)
   * isPullDownRefresh（是否是下拉刷新函数在调用）
   * isReach(是否是上拉触底函数在调用)
   */
  loadData(parameter = null, isPullDownRefresh = false, isReach = false) {
    let that = this;
    return new Promise(function(resolve, reject) {
      var curSelectIndex = that.data.curSelectIndex;
      console.log(that.data.editNoteBack == '否')
      if (app.globalData.isItAJumpFromTheSearchPage && that.data.editNoteBack=='否' && !isPullDownRefresh && !isReach) {
        // 代表是 从应用功能的通知栏点进来的 只需要查询待确认的流水单(送货单)
        if (!isEmpty(app.globalData.searchCondition['是否只搜索需要确认的流水单'])) {
          parameter = {
            login_token: app.globalData.login_token(),
            交易状态: ['未确认'],
            pagination: {
              page: 1,
              limit: 16
            },
            流水单类型: ["送货单"],
            sort: {
              更新时间: -1
            },
          }
          app.globalData.parameter = parameter
          return filter_supplier_transactions(parameter, that).then(res => {
            that.setData({
              deliveryNoteList: res.data,
              searchCondition: app.globalData.searchCondition,
              whetherToDisplayAConditionBox: true
            })
            return resolve()
          })
        } else {
          // 代表是按条件联合搜索跳转回来的。。数据已经拿到
          console.log('代表是按条件联合搜索跳转回来的。。数据已经拿到')
          that.setData({
            deliveryNoteList: that.data.deliveryNoteList.concat(app.globalData.deliveryNoteList),
            searchCondition: app.globalData.searchCondition,
            whetherToDisplayAConditionBox: true
          });
          return resolve()
        }
      } else if (app.globalData.isItAJumpFromTheSearchPage && that.data.editNoteBack == '否' && isPullDownRefresh && !isReach) {
        // 代表是按条件联合搜索跳转回来的。。要进行下拉刷新
        console.log('代表是按条件联合搜索跳转回来的。。要进行下拉刷新')
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
      } else if (app.globalData.isItAJumpFromTheSearchPage && that.data.editNoteBack == '否' && !isPullDownRefresh && isReach) {
        // 代表是按条件联合搜索跳转回来的。。要进行上拉加载
        console.log('代表是按条件联合搜索跳转回来的。。要进行上拉加载')
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
      } else {
        parameter = {
          login_token: app.globalData.login_token(),
          pagination: {
            page: that.data.page_num,
            limit: that.data.page_size
          },
          // 默认刚进来切换的是送货单
          流水单类型: that.data.curType,
          sort: {
            更新时间: -1
          }
        }
        if (app.globalData.isItAJumpFromTheSearchPage && that.data.editNoteBack == '是') {
          console.log('111')
          parameter = app.globalData.parameter
        }
      }
      //真正的查数据
      filter_supplier_transactions(parameter, that).then(res => {
        var list = res.data;
        if (!list || list.length == 0) {
          noDataProcessingLogic(that);
          return resolve('没有更多数据了')
        } else {
          that.setData({
            deliveryNoteList: that.data.deliveryNoteList.concat(list),
          });
          resolve(res.msg)
        }
      })

    })
  },

  // 操作流水单之后回调（确认，删除,结算）
  callbackAfterOption: async function(e) {
    let that = this
    if (app.globalData.isItAJumpFromTheSearchPage) {
      that.initData()
      that.loadData().then(res => {
        setStatus(that, false)
        that.setMarginTop()
      })
    } else {
      that.data.deliveryNoteList = []
      var b = 1
      const page_num = that.data.page_num
      for (var i = 1; i <= page_num; i++) {
        that.data.page_num = i
        await that.loadData()
        if (b === page_num) {
          setStatus(that, false)
        }
        b++;
      }
      markedWords(e.detail.msg)
    }
  },

  // 流水单选择之后回调
  callbackAfterSelect(e) {
    let that = this
    var selectInfo = e.detail.selectInfo
    var multipleSelection = that.data.multipleSelection
    if (selectInfo.mode === 'selected') {
      multipleSelection.push(selectInfo.unique_id)
    } else {
      multipleSelection = multipleSelection.filter(unique_id => {
        return unique_id !== selectInfo.unique_id
      })
    }
    that.setData({
      multipleSelection: multipleSelection
    })
  },

  // 全选切换
  switchclick(e) {
    let that = this
    that.data.isSwitch = e.detail.value
    var multipleSelection = []
    var list = that.selectAllComponents("#delivery-note-item");
    if (that.data.isSwitch) {
      //全选
      for (let i = 0; i < that.data.deliveryNoteList.length; i++) {
        const element = that.data.deliveryNoteList[i]
        multipleSelection.push(element.unique_id)
      }
      // 通知子组件吧选中态设置为true
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        element.setSelectedState(true)
      }
    } else {
      // 全部取消
      // 通知子组件吧选中态设置为false
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        element.setSelectedState(false)
      }
    }
    that.setData({
      multipleSelection: multipleSelection
    })
  },

  // 批量结算
  // onSettleBtnClick(e) {
  //   let that = this
  //   if (!app.globalData.theirOwnRights()['']) {
  //     markedWords("无此操作权限")
  //     return
  //   }
  //   var paramter = {
  //     login_token: app.globalData.login_token(),
  //     unique_ids: that.data.multipleSelection
  //   }
  //   batch_settle_supplier_transaction_by_ids(paramter, that).then(res => {
  //     that.initData();
  //     that.loadData().then(res => {
  //       setStatus(that, false)
  //       markedWords('批量结算，操作成功！')
  //     })
  //   })
  // },

  // 批量确认
  onAffirmBtnClick(e) {
    let that = this
    if (!app.globalData.theirOwnRights()['确认送货单']) {
      markedWords("无此操作权限")
      return
    }
    if (that.data.multipleSelection.length === 0) {
      return false
    }
    // 判断有没有已作废的流水单，如果有那么不许提交
    for (let i = 0; i < that.data.multipleSelection.length; i++) {
      const unique_id = that.data.multipleSelection[i];
      for (let j = 0; j < that.data.deliveryNoteList.length; j++) {
        const deliveryNote = that.data.deliveryNoteList[j]
        if (deliveryNote.unique_id === unique_id){
          if (deliveryNote['交易状态'] !== '未确认' && deliveryNote['交易状态'] !== '已结算'){
            markedWords('不是未确认或者已结算状态的流水单不允许再次确认！')
            return
          }
        }
      }
    }
    wx.showModal({
      title: '提示',
      content: '是否批量确认送货单？',
      success(res) {
        if (res.confirm) {
          var paramter = {
            login_token: app.globalData.login_token(),
            unique_ids: that.data.multipleSelection
          }
          batch_confirm_supplier_transaction_by_ids(paramter, that).then(res => {
            that.initData();
            that.loadData().then(res => {
              setStatus(that, false)
              markedWords('批量确认，操作成功！')
            })
          })
        }
      }
    })
  },
  // 添加退货单
  toAddReturn() {
    if (!app.globalData.theirOwnRights()['添加退货单']) {
      markedWords("无此操作权限")
      return
    }
    wx.navigateTo({
      url: '../returnSupplierNote/returnSupplierNote',
    })
  },
  // 添加现结单
  toAddCashMoney() {
    if (!app.globalData.theirOwnRights()['添加现结单']) {
      markedWords("无此操作权限")
      return
    }
    wx.navigateTo({
      url: '../cashMoneySupplierNote/cashMoneySupplierNote',
    })
  },

  // 设置marginTop
  setMarginTop() {
    // 需要获取固定定位的高度，来设置module-b 的margin-top
    let that = this
    wx.createSelectorQuery().select('#fixedBatch').boundingClientRect(function(rect) {
      // rect.height // 节点的高度
      var marginTop = rect.height + 10
      that.setData({
        marginTop: marginTop + "px"
      })
    }).exec()
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    // this.settleThrottleHandle = throttle(this.onSettleBtnClick, 3000, { leading: true, trailing: false })
    this.affirmThrottleHandle = throttle(this.onAffirmBtnClick, 3000, { leading: true, trailing: false })
    this.addThrottleHandle = throttle(this.toAddReturn, 3000, { leading: true, trailing: false })
    this.addCashMoneyThrottleHandle = throttle(this.toAddCashMoney, 3000, { leading: true, trailing: false })
    if (!isEmpty(options) && options.curSelectIndex) {
      if (Number(options.curSelectIndex) == 0) {
        that.setData({
          liveNavData: [{
            id: 0,
            isSelect: true,
            c_name: "送货单",
            status: "送货单",
          },
          {
            id: 1,
            isSelect: false,
            c_name: "退货单",
            status: '退货单'
            },
            {
              id: 2,
              isSelect: false,
              c_name: "现结单",
              status: '现结单'
            }
          ],
          curSelectIndex: 0
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    that.setMarginTop()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function(options) {
    let that = this;
    if (app.globalData.isItAJumpFromTheSearchPage && that.data.editNoteBack == '否') {
      // 代表是从搜索页面跳回来的
      that.initData()
      that.loadData().then(res => {
        setStatus(that, false)
        that.setMarginTop()
      })
    } else {
      console.log('editNoteBack')
      // 代表是从其他页面跳回来的 需要把deliveryNoteList 还原为原来的数据
      that.data.deliveryNoteList = []
      var b = 1
      const page_num = that.data.page_num
      for (var i = 1; i <= page_num; i++) {
        that.data.page_num = i
        await that.loadData()
        if (b === page_num) {
          setStatus(that, false)
        }
        b++;
      }
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
    that.initData();
    that.loadData(app.globalData.parameter, true, false).then(res => {
      wx.stopPullDownRefresh();
      setStatus(that, false)
    }).catch(err => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    // 如果正在发起请求， 那么直接退
    if (that.data.isRequestIng) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
      multipleSelection:[]
    });
    that.data.page_num = that.data.page_num + 1
    that.loadData(app.globalData.parameter, false, true).then(res => {
      if (res === '没有更多数据了') {
        that.data.page_num = that.data.page_num - 1
      } else {
        setStatus(that, false)
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
  /************页面事件*************************************end*********************** */
})