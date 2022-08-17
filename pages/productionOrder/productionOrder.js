// pages/productionOrder/productionOrder.js
import {
  filter_production_note
} from "../../services/ordersForProductionScheduling.js";
import {
  noDataProcessingLogic,
  isEmpty
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
    skipLinks: '/pages/productNoteSearchPage/productNoteSearchPage',
    // 如果是从搜索页面跳转回来的 会带上搜索条件
    searchCondition: {},
    // 是否显示条件框
    whetherToDisplayAConditionBox: false,
    // 条件查询的标题
    conditionalQueryTitle: '按以下搜索条件查询到的所有生产单',
    // 是否显示扫码
    whetherToShowScanIcon: true,

    //导航栏信息
    liveNavData: [{
        id: 0,
        isSelect: true,
        c_name: "生产中", //这里其实是 新生产单 和生产中 俩个状态（人家要求就显示一栏）
        status: "生产中",
      },
      {
        id: 1,
        isSelect: false,
        c_name: "完成",
        status: '完成'
      }
    ],
    //当前选项卡索引(0新生产单和生产中,1完成，2搜索页面跳转回来的可以有任何生产单状态)
    curSelectIndex: 0,
    //生产单列表
    productionOrderList: [],
    //当前请求的页数
    page_num: 1,
    //当前要请求的商品数
    page_size: 16,
    //是否显示回到顶部图标
    floorstatus: false,
    //是否正在发起请求
    isRequestIng: false

  },

  initData() {
    let that = this;
    that.data.page_num = 1
    that.data.page_size = 16
    that.setData({
      productionOrderList: []
    });
  },

  // 清空搜索条件后回调
  clearingSearchCallback() {
    let that = this
    that.setData({
      liveNavData: [{
          id: 0,
          isSelect: true,
          c_name: "生产中",
          status: "生产中",
        },
        {
          id: 1,
          isSelect: false,
          c_name: "完成",
          status: '完成'
        }
      ],
      curSelectIndex: 0,
      whetherToDisplayAConditionBox: false
    })
    that.initData()
    that.loadData().then(res => {
      that.setData({
        isRequestIng: false
      });
    })
  },

  /*选项卡点击事件*/
  onSelectItemClick: function (event) {
    let that = this
    that.setData({
      curSelectIndex: event.detail.index,
    });
    that.initData();
    that.loadData().then(res => {
      that.setData({
        isRequestIng: false
      });
    });
  },
  /**
   * 加载数据
   * parameter(请求的参数)
   * isPullDownRefresh（是否是下拉刷新函数在调用）
   * isReach(是否是上拉触底函数在调用)
   */
  loadData(parameter = null, isPullDownRefresh = false, isReach = false) {
    let that = this;
    return new Promise(function (resolve, reject) {
      var curSelectIndex = that.data.curSelectIndex;
      if (curSelectIndex === 2 && !isPullDownRefresh && !isReach) {
        // 代表是 从应用功能的通知栏点进来的 只查询需要确认工序的生产单
        if (!isEmpty(app.globalData.searchCondition['是否只搜索需要确认工序的生产单'])) {
          parameter = {
            login_token: app.globalData.login_token(),
            多个生产单状态: ['新生产单', '生产中'],
            "生产单工序信息.员工计件.记录确认": false,
            preview_flag: true,
            pagination: {
              page: 1,
              limit: 16
            },
            sort: {
              更新时间: -1
            },
          }
          app.globalData.parameter = parameter
          return filter_production_note(parameter, that).then(res => {
            var list = res.data;
            for (let i = 0; i < list.length; i++) {
              var element = list[i];
              element.productionSchedule = Number(parseFloat(element['完成百分比'] * 100).toFixed(2))
            }
            that.setData({
              productionOrderList: that.data.productionOrderList.concat(list),
              searchCondition: app.globalData.searchCondition
            });
            return resolve('加载生产单信息成功！！')
          })
        } else {
          // 代表是按条件联合搜索跳转回来的。。数据已经拿到
          var productNoteList = app.globalData.productNoteList
          for (let i = 0; i < productNoteList.length; i++) {
            var element = productNoteList[i];
            element.productionSchedule = Number(parseFloat(element['完成百分比'] * 100).toFixed(2))
          }
          that.setData({
            productionOrderList: that.data.productionOrderList.concat(productNoteList),
            searchCondition: app.globalData.searchCondition
          });
          return resolve('加载生产单信息成功！！')
        }
      } else if (curSelectIndex === 2 && isPullDownRefresh && !isReach) {
        // 代表需要按照搜索页面的条件 下拉刷新获取数据
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
      } else if (curSelectIndex === 2 && !isPullDownRefresh && isReach) {
        // 代表需要按照搜索页面的条件来继续上拉加载来获取数据
        parameter.pagination.page = that.data.page_num
        parameter.pagination.limit = that.data.page_size
      } else if (curSelectIndex === 1) {
        //如果选项卡==1 代表只查询完成状态的
        parameter = {
          login_token: app.globalData.login_token(),
          "生产单编号": "",
          pagination: {
            page: that.data.page_num,
            limit: that.data.page_size
          },
          sort: {
            更新时间: -1
          },
          preview_flag: true,
          returned_fields: ['unique_id', '完成百分比', '对应订单', '排产产品', '生产单时间', '生产单状态', '生产单编号'],
          '生产单状态': '完成'
        }
      } else if (curSelectIndex === 0) {
        //如果选项卡==0 代表查询新生产单和生产中
        parameter = {
          login_token: app.globalData.login_token(),
          "生产单编号": "",
          pagination: {
            page: that.data.page_num,
            limit: that.data.page_size
          },
          sort: {
            更新时间: -1
          },
          preview_flag: true,
          returned_fields: ['unique_id', '完成百分比', '对应订单', '排产产品', '生产单时间', '生产单状态', '生产单编号'],
          '多个生产单状态': ['新生产单', '生产中']
        }
      } else {
        that.setData({
          isRequestIng: false
        });
        return reject('选项卡 索引错误！')
      }
      //真正的查数据
      filter_production_note(parameter, that).then(res => {
        var list = res.data;
        console.log(res.data)
        if (!list || list.length == 0) {
          noDataProcessingLogic(that);
          that.setData({
            productionOrderList: that.data.productionOrderList
          })
          return resolve('没有更多数据了')
        } else {
          for (let i = 0; i < list.length; i++) {
            var element = list[i];
            element.productionSchedule = Number(parseFloat(element['完成百分比'] * 100).toFixed(2))
          }
          that.setData({
            productionOrderList: that.data.productionOrderList.concat(list),
          });
          return resolve('加载生产单信息成功！！')
        }
      })
    })
  },

  // 更新数据
  updateData: async function (options) {
    let that = this
    that.data.productionOrderList = []
    var b = 1
    const page_num = that.data.page_num
    for (var i = 1; i <= page_num; i++) {
      that.data.page_num = i
      await that.loadData()
      if (b === page_num) {
        options.detail.callBack(that)
      }
      b++;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    if (!isEmpty(options) && options.curSelectIndex) {
      if (Number(options.curSelectIndex) == 0) {
        that.setData({
          liveNavData: [{
              id: 0,
              isSelect: true,
              c_name: "生产中",
              status: "生产中",
            },
            {
              id: 1,
              isSelect: false,
              c_name: "完成",
              status: '完成'
            }
          ],
          curSelectIndex: 0
        })
      } else if (Number(options.curSelectIndex) == 1) {
        that.setData({
          liveNavData: [{
              id: 0,
              isSelect: false,
              c_name: "生产中",
              status: "生产中",
            },
            {
              id: 1,
              isSelect: true,
              c_name: "完成",
              status: '完成'
            }
          ],
          curSelectIndex: 1
        })
      } else if (Number(options.curSelectIndex) == 2) {
        that.setData({
          curSelectIndex: 2,
          whetherToDisplayAConditionBox: true
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function (options) {
    let that = this;
    if (this.data.curSelectIndex === 2) {
      // 代表是从搜索页面跳回来的
      that.initData();
      that.loadData().then(res => {
        that.setData({
          isRequestIng: false
        });
      })
    } else {
      // 代表是从其他页面跳回来的 需要把productionOrderList 还原为原来的数据
      that.data.productionOrderList = []
      var b = 1
      const page_num = that.data.page_num
      for (var i = 1; i <= page_num; i++) {
        that.data.page_num = i
        await that.loadData()
        if (b === page_num) {
          that.setData({
            isRequestIng: false
          });
        }
        b++;
      }
    }
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
    that.setData({
      isRequestIng: true
    })
    programInitialization(app).then(res => {
      that.initData();
      that.loadData(app.globalData.parameter, true, false).then(res => {
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
  onReachBottom: function () {
    let that = this;
    // 如果正在发起请求, 那么直接退
    if (that.data.isRequestIng) return;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
      page_num: that.data.page_num + 1
    });
    that.loadData(app.globalData.parameter, false, true).then(res => {
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
  onShareAppMessage: function () {

  }
})