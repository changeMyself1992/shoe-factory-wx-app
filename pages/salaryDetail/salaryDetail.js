// pages/salaryDetail/salaryDetail.js
const app = getApp();
import {
  staff_get_salary_stats,
  staff_get_salary_records,
} from "../../services/scheduleManagement.js"
import {
  staff_get_staff_costs_stats,
  staff_filter_staff_costs
} from "../../services/employeeDeductionInformation.js"

import {
  getCurrentMonthFirst,
  getCurrentMonthLast,
  isEmpty,
  markedWords,
  noDataProcessingLogic
} from "../../utils/util.js";
import regeneratorRuntime, {
  async
} from "../../utils/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startTime: '',
    endTime: '',
    // 计件记录列表
    salaryList: [],
    // 抵扣记录列表
    deductionList: [],
    isRequestIng: false,
    floorstatus: false,
    //导航栏信息
    liveNavData: [{
        id: 0,
        isSelect: true,
        c_name: "计件记录",
        status: "计件记录",
      },
      {
        id: 1,
        isSelect: false,
        c_name: "抵扣记录",
        status: '抵扣记录'
      }
    ],
    //当前选项卡索引(0计件记录查询模式,1抵扣记录查询模式)
    curSelectIndex: 0,
    // 工资统计信息
    salaryStatistics: {},
    // 抵扣信息
    deductionStatistics: {},
    //当前请求的页数
    page_num: 1,
    //当前要请求的商品数
    page_size: 16,
    positionStr: 'top: 20px; left: 50%;transform: translateX(-50%);',
    tabBarUrl: '/pages/dataKanban/dataKanban'
  },

  initData() {
    let that = this;
    that.data.page_num = 1;
    that.data.page_size = 16;
  },

  //日期选择回调
  bindDateChange: async function (e) {
    let that = this
    // 时间对比 开始时间不能大于结束时间
    var value = e.detail.value
    if (e.currentTarget.dataset.status === '开始') {
      if (new Date(value) > new Date(that.data.endTime)) {
        markedWords("开始时间必须小于结束时间！")
        return
      }
      that.setData({
        startTime: value
      })
    }

    if (e.currentTarget.dataset.status === '结束') {
      if (new Date(value) < new Date(that.data.startTime)) {
        markedWords("结束时间必须大于开始时间！")
        return
      }
      that.setData({
        endTime: value
      })
    }
    that.initData()
    await that.staffGetSalaryStats()
    await that.staffGetStaffCostsStats()
    var curSelectIndex = that.data.curSelectIndex;
    if (curSelectIndex === 0) {
      that.data.salaryList = [];
      await that.staffGetSalaryRecords()
    } else {
      that.data.deductionList = []
      await that.stafffilterStaffCosts()
    }
    that.setData({
      isRequestIng: false
    })
  },

  // 指定时间 员工获得他的工资统计信息
  staffGetSalaryStats() {
    let that = this
    return new Promise(function (resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
        "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
      }
      return staff_get_salary_stats(obj_b, that).then(res => {
        that.setData({
          salaryStatistics: res.data
        })
        resolve()
      })
    })
  },
  // 指定时间 员工获得他的工资计件 列表
  staffGetSalaryRecords() {
    let that = this
    return new Promise(function (resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
        "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
        pagination: {
          page: that.data.page_num,
          limit: that.data.page_size
        },
        // 记录确认:true,
        sort: {
          '记录输入时间': -1
        }
      }
      return staff_get_salary_records(obj_b, that).then(res => {
        var 记录列表 = res.data['记录列表']
        if (isEmpty(记录列表)) {
          //没有数据的处理逻辑
          noDataProcessingLogic(that);
          that.setData({
            salaryList: that.data.salaryList
          })
          return resolve('没有更多数据了')
        } else {
          for (let index = 0; index < 记录列表.length; index++) {
            记录列表[index]['应发工资'] = parseFloat(记录列表[index]['应发工资']).toFixed(2)
            记录列表[index]['完成数量'] = parseFloat(记录列表[index]['完成数量']).toFixed(2)
          }
          var a = new Date('2013-08-30 18:55:49:123')
          // 拼接
          var salaryList = that.data.salaryList.concat(记录列表);
          that.setData({
            salaryList: salaryList,
          })
          resolve('工资查询成功!!')
        }
      })
    })
  },
  // 员工获取自己的工资抵扣统计信息
  staffGetStaffCostsStats() {
    let that = this
    return new Promise(function (resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
        "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
      }
      return staff_get_staff_costs_stats(obj_b, that).then(res => {
        that.setData({
          deductionStatistics: res.data
        })
        return resolve()
      })
    })
  },
  // 员工查询自己的工资抵扣记录 列表
  stafffilterStaffCosts() {
    let that = this
    return new Promise(function (resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
        "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
        pagination: {
          page: that.data.page_num,
          limit: that.data.page_size
        },
        // 记录确认:true,
        sort: {
          '记录输入时间': -1
        }
      }
      return staff_filter_staff_costs(obj_b, that).then(res => {
        var 记录列表 = res.data['记录列表']
        if (isEmpty(记录列表)) {
          //没有数据的处理逻辑
          noDataProcessingLogic(that);
          that.setData({
            deductionList: that.data.deductionList
          })
          return resolve('没有更多数据了')
        } else {
          // 拼接
          var deductionList = that.data.deductionList.concat(记录列表);
          that.setData({
            deductionList: deductionList,
          })
          resolve('工资查询成功!!')
        }
      })
    })
  },

  /*选项卡点击事件*/
  onSelectItemClick: async function (event) {
    let that = this
    that.setData({
      curSelectIndex: event.detail.index,
    });
    that.initData();
    var curSelectIndex = that.data.curSelectIndex;
    // 计件记录
    if (curSelectIndex === 0) {
      that.data.salaryList = [];
      await that.staffGetSalaryRecords()
    } else {
      // 抵扣记录
      that.data.deductionList = []
      await that.stafffilterStaffCosts()
    }
    that.setData({
      isRequestIng: false
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    that.setData({
      startTime: getCurrentMonthFirst(),
      endTime: getCurrentMonthLast()
    })
    await that.staffGetSalaryStats()
    await that.staffGetStaffCostsStats()
    await that.staffGetSalaryRecords()
    that.setData({
      isRequestIng: false
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
  onReachBottom: async function () {
    let that = this;
    // 如果正在发起请求那么直接退
    if (that.data.isRequestIng) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
      page_num: that.data.page_num + 1
    });
    var res = ''
    var curSelectIndex = that.data.curSelectIndex;
    if (curSelectIndex === 0) {
      res = await that.staffGetSalaryRecords()
    } else {
      res = await that.stafffilterStaffCosts()
    }

    if (res === '没有更多数据了') {
      that.data.page_num = that.data.page_num - 1
    }
    that.setData({
      isRequestIng: false
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})