import throttle from "../../utils/lodash/throttle.js";


import {
  markedWords,
  parseQueryString
} from "../../utils/util.js"
import {
  confirm_login_by_qrcode_token
} from "../../services/loginAndLogoutTool.js"
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 跳转链接
    skipLinks: {
      type: String
    },
    // 搜索条件
    searchCondition: {
      type: Object
    },
    // 是否显示条件框
    whetherToDisplayAConditionBox: {
      type: Boolean
    },
    // 条件查询的标题
    conditionalQueryTitle: {
      type: String
    },
    // 是否显示扫码icon
    whetherToShowScanIcon: {
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  attached: function () {
    this.searchThrottleHandle = throttle(this.onClickSearch, 3000, {
      leading: true,
      trailing: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  detached: function () {
    app.globalData.isItAJumpFromTheSearchPage = false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 允许从相机和相册扫码
    getScancode() {
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
                  wx.showLoading({title: '登录中...'})
                  confirm_login_by_qrcode_token(paramter).then(res => {
                    setTimeout(() => {
                      wx.hideLoading()
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

    // 搜索点击
    onClickSearch() {
      let that = this
      wx.navigateTo({
        url: that.data.skipLinks,
      })
    },

    // 清空搜索条件按钮点击
    whenTheSearchCriteriaButtonIsClicked() {
      this.triggerEvent('clearingSearchCallback', {})
    },
  },

})