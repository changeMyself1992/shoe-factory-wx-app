import {
  markedWords,
  setStatus,
  concat_
} from "../../utils/util.js";
import {
  staff_get_process_summary_stats,
  mananger_get_process_summary_stats
} from "../../services/scheduleManagement.js"
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    processDepartmentList: [],
    //是否显示回到顶部图标
    floorstatus: false,
    positionStr: 'top: 110px;right: 20px;',
    tabBarUrl: '/pages/dataKanban/dataKanban',
    systeminfo: {},
  },

  //初始化部门列表
  initializesTheDepartmentList() {
    let that = this
    return new Promise(function(resolve, reject) {
      return that.getProcessSummaryStats().then(res => {
        var 今日部门工资统计 = res.data['今日部门工资统计']
        var 昨日部门工资统计 = res.data['昨日部门工资统计']
        var keysToday = Object.keys(今日部门工资统计)
        var keysYesterday = Object.keys(今日部门工资统计)
        // 组合自己可以展示的部门统计列表
        // 1.判断 今日部门工资统计，昨日部门工资统计，对象key的个数是否都为0（如果是这样代表没有任何的部门信息直接退出）
        if (keysToday.length === 0 && keysYesterday.length === 0) {
          setStatus(that, false)
          markedWords('暂时无数据.')
          reject()
        } else {
          var responsibleProcess = app.globalData.userInfo()['负责工序']
          // 2. 把 今日部门工资统计的key和昨日部门工资统计的key，提取为一个数组（不能有重复的key）
          var processKeys = concat_(keysToday, keysYesterday)
          // 3.组合
          var processDepartmentList = []
          for (let i = 0; i < processKeys.length; i++) {
            const processKey = processKeys[i];
            var item = {
              '部门名称': processKey,
              '今日完成总数': 0,
              "今日上班人数": 0,
              "昨日完成总数": 0,
              "昨日上班人数": 0,
              "是否和自身绑定": responsibleProcess.includes(processKey) ? true : false
            }
            for (const key in 今日部门工资统计) {
              if (key === processKey) {
                item['今日完成总数'] = 今日部门工资统计[key]['今日完成总数']
                item['今日上班人数'] = 今日部门工资统计[key]['今日上班人数']
                break
              }
            }
            for (const key in 昨日部门工资统计) {
              if (key === processKey) {
                item['昨日完成总数'] = 昨日部门工资统计[key]['昨日完成总数']
                item['昨日上班人数'] = 昨日部门工资统计[key]['昨日上班人数']
                break
              }
            }
            if (item['今日上班人数'] !== 0 || item['昨日上班人数'] !== 0) {
              processDepartmentList.unshift(item)
            }else{
              processDepartmentList.push(item)
            }

          }
          that.setData({
            processDepartmentList: processDepartmentList
          })
          resolve()
        }
      })
    })
  },

  // 获取部门工序统计信息
  getProcessSummaryStats() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token()
      }
      var userInfo = app.globalData.userInfo()
      if (userInfo['管理角色'] === '员工') {
        return staff_get_process_summary_stats(obj_b, that).then(res => {
          resolve(res)
        })
      } else {
        return mananger_get_process_summary_stats(obj_b, that).then(res => {
          resolve(res)
        })
      }
    })
  },
  tohome() {
    wx.switchTab({
      url: '/pages/dataKanban/dataKanban'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    wx.getSystemInfo({
      success: res => {
        that.setData({
          systeminfo: res
        })
      }
    })
    console.log(that.data.systeminfo)
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
    let that = this
    that.initializesTheDepartmentList().then(res => {
      setStatus(that, false)
    })
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
    let that = this;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})