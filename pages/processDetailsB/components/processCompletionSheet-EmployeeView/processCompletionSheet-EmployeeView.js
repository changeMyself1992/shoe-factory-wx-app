// components/component-tag-name.js
const app = getApp();
import {
  staff_record_count_same_group,
} from "../../../../services/scheduleManagement.js";
import {
  markedWords,
  isEmpty,
  setStatus
} from "../../../../utils/util.js"
import throttle from "../../../../utils/lodash/throttle.js";
import regeneratorRuntime from "../../../../utils/runtime.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    /*工序信息*/
    processinfo: {
      type: Object
    },
    /*生产单详情*/
    productionOrderDetails: {
      type: Object
    },
    //该工序员工计件中是否有自己
    isExists: {
      type: Boolean
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    //权限列表
    theirOwnRights: null,
    isRequestIng: false,
    percentageOfProgressSubmitted: 0
  },

  attached: function() {
    let that = this
    that.setData({
      theirOwnRights: app.globalData.theirOwnRights()
    })
    this.entryThrottleHandle = throttle(this.onEntryBtnClick, 3000, {
      leading: true,
      trailing: false
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 确认录入 按钮点击
     */
    onEntryBtnClick: async function(even) {
      let that = this;
      if (that.data.isRequestIng) return

      var 申请录入总计 = 0
      for (let i = 0; i < that.data.processinfo['计件信息'].length; i++) {
        申请录入总计 += that.data.processinfo['计件信息'][i]['目标数量']
      }
      if (申请录入总计 === 0) {
        markedWords('该工序已被其他员工全部录入，不可再次批量录入！')
        return
      }


      var 同批次操作选中的工序详情 = app.globalData['同批次操作选中的工序详情']
      var 生产单列表 = []
      for (let i = 0; i < 同批次操作选中的工序详情['生产单unique_ids'].length; i++) {
        生产单列表.push({
          '生产单unique_id': 同批次操作选中的工序详情['生产单unique_ids'][i],
          "工序unique_id": 同批次操作选中的工序详情['工序信息']
        })
      }
      // 如果要修改的生产单超过5个了，那么就要分批次修改了
      if (生产单列表.length > 5) {
        setStatus(that, true)

        try {
          var start_data = new Date()
          console.log('开始时间：', start_data.getTime())
          // 余数
          var remainder = 生产单列表.length % 5
          // 商
          var consult = Math.floor(生产单列表.length / 5)
          var respose_a = {}
          var count = 0
          for (let a = 0; a < consult; a++) {
            // 0 1 2 3 4
            // 0-10  10-20 20-30 30-40 40-50
            // a*10 - (a+1)*10
            var startIndex = a * 5
            var endIndex = (a + 1) * 5
            // 如果是最后一次循环那么要判断余数是否为0，如果为0代表能除尽endIndex不做任何处理
            // 如果余数不为零 那么endIndex就要加上余数
            if (a === consult - 1 && remainder !== 0) {
              endIndex = endIndex + remainder
            }
            // 截取 生产单列表
            var new_生产单列表 = 生产单列表.slice(startIndex, endIndex)
            let parameter = {
              login_token: app.globalData.login_token(),
              生产单列表: new_生产单列表
            }
            respose_a = await staff_record_count_same_group(parameter)
            count += new_生产单列表.length
            // 更新进度条
            that.setData({
              percentageOfProgressSubmitted: Number(parseFloat(count / 生产单列表.length * 100).toFixed(2))
            })
            // console.log(11111)
            // console.log(new_生产单列表)
            // console.log(that.data.percentageOfProgressSubmitted)
          }
          var end_data = new Date()
          console.log('结束时间：', end_data.getTime())
          console.log('耗时：', end_data.getTime() - start_data.getTime())

          setStatus(that, false)
          //需要通知父组件 该刷新生产单了
          that.triggerEvent("LoadData", {
            callBack: function() {
              markedWords(respose_a.msg)
            }
          });
        } catch (error) {
          setStatus(that, false)
        }
      } else {
        let parameter = {
          login_token: app.globalData.login_token(),
          生产单列表: 生产单列表
        }
        wx.showLoading({
          "title": "加载中"
        });
        staff_record_count_same_group(parameter).then(res => {
          wx.hideLoading();
          //需要通知父组件 该刷新生产单了
          that.triggerEvent("LoadData", {
            callBack: function() {
              markedWords(res.msg)
            }
          });
        }).catch(err => {
          wx.hideLoading();
        })
      }
    }
  },

})