// pages/processDetails/processDetails.js
import {
  get_production_note_by_id
} from "../../services/ordersForProductionScheduling.js";
import {
  markedWords,
  toPage,
  isEmpty
} from "../../utils/util.js"
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //当前选中的生产单详情
    productionOrderDetails: {},
    //当前选中的工序详情
    processinfo: {},
    //当前用户的角色
    role: app.globalData.userInfo()['管理角色'],
    //权限列表
    theirOwnRights: {},
    //该工序员工计件中是否有自己
    isExists: false,
    // 此工序总工资
    totalWagesForThisProcess:0,
    isRequestIng: false,
    incentiveMode: 'aSinglePiece', //计件模式  aSinglePiece(单个计件)  partnershipPiece(合伙计件)
    positionStr: 'top: 20px;right: 20px;',
    tabBarUrl:'/pages/productionOrder/productionOrder'
  },

  /**
   * 加载数据
   * subcomponentsPassParameters(子组件传递的参数)
   */
  loadData(subcomponentsPassParameters) {
    let that = this;
    return new Promise(function(resolve, reject) {
      var parameter = {
        login_token: app.globalData.login_token(),
        unique_id: app.globalData.productionOrderDetails['unique_id'],
        "返回确认管理者姓名": true
      };
      //发起查询请求
      get_production_note_by_id(parameter, that)
        .then(res => {
          that.setData({
            productionOrderDetails: res.data,
            isRequestIng: false
          });
          app.globalData.productionOrderDetails = res.data;
          //再次刷星页面数据
          that.initPageData()
          //执行子组件的回调
          if (!isEmpty(subcomponentsPassParameters) && !isEmpty(subcomponentsPassParameters.detail) &&
            !isEmpty(subcomponentsPassParameters.detail.callBack)) {
            subcomponentsPassParameters.detail.callBack()
          }
          return resolve('加载生产单信息成功！！')
        })
        .catch(err => {
          return reject('加载生产单信息失败！！');
        })
    })
  },

  /**
   * 实时计算 当前工序实际完成总数
   */
  totalNumrOfCompleted() {
    console.log(this.data)
    let that = this;
    var processinfo = this.data.processinfo;
    var count = 0;
    for (var i = 0; i < processinfo['自身计件']['配码'].length; i++) {
      var item = processinfo['自身计件']['配码'][i];
      count += Number(parseFloat(item['完成数量']).toFixed(2));
    }
    processinfo['自身计件']['总完成数'] = Number(count.toFixed(2))
    processinfo['自身计件']['计件总额'] = Number(parseFloat(count * processinfo['工序工资']).toFixed(2))
    that.setData({
      processinfo: processinfo
    })
  },

  /**
   * 单个计件按钮点击
   */
  onASinglePieceBtnClick(even) {
    let that = this
    that.setData({
      incentiveMode: 'aSinglePiece'
    })
  },
  /**
   * 合伙计件按钮点击
   */
  onPartnershipPieceBtnClick() {
    let that = this
    that.setData({
      incentiveMode: 'partnershipPiece'
    })
  },

  initPageData() {
    let that = this;
    const processName = app.globalData.processName
    that.setData({
      productionOrderDetails: app.globalData.productionOrderDetails,
      theirOwnRights: app.globalData.theirOwnRights()
    })
    //先拿到当前工序
    var processinfo = app.globalData.productionOrderDetails['生产单工序信息'].find(item => {
      return item['工序信息']['工序名称'] === processName
    })
    /******************小数处理*******************************start********************************************************** */

    for (var i = 0; i < processinfo.员工计件.length; i++) {
      var 配码计数 = processinfo.员工计件[i]['配码计数']
      配码计数.总完成数 = Number(parseFloat(配码计数.总完成数).toFixed(2))
      var 配码 = 配码计数.配码
      for (var j = 0; j < 配码.length; j++) {
        配码[j].完成数量 = Number(parseFloat(配码[j].完成数量).toFixed(2))
      }
    }
    /******************小数处理********************************end********************************************************* */

    /******************组合自身计件*******************************start********************************************************** */

    processinfo['自身计件'] = {
      '配码': [],
      '总完成数': 0,
      '组长是否已确认': false
    }
    var 员工计件 = processinfo.员工计件
    var 配码完成总计数 = processinfo.配码完成总计数
    //判断员工计件中是否有自己
    var index = 0
    var myselfUnique_id = app.globalData.userInfo().unique_id
    员工计件.forEach((员工计件元素, idx) => {
      if (员工计件元素.unique_id === myselfUnique_id) {
        that.setData({
          isExists: true
        })
        index = idx
      }
    })
    //如果有自己的话
    if (that.data.isExists) {
      var 员工计件元素 = 员工计件[index]
      var 配码 = 员工计件元素['配码计数']['配码']
      let 已提交计件数量总和=0
      for (var i = 0; i < 配码.length; i++) {
        var obj = 配码[i]
        obj.完成数量 = Number(parseFloat(obj.完成数量).toFixed(2))
        obj.已提交计件数量 = Number(parseFloat(obj.完成数量).toFixed(2))
        已提交计件数量总和 += obj.已提交计件数量
      }
      processinfo['自身计件']['配码'] = 配码
      processinfo['自身计件']['总完成数'] = Number(parseFloat(员工计件元素['配码计数']['总完成数']).toFixed(2))
      processinfo['自身计件']['组长是否已确认'] = 员工计件元素['记录确认']
      processinfo['自身计件']['已提交计件数量总和'] = 已提交计件数量总和
    } else {
      let 已提交计件数量总和 = 0
      var 配码 = 配码完成总计数.配码
      //如果没有 那就自己组一个空的结构
      //1.遍历配码
      for (var i = 0; i < 配码.length; i++) {
        var 配码元素 = 配码[i]
        var item = {
          尺码: Number(parseFloat(配码元素.尺码).toFixed(2)),
          国标码: Number(parseFloat(配码元素.国标码).toFixed(2)),
          目标数量: Number(parseFloat(配码元素.目标数量).toFixed(2)),
          已提交计件数量: Number(parseFloat(配码元素.完成数量).toFixed(2)),
          完成数量: 0
        }
        已提交计件数量总和 += item.已提交计件数量
        var count = 0 // 当前尺码，所有的其他员工提交的总数
        //2.遍历员工计件
        for (var j = 0; j < 员工计件.length; j++) {
          var 员工计件的配码 = 员工计件[j]['配码计数']['配码']
          //3. 遍历员工计件的配码
          for (var c = 0; c < 员工计件的配码.length; c++) {
            var 员工计件的配码元素 = 员工计件的配码[c]
            if (员工计件的配码元素.尺码 === 配码元素.尺码) {
              count += 员工计件的配码元素.完成数量
              break
            }
          }
        }
        // 4. 判断count的值
        if (count === 0) {
          //需要预填为目标数量
          item.完成数量 = Number(parseFloat(配码元素.目标数量).toFixed(2))
        } else if (count < Number(配码元素.目标数量)) {
          //其他员工提交的累计没有超过目标数量 那么预填为 相减的值
          item.完成数量 = Number((Number(配码元素.目标数量) - count).toFixed(2))
        } else {
          // 如果别人的累计，大于或者等于目标数量 那么我就预填0
          item.完成数量 = 0
        }
        processinfo['自身计件']['配码'].push(item)
      }
      processinfo['自身计件']['总完成数'] = 0
      processinfo['自身计件']['组长是否已确认'] = false
      processinfo['自身计件']['已提交计件数量总和'] = 已提交计件数量总和
    }

    /******************组合自身计件*******************************end********************************************************** */


    /******************组合 员工计件-配码计数-计件总额*******************************start**************************************** */
    员工计件.forEach(element => {
      element['配码计数']['计件总额'] = Number(parseFloat(processinfo['工序工资'] * element['配码计数']['总完成数']).toFixed(2))
    });
    /******************组合 员工计件-配码计数-计件总额*******************************end**************************************** */

    //设置processinfo
    that.setData({
      processinfo: processinfo,
      totalWagesForThisProcess: Number(parseFloat(processinfo['工序工资'] * processinfo['配码完成总计数']['总完成数']).toFixed(2))
    })
    that.totalNumrOfCompleted() //需要预填总完成数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    that.loadData()
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
    let that = this
    that.loadData().then(res => {
      wx.stopPullDownRefresh()
    }).catch(err => {
      wx.stopPullDownRefresh()
    })
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
})