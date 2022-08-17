import {
  markedWords,
  setStatus,
  isEmpty,
  parseQueryString,
  parseTime,
  validateIdNumber,
  processingTokenFailure,
  deepClone
} from "../../utils/util.js"

import {
  filter_process
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js"

import {
  add_user_unconfirmed,
  get_role_authority_names,
  edit_user_by_id
} from "../../services/personnelAndAuthorityManagement.js"
import api from '../../config/api';
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pattern: {
      // staffRegistration(员工注册) staffEdit(员工编辑) staffToAdd(员工添加)
      type: String
    },
    query: {
      // 注册二维码的参数
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    form: null,
    isRequestIng: false, // 是否正在请求数据
    genderItems: [{
        name: '男',
        value: '男'
        // checked: 'true'
      },
      {
        name: '女',
        value: '女'
      }
    ],
    workingStateOption: [{
        name: '在职',
        value: '在职'
      },
      {
        name: '离职',
        value: '离职'
      }, {
        name: '请假',
        value: '请假'
      }, {
        name: '开除',
        value: '开除'
      }, {
        name: '待确认',
        value: '待确认',
        checked: 'true'
      }
    ],
    roleOptions: [], // 管理角色列表
    index: -1, //管理角色的索引
    processList: [], // 工序列表
    "企业unique_id": ''
  },

  /**
   * 在这做数据初始化。传过来的数据已设置到data
   */
  attached: function() {
    let that = this
    if (that.data.pattern === 'staffRegistration') {
      that.registrationModeInitialization(that.data.query).then(res => {
        setStatus(that, false)
      })
    } else if (that.data.pattern === 'staffEdit') {
      that.editModeInitialization().then(res => {
        setStatus(that, false)
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 查看图片放大
    previewImage(e) {
      let that = this;
      var array = []
      if (e.target.id === '身份证正面照片' && !isEmpty(that.data.form['个人信息']['身份证正面照片'])) {
        array.push(that.data.form['个人信息']['身份证正面照片'])
        wx.previewImage({
          urls: array
        })
      } else if (e.target.id === '身份证反面照片' && !isEmpty(that.data.form['个人信息']['身份证反面照片'])) {
        array.push(that.data.form['个人信息']['身份证反面照片'])
        wx.previewImage({
          urls: array
        })
      } else if (e.target.id === '银行卡照片' && !isEmpty(that.data.form['银行卡信息']['银行卡照片'])) {
        array.push(that.data.form['银行卡信息']['银行卡照片'])
        wx.previewImage({
          urls: array
        })
      }
    },
    // 注册模式初始化
    registrationModeInitialization(query) {
      let that = this
      return new Promise(function(resolve, reject) {
        return that.getRoleAuthorityNames(query.id).then(res => {
          return that.filterProcess(query.id).then(res => {
            that.setData({
              form: deepClone(app.globalData['空员工结构']),
              '企业unique_id': query.id
            })
            resolve(true)
          })
        })
      })
    },
    // 编辑模式初始化
    editModeInitialization() {
      let that = this
      that.data.form = deepClone(app.globalData.curOperationStaffObj)

      //初始化 genderItems 
      var curGender = that.data.form['个人信息']['性别']
      var genderItems = that.data.genderItems
      for (let i = 0; i < genderItems.length; i++) {
        var element = genderItems[i]
        if (element.value === curGender) {
          element.checked = 'true'
        } else {
          if (element.hasOwnProperty('checked'))
            delete element['checked']
        }
      }
      // console.log(22222)
      // console.log(genderItems)

      // 初始化 workingStateOption
      var curStatus = that.data.form['工作状态']
      var workingStateOption = that.data.workingStateOption
      for (let i = 0; i < workingStateOption.length; i++) {
        var element = workingStateOption[i]
        if (element.value === curStatus) {
          element.checked = 'true'
        } else {
          if (element.hasOwnProperty('checked'))
            delete element['checked']
        }
      }
      // console.log(33333)
      // console.log(workingStateOption)

      //  初始化出生日期（返回null的）
      if (!that.data.form['个人信息']['出生日期']) {
        that.setData({
          form: that.data.form
        })
      }

      that.setData({
        form: that.data.form,
        genderItems: genderItems,
        workingStateOption: workingStateOption
      })
      // 初始化 roleOptions index
      return new Promise(function(resolve, reject) {
        return that.getRoleAuthorityNames(app.globalData.chooseedEnterpriseId()).then(res => {
          // console.log(4444)
          // console.log(that.data.roleOptions)
          // console.log(that.data.index)
          // 初始化 processList
          that.filterProcess(app.globalData.chooseedEnterpriseId()).then(res => {
            // console.log(5555)
            // console.log(that.data.processList)
            resolve(true)
          })
        })
      })
    },

    //查询 该厂的所有管理角色
    getRoleAuthorityNames(enterpriseID) {
      let that = this
      var roleOptions = []
      var index = 0
      var parameter = {
        "企业unique_id": enterpriseID
      }
      return new Promise(function(resolve, reject) {
        return get_role_authority_names(parameter, that).then(res => {
          for (let i = 0; i < res.data.length; i++) {
            roleOptions.push(res.data[i]['管理角色'])
            // 如果是员工注册模式，查找管理角色为员工的所有
            if (that.data.pattern === 'staffRegistration') {
              // if (res.data[i]['管理角色'] === '员工') {
              //   index = i
              // }
              index = -1
            } else if (that.data.pattern === 'staffEdit')
              // 如果是编辑模式查找和自身角色相符的所有
              if (res.data[i]['管理角色'] === that.data.form['管理角色']) {
                index = i
              }
          }
          that.setData({
            roleOptions: roleOptions,
            index: index,
          })
          resolve(true)
        })
      })
    },

    //查询 该厂所有的工序
    filterProcess(enterpriseID) {
      let that = this
      var parameter = {
        "企业unique_id": enterpriseID
      }
      return new Promise(function(resolve, reject) {
        return filter_process(parameter, that).then(res => {
          var items = []
          for (let i = 0; i < res.data.length; i++) {
            var item = res.data[i]
            var temp = {
              name: "工序名称",
              value: item['工序名称']
            }
            //如果是员工编辑模式 那么要判断该员工有没有此工序如果有，要加上选中状态
            if (that.data.pattern === 'staffEdit') {
              if (that.data.form['负责工序'].includes(item['工序名称'])) {
                temp.checked = 'true'
              }
            }
            items.push(temp)
          }
          that.setData({
            processList: items,
          })
          resolve(true)
        })
      })
    },

    //管理角色选择
    bindPickerChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        index: e.detail.value
      })
    },

    //出生日期选择
    bindDateChange: function(e) {
      this.setData({
        'form.个人信息.出生日期': e.detail.value
      })
    },
    // 清空日期
    deletedateclick() {
      this.setData({
        'form.个人信息.出生日期': ''
      })
    },
    // 身份证输入完成的时候 把日期取出来
    // 142322199209204038
    // 130503670401001
    onIdNumberInputCompleted(e) {
      var iIdNo = e.detail.value
      var tmpStr = ''
      if (!validateIdNumber(iIdNo)) return
      var date = null
      if (iIdNo.length === 15) {
        tmpStr = iIdNo.substring(6, 12)
        tmpStr = '19' + tmpStr
        tmpStr = tmpStr.substring(0, 4) + '-' + tmpStr.substring(4, 6) + '-' + tmpStr.substring(6)
        date = new Date(tmpStr)
        if (isEmpty(date.getTime())) {
          // 代表解析出来的是 Invalid Date
          this.setData({
            'form.个人信息.出生日期': ''
          })
        } else {
          // 代表解析出来的是正确的日期对象
          this.setData({
            'form.个人信息.出生日期': tmpStr
          })
        }
      } else {
        tmpStr = iIdNo.substring(6, 14)
        tmpStr = tmpStr.substring(0, 4) + '-' + tmpStr.substring(4, 6) + '-' + tmpStr.substring(6)
        date = new Date(tmpStr)
        if (isEmpty(date.getTime())) {
          // 代表解析出来的是 Invalid Date
          this.setData({
            'form.个人信息.出生日期': ''
          })
        } else {
          // 代表解析出来的是正确的日期对象
          this.setData({
            'form.个人信息.出生日期': tmpStr
          })
        }
      }
    },

    //银行卡图片上传
    uploadImage: function(e) {
      var that = this;
      wx.chooseImage({
        count: 1, //最多可以选择的图片总数
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          //启动上传等待中...
          wx.showToast({
            title: '正在上传...',
            icon: 'loading',
            mask: true,
            duration: 1000
          })
          var mode = e.currentTarget.id;
          wx.uploadFile({
            url: api.otherUtilityClasses.upload_file.url,
            filePath: tempFilePaths[0],
            name: 'file',
            formData: {
              'login_token': app.globalData.login_token()
            },
            success: function(res) {
              console.log(res);
              var data = JSON.parse(res.data);
              if (data.status === 'OK') {
                if (mode == "idCardBack") {
                  that.setData({
                    'form.个人信息.身份证反面照片': data.url
                  })
                } else if (mode == "idCardFront") {
                  that.setData({
                    'form.个人信息.身份证正面照片': data.url
                  })
                } else if (mode == "bankCard") {
                  that.setData({
                    'form.银行卡信息.银行卡照片': data.url
                  })
                }
              } else if (data.status === 'TOKEN_FAIL') {
                setStatus(that, false);
                processingTokenFailure(data.msg);
              } else {
                setStatus(that, false);
                markedWords(data.msg);
                reject(false)
              }
            },
            fail: function(err) {
              wx.hideToast();
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function(err) {}
              })
            }
          });
        }
      });
    },

    formSubmit: function(e) {
      let that = this
      console.log('form发生了submit事件，携带数据为：', e.detail.value)
      if (!/^[\S]{1}.{0,15}[\S]{1}$/.test(e.detail.value['姓名'])) {
        markedWords('姓名最少俩字符')
        return
      } else if (isEmpty(e.detail.value['绑定手机号']) || e.detail.value['绑定手机号'].length !== 11) {
        markedWords('绑定手机号是必填项,或则手机输入格式不对')
        return
      } else if (!isEmpty(e.detail.value['身份证号']) &&
        !validateIdNumber(e.detail.value['身份证号'])) {
        markedWords('身份证格式不对')
        return
      } else if (isEmpty(e.detail.value['负责工序'])) {
        markedWords('负责工序至少得选一个')
        return
      }
      var form = {
        "unique_id": e.detail.value['姓名'],
        "绑定手机号": e.detail.value['绑定手机号'],
        "更新时间": parseTime(new Date()),
        "管理角色": that.data.roleOptions[that.data.index],
        "工作状态": e.detail.value['工作状态'],
        "负责工序": e.detail.value['负责工序'],
        "个人信息": {
          "姓名": e.detail.value['姓名'],
          "性别": e.detail.value['性别'],
          "出生日期": e.detail.value['出生日期'],
          "身份证号": e.detail.value['身份证号'],
          "地址": e.detail.value['地址'],
          "身份证正面照片": that.data.form['个人信息']['身份证正面照片'],
          "身份证反面照片": that.data.form['个人信息']['身份证反面照片']
        },
        "银行卡信息": {
          "账户开户姓名": e.detail.value['账户开户姓名'],
          "开户行": e.detail.value['开户行'],
          "银行账号": e.detail.value['银行账号'],
          "银行卡照片": that.data.form['银行卡信息']['银行卡照片']
        }
      }
      if (that.data.pattern === 'staffRegistration') {
        var parameter_a = {
          "企业unique_id": that.data['企业unique_id'],
          data: form
        }
        add_user_unconfirmed(parameter_a, that).then(res => {
          setStatus(that, false)
          markedWords("注册成功，待审核!")
          setTimeout(() => {
            wx.navigateTo({
              url: "/pages/login/login"
            })
          }, 2000)
        })
      } else if (that.data.pattern === 'staffEdit') {
        var post_data_b = {
          login_token: app.globalData.login_token(),
          unique_id: that.data.form.unique_id,
          update_data: form
        }
        edit_user_by_id(post_data_b).then(res => {
          setStatus(that, false)
          markedWords(res.msg)
          setTimeout(() => {
            wx.navigateBack({
              delta: 1 // 返回上一级页面。
            })
          }, 2000)
        })
      }

    },
    formReset: function() {
      let that = this
      console.log('form发生了reset事件')
      that.setData({
        workingStateOption: that.data.workingStateOption
      })
      if (that.data.pattern === 'staffRegistration') {
        that.registrationModeInitialization(that.data.query).then(res => {
          setStatus(that, false)
        })
      } else if (that.data.pattern === 'staffEdit') {
        that.editModeInitialization().then(res => {
          setStatus(that, false)
        })
      }
    },
  },

})