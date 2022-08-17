const app = getApp();
import {
  markedWords,
  setStatus,
  isEmpty,
} from "../../utils/util.js"
import {
  get_role_authority_names,
  filter_user
} from "../../services/personnelAndAuthorityManagement.js"
import throttle from "../../utils/lodash/throttle.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否正在发起请求
    isRequestIng: false,
    roleOptions: [],
    workingStateOption: [{
        name: '在职',
        value: '在职'
      },
      {
        name: '离职',
        value: '离职'
      }, {
        name: '请假',
        value: '请假'
      }, {
        name: '开除',
        value: '开除'
      }, {
        name: '待确认',
        value: '待确认'
      }
    ],
  },

  //查询 该厂的所有管理角色
  getRoleAuthorityNames(enterpriseID) {
    let that = this
    var parameter = {
      "企业unique_id": enterpriseID
    }
    return new Promise(function(resolve, reject) {
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

  formSubmit: function (e) {
    let that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var post_data = {
      login_token: app.globalData.login_token(),
      sort: { 更新时间: -1 },
      pagination: {
        page: 1,
        limit: 16
      },
    }
    if (!isEmpty(e.detail.value['姓名'])) {
      post_data['姓名'] = e.detail.value['姓名']
    }
    if (!isEmpty(e.detail.value['管理角色'])) {
      post_data['管理角色'] = e.detail.value['管理角色']
    }
    if (!isEmpty(e.detail.value['绑定手机号'])) {
      post_data['绑定手机号'] = e.detail.value['绑定手机号']
    }
    if (!isEmpty(e.detail.value['工作状态'])) {
      post_data['工作状态'] = e.detail.value['工作状态']
    }
    app.globalData.parameter = post_data
    filter_user(post_data,that).then(res=>{
      setStatus(that, false)
      if (res.data.length === 0) {
        markedWords('没有搜索到任何数据')
      } else {
        app.globalData.staffListFromQuery = res.data
        var 工作状态_str = ''
        for (let i = 0; i < e.detail.value['工作状态'].length; i++) {
          工作状态_str += e.detail.value['工作状态'][i] + (i === e.detail.value['工作状态'].length - 1 ? '' : '，');
        }
        app.globalData.searchCondition = {
          名字: e.detail.value['姓名'],
          手机号: e.detail.value['绑定手机号'],
          管理角色: e.detail.value['管理角色'],
          工作状态: 工作状态_str
        }
        app.globalData.isItAJumpFromTheSearchPage = true
        // 跳回生产单列表并指定为 不选中任何状态
        wx.navigateBack({
          url: '/pages/personnelList_applicationFunction/personnelList_applicationFunction'
        })
      }
    })
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },

  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.formSubmitThrottleHandle = throttle(this.formSubmit, 3000, { leading: true, trailing: false })

    that.getRoleAuthorityNames(app.globalData.chooseedEnterpriseId()).then(res => {
      setStatus(that, false)
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
  /************页面事件*************************************end*********************** */
})