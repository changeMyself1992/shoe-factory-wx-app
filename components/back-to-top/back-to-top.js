// components/component-tag-name.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    floorstatus: {
      type: Boolean,
      // value: false
    },
    location:{
      type:String,
      value: 'bottom: 70rpx;right: 70rpx;'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //回到顶部
    goTop: function(e) { // 一键回到顶部
      this.setData({
        floorstatus: false
      });
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    },
  },

  created: function() {
    var a = this.properties.floorstatus;
  },
  detached: function() {},
})