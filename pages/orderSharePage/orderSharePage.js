// pages/orderSharePage/orderSharePage.js
const app = getApp();
import {
  markedWords,
  isEmpty
} from "../../utils/util.js";
import regeneratorRuntime from "../../utils/runtime.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDetails: {},
    // canvas的宽高
    canvasWidth: 0,
    canvasHeight: 0
  },

  // 获取orderDetails数据的 包含的产品  计算canvas高度（产品信息多的话会拉长页面）
  cumputerHeight() {
    var that = this
    var productArray = that.data.orderDetails['包含的产品']
    var custom = that.data.orderDetails['客户信息']
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        that.setData({
          canvasWidth: res.windowWidth
        })
      },
    })
    var hei = 0
    if (productArray.length == 1) {
      hei = 30
    }
    if (productArray.length == 2) {
      hei = 50
    }
    if (productArray.length == 3) {
      hei = 0
    }
    if (productArray.length == 4) {
      hei = -20
    }
    if (productArray.length > 4) {
      hei = -((productArray.length - 4) * 30)
    }
    var canvasHeight = (productArray.length) * 150 + 210 + hei
    if (isEmpty(custom)) {
      canvasHeight = canvasHeight - 80
    }
    that.setData({
      canvasHeight: canvasHeight
    })
  },

  /************canvas分享事件start*********************** */
  share: function() {
    var that = this;
    var canvasOrderDetails = that.data.orderDetails
    console.log(canvasOrderDetails)
    var canvasHeight = that.data.canvasHeight
    var canvasWidth = that.data.canvasWidth
    const ctx = wx.createCanvasContext('myCanvas')


    // 画头部
    let bgtop = '../../static/imageC/bgtop.png';
    var bgtopHeight = Number((canvasWidth / 2.6).toFixed(0))
    ctx.drawImage(bgtop, 0, 0, canvasWidth, bgtopHeight)

    // 工厂名称
    ctx.setFontSize(13)
    ctx.fillStyle = '#605AB3';
    ctx.font = 'normal bold 13px sans-serif';
    var factoryname = app.globalData.chooseedEnterpriseName(); 
    ctx.fillText(factoryname, 25, 38);
    ctx.font = '13px sans-serif';
    // logo
    let logo = '../../static/imageC/logo.png';
    ctx.drawImage(logo, canvasWidth - 70, 20, 30, 30)

    // 订单标题
    ctx.setFontSize(19)
    ctx.fillStyle = '#000000';
    var title = "订单基本信息"; // measureText检查字体宽度
    ctx.fillText(title, (canvasWidth - ctx.measureText(title).width) / 2, 68)

    // 订单编号
    var orderId = '订单编号：' + canvasOrderDetails['订单编号']
    ctx.setFontSize(13)
    ctx.fillStyle = '#000000';
    ctx.fillText(orderId, 20, 87)

    // 订单日期
    var orderData1 = '订单日期：' + canvasOrderDetails['订单日期']
    ctx.setFontSize(13)
    ctx.fillStyle = '#000000';
    ctx.fillText(orderData1, 20, 105)
    // 交货日期
    var orderData2 = '交货日期：' + canvasOrderDetails['交货日期']
    ctx.setFontSize(13)
    ctx.fillStyle = '#000000';
    ctx.fillText(orderData2, canvasWidth / 2, 105)

    // 当前进度
    var process = '当前进度：'
    ctx.setFontSize(13)
    ctx.fillStyle = '#000000';
    ctx.fillText(process, 20, 123)

    // 进度条 实际进度
    var margin = ctx.measureText(process).width + 20
    var processWidth = canvasWidth * 0.5 * canvasOrderDetails['订单完成百分比']
    console.log(processWidth)
    ctx.setFillStyle('#DC5460')
    ctx.fillRect(margin, 115, processWidth, 7)
    // 进度条 底色
    var margin = ctx.measureText(process).width + 20
    var noProcessWidth = canvasWidth * 0.5 * (1 - canvasOrderDetails['订单完成百分比'])
    ctx.setFillStyle('#cdcdcd')
    ctx.fillRect(margin + processWidth, 115, noProcessWidth, 7)
    // 进度百分数
    var processNum = Number(canvasOrderDetails['订单完成百分比'] * 100).toFixed(0) + '%'
    var left = margin + canvasWidth * 0.5 + 20
    ctx.setFontSize(13)
    ctx.fillStyle = '#000000';
    ctx.fillText(processNum, left, 123)

    // 画虚线
    ctx.beginPath();
    // 设置线宽
    ctx.lineWidth = 1;
    // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    ctx.setLineDash([2, 2]);
    ctx.moveTo(40, 136);
    ctx.lineTo(canvasWidth - 40, 136);
    // 填充颜色
    ctx.strokeStyle = "#c4c8ff";
    // 开始填充
    ctx.stroke();
    ctx.closePath();
    // 切换回实线
    ctx.setLineDash([]);

    // 重复的  底背景
    let bgfor = '../../static/imageC/bgfor.png';
    ctx.drawImage(bgfor, 0, bgtopHeight, canvasWidth, 150)
    // 重复的  放产品的背景
    let productbg = '../../static/imageC/productbg.png';
    ctx.drawImage(productbg, 25, bgtopHeight + 10, canvasWidth - 50, 120)
    // 产品信息&配码数 背景
    let peimabg = '../../static/imageC/peima.png';
    ctx.drawImage(peimabg, (canvasWidth - 180) / 2, bgtopHeight, 180, 30)
    // 产品信息&配码数 文字
    var textsize = '产品信息&配码数'
    ctx.setFontSize(16)
    ctx.fillStyle = '#605AB3';
    ctx.fillText(textsize, (canvasWidth - ctx.measureText(textsize).width) / 2, bgtopHeight + 20)

    // 配码表格头部 标题
    var tabletitleinfo = canvasOrderDetails['包含的产品'][0]['产品信息'].tags
    var tabletitleArr = []
    for (var str in tabletitleinfo) {
      tabletitleArr.push(str)
    }
    var tabletitleStr = '产品编号 ' + tabletitleArr.join(' ')
    ctx.setFontSize(13)
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tabletitleStr, (canvasWidth - ctx.measureText(tabletitleStr).width) / 2, bgtopHeight + 44)

    // tags信息展示的背景
    let mashu1 = '../../static/imageC/mashu1.png';
    ctx.drawImage(mashu1, 15, bgtopHeight + 50, canvasWidth - 30, 25)
    // tags信息展示的内容
    var tagsinfo = canvasOrderDetails['包含的产品'][0]['产品信息'].tags
    var tagsArr = []
    for (var str in tagsinfo) {
      if (tagsinfo[str] == '') {
        tagsinfo[str] = ' 暂 无 '
      }
      tagsArr.push(tagsinfo[str])
    }
    var tagsStr = canvasOrderDetails['包含的产品'][0]['产品信息']['产品编号'] + ' ' + tagsArr.join(' ')
    ctx.setFontSize(12)
    ctx.fillStyle = '#2D3674';
    ctx.fillText(tagsStr, (canvasWidth - ctx.measureText(tagsStr).width) / 2, bgtopHeight + 66)

    // 配码表格 码数标题
    var sizeArrInfo = canvasOrderDetails['包含的产品'][0]['配码数量']['配码']
    var sizeArr = []
    for (var i = 0; i < sizeArrInfo.length; i++) {
      var ele = sizeArrInfo[i]['尺码']
      sizeArr.push(ele)
    }
    var sizeStr = sizeArr.join('/') + ' 件数 总数'
    ctx.setFontSize(12)
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sizeStr, (canvasWidth - ctx.measureText(sizeStr).width) / 2, bgtopHeight + 86)

    // 配码表格 展示的背景
    let mashu2 = '../../static/imageC/mashu2.png';
    ctx.drawImage(mashu2, 15, bgtopHeight + 90, canvasWidth - 30, 30)
    // 配码表格 码数数据
    var sizejianshu = canvasOrderDetails['包含的产品'][0]['配码数量']['件数']
    var sizezongshu = canvasOrderDetails['包含的产品'][0]['配码数量']['总数']
    var sizedataArr = []
    for (var i = 0; i < sizeArrInfo.length; i++) {
      var ele = sizeArrInfo[i]['已排产数量']
      sizedataArr.push(ele)
    }
    var sizedataStr = sizedataArr.join(' /') + ' ' + sizejianshu + '件 ' + sizezongshu
    ctx.setFontSize(14)
    ctx.fillStyle = '#2D3674';
    ctx.fillText(sizedataStr, (canvasWidth - ctx.measureText(sizedataStr).width) / 2, bgtopHeight + 110)



    /************包含的产品大于1的时候  循环绘制canvas*********************** */
    var lengthProduct = canvasOrderDetails['包含的产品'].length - 1
    // 重复的  底背景
    for (var j = 0; j < lengthProduct; j++) {
      ctx.drawImage(bgfor, 0, bgtopHeight + 150 * (j + 1), canvasWidth, 150)

      // 重复的  放产品的背景
      var product12 = null
      if (j % 2 == 0) {
        // 偶数
        product12 = '../../static/imageC/product2.png';
      } else {
        product12 = '../../static/imageC/product1.png';
      }
      ctx.drawImage(product12, 25, bgtopHeight + 150 * (j + 1) - 40 - j * 20, canvasWidth - 50, 150)

      // 重复绘制过程
      // 配码表格头部 标题
      ctx.setFontSize(13)
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tabletitleStr, (canvasWidth - ctx.measureText(tabletitleStr).width) / 2, bgtopHeight + 150 * (j + 1) + 22 - j * 20)
      // 第一个背景
      ctx.drawImage(mashu1, 15, bgtopHeight + 150 * (j + 1) + 27 - j * 20, canvasWidth - 30, 25)
      // tags信息展示的内容
      var tags_info = canvasOrderDetails['包含的产品'][j + 1]['产品信息'].tags
      var tags_Arr = []
      for (var str in tags_info) {
        if (tags_info[str] == '') {
          tags_info[str] = ' 暂 无 '
        }
        tags_Arr.push(tags_info[str])
      }
      var tags_Str = canvasOrderDetails['包含的产品'][j + 1]['产品信息']['产品编号'] + ' ' + tags_Arr.join(' ')
      ctx.setFontSize(12)
      ctx.fillStyle = '#2D3674';
      ctx.fillText(tags_Str, (canvasWidth - ctx.measureText(tagsStr).width) / 2, bgtopHeight + 150 * (j + 1) + 42 - j * 20)

      // 配码表格 码数标题
      var sizeArr_Info = canvasOrderDetails['包含的产品'][j + 1]['配码数量']['配码']
      var size_Arr = []
      for (var i = 0; i < sizeArr_Info.length; i++) {
        var ele = sizeArr_Info[i]['尺码']
        size_Arr.push(ele)
      }
      var size_Str = size_Arr.join('/') + ' 件数 总数'
      ctx.setFontSize(12)
      ctx.fillStyle = '#ffffff';
      ctx.fillText(size_Str, (canvasWidth - ctx.measureText(size_Str).width) / 2, bgtopHeight + 150 * (j + 1) + 65 - j * 20)

      // 配码表格 展示的背景
      ctx.drawImage(mashu2, 15, bgtopHeight + 150 * (j + 1) + 70 - j * 20, canvasWidth - 30, 30)
      // 配码表格 码数数据
      var size_jianshu = canvasOrderDetails['包含的产品'][j + 1]['配码数量']['件数']
      var size_zongshu = canvasOrderDetails['包含的产品'][j + 1]['配码数量']['总数']
      var sizedata_Arr = []
      for (var i = 0; i < sizeArr_Info.length; i++) {
        var ele = sizeArr_Info[i]['已排产数量']
        sizedata_Arr.push(ele)
      }
      var sizedata_Str = sizedata_Arr.join(' /') + ' ' + size_jianshu + '件 ' + size_zongshu
      ctx.setFontSize(14)
      ctx.fillStyle = '#2D3674';
      ctx.fillText(sizedata_Str, (canvasWidth - ctx.measureText(sizedata_Str).width) / 2, bgtopHeight + 150 * (j + 1) + 90 - j * 20)

    }
    /************包含的产品大于1的时候  循环绘制canvas*********************** */

    // 画虚线
    var len = canvasOrderDetails['包含的产品'].length - 2
    ctx.beginPath();
    // 设置线宽
    ctx.lineWidth = 1;
    // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    ctx.setLineDash([2, 2]);
    ctx.moveTo(40, bgtopHeight + 150 * (len + 1) + 120 - len * 20);
    ctx.lineTo(canvasWidth - 40, bgtopHeight + 150 * (len + 1) + 120 - len * 20);
    // 填充颜色
    ctx.strokeStyle = "#c4c8ff";
    // 开始填充
    ctx.stroke();
    ctx.closePath();
    // 切换回实线
    ctx.setLineDash([]);

    // 客户信息 的背景
    var numlen = canvasOrderDetails['包含的产品'].length
    ctx.drawImage(bgfor, 0, bgtopHeight + 150 * numlen, canvasWidth, 200)
    // 客户名称
    if (!isEmpty(canvasOrderDetails['客户信息']['名称'])) {
      ctx.setFontSize(13)
      ctx.fillStyle = '#000000';
      var customname = '客户名称：' + canvasOrderDetails['客户信息']['名称'];
      ctx.fillText(customname, 20, bgtopHeight + 150 * (len + 1) + 150 - len * 20)
    }
    // 客户电话
    if (!isEmpty(canvasOrderDetails['客户信息']['电话'])) {
      ctx.setFontSize(13)
      ctx.fillStyle = '#000000';
      var customtel = '客户电话：' + canvasOrderDetails['客户信息']['电话'];
      ctx.fillText(customtel, 20, bgtopHeight + 150 * (len + 1) + 175 - len * 20)
    }
    // 客户地址
    if (!isEmpty(canvasOrderDetails['客户信息']['地址'])) {
      ctx.setFontSize(13)
      ctx.fillStyle = '#000000';
      var customadd = '客户地址：' + canvasOrderDetails['客户信息']['地址'];
      ctx.fillText(customadd, 20, bgtopHeight + 150 * (len + 1) + 200 - len * 20)
    }


    ctx.draw(false, function() {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function(res) {
          console.log(res.tempFilePath)
          that.setData({
            canvasUrl: res.tempFilePath
          })
        }
      })
    });

  },
  // 保存图片到本地
  save: function() {
    var that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.canvasUrl,
      success(res) {
        markedWords('图片已保存到相册，赶紧分享一下吧~')
      }
    })
  },
  /************canvas分享事件end*********************** */


  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function() {
    let that = this
    var orderDetails = app.globalData.orderDetails
    that.setData({
      orderDetails: orderDetails
    })
    console.log(orderDetails)
    var res = await that.cumputerHeight()
    that.share()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
  /************页面事件*************************************end*********************** */
})