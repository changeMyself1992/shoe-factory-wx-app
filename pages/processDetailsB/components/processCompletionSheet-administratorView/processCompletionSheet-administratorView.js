// components/component-tag-name.js
const app = getApp();
import {
  batch_manager_confirm_staff_record,
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
    }
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
      // 如果要修改的生产单超过5个了，那么就要分批次修改了
      if (that.data.processinfo['员工计件记录'].length > 5) {
        setStatus(that, true)
        try {
          var start_data = new Date()
          console.log('开始时间：', start_data.getTime())
          // 余数
          var remainder = that.data.processinfo['员工计件记录'].length % 5
          // 商
          var consult = Math.floor(that.data.processinfo['员工计件记录'].length / 5)
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
            // 截取 that.data.processinfo['员工计件记录']
            var new_员工计件记录 = that.data.processinfo['员工计件记录'].slice(startIndex, endIndex)
            let parameter = {
              login_token: app.globalData.login_token(),
              员工计件记录: new_员工计件记录
            }
            respose_a = await batch_manager_confirm_staff_record(parameter)
            count += new_员工计件记录.length
            // 更新进度条
            that.setData({
              percentageOfProgressSubmitted: Number(parseFloat(count / that.data.processinfo['员工计件记录'].length * 100).toFixed(2))
            })
            // console.log(11111)
            // console.log(new_员工计件记录)
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
        if (that.data.processinfo['员工计件记录'].length === 0) {
          markedWords('已全部同意录入，不可重复操作')
          return
        }

        let parameter = {
          login_token: app.globalData.login_token(),
          员工计件记录: that.data.processinfo['员工计件记录']
        }
        wx.showLoading({
          "title": "加载中"
        });
        batch_manager_confirm_staff_record(parameter).then(res => {
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