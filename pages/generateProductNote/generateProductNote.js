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
  compareObj,
  sumArray
} from "../../utils/util.js";
import {
  generate_year_month_sequence_number
} from "../../services/otherUtilityClasses.js";
import {
  filter_process
} from "../../services/maintenanceOfProcessPartsOfProductLibrary.js";
import {
  match_recent_production_note_process_info_by_product_info
} from "../../services/scheduleManagement.js";
import {
  add_production_note
} from "../../services/ordersForProductionScheduling.js";
import regeneratorRuntime from '../../utils/runtime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: null,
    // 当前操作的订单详情
    orderDetails: {},
    // 对应的订单包含的产品列表,用于进行产品选择
    includedProducts: [],
    // 选中的产品
    selectedProductAndArrange: null,
    // 用于进行工艺选择
    processOptions: [],
    // 原始的选中的产品的工艺记录
    processRecord: [],
    // 当前的选中的产品工艺记录
    craftCheckList: [],
    // 排产模式选项
    autoGenerateModeOptions: [{
        name: 'manual',
        value: '手动排产',
        checked: true
      },
      {
        name: 'average',
        value: '尽量平均配码',
        checked: false
      },
      {
        name: 'averageInteger',
        value: '尽量平均整数配码',
        checked: false
      },
      {
        name: 'single',
        value: '单一码数配码',
        checked: false
      }
    ],
    // 自动排单的模式，manual/average/single 手动排产/码数平均/单一码数
    autoGenerateMode: 'manual',
    // 当前排产批次
    productionSchedulingBatch: 1,
    // 最小排产次数
    minimumProductionSchedule: 1,
    // 最大排产次数
    maximumProductionSchedule: 1,
    // 不同工序的工序工资
    salary: {},
    // 根据不同排单模式，和批次，计算出来的排产表
    sizeArrangeList_add: [
      // {
      //   配码: [
      //     {
      //       国标码: 220,
      //       尺码: 34,
      //       已排产数量: 0,
      //       此次排产: 10,
      //       目标数量: 10
      //     }
      //   ],
      //   此次总排产数: 0,
      //   剩余未排产数: 0
      // }
    ],
    // 配码数量是否展开
    whetherToExpandTheSizeOfTheCode: {
      // 开料: false,
      // 包装: true
    },
    integerInterval: 5,


    floorstatus: false,
    isRequestIng: false,
    positionStr: 'top: -10px;right: 20px;',
    tabBarUrl: '/pages/applicationFunctions/applicationFunctions'
  },



  // 初始化form
  initializationForm() {
    let that = this
    return new Promise(function(resolve, reject) {
      // 拷贝空的生产单数据结构
      that.data.form = deepClone(app.globalData['空的生产单结构'])
      var orderDetails = app.globalData.orderDetails
      var includedProducts = orderDetails['包含的产品']
      for (let i = 0; i < includedProducts.length; i++) {
        var element = includedProducts[i];
        element.name = element['产品信息'].unique_id
        element.value = element['产品信息'].unique_id
        element['配码数量是否展开'] = false
      }

      console.log("当前操作的订单详情", orderDetails)
      var parameter = {
        login_token: app.globalData.login_token(),
        流水单分组: 'SCD'
      }
      return generate_year_month_sequence_number(parameter, that).then(res => {
        var code = res.data['流水号']
        that.data.form.unique_id = code
        that.data.form['生产单编号'] = code
        that.data.form['生产单时间'] = parseTime(new Date(), '{y}-{m}-{d}')

        that.data.form['对应订单']['tags'] = orderDetails['tags']
        that.data.form['对应订单']['unique_id'] = orderDetails[
          'unique_id'
        ]
        that.data.form['对应订单']['上传图片列表'] = orderDetails['上传图片列表']
        that.data.form['对应订单']['交货日期'] = orderDetails['交货日期']
        that.data.form['对应订单']['客户信息'] = orderDetails['客户信息']
        that.data.form['对应订单']['订单备注'] = orderDetails['订单备注']
        that.data.form['对应订单']['订单日期'] = orderDetails['订单日期']
        that.data.form['对应订单']['订单编号'] = orderDetails['订单编号']
        that.data.form['生产单备注'] = orderDetails['订单备注']

        filter_process({
          login_token: app.globalData.login_token()
        }).then(res => {
          var allProcess = res.data
          var whetherToExpandTheSizeOfTheCode = {}
          for (var i = 0; i < allProcess.length; i++) {
            var element = allProcess[i]
            whetherToExpandTheSizeOfTheCode[element['工序名称']] = false
          }

          that.setData({
            form: that.data.form,
            orderDetails: orderDetails,
            includedProducts: includedProducts,
            whetherToExpandTheSizeOfTheCode: whetherToExpandTheSizeOfTheCode
          })
          resolve(true)
        })

      })
    })
  },

  //日期选择
  bindDateChange: function(e) {
    let that = this
    this.setData({
      'form.生产单时间': e.detail.value
    })
  },

  //产品选择回调
  productRadioChange: function(e) {
    let that = this
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    var index = e.detail.value
    var selectedProductAndArrange = that.data.includedProducts[index]
    that.setData({
      selectedProductAndArrange: selectedProductAndArrange
    })
    // 1.赋值选中的产品
    that.data.selectedProductAndArrange = selectedProductAndArrange
    // 2.获取该产品的默认工艺，自动勾选
    filter_process({
      login_token: app.globalData.login_token()
    }).then(res => {
      var allProcess = res.data
      var parameter = {
        login_token: app.globalData.login_token(),
        data: {
          排产产品: {
            产品信息: {
              unique_id: that.data.selectedProductAndArrange['产品信息'].unique_id,
              tags: that.data.selectedProductAndArrange['产品信息'].tags,
              产品编号: that.data.selectedProductAndArrange['产品信息']['产品编号']
            }
          }
        }
      }
      match_recent_production_note_process_info_by_product_info(parameter, that).then(res => {
        var processRecord = res.data['生产单工序信息']
        var processOptions = []
        var craftCheckList = []
        for (var i = 0; i < allProcess.length; i++) {
          var element = allProcess[i]
          var index = processRecord.findIndex(item => {
            return item['工序信息'].unique_id === element.unique_id
          })
          if (index === -1) {
            processOptions.push({
              name: element.unique_id,
              value: element.unique_id,
              checked: false
            })
          } else {
            processOptions.push({
              name: element.unique_id,
              value: element.unique_id,
              checked: true
            })
            craftCheckList.push(element.unique_id)
          }
        }
        that.setData({
          isRequestIng: false,
          processOptions: processOptions,
          craftCheckList: craftCheckList
        })
        that.data.processRecord = processRecord
        // 3.计算排产数
        that.initializeProductionSchedule()
        //4. 初始化工资
        that.initialChemicalProcessSalary()
        // 5.排产表展示数据的初始化
        that.addTheInitializationOfThePattern()
      })
    })

  },
  // 工艺选择触发
  processCheckboxChange(e) {
    let that = this
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    that.setData({
      craftCheckList: e.detail.value
    })
    // 初始化工资
    that.initialChemicalProcessSalary()
  },
  // 排产模式选择触发
  generateModeRadioChange(e) {
    let that = this
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    that.setData({
      autoGenerateMode: e.detail.value
    })
    that.initializeProductionSchedule()
    that.addTheInitializationOfThePattern()
  },
  //初始化排产数
  initializeProductionSchedule() {
    let that = this
    // 如果是手动排产
    if (that.data.autoGenerateMode === 'manual') {
      that.setData({
        productionSchedulingBatch: 1,
        minimumProductionSchedule: 1,
        maximumProductionSchedule: 1
      })
    }
    // 如果是 平均配码
    else if (that.data.autoGenerateMode === 'average') {
      // 计算最大排产数字
      // 找出所有配码里面 目标数量-已排产数量 最大的值 就是最大排产数
      var 配码 = that.data.selectedProductAndArrange['配码数量']['配码']
      var temp = []
      for (let i = 0; i < 配码.length; i++) {
        const element = 配码[i]
        temp.push(element['目标数量'] - element['已排产数量'])
      }
      temp.sort(function(a, b) {
        return b - a
      })
      var maximumProductionSchedule = temp[0]

      that.setData({
        productionSchedulingBatch: 1,
        minimumProductionSchedule: 1,
        maximumProductionSchedule: maximumProductionSchedule
      })
    }
    // 如果是 平均整数配码
    else if (that.data.autoGenerateMode === 'averageInteger') {
      var maximumProductionSchedule = Math.floor(
        (that.data.selectedProductAndArrange['配码数量']['总数'] -
          that.data.selectedProductAndArrange['配码数量']['已经排产数量']) /
        that.data.integerInterval
      )
      that.setData({
        productionSchedulingBatch: 1,
        minimumProductionSchedule: 1,
        maximumProductionSchedule: maximumProductionSchedule
      })
    }
    // 如果是单一码数分配
    else {
      var 配码 = that.data.selectedProductAndArrange['配码数量']['配码']
      // 计算最小排产数
      var minimumProductionSchedule = 0
      for (let i = 0; i < 配码.length; i++) {
        const element = 配码[i]
        if (element['目标数量'] - element['已排产数量'] > 0) {
          minimumProductionSchedule = minimumProductionSchedule + 1
        }
      }

      // 计算最大排产数,所有未排产的总数加起来就是 最大排产数
      var maximumProductionSchedule = 0
      for (let i = 0; i < 配码.length; i++) {
        const element = 配码[i]
        maximumProductionSchedule += (element['目标数量'] - element['已排产数量'])
      }

      that.setData({
        productionSchedulingBatch: minimumProductionSchedule,
        minimumProductionSchedule: minimumProductionSchedule,
        maximumProductionSchedule: maximumProductionSchedule
      })
    }
  },
  // 限制批次的输入
  handleBatchChange(e) {
    let that = this
    // console.log('批次输入框发生输入事件，携带value值为：', e.detail.value)
    var value = Number(e.detail.value)
    if (value < that.data.minimumProductionSchedule) {
      value = that.data.minimumProductionSchedule
    }
    if (value > that.data.maximumProductionSchedule) {
      value = that.data.maximumProductionSchedule
    }
    that.setData({
      productionSchedulingBatch: value
    })
    // 排产表展示数据的初始化
    that.addTheInitializationOfThePattern()
  },
  // 限制配码整数的输入
  handleIntegerIntervalChange(e) {
    let that = this
    // console.log('批次输入框发生输入事件，携带value值为：', e.detail.value)
    var value = Number(e.detail.value)
    if (value < 5) {
      value = 5
    } else if ((value % 5) !== 0) {
      value = Math.floor(value / 5) * 5
    }
    that.setData({
      integerInterval: value
    })
    that.initializeProductionSchedule()
    that.addTheInitializationOfThePattern()
  },

  kindToggle: function(even) {
    let that = this
    var curOperationProcutIndex = Number(even.currentTarget.dataset.curoperationprocutindex)
    that.data.includedProducts[curOperationProcutIndex]['配码数量是否展开'] = !that.data.includedProducts[curOperationProcutIndex]['配码数量是否展开']
    this.setData({
      curOperationProcutIndex: curOperationProcutIndex,
      includedProducts: that.data.includedProducts
    });
  },

  // 排产表展示数据的初始化(批次输入的时候触发,分配模式选择后触发,选择产品的时候触发)
  addTheInitializationOfThePattern() {
    let that = this
    // 分不同模式进行自动排产分单处理
    // 平均分尺码 和 手动排产
    if (that.data.autoGenerateMode === 'average' || that.data.autoGenerateMode === 'manual' || that.data.autoGenerateMode === 'averageInteger') {
      // 1. 尺码计算
      var temp = {}
      var selectedProductAndArrange = deepClone(
        that.data.selectedProductAndArrange
      )
      console.log(selectedProductAndArrange)

      var batch = that.data.productionSchedulingBatch // 要平均分为几张订单
      var total_size = selectedProductAndArrange['配码数量']['配码'].length // 一共有多少个码数
      var left = [] // 码数剩余计数，剩余排产数
      for (var i = 0; i < total_size; i++) {
        left.push(selectedProductAndArrange['配码数量']['配码'][i]['目标数量'] - selectedProductAndArrange['配码数量']['配码'][i]['已排产数量'])
      }
      console.log(left)
      var notes = []
      var total_count = selectedProductAndArrange['配码数量']['总数'] - selectedProductAndArrange['配码数量']['已经排产数量']
      if (that.data.autoGenerateMode === 'average' || that.data.autoGenerateMode === 'manual') {
        var average_batch = Math.floor(total_count / batch)
      } else {
        // 如果是尽量平均整数配码的时候可以通过前端传入一个参数来改变integerInterval这个值
        var integerInterval = that.data.integerInterval
        average_batch = Math.floor(Math.floor(total_count / batch) / integerInterval) * integerInterval
      }
      for (var a = 0; a < batch - 1; a++) {
        var note = []
        for (var b = 0; b < total_size; b++) {
          note.push(0)
        }
        var count = 0
        var index = 0

        while (count < average_batch) {
          if (left[index] > 0) {
            note[index] += 1
            left[index] -= 1
            count += 1
          }
          index += 1

          if (index >= total_size) {
            index -= total_size
          }
        }

        notes.push(note)
      }
      // 处理最后一个生产单
      notes.push(left)
      console.log(notes)

      // 转化为前端根据码数的格式
      for (var m = 0; m < total_size; m++) {
        var ele = selectedProductAndArrange['配码数量']['配码'][m]
        temp[ele['尺码']] = []
        for (var n = 0; n < batch; n++) {
          temp[ele['尺码']][n] = notes[n][m]
        }
      }
      console.log(1111)
      console.log(temp)

      that.data.sizeArrangeList_add = []
      for (let b = 0; b < that.data.productionSchedulingBatch; b++) {
        var sizeArrangeItem = {
          配码: [],
          此次总排产数: 0,
          剩余未排产数: selectedProductAndArrange['配码数量']['总数'] -
            selectedProductAndArrange['配码数量']['已经排产数量']
        }
        for (
          let c = 0; c < selectedProductAndArrange['配码数量']['配码'].length; c++
        ) {
          var element_b = selectedProductAndArrange['配码数量']['配码'][c]
          var 配码元素 = deepClone(element_b)
          配码元素['此次排产'] = temp[String(element_b['尺码'])][b]
          sizeArrangeItem.配码.push(配码元素)
          sizeArrangeItem.此次总排产数 =
            sizeArrangeItem.此次总排产数 + 配码元素['此次排产']
        }
        // that.data.sizeArrangeList_add.push(sizeArrangeItem)
        if (sizeArrangeItem['此次总排产数'] !== 0) {
          that.data.sizeArrangeList_add.push(sizeArrangeItem)
        }
      }
      console.log(2222)
      console.log(that.data.sizeArrangeList_add)
      that.setData({
        sizeArrangeList_add: that.data.sizeArrangeList_add
      })
    } else {
      // 单一码数配码
      // 1. 尺码计算
      temp = {}
      selectedProductAndArrange = deepClone(
        that.data.selectedProductAndArrange
      )
      batch = that.data.productionSchedulingBatch // 要平均分为几张订单
      total_size = selectedProductAndArrange['配码数量']['配码'].length // 一共有多少个码数
      left = [] // 码数剩余计数，剩余排产数
      for (let i = 0; i < total_size; i++) {
        left.push(selectedProductAndArrange['配码数量']['配码'][i]['目标数量'] - selectedProductAndArrange['配码数量']['配码'][i]['已排产数量'])
      }
      // console.log(left)
      notes = []
      total_count = selectedProductAndArrange['配码数量']['总数'] - selectedProductAndArrange['配码数量']['已经排产数量']

      average_batch = Math.floor(total_count / batch)
      var min_batch = Math.max(1, Math.floor(average_batch * 0.7))
      console.log(average_batch)
      console.log(min_batch)

      index = 0
      var new_note_flag = false
      note = []
      for (let a = 0; a < total_size; a++) {
        note.push(0)
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (left[index] >= average_batch) {
          note[index] += average_batch
          left[index] -= average_batch
          notes.push(note)
          note = []
          for (let a = 0; a < total_size; a++) {
            note.push(0)
          }
          new_note_flag = true
        } else if (left[index] >= min_batch) {
          note[index] += min_batch
          left[index] -= min_batch
          notes.push(note)
          note = []
          for (let a = 0; a < total_size; a++) {
            note.push(0)
          }
          new_note_flag = true
        }
        // 准备进入下一个循环
        index += 1
        if (index >= total_size) {
          index -= total_size
          if (new_note_flag !== true) { // 没有大于阈值的尺码了
            break
          } else { // 否则进入下一轮
            new_note_flag = false
          }
        }
      }

      // 第二轮组合剩余的零散尺码
      while (sumArray(left) > 0) {
        note = []
        for (let a = 0; a < total_size; a++) {
          note.push(0)
        }
        index = 0
        var operation_flag = false
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (left[index] > 0) {
            note[index] += left[index]
            left[index] = 0
            operation_flag = true
          }

          if (sumArray(note) >= min_batch) {
            notes.push(note)
            note = []
            for (let a = 0; a < total_size; a++) {
              note.push(0)
            }
          }

          // 准备进入下一个循环
          index += 1
          if (index >= total_size) {
            index -= total_size
            if (operation_flag !== true) { // 没有大于阈值的尺码了
              break
            } else { // 否则进入下一轮
              operation_flag = false
            }
          }
        }
      }

      // 处理最后一个剩余
      if (sumArray(note) > 0) {
        notes.push(note)
        note = []
        for (let a = 0; a < total_size; a++) {
          note.push(0)
        }
      }
      // 打印结果
      console.log(notes)
      // 转化为前端根据码数的格式
      for (let m = 0; m < total_size; m++) {
        ele = selectedProductAndArrange['配码数量']['配码'][m]
        temp[ele['尺码']] = []
        for (let n = 0; n < batch; n++) {
          temp[ele['尺码']][n] = notes[n][m]
        }
      }
      console.log(1111)
      console.log(temp)

      that.data.sizeArrangeList_add = []
      for (let b = 0; b < that.data.productionSchedulingBatch; b++) {
        const sizeArrangeItem = {
          配码: [],
          此次总排产数: 0,
          剩余未排产数: selectedProductAndArrange['配码数量']['总数'] -
            selectedProductAndArrange['配码数量']['已经排产数量']
        }
        for (
          let c = 0; c < selectedProductAndArrange['配码数量']['配码'].length; c++
        ) {
          const element_b = selectedProductAndArrange['配码数量']['配码'][c]
          const 配码元素 = deepClone(element_b)
          配码元素['此次排产'] = temp[String(element_b['尺码'])][b]
          sizeArrangeItem.配码.push(配码元素)
          sizeArrangeItem.此次总排产数 =
            sizeArrangeItem.此次总排产数 + 配码元素['此次排产']
        }
        // that.data.sizeArrangeList_add.push(sizeArrangeItem)
        if (sizeArrangeItem['此次总排产数'] !== 0) {
          that.data.sizeArrangeList_add.push(sizeArrangeItem)
        }
      }
      console.log(2222)
      console.log(that.data.sizeArrangeList_add)
      that.setData({
        sizeArrangeList_add: that.data.sizeArrangeList_add
      })
    }
  },

  // 初始化工序工资
  initialChemicalProcessSalary() {
    let that = this
    var salary = {}
    filter_process({
      login_token: app.globalData.login_token()
    }).then(res => {
      var allProcess = res.data
      for (var i = 0; i < allProcess.length; i++) {
        const process = allProcess[i]
        const 生产单工序信息 = that.data.processRecord

        if (!isEmpty(生产单工序信息)) {
          var index = 生产单工序信息.findIndex(item => {
            return item.工序信息.工序名称 === process['工序名称']
          })
          if (index !== -1) {
            salary[process['工序名称']] = 生产单工序信息[index]['工序工资']
          } else {
            salary[process['工序名称']] = 0.0
          }
        } else {
          salary[process['工序名称']] = 0.0
        }
      }
      that.setData({
        salary: salary
      })
    })

  },

  // 配码数量展开
  peiMaNumToggle(e) {
    let that = this
    var processName = e.currentTarget.dataset.processname
    that.data.whetherToExpandTheSizeOfTheCode[processName] = !that.data.whetherToExpandTheSizeOfTheCode[processName]
    that.setData({
      whetherToExpandTheSizeOfTheCode: that.data.whetherToExpandTheSizeOfTheCode
    })
  },

  // 限制工序工资_添加模式
  processWageRestraint_add(e) {
    let that = this
    var value = e.detail.value
    var process_name = e.currentTarget.dataset.processname
    if (!value || Number(value) < 0) {
      value = 0
    }
    that.data.salary[process_name] = Number(Number(value).toFixed(2))
    that.setData({
      salary: that.data.salary
    })
  },

  // 限制此次排产数字
  limitThisOutput(e) {
    let that = this
    var cur = Number(e.detail.value)
    var index = e.currentTarget.dataset.index
    var peima = that.data.sizeArrangeList_add[0]['配码'][index]
    var min = 0
    var max = peima['目标数量'] - peima['已排产数量']
    if (cur < min) cur = min
    else if (cur > max) cur = max
    peima['此次排产'] = cur
    that.setData({
      'sizeArrangeList_add[0]': that.data.sizeArrangeList_add[0]
    })
    that.totalArrangeCountFromSizeArrangeList()
  },

  // 实时计算totalArrangeCount
  totalArrangeCountFromSizeArrangeList() {
    let that = this
    var 配码 = that.data.sizeArrangeList_add[0]['配码']
    var count = 0
    配码.forEach(element => {
      count += element.此次排产
    })
    that.data.sizeArrangeList_add[0]['此次总排产数'] = count
    that.setData({
      'sizeArrangeList_add[0]': that.data.sizeArrangeList_add[0]
    })
  },

  formSubmit: async function(e) {
    let that = this
    if (isEmpty(that.data.craftCheckList)) {
      markedWords('至少要选择一个工序！')
      return
    }

    for (let index = 0; index < that.data.sizeArrangeList_add.length; index++) {
      const sizeArrangeItem = that.data.sizeArrangeList_add[index]
      // 提交之前验证
      if (sizeArrangeItem.剩余未排产数 <= 0) {
        markedWords('该产品已全部排产完毕，不可再进行排产')
        return
      } else if (sizeArrangeItem.此次总排产数 < 1 && that.data.productionSchedulingBatc === 1) {
        markedWords('产品排产数量不能小于1！')
        return
      }

      // 如果不是第一次提交 那么要生成信息的生产单id
      if (index !== 0) {
        var parameter = {
          login_token: app.globalData.login_token(),
          流水单分组: 'SCD'
        }
        var res = await generate_year_month_sequence_number(parameter)
        var code = res.data['流水号']
        that.data.form.unique_id = code
        that.data.form['生产单编号'] = code
      }

      // 加入 "排产产品">"产品信息"
      that.data.form['排产产品']['产品信息'] = that.data.selectedProductAndArrange['产品信息']

      // 加入 "排产产品">"排产配码数量"
      var arrangedCount = []
      for (var k = 0; k < sizeArrangeItem['配码'].length; k++) {
        var element = sizeArrangeItem['配码'][k]
        arrangedCount.push({
          尺码: element['尺码'],
          国标码: element['国标码'],
          目标数量: Number(parseFloat(element['此次排产']).toFixed(2))
        })
      }
      that.data.form['排产产品']['排产配码数量']['配码'] = arrangedCount
      that.data.form['排产产品']['排产配码数量']['总排产数'] =
        sizeArrangeItem.此次总排产数

      // 加入 "生产单工序信息"
      var productionNoteProcessInfo = []
      var new_arranged_count = deepClone(arrangedCount)
      for (k = 0; k < new_arranged_count.length; k++) {
        new_arranged_count[k]['完成数量'] = 0
      }
      for (k = 0; k < that.data.craftCheckList.length; k++) {
        productionNoteProcessInfo.push({
          员工计件: [],
          员工计件配码总计数: {
            配码: new_arranged_count,
            总完成数: 0
          },
          工序信息: {
            unique_id: that.data.craftCheckList[k],
            工序名称: that.data.craftCheckList[k]
          },
          工序工资: that.data.salary[
            that.data.craftCheckList[k]
          ],
          配码完成总计数: {
            配码: new_arranged_count,
            总完成数: 0
          }
        })
        if (that.data.salary[that.data.craftCheckList[k]] === 0) {
          markedWords('工序：' + that.data.craftCheckList[k] + '的工资输入值为0，请再次确认后重新提交')
          return
        }
      }
      that.data.form['生产单工序信息'] = productionNoteProcessInfo

      // 发起添加排产单请求
      var post_data = {
        login_token: app.globalData.login_token(),
        data: that.data.form
      }
      console.log(post_data)
      await add_production_note(post_data, that)
    }
    setStatus(that, false)
    markedWords('创建生产单成功！')
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/productionOrder/productionOrder',
      })
    }, 2000);
  },
  formReset: function() {
    let that = this
    console.log('form发生了reset事件')
  },


  /************页面事件*************************************start*********************** */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    // 页面初始化流程
    that.initializationForm().then(res => {
      that.setData({
        isRequestIng: false
      })
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
    let that = this;
    //激活弹回顶部icon，并设置为正在加载中....
    that.setData({
      floorstatus: true,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
  /************页面事件*************************************end*********************** */
})