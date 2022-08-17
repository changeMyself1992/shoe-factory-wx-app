// pages/salarySettle_applicationFunction/salarySettle_applicationFunction.js
const app = getApp();
import {
  generate_salary_list_for_frontend_by_time_range
} from "../../services/theFinancialManagement.js"

import {
  manager_filter_staff_costs,
  manager_add_staff_costs
} from "../../services/employeeDeductionInformation.js"
import {
  get_role_authority_names,
  filter_user
} from "../../services/personnelAndAuthorityManagement.js"
import {
  getCurrentMonthFirst,
  getCurrentMonthLast,
  isEmpty,
  markedWords,
  setStatus,
  parseTime
} from "../../utils/util.js";
import regeneratorRuntime, {
  async
} from '../../utils/runtime.js';
import debounce from "../../utils/lodash/debounce.js";
import throttle from "../../utils/lodash/throttle.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    startTime: '',
    endTime: '',
    //导航栏信息
    liveNavData: [{
        id: 0,
        isSelect: true,
        c_name: "员工个人工资", //这里其实是 新生产单 和生产中 俩个状态（人家要求就显示一栏）
        status: "员工个人工资",
      },
      {
        id: 1,
        isSelect: false,
        c_name: "部门工资汇总",
        status: '部门工资汇总'
      },
      {
        id: 2,
        isSelect: false,
        c_name: "抵扣记录",
        status: '抵扣记录'
      }
    ],
    //当前选项卡索引(0员工个人工资,1部门工资汇总)
    curSelectIndex: 0,
    // 工资数据
    wageData: {},
    timeMode: [{
        id: '0',
        name: '今日',
        checked: false
      },
      {
        id: '1',
        name: '昨日',
        checked: false
      },
      {
        id: '2',
        name: '本月',
        checked: true
      },
      {
        id: '3',
        name: '自定义',
        checked: false
      }
    ],
    // 人员搜索关键字
    peopleSearchForKeywords: '',
    // 人员选择输入框是否获取了焦点
    peopleInputFocus: false,
    // 人员搜索输入框的 filter值列表
    suggest_value_list: [],
    // 当前选中的员工
    curSelectedStaff: {},
    // 抵扣原因
    deductionReason: '',
    // 抵扣金额
    deductibleAmount: 0,
    roleOptions: [],
    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false
  },

  //选择企业的时候触发
  checkboxChange: async function (e) {
    let that = this;
    const index = Number(e.detail.value)
    for (let i = 0; i < that.data.timeMode.length; i++) {
      var element = that.data.timeMode[i];
      element.checked = false
    }
    that.data.timeMode[index].checked = true
    that.setData({
      timeMode: that.data.timeMode
    })

    var date = new Date()
    var d = date.getDate()
    var y = date.getFullYear()
    var m = date.getMonth()
    switch (index) {
      case 0:
        // 今日
        that.data.startTime = parseTime(new Date(y, m, d))
        that.data.endTime = parseTime(new Date(y, m, d))
        break
      case 1:
        // 昨日
        that.data.startTime = parseTime(new Date(y, m, d - 1))
        that.data.endTime = parseTime(new Date(y, m, d - 1))
        break
      case 2:
        // 本月
        that.data.startTime = getCurrentMonthFirst()
        that.data.endTime = getCurrentMonthLast()
        break
      default:
        return
    }
    that.setData({
      startTime: that.data.startTime,
      endTime: that.data.endTime
    })
    await that.generateSalaryListForFrontendByTimeRange()
    await that.managerFilterStaffCosts()
    setStatus(that, false)
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

    await that.generateSalaryListForFrontendByTimeRange()
    await that.managerFilterStaffCosts()
    setStatus(that, false)
  },

  /*选项卡点击事件*/
  onSelectItemClick: function (event) {
    let that = this
    that.setData({
      curSelectIndex: event.detail.index,
    });
    if (event.detail.index == 1 && !app.globalData.theirOwnRights()['部门工资列表可读']) {
      wx.showModal({
        title: '权限提示',
        content: '该用户没有 员工工资>查看部门工资信息 相关权限',
        showCancel: false,
        success(res) {}
      })
    }
    if (event.detail.index == 0 && !app.globalData.theirOwnRights()['员工工资列表可读']) {
      wx.showModal({
        title: '权限提示',
        content: '该用户没有 员工工资>查看员工工资信息 相关权限',
        showCancel: false
      })
    }
  },

  // 查询指定时间内的工资信息
  generateSalaryListForFrontendByTimeRange() {
    let that = this
    return new Promise(function (resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
        "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
      }
      return generate_salary_list_for_frontend_by_time_range(obj_b, that).then(res => {
        var data = res.data
        if (!app.globalData.theirOwnRights()['员工工资列表可读']) {
          data['员工工资'] = []
        }
        if (!app.globalData.theirOwnRights()['部门工资列表可读']) {
          data['部门工资'] = []
        }

        that.setData({
          wageData: data
        })
        resolve()
      }).catch(err => {
        reject()
      })
    })
  },
  // 查询指定时间内的工资抵扣信息
  managerFilterStaffCosts() {
    let that = this
    return new Promise(function (resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
        "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
        sort:{
          记录输入时间:-1
        }
      }
      return manager_filter_staff_costs(obj_b, that).then(res => {
        that.setData({
          "wageData.抵扣记录": res.data['记录列表']
        })
        resolve()
      }).catch(err => {
        reject()
      })
    })
  },
  // 添加抵扣按钮调用
  addPayrollDeduction() {
    if (!app.globalData.theirOwnRights()['工资抵扣']) {
      markedWords("无此操作权限")
      return
    }
    var dd = new Date();
    dd.setDate(dd.getDate())
    var datecosts = parseTime(dd, '{y}-{m}-{d}');
    console.log(datecosts)
    this.setData({
      show: true,
      datecosts: datecosts
    })
  },
  // 添加抵扣 时间选择
  bindDateCostsChange: function(e) {
    var that = this
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var datethis = new Date()
    if (new Date(e.detail.value) > new Date(datethis)) {
      wx.showModal({
        title: '提示',
        content: '您填写的抵扣发生时间为未来的一个时段，是否确认添加？',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              datecosts: e.detail.value
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      that.setData({
        datecosts: e.detail.value
      })
    }
  },
  // 添加抵扣对话框关闭调用
  onClickHide() {
    this.setData({
      show: false,
      peopleInputFocus: false,
      peopleSearchForKeywords: '',
      suggest_value_list: [],
      deductionReason:'',
      deductibleAmount:0
    })
    this.data.curSelectedStaff = {}
  },
  // 订单删除之后回调
  callbackDelCostsDeletion(e) {
    let that = this
    var info = e.detail.info
    var index = that.data.wageData['抵扣记录'].findIndex(item => {
      return item.unique_id === info.unique_id
    })
    if (index !== -1) {
      that.data.wageData['抵扣记录'].splice(index, 1)
      that.setData({
        'wageData.抵扣记录': that.data.wageData['抵扣记录']
      })
    }
  },

  //防止点击穿透 背景层
  preventD: function () {},

  // 人员搜索框获取焦点的时候
  onFocusPeople: function (e) {
    let that = this
    that.returnsAListOfPayerInformation().then(suggest_value_list => {
      that.setData({
        peopleInputFocus: true,
        peopleSearchForKeywords: '',
        suggest_value_list: suggest_value_list
      })
    })
  },
  // 返回付款人信息列表
  returnsAListOfPayerInformation: async function (queryString = '') {
    let that = this
    var post_data = {
      login_token: app.globalData.login_token(),
      sort: {
        update_time: -1
      },
      工作状态: ['在职', '离职', '请假', '开除'],
      pagination: {
        page: 1,
        limit: 300
      }
    }
    return new Promise(function (resolve, reject) {
      if (!isEmpty(queryString)) {
        // 认为他是想按照手机号查询
        if (/^[0-9]{1,11}$/.test(queryString)) {
          post_data['绑定手机号'] = '.*' + queryString + '.*'
        } else if (that.data.roleOptions.findIndex(item => {
            return item.value === queryString
          }) !== -1) {
          // 代表他是想按角色查
          post_data['管理角色'] = '.*' + queryString + '.*'
        } else if (['在职', '离职', '请假', '开除', '待确认'].includes(queryString)) {
          // 代表他是想按工作状态查
          var temp = []
          temp.push(queryString)
          post_data['工作状态'] = temp
        } else {
          // 代表他是想按名字查
          post_data['姓名'] = '.*' + queryString + '.*'
        }
      }
      filter_user(post_data).then(response => {
        var suggest_value_list = []
        for (var i in response.data) {
          suggest_value_list.push({
            value: `姓名:${response.data[i]['个人信息']['姓名']}，角色:${response.data[i]['管理角色']}，${response.data[i]['绑定手机号']}`,
            data: response.data[i]
          })
        }
        resolve(suggest_value_list)
      })
    })
  },
  // 人员搜索框输入的时候
  onInputPeople: function (e) {
    let that = this
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return

    var value = e.detail.value
    that.returnsAListOfPayerInformation(value).then(suggest_value_list => {
      that.setData({
        suggest_value_list: suggest_value_list,
        peopleInputFocus: suggest_value_list.length === 0 ? false : true,
      })
      that.data.curSelectedStaff = {}
    })
  },
  // 人员搜索框进行选择的时候
  onPeopleSelect(e) {
    let that = this
    that.data.curSelectedStaff = e.currentTarget.dataset.item.data
    that.setData({
      peopleSearchForKeywords: e.currentTarget.dataset.item.value,
      peopleInputFocus: false
    })
  },
  //查询 该厂的所有管理角色
  getRoleAuthorityNames(enterpriseID) {
    let that = this
    var parameter = {
      "企业unique_id": enterpriseID
    }
    return new Promise(function (resolve, reject) {
      return get_role_authority_names(parameter, that).then(res => {
        var roleOptions = []
        for (let i = 0; i < res.data.length; i++) {
          var item = res.data[i]
          var temp = {
            name: item['管理角色'],
            value: item['管理角色']
          }
          roleOptions.push(temp)
        }
        that.setData({
          roleOptions: roleOptions,
        })
        resolve(true)
      })
    })
  },
  // 输入抵扣原因
  onInputDeductionReason(e) {
    let that = this
    // 手机端点选的时候会触发input事件，所以我们要做判断
    if (isEmpty(e.detail.keyCode)) return
    that.setData({
      deductionReason: e.detail.value
    })
  },
  // 抵扣金额失去焦点
  onBlurDeductibleAmount(e) {
    let that = this
    that.setData({
      deductibleAmount: parseFloat(e.detail.value) ? Number(parseFloat(e.detail.value).toFixed(2)) : 0
    })
  },
  // 当任何非下拉框form元素tap的时候
  onTap() {
    let that = this
    that.setData({
      peopleInputFocus: false
    })
  },
  // 提交工资抵扣表单
  submitPayrollDeduction: async function (e) {
    let that = this
    setTimeout(async () => {
      if (isEmpty(that.data.curSelectedStaff)) {
        markedWords('请选择一个员工！')
        return
      }
      if (isEmpty(that.data.deductionReason)) {
        markedWords('请填写抵扣原因！')
        return
      }
      if (that.data.deductibleAmount <= 0) {
        markedWords('请填写抵扣金额！')
        return
      }
      var paramter = {
        login_token: app.globalData.login_token(),
        data: {
          员工unique_id: that.data.curSelectedStaff.unique_id,
          工资抵扣原因: that.data.deductionReason,
          抵扣金额: that.data.deductibleAmount,
          记录发生时间: that.data.datecosts + ' 00:00:00'
        }
      }
      var res = await manager_add_staff_costs(paramter)
      this.onClickHide()
      // 更新数据
      await that.generateSalaryListForFrontendByTimeRange()
      await that.managerFilterStaffCosts()
      setStatus(that, false)
      markedWords(res.msg)
    }, 200)

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    this.peopleDebouncedHandleSearch = debounce(this.onInputPeople, 1000)
    this.submitPayrollDeductionThrottleHandle = throttle(this.submitPayrollDeduction, 3000, {
      leading: true,
      trailing: false
    })
    that.setData({
      startTime: getCurrentMonthFirst(),
      endTime: getCurrentMonthLast()
    })
    await that.getRoleAuthorityNames(app.globalData.chooseedEnterpriseId())
    await that.generateSalaryListForFrontendByTimeRange()
    await that.managerFilterStaffCosts()
    setStatus(that, false)
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
    //重置数据
    let that = this;
    setStatus(that, true)
    that.generateSalaryListForFrontendByTimeRange().then(res => {
      that.managerFilterStaffCosts().then(res => {
        setStatus(that, false)
        wx.stopPullDownRefresh();
      })
    }).catch(err => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    that.setData({
      floorstatus: true,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})