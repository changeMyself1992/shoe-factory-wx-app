// component/qz-lists/index.js
import throttle from "../../utils/lodash/throttle.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    max_page: {
      type: Number,
      value: 0
    },
    page_num: {
      type: Number,
      value: 1
    },
    page_size: {
      type: Number,
      value: 5
    },
    total_count:{
      type: Number,
      value: 0
    },
    isRequestIng:{
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  attached: function() {
    this.selectThrottleHandle = throttle(this.selectPage, 1000, {
      leading: true,
      trailing: false
    })
  },


  observers: {
    'max_page': function(max_page) {},
    'page_num': function(page) {},
    'isRequestIng': function (isRequestIng) {
      this.data.isRequestIng = isRequestIng
     }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    setPageSelect: function(e) {
      var ind = e.currentTarget.dataset.in;
      this.setData({
        page_select: ind
      });
    },

    selectPage: function(e) {
      let that = this
      if (that.data.isRequestIng) return
      var id = Number(e.currentTarget.dataset.id)
      // 上一页
      if (id === 0) {
        if (that.data.page_num <= 1) return
        that.data.page_num = that.data.page_num - 1
      } else {
        // 下一页
        if (that.data.page_num >= that.data.max_page) return
        that.data.page_num = that.data.page_num + 1
      }
      that.setData({
        page_num: that.data.page_num
      })
      this.triggerEvent("selectPage", that.data.page_num, {});
    },

  }
})