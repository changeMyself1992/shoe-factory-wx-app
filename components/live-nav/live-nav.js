// components/component-tag-name.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //直播时间轴
    liveNavData: {
      type: Array,
      // value:[{
      //   id: 0,
      //   isSelect: true,
      //   c_name: "不限",
      // isIcon: true
      // }]
    },
    // item宽度
    width:{
      type:String,
      value:'50%'
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    //当前选中的时间轴索引
    curIndex: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /*导航元素点击事件*/
    onItemClick: function(event) {
      let that = this
      console.log(event);
      var liveNavData = this.data.liveNavData;
      var id = event.currentTarget.dataset.item.id;
      var curIndex = 0;
      for (var i = 0; i < liveNavData.length; i++) {
        var itemid = liveNavData[i].id;
        if (id == liveNavData[i].id) {
          liveNavData[i].isSelect = true;
          curIndex = id;
        } else {
          liveNavData[i].isSelect = false;
        }
      }

      that.setData({
        curIndex: curIndex,
        liveNavData: liveNavData,
      });
      //根据当前索引,刷新商品列表信息(调用父组件方法)
      this.triggerEvent('myevent', { index: that.data.curIndex});
    },

  },

  created: function() {

  },
  ready: function() {
   
  },
  detached: function() {

  },
})