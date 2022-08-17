const app = getApp();
/**
 * 检查小程序授权情况
 */
function checkUserAuthorization() {
  return new Promise(function (resolve, reject) {
    /*获取用户的当前的授权设置！！*/
    console.log("检查小程序授权情况!");
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userInfo']) {
          console.warn("未授权小程序使用用户信息,或者用户授权权限不完整");
          reject(res);
        } else {
          console.log("授权成功！");
          resolve(res);
        }
      },
      fail: function (err) {
        console.warn("授权检测接口调用失败！！");
        reject(err);
      }
    })
  })
}

/**
 * Toast封装
 */
function markedWords(str, icon = 'none', duration = 0) {
  if (duration === 0 && str.length <= 8) {
    duration = 1500
  } else if (duration === 0 && str.length > 8) {
    duration = 5000
  }
  wx.showToast({
    title: str,
    icon: icon,
    duration: duration,
    // mask: true
  });
}

/**
 * 设置加载中状态
 * that 页面对象
 */
function setStatus(that, boolRequestIng) {
  if (that) {
    if (that.data.isRequestIng === boolRequestIng) return
    that.setData({
      isRequestIng: boolRequestIng
    });
  }
}

/**
 * 没有数据的处理逻辑
 * that 页面对象
 */
function noDataProcessingLogic(that, content = '没有更多数据了~') {
  setStatus(that, false)
  wx.showToast({
    title: content,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 封微信的的request
 */
function request(url, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: {
        Authorization: wx.getStorageSync('login_token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          // 状态正常
          if (res.data.status == 'OK') {
            resolve(res.data);
          }
          // 工作状态 错误（一礼拜不登录会自动设置为离职）
          else if (res.data.status == 'WORK_STATUS_FAIL') {
            wx.navigateTo({
              url: '../workStatusFail/workStatusFail'
            })
            reject()
          }
          // 权限错误
          else if (res.data.status == 'AUTHORITY_FAIL') {
            var bindAuthority = res.data.data
            var title = ''
            setTimeout(() => {
              for (let i = 0; i < app.globalData.administrativePrivileges.length; i++) {
                const element_a = app.globalData.administrativePrivileges[i]
                const permission = element_a.permission
                var permission_des = ''
                for (let j = 0; j < permission.length; j++) {
                  const element_b = permission[j]
                  if (bindAuthority.includes(element_b.value)) {
                    permission_des = permission_des + element_b.name + "，"
                  }
                }
                if (permission_des) {
                  title = element_a.title
                  wx.showModal({
                    title: '权限提示',
                    content: '该用户没有 ' + title + '>' + permission_des + '相关权限',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {
                        console.log('用户点击确定')
                      }
                    }
                  })
                  return
                }
              }
              markedWords('该页面缺少相关权限，如要访问更多功能请联系管理员！')
            }, 50)
            reject()
          }
          // token过期
          else if (res.data.status === 'TOKEN_FAIL') {
            setTimeout(() => {
              processingTokenFailure(res.data.msg)
            }, 50)
            reject()
          }
          // 其他错误
          else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false,
              success(res) {}
            })
            reject()
          }
        }
        // http 状态码错误
        else {
          setTimeout(() => {
            markedWords('发生错误，联系客服人员！')
          }, 100)
          reject()
        }
      },
      fail(err) {
        setTimeout(() => {
          markedWords("当前网络状况差，请稍候重试！")
        }, 100)
        reject(err)
      }
    })
  })
}

/**
 * token失效的异常处理
 */
function processingTokenFailure(msg) {
  //token失效清除所有缓存，跳转到登录页面
  markedWords(msg);
  // 1.判断有没有手机号缓存
  if (wx.getStorageSync('phoneNumberMemory')) {
    var phoneNumberMemory = wx.getStorageSync("phoneNumberMemory")
    wx.clearStorageSync();
    wx.setStorageSync("phoneNumberMemory", phoneNumberMemory)
  } else {
    wx.clearStorageSync();
  }
  setTimeout(() => {
    wx.reLaunch({
      url: '/pages/login/login',
    });
  }, 4000)

}

/** 
 * 获取用户微信信息（调用前需要 用户授权 ）
 * */
function getWechatInfo() {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      success: function (res) {
        console.log("获取用户微信信息成功！");
        wx.setStorageSync('userInfoFromWeChat', res.userInfo);
        resolve(res);
      },
      fail: function (err) {
        console.log("获取用户微信信息失败！可能是没有授权");
        reject(err);
      }
    });
  });
}

/**
 * 把url中的参数以对象形式返回
 */
function parseQueryString(url) {
  var json = {};
  var arr = url.substr(url.indexOf('?') + 1).split('&');
  arr.forEach(item => {
    var tmp = item.split('=');
    json[tmp[0]] = tmp[1];
  });
  return json;
}

/**
 * 根据身份来判断能否跳转某个界面
 */
function toPage(app, path) {
  //先获取用户角色
  const role = app.globalData.userInfo['管理角色']
  if (role === '员工' && path === '/pages/employeeCompletionInformation/employeeCompletionInformation') {
    markedWords("您没有权限前往该页面");
    return
  }
  wx.navigateTo({
    url: path
  })
}

/**
 * 判断变量 是不是空对象 空数组 。。。各种空
 */
