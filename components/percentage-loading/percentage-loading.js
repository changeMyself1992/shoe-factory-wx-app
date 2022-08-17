// components/component-tag-name.js
var windWidth = wx.getSystemInfoSync().windowWidth;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isRequestIng:{
      type: Boolean,
      value:false
    },

    //当前的值 默认45
    value: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
   
  },

  attached: function () {
    let that = this
  },

  /**
   * 组件的方法列表
   */
  methods: {
   
  },

  created:function(){

  },
  detached:function(){
  },
})
