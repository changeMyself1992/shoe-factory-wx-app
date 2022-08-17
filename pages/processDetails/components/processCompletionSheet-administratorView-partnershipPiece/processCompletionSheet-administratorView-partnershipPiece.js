// components/component-tag-name.js
const app = getApp();
import {
  filter_user
} from "../../../../services/personnelAndAuthorityManagement.js";
import {
  partnership_record_count
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
    isRequestIng: false,
    // 工序下的所有员工
    allEmployeesUnderTheProcess: [],
    // 员工合伙名单uniqueid列表
    "uniqueids": []
  },

  /**
   * 在这做数据初始化。传过来的数据已设置到data
   */
  attached: function() {
    let that = this
    this.partnerSubmitThrottleHandle = throttle(this.partnerSubmit, 3000, { leading: true, trailing: false })

    var parameter = {
      login_token: app.globalData.login_token(),
      "负责工序": that.data.processinfo['工序信息']['工序名称'],
      "工作状态": "在职",
      "管理角色":"员工"
    }
    filter_user(parameter, that).then(res => {
      var uniqueids_old = wx.getStorageSync('员工合伙名单uniqueid列表');
      var uniqueids_new = []
      var allEmployeesUnderTheProcess = res.data
      //如果是有提交缓存的情况下
      if (!isEmpty(uniqueids_old)) {
        // 1.遍历 员工合伙名单uniqueid列表 缓存
        for (var i = 0; i < uniqueids_old.length; i++) {
          const uniqueid = uniqueids_old[i]
          // 2.遍历查询回来的用户
          for (var j = 0; j < allEmployeesUnderTheProcess.length; j++) {
            var user = allEmployeesUnderTheProcess[j]
            // 如果 缓存的uniqueid 和这个用户的uniqueid相等，那么要把该用户标记为选中
            // 并且 要push到一个临时数组里面
            if (user.unique_id === uniqueid) {
              user['checked'] = true
              uniqueids_new.push(uniqueid)
            }
          }
        }
        // 用临时数组赋值
        that.setData({
          uniqueids: uniqueids_new
        })
      }
      that.setData({
        isRequestIng: false,
        allEmployeesUnderTheProcess: allEmployeesUnderTheProcess
      })
      // console.log(11111)
      // console.log(that.data.uniqueids)
      // console.log(allEmployeesUnderTheProcess)
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 合伙人选择事件
     */
    switchChange: function(e) {
      let that = this
      // console.log('switch1 发生 change 事件，携带值为', e)
      var unique_id = e.currentTarget.dataset.unique_id
      var uniqueids = that.data.uniqueids
      var index = uniqueids.findIndex((uniqueid) => {
        return uniqueid === unique_id
      })
      //选中状态，并且 员工合伙名单uniqueid列表 中不包含这个unique_id 那么push
      if (e.detail.value && index === -1) {
        uniqueids.push(unique_id)
      } else if (!e.detail.value && index !== -1) {
        //取消状态，并且 员工合伙名单uniqueid列表 中不包含这个unique_id 那么删除
        uniqueids.splice(index, 1);
      }
      that.setData({
        uniqueids: uniqueids
      })
      console.log(that.data.uniqueids)
    },

    /**
     * 合伙计件接口提交
     */
    partnerSubmit() {
      let that = this;
      
      if (that.data.uniqueids.length === 0) {
        markedWords("至少要选一个合伙人")
        return
      }
      var parameter = {
        login_token: app.globalData.login_token(),
        "生产单unique_id": app.globalData.productionOrderDetails.unique_id,
        "工序unique_id": that.data.processinfo['工序信息'].unique_id,
        "员工合伙名单uniqueid列表": that.data.uniqueids
      };
      partnership_record_count(parameter).then(res => {
        markedWords(res.msg, 'success')
        // 把 员工合伙名单uniqueid列表 存入缓存
        wx.setStorageSync('员工合伙名单uniqueid列表', that.data.uniqueids);
        // 告诉父组件刷新数据
        this.triggerEvent("LoadData");
        // 让父组件 自动选到 计件记录上
        this.triggerEvent("onASinglePieceBtnClick");
      })
    }
  },

})