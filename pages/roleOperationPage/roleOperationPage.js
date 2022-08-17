const app = getApp();
import {
  noDataProcessingLogic,
  isEmpty,
  markedWords,
  parseTime,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  deepClone,
  setStatus,
  isObjectValueEqual,
  compareObj
} from "../../utils/util.js";
import {
  add_role_authority,
  edit_role_authority_by_id
} from "../../services/personnelAndAuthorityManagement.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面模式 addRole（新建角色），editRole（编辑角色）
    mode: '',
    form: null,

    // 权限管理选项
    administrativePrivileges: [],

    positionStr: 'top: 30px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },

  // 标题的初始化
  titleInitialization(options) {
    let that = this
    if (!isEmpty(options) && options.mode === 'addRole') {
      wx.setNavigationBarTitle({
        title: '新建角色'
      })
    } else if (!isEmpty(options) && options.mode === 'editRole') {
      wx.setNavigationBarTitle({
        title: '编辑角色'
      })
    } else {
      return
    }
    that.setData({
      mode: options.mode
    })
  },

  // 初始化form
  initializationForm() {
    let that = this
    return new Promise(function(resolve, reject) {
      if (that.data.mode === 'addRole') {
        var form = deepClone(app.globalData['空角色结构'])
        var theirOwnRights = app.globalData.theirOwnRights()
        that.setData({
          form: form,
          isEdit: theirOwnRights['权限管理可写'] ? true : false
        })
        resolve(true)
      } else if (that.data.mode === 'editRole') {
        var form = app.globalData.curOperationRole
        // 1.组合权限管理选项
        var theirOwnRights = form.管理权限
        var administrativePrivileges = that.data.administrativePrivileges
        administrativePrivileges = administrativePrivileges.map(item => {
          for (let i = 0; i < item.permission.length; i++) {
            var element = item.permission[i];
            if (theirOwnRights.hasOwnProperty(element.value) && theirOwnRights[element.value]) {
              element.checked = true
              item.isUnfold = true
            }
          }
          return item
        })

        var theirOwnRights = app.globalData.theirOwnRights()
        that.setData({
          form: form,
          administrativePrivileges: administrativePrivileges,
          isEdit: theirOwnRights['权限管理可写'] ? true : false
        })
        resolve(true)
      }
    })
  },

  kindToggle: function(even) {
    let that = this
    var curoperationpageindex = Number(even.currentTarget.dataset.curoperationpageindex)
    that.data.administrativePrivileges[curoperationpageindex]['isUnfold'] = !that.data.administrativePrivileges[curoperationpageindex]['isUnfold']
    this.setData({
      curoperationpageindex: curoperationpageindex,
      administrativePrivileges: that.data.administrativePrivileges
    });
  },

  checkboxChange(e) {
    let that = this
    var administrativePrivileges = that.data.administrativePrivileges
    // 1.根据title找出用户是在操作那个页面
    var title = e.currentTarget.dataset.curtitle
    var page = administrativePrivileges.find(item => {
      return item.title === title
    })
    // 2. 找出当前页面的全部权限
    var allPermissions = []
    for (let i = 0; i < page.permission.length; i++) {
      var element = page.permission[i];
      allPermissions.push(element.value)
    }
    // 3.拿到当前选中的数据
    var curSelectedPermissions = e.detail.value
    // 4. 拿到 已勾选的权限 和 未勾选的权限 
    var checkedPermissions = []
    var uncheckedPermissions = []
    for (let i = 0; i < allPermissions.length; i++) {
      if (curSelectedPermissions.includes(allPermissions[i])) {
        checkedPermissions.push(allPermissions[i])
      } else {
        uncheckedPermissions.push(allPermissions[i])
      }
    }
    console.log('已勾选的权限', checkedPermissions)
    console.log('未勾选的权限', uncheckedPermissions)

    administrativePrivileges = administrativePrivileges.map(item => {
      for (let i = 0; i < item.permission.length; i++) {
        var element = item.permission[i];
        if (checkedPermissions.includes(element.value)) {
          element.checked = true
          item.isUnfold = true
        } else if (uncheckedPermissions.includes(element.value)) {
          element.checked = false
        }
      }
      return item
    })
    that.setData({
      administrativePrivileges: administrativePrivileges
    })
  },

  formSubmit: function(e) {
    let that = this
    if (!app.globalData.theirOwnRights()['权限管理可写']) {
      markedWords("无此操作权限")
      return
    }
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (isEmpty(e.detail.value['管理角色'])) {
      markedWords('名称是必填项！')
      return
    }
    var selectedPermission = []
    for (const key in e.detail.value) {
      if (key === '管理角色') {
        continue
      }
      const element = e.detail.value[key];
      for (let i = 0; i < element.length; i++) {
        const permissions = element[i];
        if (!selectedPermission.includes(permissions)) {
          selectedPermission.push(permissions)
        }
      }
    }

    if (that.data.mode === 'addRole') {
      var 管理权限 = app.globalData.theirOwnRights()
      var jurisdiction = {}
      for (const key in 管理权限) {
        // 如果选中了该权限那么一定是true
        if (selectedPermission.includes(key)) {
          jurisdiction[key] = true
        } else {
          jurisdiction[key] = false
        }
      }
      var parameter = {
        login_token: app.globalData.login_token(),
        data: {
          管理角色: e.detail.value['管理角色'],
          管理权限: jurisdiction
        }
      }
      add_role_authority(parameter, that).then(res => {
        setStatus(that, false)
        markedWords('新建角色成功','none',1500)
        setTimeout(function(){
          wx.navigateBack({
            delta:1
          })
        },1500)
      })
    } else if (that.data.mode === 'editRole') {
      var 管理权限 = app.globalData.curOperationRole['管理权限']
      var jurisdiction = {}
      for (const key in 管理权限) {
        // 如果选中了该权限那么一定是true
        if (selectedPermission.includes(key)) {
          jurisdiction[key] = true
        } else {
          // 判断这个key 是否在administrativePrivileges中存在
          // 如果存在，那么代表没勾选 给他赋值false
          // 如果不存在 那么代表 该权限没有在小程序工程用到 设置它的初始值传递给后端
          var bool = that.data.administrativePrivileges.some(item1 => {
            var bool1 = item1.permission.some(item2 => {
              return item2.value === key
            })
            return bool1
          })

          if (bool) {
            jurisdiction[key] = false
          } else {
            jurisdiction[key] = 管理权限[key]
          }
        }
      }
      var parameter = {
        login_token: app.globalData.login_token(),
        unique_id: e.detail.value['管理角色'],
        update_data: {
          管理权限: jurisdiction
        }
      }
      edit_role_authority_by_id(parameter, that).then(res => {
        setStatus(that, false)
        markedWords('修改角色成功', 'none', 1500)
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      })




    }

  },
  cancelBtnClick: function() {
    let that = this
    wx.navigateBack()
  },


  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    that.setData({
      administrativePrivileges: deepClone(app.globalData.administrativePrivileges) 
    })
    that.titleInitialization(options)

    // 页面初始化流程
    that.initializationForm().then(res => {

    })

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