function isEmpty(v) {
  switch (typeof v) {
    case 'undefined':
      return true
    case 'string':
      if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length === 0) return true
      break
    case 'boolean':
      if (!v) return true
      break
    case 'number':
      if (v === 0 || isNaN(v)) return true
      break
    case 'object':
      if (v === null || v.length === 0) return true
      for (var i in v) {
        return false
      }
      return true
  }
  return false
}

/**
 * Created by jiachenpan on 16/11/18.
 */
function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  // {y}-{m}-{d} {h}:{i}:{s}
  const format = cFormat || '{y}-{m}-{d}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 获取当前月的第一天
function getCurrentMonthFirst() {
  var date = new Date();
  date.setDate(1);
  return parseTime(date, '{y}-{m}-{d}');
}

// 获取当前月的最后一天
function getCurrentMonthLast() {
  var date = new Date();
  var currentMonth = date.getMonth();
  var nextMonth = ++currentMonth;
  var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
  var oneDay = 1000 * 60 * 60 * 24;
  return parseTime(new Date(nextMonthFirstDay - oneDay), '{y}-{m}-{d}');
}

function getDateStr(AddDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
  return parseTime(dd, '{y}-{m}-{d}');
}
// 获取近七天
function doHandleMonth(month) {
  var m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}

function getSevenDay(day) {
  var today = new Date();
  var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds); //注意，这行是关键代码
  var tYear = today.getFullYear();
  var tMonth = today.getMonth();
  var tDate = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear + "-" + tMonth + "-" + tDate;
}
// 获取近七天


//合并两个数组，去重
function concat_(arr1, arr2) {
  //不要直接使用var arr = arr1，这样arr只是arr1的一个引用，两者的修改会互相影响
  var arr = arr1.concat();
  //或者使用slice()复制，var arr = arr1.slice(0)
  for (var i = 0; i < arr2.length; i++) {
    arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
  }
  return arr;
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 */
function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * 判断对象 是否至少有一个键的值不为空
 * @param {*} obj 只能是 对象
 */
function objectHasAtLeastOneKeyWhoseValueIsNotNull(obj) {
  for (var key in obj) {
    if (obj[key]) {
      return true
    }
  }
  return false
}

/**
 * 判断俩个对象是否键值相等 忽略内存地址
 * @param {*} a
 * @param {*} b
 */
function isObjectValueEqual(obj1, obj2) { // 比较两个对象键值对是否相等
  var o1 = obj1 instanceof Object
  var o2 = obj2 instanceof Object
  if (!o1 || !o2) {
    /*  判断不是对象  */
    return obj1 === obj2
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false
  }

  for (var attr in obj1) {
    var t1 = obj1[attr] instanceof Object
    var t2 = obj2[attr] instanceof Object
    if (t1 && t2) {
      return isObjectValueEqual(obj1[attr], obj2[attr])
    } else if (obj1[attr] !== obj2[attr]) {
      return false
    }
  }
  return true
}

/**
 * 判断两个对象是否相等的方法
 */
function compareObj(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false
  else {
    for (var key in obj1) {
      if (obj2.hasOwnProperty(key)) {
        if (!Object.is(obj1[key], obj2[key])) {
          return false
        }
      } else {
        return false
      }
    }
    return true
  }
}

/**
 * 判断对象 是否全部的键都没有空值
 * @param {*} obj 只能是 对象
 */
function objectWhetherAllKeysHaveNoNullValue(obj) {
  for (var key in obj) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}

/**
 * Created by jiachenpan on 16/11/18.
 */

function sumArray(arr) {
  var sum = 0
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum
}


/**
 * 验证名称 (字符限制1-17位，开头结尾不能有空白！)
 */
function validateCustomerName(str) {
  if (!str) return false
  return /^[\S]{1}.{0,15}[\S]{1}$/.test(str)
}

/**
 * 验证座机
 * @param {*} str
 * 025-85951313
 */
function isValidSpecialPlane(str) {
  return /0\d{2,3}-\d{7,8}/.test(str)
}

/**
 * 手机号检测(不要用正则 手机号实在太多了)
 */
function detectMobilePhoneNumber(phone) {
  return /^1[3456789]\d{9}$/.test(phone)
}

/**
 * 身份证检测
 */
export function validateIdNumber(str) {
  if (!str) return false
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str)
}

/**
 * 调用接口获取登录凭证（code）进而换取用户登录态信息
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        console.log("获取微信登录码成功！！")
        resolve(res);
      },
      fail: function (err) {
        console.error("获取微信登录码失败！！")
        reject(err);
      }
    });
  });
}
/**
 * 判断数组中是不是有重复值（一维数组）
 */
function isRepeat(arr) {
  var hash = {};
  for (var i in arr) {
    if (hash[arr[i]]) return true;
    hash[arr[i]] = true;
  }
  return false;
}

module.exports = {
  checkUserAuthorization,
  detectMobilePhoneNumber,
  markedWords,
  request,
  getWechatInfo,
  processingTokenFailure,
  setStatus,
  noDataProcessingLogic,
  parseQueryString,
  toPage,
  isEmpty,
  parseTime,
  validateIdNumber,
  getCurrentMonthFirst,
  getCurrentMonthLast,
  concat_,
  getDateStr,
  deepClone,
  objectHasAtLeastOneKeyWhoseValueIsNotNull,
  isObjectValueEqual,
  compareObj,
  validateCustomerName,
  isValidSpecialPlane,
  objectWhetherAllKeysHaveNoNullValue,
  sumArray,
  getSevenDay,
  login,
  isRepeat
}