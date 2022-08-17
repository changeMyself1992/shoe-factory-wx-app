// components/component-tag-name.js
const app = getApp();
import {
  staff_record_count,
} from "../../../../services/scheduleManagement.js";
import {
  markedWords,
  isEmpty
} from "../../../../utils/util.js"
import throttle from "../../../../utils/lodash/throttle.js";
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

  },

  attached: function () {
    this.entryThrottleHandle = throttle(this.onEntryBtnClick, 3000, { leading: true, trailing: false })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 确认录入 按钮点击
     */
    onEntryBtnClick(even) {
      let that = this;
      setTimeout(() => {
        // 如果总完成数为0，那么没有任何提交意义 退出就好
        if (that.data.processinfo["自身计件"]['总完成数'] === 0) {
          markedWords('总完成数为0，没有任何提交意义!请检查！')
          return
        }
        var parameter = {
          login_token: app.globalData.login_token(),
          "生产单unique_id": that.data.productionOrderDetails['unique_id'],
          "工序unique_id": that.data.processinfo['工序信息'].unique_id,
          "配码计数": {
            "配码": that.data.processinfo["自身计件"]['配码'],
            "总完成数": that.data.processinfo["自身计件"]['总完成数']
          }
        }
        //如果已经被组长同意过了 再次录入需要用户确认一下
        if (that.data.processinfo["自身计件"]['组长是否已确认']) {
          wx.showModal({
            title: '提示',
            content: '该完成信息已被组长同意过，确认要重新录入？',
            success(res) {
              if (res.confirm) {
                //发起录入请求
                staff_record_count(parameter).then(res => {
                  //需要通知父组件 该刷新生产单了
                  that.triggerEvent("LoadData");
                })
              } else if (res.cancel) {
                return
              }
            }
          })
        } else {
          //发起录入请求
          staff_record_count(parameter).then(res => {
            //需要通知父组件 该刷新生产单了
            that.triggerEvent("LoadData", {
              callBack: () => {
                markedWords(res.msg, 'success')
              }
            })
          })
        }
      }, 100)
    },

    // 完成数量编辑框获取焦点的时候
    inputFocus(even) {
      let that = this;
      var value = parseFloat(even.detail.value);
      var index = even.target.dataset.index
      // 如果是0，那么直接清空输入框
      if (value === 0) {
        var processinfo = this.data.processinfo;
        processinfo['自身计件']['配码'][index]['完成数量'] = ''
        that.setData({
          processinfo: that.data.processinfo
        });
      }
    },

    /**
     * 编辑实际完成数量回调
     */
    inputedit(even) {
      let that = this;
      var value = parseFloat(even.detail.value);
      var index = even.target.dataset.index
      var item = even.target.dataset.obj;
      if (isEmpty(value)) value = 0
      else if (value > item['目标数量']) value = Number(parseFloat(item['目标数量']).toFixed(2))
      var processinfo = this.data.processinfo;
      processinfo['自身计件']['配码'][index]['完成数量'] = Number(parseFloat(value).toFixed(2));
      that.setData({
        processinfo: processinfo
      });
      this.totalNumrOfCompleted();
    },

    sliderChange(even){
      let that = this;
      var value = even.detail.value
      var index = even.target.dataset.index

      var processinfo = that.data.processinfo;
      processinfo['自身计件']['配码'][index]['完成数量'] = value
      that.setData({
        processinfo: processinfo
      });
      that.totalNumrOfCompleted();
    },


    /**
     * 实时计算 当前工序实际完成总数
     */
    totalNumrOfCompleted() {
      let that = this;
      var processinfo = this.data.processinfo;
      var count = 0;
      for (var i = 0; i < processinfo['自身计件']['配码'].length; i++) {
        var item = processinfo['自身计件']['配码'][i];
        count += Number(parseFloat(item['完成数量']).toFixed(2));
      }
      processinfo['自身计件']['总完成数'] = parseFloat(count.toFixed(2))
      that.setData({
        processinfo: processinfo
      })
    },
  },

})