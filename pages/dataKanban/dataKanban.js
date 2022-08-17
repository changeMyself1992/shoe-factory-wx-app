// pages/personalSetting /personalSetting.js
const app = getApp();
import {
  staff_get_recent_salary_summary
} from "../../services/scheduleManagement.js"
import {
  statistics_data_get_day_profits,
  statistics_data_get_month_profits,
  statistics_data_get_year_profits,
  statistics_data_get_salary_cost,
  statistics_data_get_order_data,
  statistics_data_get_product_note,
  statistics_data_get_month_sell_products,
  statistics_data_get_month_customer_data,
  statistics_data_get_day_supplier_purchases,
  statistics_data_get_month_supplier_purchases,
  statistics_data_get_day_warehouse_statistics,
  statistics_data_get_day_in_out_warehouse_statistics,
  statistics_data_get_month_supplier_statements,
  statistics_data_get_month_product_note,
  statistics_data_get_year_product_note,
  statistics_data_get_year_order_data,
  statistics_data_get_years_supplier_purchases
} from "../../services/statisticsData.js"
import {
  getCurrentMonthFirst,
  getCurrentMonthLast,
  isEmpty,
  setStatus,
  getSevenDay,
  markedWords
} from "../../utils/util.js";
import {
  programInitialization
} from '../../utils/user.js'
import regeneratorRuntime from "../../utils/runtime.js";
import * as echarts from '../../components/ec-canvas/echarts';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 收益
    cur: 2,
    // 采购供应的cur
    cggycur: 1,
    // 销售订单的cur
    xsddcur: 2,
    // 生产订单的cur
    scddcur: 1,
    // 传递给工资卡片的信息
    salaryInformation: null,
    // 产量折线图ec
    ec_line_a: {
      lazyLoad: true
    },
    isRequestIng: false,
    //是否显示回到顶部图标
    floorstatus: false
  },
  notOpen() {
    markedWords('暂未开放')
  },
  // 日收益
  statisticsDataGetDayProfits() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_day_profits(obj_b, that).then(res => {
        var resData = res.data['近7天收益']
        var profitsMonthXAxis = []
        var profitsMonthSeries = []
        for (var i = 0; i < resData.length; i++) {
          // profitsMonthXAxis.push(resData[i]['时间标记'].split('-')[2] + '日')
          profitsMonthXAxis.push(resData[i]['时间标记'].split('-')[0] + '年' + resData[i]['时间标记'].split('-')[1] + '月' + resData[i]['时间标记'].split('-')[2] + '日')
          profitsMonthSeries.push(Math.ceil(resData[i]['内容']['日收益金额']))
        }
        that.setData({
          getDayProfits: res.data['日收益']['内容'],
          profitsUpdate: res.data['日收益']['更新时间'],
          profitsMonthXAxis: profitsMonthXAxis,
          profitsMonthSeries: profitsMonthSeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 月收益
  statisticsDataGetMonthProfits() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_month_profits(obj_b, that).then(res => {
        var resData = res.data['近半年收益']
        var profitsMonthXAxis = []
        var profitsMonthSeries = []
        for (var i = 0; i < resData.length; i++) {
          // profitsMonthXAxis.push(resData[i]['时间标记'].split('-')[1] + '月')
          profitsMonthXAxis.push(resData[i]['时间标记'].split('-')[0] + '年' + resData[i]['时间标记'].split('-')[1] + '月')
          
          profitsMonthSeries.push(Math.ceil(resData[i]['内容']['月收益金额']))
        }
        that.setData({
          getDayProfits: res.data['本月收益']['内容'],
          profitsUpdate: res.data['本月收益']['更新时间'],
          profitsMonthXAxis: profitsMonthXAxis,
          profitsMonthSeries: profitsMonthSeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 年收益
  statisticsDataGetYearProfits() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_year_profits(obj_b, that).then(res => {
        var resData = res.data['近两年收益']
        var profitsMonthXAxis = []
        var profitsMonthSeries = []
        for (var i = 0; i < resData.length; i++) {
          profitsMonthXAxis.push(resData[i]['时间标记'] + '年')
          profitsMonthSeries.push(Math.ceil(resData[i]['内容']['年收益金额']))
        }
        that.setData({
          getDayProfits: res.data['今年收益']['内容'],
          profitsUpdate: res.data['今年收益']['更新时间'],
          profitsMonthXAxis: profitsMonthXAxis,
          profitsMonthSeries: profitsMonthSeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 日生产订单api
  statisticsDataGetProductNote() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_product_note(obj_b, that).then(res => {
        // 生产订单圆环工序图
        var newProcessGetProductNote = res.data['当日数据']['内容']['最新生产单工序数据']
        if (newProcessGetProductNote.length > 0) {
          for (var i = 0; i < newProcessGetProductNote.length; i++) {
            newProcessGetProductNote[i].title = ''
            newProcessGetProductNote[i].canvasWidth = 80
            newProcessGetProductNote[i].valueColor = '#333'
            newProcessGetProductNote[i].lineWidth = "5"
            newProcessGetProductNote[i]['工序完成进度'] = newProcessGetProductNote[i]['工序完成进度'] * 100
          }
          var colorArr = ['#4A90E2', '#F19F27', '#2FCC71', '#DC5460', '#768CD2', '#EB8C4C', '#7B91B3', '#F9D710', '#D2767F', '#516ECD', '#06258B', '#4A90E2', '#F19F27', '#2FCC71', '#DC5460', '#768CD2', '#EB8C4C', '#7B91B3', '#F9D710', '#D2767F', '#516ECD', '#06258B']
          // 随机颜色
          // var colorArr = []
          // for (var j = 0; j < newProcessGetProductNote.length; j++) {
          //   colorArr.push(that.setColor())
          // }
          for (var j = 0; j < newProcessGetProductNote.length; j++) {
            newProcessGetProductNote[j].lineColor = colorArr[j]
          }
        }
        // 生产订单折线图
        // var sevenDayXAxis = [getSevenDay(-6).split('-')[2], getSevenDay(-5).split('-')[2], getSevenDay(-4).split('-')[2], getSevenDay(-3).split('-')[2], getSevenDay(-2).split('-')[2], '昨日', '今日']
        // var sevenDaySeries = ['','','','']
        var sevenDayXAxis = []
        var sevenDaySeries = []
        for (var k = 0; k < res.data['近7天数据'].length; k++) {
          sevenDayXAxis.push(res.data['近7天数据'][k]['时间标记'].split('-')[0] + '年' + res.data['近7天数据'][k]['时间标记'].split('-')[1] + '月' + res.data['近7天数据'][k]['时间标记'].split('-')[2] + '日')
          sevenDaySeries.push(res.data['近7天数据'][k]['当日产量'])
        }
        that.setData({
          getProductNoteTHISDAY: res.data['当日数据']['内容']['当日产量'],
          getProductNoteTHISMONTH: res.data['当月数据']['当月产量'],
          getProductNoteTHISYEAR: res.data['当年数据']['当年产量'],
          newProcessGetProductNote: res.data['当日数据']['内容']['最新生产单工序数据'],
          productUpdate: res.data['当日数据']['更新时间'],
          sevenDayXAxis: sevenDayXAxis,
          sevenDaySeries: sevenDaySeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 月生产订单api
  statisticsDataGetMonthProductNote() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_month_product_note(obj_b, that).then(res => {
        console.log(res.data)
        var sevenDayXAxis = []
        var sevenDaySeries = []
        for (var k = 0; k < res.data['近半年的数据'].length; k++) {
          sevenDayXAxis.push(res.data['近半年的数据'][k]['时间标记'].split('-')[0] + '年' + res.data['近半年的数据'][k]['时间标记'].split('-')[1] + '月')
          sevenDaySeries.push(res.data['近半年的数据'][k]['当月产量'])
        }
        that.setData({
          sevenDayXAxis: sevenDayXAxis,
          sevenDaySeries: sevenDaySeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 年生产订单api
  statisticsDataGetYearProductNote() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_year_product_note(obj_b, that).then(res => {
        console.log(res.data)
        var sevenDayXAxis = []
        var sevenDaySeries = []
        for (var k = 0; k < res.data['近两年的数据'].length; k++) {
          sevenDayXAxis.push(res.data['近两年的数据'][k]['时间标记'] + '年')
          sevenDaySeries.push(res.data['近两年的数据'][k]['当年产量'])
        }
        that.setData({
          sevenDayXAxis: sevenDayXAxis,
          sevenDaySeries: sevenDaySeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 销售订单数据（日月）
  statisticsDataGetOrderNote(xsddcur) {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_order_data(obj_b, that).then(res => {
        // 销售订单柱状图
        if (xsddcur == 1) {
          // 日的
          var sellDayXAxis = []
          var sellDaySeries = []
          for (var k = 0; k < res.data['近7天销售数据'].length; k++) {
            sellDayXAxis.push(res.data['近7天销售数据'][k]['时间标记'].split('-')[0] + '年' + res.data['近7天销售数据'][k]['时间标记'].split('-')[1] + '月' + res.data['近7天销售数据'][k]['时间标记'].split('-')[2] + '日')
            sellDaySeries.push(res.data['近7天销售数据'][k]['内容']['当日销售额'])
          }
          that.setData({
            sellDayXAxis: sellDayXAxis,
            sellDaySeries: sellDaySeries
          })
        } else if (xsddcur == 2) {
          var sellMonthXAxis = []
          var sellMonthSeries = []
          for (var k = 0; k < res.data['近半年销售订单数据'].length; k++) {
            sellMonthXAxis.push(res.data['近半年销售订单数据'][k]['时间标记'].split('-')[0] + '年' + res.data['近半年销售订单数据'][k]['时间标记'].split('-')[1] + '月')
            sellMonthSeries.push(res.data['近半年销售订单数据'][k]['内容']['当月销售额'])
          }
          that.setData({
            sellMonthXAxis: sellMonthXAxis,
            sellMonthSeries: sellMonthSeries,
          })
        }
        that.setData({
          getOrderNoteTHISDAY: res.data['日销售订单数据']['内容']['当日销售额'],
          getOrderNoteTHISMONTH: res.data['当月销售订单']['内容']['当月销售额'],
          getOrderNoteTHISYEAR: res.data['当年销售订单']['内容']['当年销售额'],
          sellUpdate: res.data['日销售订单数据']['更新时间'],
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 销售订单数据（年）
  statisticsDataGetYearOrderNote() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_year_order_data(obj_b, that).then(res => {
        console.log(res.data)
        var sellYearXAxis = []
        var sellYearSeries = []
        for (var k = 0; k < res.data['近两年销售订单数据'].length; k++) {
          sellYearXAxis.push(res.data['近两年销售订单数据'][k]['时间标记'] + '年')
          sellYearSeries.push(res.data['近两年销售订单数据'][k]['内容']['当年销售额'])
        }
        that.setData({
          sellYearXAxis: sellYearXAxis,
          sellYearSeries: sellYearSeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 本月热销产品
  statisticsDataGetMonthSellProducts() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_month_sell_products(obj_b, that).then(res => {
        // 热销产品前三名
        if (!isEmpty(res.data['内容']['本月热销产品第一名'])) {
          that.setData({
            hotSellOne: res.data['内容']['本月热销产品第一名']
          })
        } else {
          that.setData({
            hotSellOne: false
          })
        }
        if (!isEmpty(res.data['内容']['本月热销产品第二名'])) {
          that.setData({
            hotSellTwo: res.data['内容']['本月热销产品第二名']
          })
        } else {
          that.setData({
            hotSellTwo: false
          })
        }
        if (!isEmpty(res.data['内容']['本月热销产品第三名'])) {
          that.setData({
            hotSellThree: res.data['内容']['本月热销产品第三名']
          })
        } else {
          that.setData({
            hotSellThree: false
          })
        }
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 客户统计
  statisticsDataGetMonthCustomerData() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_month_customer_data(obj_b, that).then(res => {
        // 热销客户前三名
        that.setData({
          hotCustomerOne: res.data['内容']['本月热销客户第一名']['名称'] || '',
          hotCustomerOneMoney: res.data['内容']['本月热销客户第一名']['销售额'] || '',
          hotCustomerTwo: res.data['内容']['本月热销客户第二名']['名称'] || '',
          hotCustomerTwoMoney: res.data['内容']['本月热销客户第二名']['销售额'] || '',
          hotCustomerThree: res.data['内容']['本月热销客户第三名']['名称'] || '',
          hotCustomerThreeMoney: res.data['内容']['本月热销客户第三名']['销售额'] || ''
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 月供应商结算
  statisticsDataGetMonthSupplierStatements() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_month_supplier_statements(obj_b, that).then(res => {
        // 供应商
        var resData = res.data['内容']['当月供应商结算总金额排行榜']
        var pieSupplierStatements = []
        if (resData.length == 0) {
          var item = {
            value: 0,
            name: '',
          }
          pieSupplierStatements.push(item)
        } else {
          for (var i = 0; i < resData.length; i++) {
            
            resData[i]['排行占比'] = parseFloat(resData[i]['排行占比'] * 100).toFixed(2)
            var item = {
              value: resData[i]['排行占比'],
              name: resData[i]['名称'],
            }
            pieSupplierStatements.push(item)
          }
        }
        that.setData({
          thisMonthsupplierMoney: res.data['内容']['当月结算额'],
          pieSupplierStatementsInfo: res.data['内容']['当月供应商结算总金额排行榜'],
          suppStateUpdate: res.data['更新时间'],
          pieSupplierStatements: pieSupplierStatements
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 日采购供应数据（日）
  statisticsDataGetDaySupplierPurchases() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_day_supplier_purchases(obj_b, that).then(res => {
        // 日采购供应数据
        console.log(res.data)
        var purchasesDayXAxis = []
        var purchasesDaySeries = []
        for (var k = 0; k < res.data['近7天采购量'].length; k++) {
          purchasesDayXAxis.push(res.data['近7天采购量'][k]['时间标记'].split('-')[0] + '年' + res.data['近7天采购量'][k]['时间标记'].split('-')[1] + '月' + res.data['近7天采购量'][k]['时间标记'].split('-')[2] + '日')
          purchasesDaySeries.push(res.data['近7天采购量'][k]['内容']['当日采购额'])
        }
        that.setData({
          thisDayPurchasesMoney: res.data['当日采购量']['内容']['当日采购额'],
          thisMonthPurchasesMoney: res.data['当月采购量']['内容']['当月采购额'],
          thisYearPurchasesMoney: res.data['当年采购量']['内容']['当年采购额'],
          suppPurUpdate: res.data['当日采购量']['更新时间'],
          purchasesDayXAxis: purchasesDayXAxis,
          purchasesDaySeries: purchasesDaySeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 近半年来采购供应数据（月）
  statisticsDataGetMonthSupplierPurchases() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_month_supplier_purchases(obj_b, that).then(res => {
        // 近半年来采购供应图表
        var purchasesMonthXAxis = []
        var purchasesMonthSeries = []
        for (var k = 0; k < res.data['近半年采购额'].length; k++) {
          purchasesMonthXAxis.push(res.data['近半年采购额'][k]['时间标记'].split('-')[0] + '年' + res.data['近半年采购额'][k]['时间标记'].split('-')[1] + '月')
          purchasesMonthSeries.push(res.data['近半年采购额'][k]['内容']['当月采购额'])
        }
        that.setData({
          purchasesMonthXAxis: purchasesMonthXAxis,
          purchasesMonthSeries: purchasesMonthSeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 年采购供应数据
  statisticsDataGetYearSupplierPurchases() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_years_supplier_purchases(obj_b, that).then(res => {
        console.log(res.data)
        var purchasesYearXAxis = []
        var purchasesYearSeries = []
        for (var k = 0; k < res.data['近半年采购额'].length; k++) {
          purchasesYearXAxis.push(res.data['近半年采购额'][k]['时间标记'] + '年')
          purchasesYearSeries.push(res.data['近半年采购额'][k]['内容']['当年采购额'])
        }
        that.setData({
          purchasesYearXAxis: purchasesYearXAxis,
          purchasesYearSeries: purchasesYearSeries
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 日仓库统计
  statisticsDataGetDayWarehouseStatistics() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_day_warehouse_statistics(obj_b, that).then(res => {
        // 日仓库统计
        that.setData({
          warehouseNum: res.data['内容']['库存数量'],
          warehouseMoney: res.data['内容']['库存金额']
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  // 日出入库统计
  statisticsDataGetDayInOutWarehouseStatistics() {
    let that = this
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token(),
        operate: '' // update
      }
      return statistics_data_get_day_in_out_warehouse_statistics(obj_b, that).then(res => {
        // 日仓库统计
        that.setData({
          inWarehouse: res.data['内容']['今日入库'],
          outWarehouse: res.data['内容']['今日出库']
        })
        setStatus(that, false)
        resolve(true)
      })
    })
  },
  //初始化自身工资
  initializeTheirWages() {
    let that = this
    var startTime = getCurrentMonthFirst()
    var endTime = getCurrentMonthLast()
    return new Promise(function(resolve, reject) {
      var obj_b = {
        login_token: app.globalData.login_token()
      }
      return staff_get_recent_salary_summary(obj_b, that).then(res => {
        that.setData({
          salaryInformation: res.data,
        })
        var wageInfo = that.selectComponent('#wage-info')
        wageInfo.setSalaryInformation()
        setStatus(that, false)
        resolve(true)
      }).catch(err => {
        reject()
      })
    })
  },
  // 初始化部门统计
  initializesDepartmentStatistics() {
    let that = this
    return new Promise(function(resolve, reject) {
      // 获取子组件的实例强制刷新他么的麻烦
      var department = that.selectComponent('#process-department-info-located-in-the-dataKanban')
      department.initResponsibleProcessList()
      setStatus(that, false)
      resolve()
    })
  },

  // 获取订单产量折线图option
  getLineAOption: function(scddcur = 1) {
    let that = this
    return new Promise(function(resolve, reject) {
      if (scddcur == 1) {
        that.statisticsDataGetProductNote().then(res => {
          var a = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              },
              position: ['50%', '50%']
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 20,
              top: 20,
              containLabel: true
            },
            xAxis: [{
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 40,
                // fontSize: 8,//字体大小
              },
              data: that.data.sevenDayXAxis,
            }],
            yAxis: [{
              type: 'value'
            }],
            series: [{
              name: '当日产量',
              type: 'bar',
              barGap: 0,
              barWidth: 25,
              // label: labelOption,
              color: '#89A7E8',
              data: that.data.sevenDaySeries
            },
            {
              name: '当日产量',
              type: 'line',
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    color: '#89A7E8'
                  }
                }
              },
              // label: {
              //   show: true, 
              //   position: 'inside',
              //   color:"#333"
              // },
              data: that.data.sevenDaySeries
            }]
          };
          resolve(a)
        })
      } else if (scddcur == 2) {
        that.statisticsDataGetMonthProductNote().then(res => {
          var a = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              },
              position: ['50%', '50%']
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 20,
              top: 20,
              containLabel: true
            },
            xAxis: [{
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 40,
                // fontSize: 8,//字体大小
              },
              data: that.data.sevenDayXAxis,
            }],
            yAxis: [{
              type: 'value'
            }],
            series: [{
              name: '当月产量',
              type: 'bar',
              barGap: 0,
              barWidth: 25,
              // label: labelOption,
              color: '#89A7E8',
              data: that.data.sevenDaySeries
            },
            {
              name: '当月产量',
              type: 'line',
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    color: '#89A7E8'
                  }
                }
              },
              // label: {
              //   show: true, 
              //   position: 'inside',
              //   color:"#333"
              // },
              data: that.data.sevenDaySeries
            }]
          };
          resolve(a)
        })
      } else if (scddcur == 3) {
        that.statisticsDataGetYearProductNote().then(res => {
          var a = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              },
              position: ['50%', '50%']
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 20,
              top: 20,
              containLabel: true
            },
            xAxis: [{
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 40,
                // fontSize: 8,//字体大小
              },
              data: that.data.sevenDayXAxis,
            }],
            yAxis: [{
              type: 'value'
            }],
            series: [{
              name: '当年产量',
              type: 'bar',
              barGap: 0,
              barWidth: 25,
              // label: labelOption,
              color: '#89A7E8',
              data: that.data.sevenDaySeries
            },
            {
              name: '当年产量',
              type: 'line',
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    color: '#89A7E8'
                  }
                }
              },
              // label: {
              //   show: true, 
              //   position: 'inside',
              //   color:"#333"
              // },
              data: that.data.sevenDaySeries
            }]
          };
          resolve(a)
        })
      }
    })
  },
  // 获取曲线图
  getLineSmoothOption(cggycur = 1) {
    let that = this
    return new Promise(function(resolve, reject) {
      if (cggycur == 1) {
        that.statisticsDataGetDaySupplierPurchases().then(res => {
          var a = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              },
              position: ['50%', '50%']
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 20,
              top: 20,
              containLabel: true
            },
            xAxis: [{
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.purchasesDayXAxis,
            }],
            yAxis: [{
              type: 'value'
            }],
            series: [{
              name: '当日采购额',
              type: 'line',
              smooth: true,
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    color: '#89A7E8'
                  }
                }
              },
              // label: {
              //   show: true, 
              //   position: 'inside',
              //   color:"#333"
              // },
              data: that.data.purchasesDaySeries
            }]
          };
          resolve(a)
        })
      } else if (cggycur == 2) {
        that.statisticsDataGetMonthSupplierPurchases().then(res => {
          var a = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              },
              position: ['50%', '50%']
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 20,
              top: 20,
              containLabel: true
            },
            xAxis: [{
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.purchasesMonthXAxis,
            }],
            yAxis: [{
              type: 'value'
            }],
            series: [{
              name: '当日采购额',
              type: 'line',
              smooth: true,
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    color: '#89A7E8'
                  }
                }
              },
              // label: {
              //   show: true, 
              //   position: 'inside',
              //   color:"#333"
              // },
              data: that.data.purchasesMonthSeries
            }]
          };
          resolve(a)
        })
      } else if (cggycur == 3) {
        that.statisticsDataGetYearSupplierPurchases().then(res => {
          var a = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              },
              position: ['50%', '50%']
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 20,
              top: 20,
              containLabel: true
            },
            xAxis: [{
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.purchasesYearXAxis,
            }],
            yAxis: [{
              type: 'value'
            }],
            series: [{
              name: '当日采购额',
              type: 'line',
              smooth: true,
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    color: '#89A7E8'
                  }
                }
              },
              // label: {
              //   show: true, 
              //   position: 'inside',
              //   color:"#333"
              // },
              data: that.data.purchasesYearSeries
            }]
          };
          resolve(a)
        })
      }
    })
  },
  // 获取供应商圆环图
  getGysPieOption() {
    let that = this
    return new Promise(function(resolve, reject) {
      that.statisticsDataGetMonthSupplierStatements().then(res => {
        var a = {
          // tooltip: {
          //   trigger: 'item',
          //   formatter: "{b}: {c} ({d}%)"
          // },
          series: [{
            type: 'pie',
            color: ["#2FCC71", "#3298DB", "#F19F27", "#DC5460"],
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '26rpx',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: that.data.pieSupplierStatements
          }]
        };
        resolve(a)
      })
    })
  },
  // 获取销售订单柱状图option
  getBarAOption(xsddcur = 2) {
    let that = this
    var xsddcur = xsddcur
    return new Promise(function(resolve, reject) {
      if (xsddcur == 1) {
        that.statisticsDataGetOrderNote(xsddcur).then(res => {
          var app = {}
          var option = null
          var posList = [
            'left',
            'right',
            'top',
            'bottom',
            'inside',
            'insideTop',
            'insideLeft',
            'insideRight',
            'insideBottom',
            'insideTopLeft',
            'insideTopRight',
            'insideBottomLeft',
            'insideBottomRight'
          ]
          app.configParameters = {
            rotate: {
              min: -90,
              max: 90
            },
            align: {
              options: {
                left: 'left',
                center: 'center',
                right: 'right'
              }
            },
            verticalAlign: {
              options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
              }
            },
            position: {
              options: echarts.util.reduce(
                posList,
                function(map, pos) {
                  map[pos] = pos
                  return map
                }, {}
              )
            },
            distance: {
              min: 0,
              max: 100
            }
          }
          app.config = {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', -15],
            distance: 10,
            onChange: function() {
              var labelOption = {
                normal: {
                  rotate: app.config.rotate,
                  align: app.config.align,
                  verticalAlign: app.config.verticalAlign,
                  position: app.config.position,
                  distance: app.config.distance
                }
              }
              myChart.setOption({
                series: [{
                  label: labelOption
                }]
              })
            }
          }
          var labelOption = {
            show: true,
            position: app.config.position,
            distance: app.config.distance,
            align: app.config.align,
            verticalAlign: app.config.verticalAlign,
            rotate: app.config.rotate,
            formatter: params => {
              if (!params.value) return ''
              return params.value
            },
            color: '#333',
            fontSize: 12,
            // borderWidth: 1,
            // borderColor: "auto",
            padding: 2,
            rich: {
              name: {
                textBorderColor: 'black',
                color: '#fff'
              }
            }
          }
          option = {
            color: ['#DC5460', '#d14a61'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            calculable: true,
            xAxis: [{
              type: 'category',
              axisTick: {
                show: false
              },
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.sellDayXAxis
            }],
            yAxis: [{
              type: 'value'
            }],
            grid: {
              left: '0',
              right: '0',
              containLabel: true
            },
            series: [{
                name: '销售额',
                type: 'bar',
                barGap: 0,
                barWidth: 25,
                label: labelOption,
                color: '#89A7E8',
                data: that.data.sellDaySeries
              },
              {
                name: '销售额',
                type: 'line',
                barGap: 0,
                barWidth: 25,
                // label: labelOption,
                color: '#DC5460',
                data: that.data.sellDaySeries
              }
            ]
          }
          resolve(option)
        })
      } else if (xsddcur == 2) {
        that.statisticsDataGetOrderNote(xsddcur).then(res => {
          var app = {}
          var option = null
          var posList = [
            'left',
            'right',
            'top',
            'bottom',
            'inside',
            'insideTop',
            'insideLeft',
            'insideRight',
            'insideBottom',
            'insideTopLeft',
            'insideTopRight',
            'insideBottomLeft',
            'insideBottomRight'
          ]
          app.configParameters = {
            rotate: {
              min: -90,
              max: 90
            },
            align: {
              options: {
                left: 'left',
                center: 'center',
                right: 'right'
              }
            },
            verticalAlign: {
              options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
              }
            },
            position: {
              options: echarts.util.reduce(
                posList,
                function(map, pos) {
                  map[pos] = pos
                  return map
                }, {}
              )
            },
            distance: {
              min: 0,
              max: 100
            }
          }
          app.config = {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', -15],
            distance: 10,
            onChange: function() {
              var labelOption = {
                normal: {
                  rotate: app.config.rotate,
                  align: app.config.align,
                  verticalAlign: app.config.verticalAlign,
                  position: app.config.position,
                  distance: app.config.distance
                }
              }
              myChart.setOption({
                series: [{
                  label: labelOption
                }]
              })
            }
          }
          var labelOption = {
            show: true,
            position: app.config.position,
            distance: app.config.distance,
            align: app.config.align,
            verticalAlign: app.config.verticalAlign,
            rotate: app.config.rotate,
            formatter: params => {
              if (!params.value) return ''
              return params.value
            },
            color: '#333',
            fontSize: 12,
            // borderWidth: 1,
            // borderColor: "auto",
            padding: 2,
            rich: {
              name: {
                textBorderColor: 'black',
                color: '#fff'
              }
            }
          }
          option = {
            color: ['#DC5460', '#d14a61'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            calculable: true,
            xAxis: [{
              type: 'category',
              axisTick: {
                show: false
              },
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.sellMonthXAxis
            }],
            yAxis: [{
              type: 'value'
            }],
            grid: {
              left: '0',
              right: '0',
              containLabel: true
            },
            series: [{
                name: '销售额',
                type: 'bar',
                barGap: 0,
                barWidth: 25,
                label: labelOption,
                color: '#89A7E8',
                data: that.data.sellMonthSeries
              },
              {
                name: '销售额',
                type: 'line',
                barGap: 0,
                barWidth: 25,
                // label: labelOption,
                color: '#DC5460',
                data: that.data.sellMonthSeries
              }
            ]
          }
          resolve(option)
        })
      } else if (xsddcur == 3) {
        that.statisticsDataGetYearOrderNote().then(res => {
          var app = {}
          var option = null
          var posList = [
            'left',
            'right',
            'top',
            'bottom',
            'inside',
            'insideTop',
            'insideLeft',
            'insideRight',
            'insideBottom',
            'insideTopLeft',
            'insideTopRight',
            'insideBottomLeft',
            'insideBottomRight'
          ]
          app.configParameters = {
            rotate: {
              min: -90,
              max: 90
            },
            align: {
              options: {
                left: 'left',
                center: 'center',
                right: 'right'
              }
            },
            verticalAlign: {
              options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
              }
            },
            position: {
              options: echarts.util.reduce(
                posList,
                function(map, pos) {
                  map[pos] = pos
                  return map
                }, {}
              )
            },
            distance: {
              min: 0,
              max: 100
            }
          }
          app.config = {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', -15],
            distance: 10,
            onChange: function() {
              var labelOption = {
                normal: {
                  rotate: app.config.rotate,
                  align: app.config.align,
                  verticalAlign: app.config.verticalAlign,
                  position: app.config.position,
                  distance: app.config.distance
                }
              }
              myChart.setOption({
                series: [{
                  label: labelOption
                }]
              })
            }
          }
          var labelOption = {
            show: true,
            position: app.config.position,
            distance: app.config.distance,
            align: app.config.align,
            verticalAlign: app.config.verticalAlign,
            rotate: app.config.rotate,
            formatter: params => {
              if (!params.value) return ''
              return params.value
            },
            color: '#333',
            fontSize: 12,
            // borderWidth: 1,
            // borderColor: "auto",
            padding: 2,
            rich: {
              name: {
                textBorderColor: 'black',
                color: '#fff'
              }
            }
          }
          option = {
            color: ['#DC5460', '#d14a61'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            calculable: true,
            xAxis: [{
              type: 'category',
              axisTick: {
                show: false
              },
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.sellYearXAxis
            }],
            yAxis: [{
              type: 'value'
            }],
            grid: {
              left: '0',
              right: '0',
              containLabel: true
            },
            series: [{
                name: '销售额',
                type: 'bar',
                barGap: 0,
                barWidth: 25,
                label: labelOption,
                color: '#89A7E8',
                data: that.data.sellYearSeries
              },
              {
                name: '销售额',
                type: 'line',
                barGap: 0,
                barWidth: 25,
                // label: labelOption,
                color: '#DC5460',
                data: that.data.sellYearSeries
              }
            ]
          }
          resolve(option)
        })
      }
    })
  },
  // 获取正负柱状图
  getBarBarAOption(cur = 2) {
    let that = this
    var cur = cur
    return new Promise(function(resolve, reject) {
      if (cur == 1) {
        that.statisticsDataGetDayProfits().then(res => {
          var app = {}
          var option = null
          var posList = [
            'left',
            'right',
            'top',
            'bottom',
            'inside',
            'insideTop',
            'insideLeft',
            'insideRight',
            'insideBottom',
            'insideTopLeft',
            'insideTopRight',
            'insideBottomLeft',
            'insideBottomRight'
          ]
          app.configParameters = {
            rotate: {
              min: -90,
              max: 90
            },
            align: {
              options: {
                left: 'left',
                center: 'center',
                right: 'right'
              }
            },
            verticalAlign: {
              options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
              }
            },
            position: {
              options: echarts.util.reduce(
                posList,
                function(map, pos) {
                  map[pos] = pos
                  return map
                }, {}
              )
            },
            distance: {
              min: 0,
              max: 100
            }
          }
          app.config = {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', -15],
            distance: 10,
            onChange: function() {
              var labelOption = {
                normal: {
                  rotate: app.config.rotate,
                  align: app.config.align,
                  verticalAlign: app.config.verticalAlign,
                  position: app.config.position,
                  distance: app.config.distance
                }
              }
              myChart.setOption({
                series: [{
                  label: labelOption
                }]
              })
            }
          }
          var labelOption = {
            show: true,
            position: app.config.position,
            distance: app.config.distance,
            align: app.config.align,
            verticalAlign: app.config.verticalAlign,
            rotate: app.config.rotate,
            formatter: params => {
              if (!params.value) return ''
              return params.value
            },
            color: '#333',
            fontSize: 12,
            // borderWidth: 1,
            // borderColor: "auto",
            padding: 2,
            rich: {
              name: {
                textBorderColor: 'black',
                color: '#fff'
              }
            }
          }
          option = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            calculable: true,
            xAxis: [{
              type: 'category',
              axisTick: {
                show: false
              },
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.profitsMonthXAxis
            }],
            yAxis: [{
              type: 'value'
            }],
            grid: {
              left: '0',
              right: '0',
              containLabel: true
            },
            series: [{
                name: '收益金额',
                type: 'bar',
                barGap: 0,
                barWidth: 25,
                // label: labelOption,
                color: '#89A7E8',
                data: that.data.profitsMonthSeries
              },
              {
                name: '收益金额',
                type: 'line',
                barGap: 0,
                barWidth: 25,
                label: labelOption,
                color: '#DC5460',
                data: that.data.profitsMonthSeries
              }
            ]
          }
          resolve(option)
        })
      } else if (cur == 2) {
        that.statisticsDataGetMonthProfits().then(res => {
          var app = {}
          var option = null
          var posList = [
            'left',
            'right',
            'top',
            'bottom',
            'inside',
            'insideTop',
            'insideLeft',
            'insideRight',
            'insideBottom',
            'insideTopLeft',
            'insideTopRight',
            'insideBottomLeft',
            'insideBottomRight'
          ]
          app.configParameters = {
            rotate: {
              min: -90,
              max: 90
            },
            align: {
              options: {
                left: 'left',
                center: 'center',
                right: 'right'
              }
            },
            verticalAlign: {
              options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
              }
            },
            position: {
              options: echarts.util.reduce(
                posList,
                function(map, pos) {
                  map[pos] = pos
                  return map
                }, {}
              )
            },
            distance: {
              min: 0,
              max: 100
            }
          }
          app.config = {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', -15],
            distance: 10,
            onChange: function() {
              var labelOption = {
                normal: {
                  rotate: app.config.rotate,
                  align: app.config.align,
                  verticalAlign: app.config.verticalAlign,
                  position: app.config.position,
                  distance: app.config.distance
                }
              }
              myChart.setOption({
                series: [{
                  label: labelOption
                }]
              })
            }
          }
          var labelOption = {
            show: true,
            position: app.config.position,
            distance: app.config.distance,
            align: app.config.align,
            verticalAlign: app.config.verticalAlign,
            rotate: app.config.rotate,
            formatter: params => {
              if (!params.value) return ''
              return params.value
            },
            color: '#333',
            fontSize: 12,
            // borderWidth: 1,
            // borderColor: "auto",
            padding: 2,
            rich: {
              name: {
                textBorderColor: 'black',
                color: '#fff'
              }
            }
          }
          option = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            calculable: true,
            xAxis: [{
              type: 'category',
              axisTick: {
                show: false
              },
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.profitsMonthXAxis
            }],
            yAxis: [{
              type: 'value',
              axisLabel: {
                formatter: function (value, index) {
                  var value;
                  if (value >= 1000) {
                    value = value / 1000 + 'k';
                  }
                  if (value >= 10000) {
                    value = value / 10000 + 'w';
                  }
                  if (value <= -1000) {
                    value = value / 1000 + 'k';
                  }
                  if (value <= -10000) {
                    value = value / 10000 + 'w';
                  }
                  return value
                }
              }
            }],
            grid: {
              left: '0',
              right: '0',
              containLabel: true
            },
            series: [{
                name: '收益金额',
                type: 'bar',
                barGap: 0,
                barWidth: 25,
                // label: labelOption,
                color: '#89A7E8',
                data: that.data.profitsMonthSeries
              },
              {
                name: '收益金额',
                type: 'line',
                barGap: 0,
                barWidth: 25,
                label: labelOption,
                color: '#DC5460',
                // itemStyle: {
                //   normal: {
                //     label: {
                //       show: true,		//开启显示
                //       position: 'top',	//在上方显示
                //     }
                //   }
                // },
                data: that.data.profitsMonthSeries
              }
            ]
          }
          resolve(option)
        })
      } else if (cur == 3) {
        that.statisticsDataGetYearProfits().then(res => {
          var app = {}
          var option = null
          var posList = [
            'left',
            'right',
            'top',
            'bottom',
            'inside',
            'insideTop',
            'insideLeft',
            'insideRight',
            'insideBottom',
            'insideTopLeft',
            'insideTopRight',
            'insideBottomLeft',
            'insideBottomRight'
          ]
          app.configParameters = {
            rotate: {
              min: -90,
              max: 90
            },
            align: {
              options: {
                left: 'left',
                center: 'center',
                right: 'right'
              }
            },
            verticalAlign: {
              options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
              }
            },
            position: {
              options: echarts.util.reduce(
                posList,
                function(map, pos) {
                  map[pos] = pos
                  return map
                }, {}
              )
            },
            distance: {
              min: 0,
              max: 100
            }
          }
          app.config = {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', -15],
            distance: 10,
            onChange: function() {
              var labelOption = {
                normal: {
                  rotate: app.config.rotate,
                  align: app.config.align,
                  verticalAlign: app.config.verticalAlign,
                  position: app.config.position,
                  distance: app.config.distance
                }
              }
              myChart.setOption({
                series: [{
                  label: labelOption
                }]
              })
            }
          }
          var labelOption = {
            show: true,
            position: app.config.position,
            distance: app.config.distance,
            align: app.config.align,
            verticalAlign: app.config.verticalAlign,
            rotate: app.config.rotate,
            formatter: params => {
              if (!params.value) return ''
              return params.value
            },
            color: '#333',
            fontSize: 12,
            // borderWidth: 1,
            // borderColor: "auto",
            padding: 2,
            rich: {
              name: {
                textBorderColor: 'black',
                color: '#fff'
              }
            }
          }
          option = {
            color: ['#DC5460'],
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            calculable: true,
            xAxis: [{
              type: 'category',
              axisTick: {
                show: false
              },
              axisLabel: {
                interval: 0,
                rotate: 40
              },
              data: that.data.profitsMonthXAxis
            }],
            yAxis: [{
              type: 'value',
              axisLabel: {
                formatter: function (value, index) {
                  var value;
                  if (value >= 1000) {
                    value = value / 1000 + 'k';
                  }
                  if (value >= 10000) {
                    value = value / 10000 + 'w';
                  }
                  if (value <= -1000) {
                    value = value / 1000 + 'k';
                  }
                  if (value <= -10000) {
                    value = value / 10000 + 'w';
                  }
                  return value
                }
              }
            }],
            grid: {
              left: '0',
              right: '0',
              containLabel: true
            },
            series: [{
                name: '收益金额',
                type: 'bar',
                barGap: 0,
                barWidth: 25,
                // label: labelOption,
                color: '#89A7E8',
                data: that.data.profitsMonthSeries
              },
              {
                name: '收益金额',
                type: 'line',
                barGap: 0,
                barWidth: 25,
                label: labelOption,
                color: '#DC5460',
                data: that.data.profitsMonthSeries
              }
            ]
          }
          resolve(option)
        })
      }
    })
  },
  // 生成随机颜色
  setColor() {
    let colorValue = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f";
    let colorArray = colorValue.split(',')
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += colorArray[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  // 获取页面显示权限
  getRoleArr() {
    this.setData({
      profits: app.globalData.theirOwnRights()['收益统计可读'],
      productOrder: app.globalData.theirOwnRights()['生产订单统计可读'],
      sellOrder: app.globalData.theirOwnRights()['销售订单统计可读'],
      hotProduct: app.globalData.theirOwnRights()['本月热销产品统计可读'],
      hotCustom: app.globalData.theirOwnRights()['客户统计可读'],
      supplierPurchases: app.globalData.theirOwnRights()['采购供应统计可读'],
      supplierStatements: app.globalData.theirOwnRights()['供应商结算统计可读'],
      stock: app.globalData.theirOwnRights()['仓库统计可读'],
      inOutStock: app.globalData.theirOwnRights()['出入库统计可读'],
      staffSelfMoney: app.globalData.theirOwnRights()['员工自身工资可读'],
      partData: app.globalData.theirOwnRights()['部门统计可读'],


      whetherToDisplay404: !app.globalData.theirOwnRights()['收益统计可读'] && !app.globalData.theirOwnRights()['生产订单统计可读'] &&
        !app.globalData.theirOwnRights()['销售订单统计可读'] && !app.globalData.theirOwnRights()['本月热销产品统计可读'] &&
        !app.globalData.theirOwnRights()['客户统计可读'] && !app.globalData.theirOwnRights()['采购供应统计可读'] &&
        !app.globalData.theirOwnRights()['供应商结算统计可读'] && !app.globalData.theirOwnRights()['员工自身工资可读'] &&
        !app.globalData.theirOwnRights()['部门统计可读']
    })
    //这俩功能暂时没开放 !app.globalData.theirOwnRights()['仓库统计可读'] && !app.globalData.theirOwnRights()['出入库统计可读'] && 
  },
  // 收益年月日
  onItemClick(e) {
    var that = this
    var cur = e.currentTarget.dataset.cur
    that.setData({
      cur: cur
    })
    if (cur == 1) {
      that.currEcharse(cur)
    } else if (cur == 2) {
      that.currEcharse(cur)
    } else if (cur == 3) {
      that.currEcharse(cur)
    }
  },
  // 生产订单年月日
  scddClick(e) {
    var that = this
    var scddcur = e.currentTarget.dataset.scddcur
    that.setData({
      scddcur: scddcur
    })
    if (scddcur == 1) {
      that.scddcurEchase(scddcur)
    } else if (scddcur == 2) {
      that.scddcurEchase(scddcur)
    } else if (scddcur == 3) {
      that.scddcurEchase(scddcur)
    }
  },
  // 销售订单年月日
  xsddClick(e) {
    var that = this
    var xsddcur = e.currentTarget.dataset.xsddcur
    that.setData({
      xsddcur: xsddcur
    })
    // 日月接口一样
    if (xsddcur == 1) {
      that.xsddcurEchase(xsddcur)
    } else if (xsddcur == 2) {
      that.xsddcurEchase(xsddcur)
    } else if (xsddcur == 3) {
      that.xsddcurEchase(xsddcur)
    }
  },
  // 采购供应年月日
  cggyClick(e) {
    var that = this
    var cggycur = e.currentTarget.dataset.cggycur
    that.setData({
      cggycur: cggycur
    })
    if (cggycur == 1) {
      that.cggycurEchase(cggycur)
    } else if (cggycur == 2) {
      that.cggycurEchase(cggycur)
    } else if (cggycur == 3) {
      that.cggycurEchase(cggycur)
    }
  },
  // 切换图表
  currEcharse: async function(cur) {
    let that = this;
    if (app.globalData.theirOwnRights()['收益统计可读']) {
      var option = await that.getBarBarAOption(cur)
      // // 初始化产量折线图数据
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-bar').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(option);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
  },
  // 切换销售订单图表
  xsddcurEchase: async function(xsddcur) {
    let that = this;
    if (app.globalData.theirOwnRights()['销售订单统计可读']) {
      var option = await that.getBarAOption(xsddcur)
      // // 初始化产量折线图数据
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-bar1').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(option);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
  },
  // 切换生产订单图表
  scddcurEchase: async function(scddcur) {
    let that = this;
    if (app.globalData.theirOwnRights()['生产订单统计可读']) {
      var option = await that.getLineAOption(scddcur)
      // // 初始化产量折线图数据
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-line').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(option);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
  },
  // 切换采购供应图表
  cggycurEchase: async function(cggycur) {
    let that = this;
    if (app.globalData.theirOwnRights()['采购供应统计可读']) {
      var option = await that.getLineSmoothOption(cggycur)
      // // 初始化产量折线图数据
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-smoothline').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(option);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
  },

  initData:async function(){
    let that = this
    that.setData({
      cur: 2
    })
    that.getRoleArr()
    var roleGet = app.globalData.theirOwnRights()
    var roleArr = [{
      'boll': roleGet['收益统计可读'],
      'func': that.getBarBarAOption,
      'name': '收益统计可读',
    },
    {
      'boll': roleGet['生产订单统计可读'],
      'func': that.getLineAOption,
      'name': '生产订单统计可读',
    },
    {
      'boll': roleGet['供应商结算统计可读'],
      'func': that.getGysPieOption,
      'name': '供应商结算统计可读',
    },
    {
      'boll': roleGet['销售订单统计可读'],
      'func': that.getBarAOption,
      'name': '销售订单统计可读',
    },
    {
      'boll': roleGet['采购供应统计可读'],
      'func': that.getLineSmoothOption,
      'name': '采购供应统计可读',
    },
      // {
      //   'boll': roleGet['员工自身工资可读'],
      //   'func': that.initializeTheirWages(),
      //   'name': '员工自身工资可读',
      // },
      // {
      //   'boll': roleGet['部门统计可读'],
      //   'func': that.initializesDepartmentStatistics(),
      //   'name': '部门统计可读',
      // }, 
    ]
    var request = []
    var requestName = []
    for (let i = 0; i < roleArr.length; i++) {
      if (roleArr[i]['boll']) {
        request.push(roleArr[i]['func']())
        requestName.push(roleArr[i]['name'])
      }
    }
    // 发请求
    var responseArr = await Promise.all(request)
    console.log(responseArr)

    if (requestName.indexOf('收益统计可读') != -1) {
      var index1 = requestName.indexOf('收益统计可读')
      // 初始化
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-bar').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(responseArr[index1]);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
    if (requestName.indexOf('生产订单统计可读') != -1) {
      var index2 = requestName.indexOf('生产订单统计可读')
      // 初始化
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-line').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(responseArr[index2]);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
    if (requestName.indexOf('供应商结算统计可读') != -1) {
      var index3 = requestName.indexOf('供应商结算统计可读')
      // 初始化
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-pie').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(responseArr[index3]);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
    if (requestName.indexOf('销售订单统计可读') != -1) {
      var index4 = requestName.indexOf('销售订单统计可读')
      // 初始化
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-bar1').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(responseArr[index4]);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
    if (requestName.indexOf('采购供应统计可读') != -1) {
      var index5 = requestName.indexOf('采购供应统计可读')
      // 初始化
      that.setData({
        ec_line_a: {
          lazyLoad: true
        }
      })
      that.selectComponent('#mychart-dom-smoothline').init((canvas, width, height) => {
        // 初始化图表
        const Chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        Chart.setOption(responseArr[index5]);
        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return Chart;
      })
    }
    // =========================仓库出入库暂时不做
    // if (app.globalData.theirOwnRights()['仓库统计可读']) {
    //   that.statisticsDataGetDayWarehouseStatistics()
    // }
    // if (app.globalData.theirOwnRights()['出入库统计可读']) {
    //   that.statisticsDataGetDayInOutWarehouseStatistics()
    // }
    if (app.globalData.theirOwnRights()['采购供应统计可读']) {
      that.statisticsDataGetDaySupplierPurchases()
    }
    if (app.globalData.theirOwnRights()['本月热销产品统计可读']) {
      that.statisticsDataGetMonthSellProducts()
    }
    if (app.globalData.theirOwnRights()['客户统计可读']) {
      that.statisticsDataGetMonthCustomerData()
    }
    if (app.globalData.theirOwnRights()['员工自身工资可读']) {
      that.initializeTheirWages()
    }
    if (app.globalData.theirOwnRights()['部门统计可读']) {
      that.initializesDepartmentStatistics()
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function() {
    this.initData()
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
  onPullDownRefresh: async function() {
    //重置数据
    let that = this;
    that.getRoleArr()
    that.setData({
      isRequestIng: true
    })
    try {
      await programInitialization(app)
      await that.initData()
      wx.stopPullDownRefresh();
      setStatus(that, false)
    } catch (error) {
      wx.stopPullDownRefresh();
    }
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