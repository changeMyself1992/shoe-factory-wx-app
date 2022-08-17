const app = getApp();
Component({
  properties: {
    position: {
      type: String
    },
    tabBarUrl:{
      type: String
    }
  },
  data: {},
  methods: {
    backToMain(e) {
      let that=this
      wx.reLaunch({
        url: that.data.tabBarUrl,
      })
    }
  }
})