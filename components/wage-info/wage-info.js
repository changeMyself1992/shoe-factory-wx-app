// components/component-tag-name.js
import throttle from "../../utils/lodash/throttle.js";
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    salaryInformation: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    salaryInformation: {},
    monthlySalary: '0.00',
    yesterdayTheSalary: "0.00",
    todayTheSalary: "0.00",
    deductionMonthSalary:'0.00',
    todayTheDeductionSalary:"0.00",
    textBStyle: ''
  },

  attached: function () {
    this.wageDetailThrottleHandle = throttle(this.wageDetailClick, 3000, { leading: true, trailing: false })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //工资详情按钮
    wageDetailClick(even) {
      wx.navigateTo({
        url: '/pages/salaryDetail/salaryDetail',
      })
    },
    // 让父组件调用 强制刷新被组件数据
    setSalaryInformation(e) {
      let that = this
      var salaryInformation = that.data.salaryInformation;
      that.setData({
        monthlySalary: parseFloat(salaryInformation['本月已确认工资']).toFixed(2),
        yesterdayTheSalary: parseFloat(salaryInformation['昨日已确认工资']).toFixed(2),
        todayTheSalary: parseFloat(salaryInformation['今日已确认工资']).toFixed(2),
        deductionMonthSalary:parseFloat(salaryInformation['本月抵扣金额']).toFixed(2),
        todayTheDeductionSalary:parseFloat(salaryInformation['今日抵扣金额']).toFixed(2),
      });
      var length = that.data.monthlySalary.length >= that.data.todayTheSalary.length ?
        that.data.monthlySalary.length : that.data.todayTheSalary.length
      if (length <= 9) {
        that.setData({
          textBStyle: 'font-size: 50rpx;'
        })
      } else {
        that.setData({
          textBStyle: `font-size: ${50 - (length - 9)*4}rpx;`
        })
      }
      
    }
  },

})