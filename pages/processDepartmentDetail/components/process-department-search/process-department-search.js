// components/component-tag-name.js
const app = getApp();
import {
  markedWords,
  getDateStr,
  isEmpty,
  deepClone
} from "../../../../utils/util.js";
import {
  staff_get_process_summary_detail_by_process_id,
  manager_get_process_summary_detail
} from "../../../../services/scheduleManagement.js";
import debounce from "../../../../utils/lodash/debounce.js";
import {
  product_tags_auto_complete
} from "../../../../services/maintenanceOfProcessPartsOfProductLibrary.js";
var items = [{
    name: '0',
    value: '升序',
  },
  {
    name: '1',
    value: '降序',
  }
]
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    item: {
      name: '按时间搜索之后的筛选生产单',
      open: false
    },


    // 搜索的开始时间和结束时间
    startTime: '',
    endTime: '',
    // 原始的部门工资详情
    originalDepartmentalWageDetails: null,
    product_tag_names: [],
    // 是否正在处理按钮逻辑
    loading: false,

    // 先搜索后筛选（纯客户端逻辑）
    /*******这里面放筛选的条件**********1111111111********** */
    // 生产单编号
    productUniqueId: '',
    //单价排序
    items_1: [{
        name: '0',
        value: '升序',
      },
      {
        name: '1',
        value: '降序',
      }
    ],
    //总件数排序
    items_2: [{
        name: '0',
        value: '升序',
      },
      {
        name: '1',
        value: '降序',
      }
    ],
    //总金额排序
    items_3: [{
        name: '0',
        value: '升序',
      },
      {
        name: '1',
        value: '降序'
      }
    ],
    product_tag_filter: {},
    /*******这里面放筛选的条件**********2222222222********** */

    // 获取焦点的那个产品标签标签输入框的 标签值列表（比如楦型的所有值）
    product_suggest_value_list: [],
    // 产品标签输入框 获取焦点的标签名称(比如 楦型)
    productTagKeyFocus: '',
    isRequestIng: false,
  },

  /**
   * 在组件实例刚刚被创建时执行 此时还不能调用 setData
   */
  created: function() {
    this.productUniqueIdDebouncedHandleSearch = debounce(this.onInputProductUniqueId, 1000)
    this.productDebouncedHandleSearch = debounce(this.onInputProductTag, 1000)
  },

  /**
   * 在组件实例进入页面节点树时执行，在这做数据初始化。传过来的数据已设置到data，现在可以调用setData
   */
  attached: function() {
    this.setData({
      startTime: getDateStr(0),
      endTime: getDateStr(1)
    })
    this.getProductTagNames()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 当任何非下拉框form元素tap的时候
    onTap() {
      let that = this
      that.setData({
        productTagKeyFocus: ''
      })
    },
    //获取某员工在指定时间内部门工资详情统计
    obtainDetailedDepartmentSalaryStatisticsFromEmployees() {
      let that = this
      return new Promise(function(resolve, reject) {
        var parameter = {
          login_token: app.globalData.login_token(),
          "日期_上限": isEmpty(that.data.endTime) ? getCurrentMonthLast() : that.data.endTime, // 结束 时间
          "日期_下限": isEmpty(that.data.startTime) ? getCurrentMonthLast() : that.data.startTime, //开始 时间
          "工序名称": app.globalData.processDepartmentName
        }
        var userInfo = app.globalData.userInfo()
        if (userInfo['管理角色'] === '员工') {
          return staff_get_process_summary_detail_by_process_id(parameter, that).then(res => {
            that.data.originalDepartmentalWageDetails = res.data
            that.setData({
              isRequestIng: false
            })
            if (that.data.originalDepartmentalWageDetails['工序人员'].length===0){
              markedWords('该时间段，该工序，没有数据！')
            }
            resolve(res.data)
          })
        } else {
          return manager_get_process_summary_detail(parameter, that).then(res => {
            that.data.originalDepartmentalWageDetails = res.data[app.globalData.processDepartmentName]
            that.setData({
              isRequestIng: false
            })
            if (that.data.originalDepartmentalWageDetails['工序人员'].length === 0) {
              markedWords('该时间段，该工序，没有数据！')
            }
            resolve(res.data[app.globalData.processDepartmentName])
          })
        }
      })
    },

    //日期选择回调
    bindDateChange: function(e) {
      let that = this
      // 时间对比 开始时间不能大于结束时间
      var value = e.detail.value
      if (e.currentTarget.dataset.status === '开始') {
        if (new Date(value) > new Date(that.data.endTime)) {
          markedWords("开始时间必须小于结束时间！")
          return
        }
        that.setData({
          startTime: value
        })

      }

      if (e.currentTarget.dataset.status === '结束') {
        if (new Date(value) < new Date(that.data.startTime)) {
          markedWords("结束时间必须大于开始时间！")
          return
        }
        that.setData({
          endTime: value
        })
      }
      // 调用查询方法
      that.obtainDetailedDepartmentSalaryStatisticsFromEmployees().then(res => {
        // 更新父组件数据
        this.triggerEvent('callbackAfterConditionQuery', {
          departmentalWageDetails: res
        })
      })
    },

    //获取产品标签
    getProductTagNames() {
      let that = this
      var product_tag_names = app.globalData.productTag()
      var product_tag_filter = {}
      for (var index in product_tag_names) {
        product_tag_filter[product_tag_names[index]] = ''
      }
      that.setData({
        product_tag_names: product_tag_names,
        product_tag_filter: product_tag_filter
      })
    },

    // 清空筛选条件按钮点击
    emptyFilter() {
      let that = this
      that.onTap()
      that.setData({
        productUniqueId: '',
        items_1: deepClone(items),
        items_2: deepClone(items),
        items_3: deepClone(items),
        loading: true
      })
      this.getProductTagNames()
      // 通知父组件更新数据
      this.triggerEvent('callbackAfterConditionQuery', {
        departmentalWageDetails: that.data.originalDepartmentalWageDetails
      })
      // 取消按钮loading状态
      setTimeout(() => {
        that.setData({
          loading: false
        })
      }, 500);
    },

    // 输入生产单编号触发
    onInputProductUniqueId(e) {
      // 手机端点选的时候会触发input事件，所以我们要做判断
      if (isEmpty(e.detail.keyCode))return
      this.data.productUniqueId = e.detail.value
      this.filterRelevantInformationAccordingToTheFilterCriteria()
    },

    radioChange: function(e) {
      let that = this
      var index = Number(e.detail.value)
      var des = e.currentTarget.dataset.des
      console.log(`${des}发生change事件，携带value值为：`, e.detail.value)
      switch (des) {
        case '单价排序':
          // 遍历自身 加checked选中态
          var items_1 = that.data.items_1
          for (let i = 0; i < items_1.length; i++) {
            var element = items_1[i];
            if (i === index) {
              element['checked'] = 'true'
            } else {
              if (element.hasOwnProperty('checked'))
                delete element['checked']
            }
          }
          // 清空其他排序
          that.setData({
            items_1: items_1,
            items_2: deepClone(items),
            items_3: deepClone(items),
          })
          break;
        case '总件数排序':
          // 遍历自身 加checked选中态
          var items_2 = that.data.items_2
          for (let i = 0; i < items_2.length; i++) {
            var element = items_2[i];
            if (i === index) {
              element['checked'] = 'true'
            } else {
              if (element.hasOwnProperty('checked'))
                delete element['checked']
            }
          }
          // 清空其他排序
          that.setData({
            items_1: deepClone(items),
            items_2: items_2,
            items_3: deepClone(items),
          })
          break;
        case '总金额排序':
          // 遍历自身 加checked选中态
          var items_3 = that.data.items_3
          for (let i = 0; i < items_3.length; i++) {
            var element = items_3[i];
            if (i === index) {
              element['checked'] = 'true'
            } else {
              if (element.hasOwnProperty('checked'))
                delete element['checked']
            }
          }
          // 清空其他排序
          that.setData({
            items_1: deepClone(items),
            items_2: deepClone(items),
            items_3: items_3
          })
          break;

        default:
          break;
      }
      console.log(11111)
      console.log(that.data.items_1)
      console.log(that.data.items_2)
      console.log(that.data.items_3)
      that.filterRelevantInformationAccordingToTheFilterCriteria()
    },

    // 产品标签获取焦点的时候
    onFocusProductTag(e) {
      let that = this
      setTimeout(() => {
        var login_token = app.globalData.login_token()
        var post_data = {
          login_token: login_token,
          base_tags: that.data.product_tag_filter,
          target_tag_name: e.currentTarget.dataset.tagname
        }
        product_tags_auto_complete(post_data, that).then(res => {
          that.setData({
            product_suggest_value_list: res.data,
            productTagKeyFocus: res.data.length === 0 ? '' : e.currentTarget.dataset.tagname,
            isRequestIng: false
          })
        })
      }, 200)
    },

    // 产品标签输入的时候
    onInputProductTag(e){
      let that = this
      var tagname = e.currentTarget.dataset.tagname
      var value = e.detail.value
      // 手机端点选的时候会触发input事件，所以我们要做判断
      if (isEmpty(e.detail.keyCode)) return
      that.data.product_tag_filter[tagname] = value
      // 1.继续自动补全标签
      var login_token = app.globalData.login_token()
      var post_data = {
        login_token: login_token,
        base_tags: that.data.product_tag_filter,
        target_tag_name: tagname
      }
      product_tags_auto_complete(post_data, that).then(res => {
        that.setData({
          product_suggest_value_list: res.data,
          productTagKeyFocus: res.data.length === 0 ? '' : tagname,
          isRequestIng:false
        })
      })
    },

    // 进行产品标签值选择的时候回调
    onProductTagValueSelect(e) {
      var tagname = e.currentTarget.dataset.tagname
      var tagvalue = e.currentTarget.dataset.tagvalue
      for (const key in this.data.product_tag_filter) {
        if (key === tagname) {
          this.data.product_tag_filter[key] = tagvalue
        }
      }
      this.setData({
        product_tag_filter: this.data.product_tag_filter,
        productTagKeyFocus: ''
      })
      this.filterRelevantInformationAccordingToTheFilterCriteria()
    },

    // 根据筛选条件过滤 相关信息
    filterRelevantInformationAccordingToTheFilterCriteria() {
      let that = this
      // 1. 生产单编号的筛选
      // 在相关信息元素里面找出包含 productUniqueId的元素并返回一个新数组
      var departmentalWageDetails = deepClone(this.data.originalDepartmentalWageDetails)
      var 相关信息 = departmentalWageDetails['相关信息']
      var 新_相关信息 = 相关信息.filter(item => {
        return item['生产单号'].includes(this.data.productUniqueId)
      })

      // 2. 大小排序的筛选
      var element_1 = that.querySortSelectedState(that.data.items_1)
      var element_2 = that.querySortSelectedState(that.data.items_2)
      var element_3 = that.querySortSelectedState(that.data.items_3)
      if (element_1) {
        if (element_1.value === '升序') {
          新_相关信息 = 新_相关信息.sort((a, b) => {
            return a['单价'] - b['单价']
          })
        } else {
          新_相关信息 = 新_相关信息.sort((a, b) => {
            return b['单价'] - a['单价']
          })
        }
      } else if (element_2) {
        if (element_2.value === '升序') {
          新_相关信息 = 新_相关信息.sort((a, b) => {
            return a['单价'] - b['单价']
          })
        } else {
          新_相关信息 = 新_相关信息.sort((a, b) => {
            return b['单价'] - a['单价']
          })
        }
      } else if (element_3) {
        if (element_3.value === '升序') {
          新_相关信息 = 新_相关信息.sort((a, b) => {
            return a['单价'] - b['单价']
          })
        } else {
          新_相关信息 = 新_相关信息.sort((a, b) => {
            return b['单价'] - a['单价']
          })
        }
      }
      // 3. 产品信息的筛选
      var product_tag_filter = that.data.product_tag_filter
      for (const key in product_tag_filter) {
        // 输入了标签才算一个筛选条件
        if (product_tag_filter[key]) {
          新_相关信息 = 新_相关信息.filter(item => {
            return item['产品标签'][key].includes(product_tag_filter[key])
          })
        }
      }

      departmentalWageDetails['相关信息'] = 新_相关信息
      // 通知父组件更新数据
      this.triggerEvent('callbackAfterConditionQuery', {
        departmentalWageDetails: departmentalWageDetails
      })
    },
    // 查询排序选中态
    querySortSelectedState(array) {
      // 查询排序选中态
      for (let i = 0; i < array.length; i++) {
        var element = array[i];
        if (element.hasOwnProperty('checked')) {
          return element
        }
      }
      return null
    },


    kindToggle: function(e) {
      let that=this
      that.onTap()
      this.data.item.open = !this.data.item.open
      this.setData({
        item: this.data.item
      });
    }


  },

})