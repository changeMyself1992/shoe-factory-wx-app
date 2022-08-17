// components/component-tag-name.js
const app = getApp();
import {
  manager_confirm_staff_record
} from "../../../../services/scheduleManagement.js";
import {
  markedWords
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
    // 此工序总工资
    totalWagesForThisProcess: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  attached: function () {
    this.groupLeaderConfirmThrottleHandle = throttle(this.onGroupLeaderConfirmBtnClick, 3000, {
      leading: true,
      trailing: false
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 组长确认按钮点击
     */
    onGroupLeaderConfirmBtnClick(even) {
      let that = this;
      var item = even.currentTarget.dataset.item
      wx.showModal({
        title: '提示',
        content: `确认同意${item['员工姓名']}的工序申请吗？`,
        success(res) {
          if (res.confirm) {
            var parameter = {
              login_token: app.globalData.login_token(),
              "生产单unique_id": app.globalData.productionOrderDetails.unique_id,
              "工序unique_id": that.data.processinfo['工序信息'].unique_id,
              "员工unique_id": item.unique_id
            };
            //发起  管理人员确认员工计件 请求
            manager_confirm_staff_record(parameter, that).then(res => {
              //刷新生产单详情页面
              that.triggerEvent("LoadData", {
                callBack: () => {
                  markedWords(res.msg)
                }
              })
            })
          }
        }
      })
    },
  },

})