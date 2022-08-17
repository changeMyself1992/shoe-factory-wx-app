/**
 * 封装 数据统计   相关api
 */
import api from '../config/api';
import {
  request,
  
  setStatus
} from "../utils/util.js"

/**
 * 获取日收益
 */
function statistics_data_get_day_profits(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_day_profits.url, api.statisticsData.statistics_data_get_day_profits.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 获取月收益
 */
function statistics_data_get_month_profits(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_month_profits.url, api.statisticsData.statistics_data_get_month_profits.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 获取年收益
 */
function statistics_data_get_year_profits(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_year_profits.url, api.statisticsData.statistics_data_get_year_profits.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 工资支出
 */
function statistics_data_get_salary_cost(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_salary_cost.url, api.statisticsData.statistics_data_get_salary_cost.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 销售订单数据
 */
function statistics_data_get_order_data(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_order_data.url, api.statisticsData.statistics_data_get_order_data.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 生产订单api
 */
function statistics_data_get_product_note(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_product_note.url, api.statisticsData.statistics_data_get_product_note.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 生产订单api
 */
function statistics_data_get_month_sell_products(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_month_sell_products.url, api.statisticsData.statistics_data_get_month_sell_products.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 客户统计
 */
function statistics_data_get_month_customer_data(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_month_customer_data.url, api.statisticsData.statistics_data_get_month_customer_data.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 日采购供应数据
 */
function statistics_data_get_day_supplier_purchases(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_day_supplier_purchases.url, api.statisticsData.statistics_data_get_day_supplier_purchases.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 近半年来采购供应数据
 */
function statistics_data_get_month_supplier_purchases(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_month_supplier_purchases.url, api.statisticsData.statistics_data_get_month_supplier_purchases.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 近半年来采购供应数据
 */
function statistics_data_get_day_warehouse_statistics(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_day_warehouse_statistics.url, api.statisticsData.statistics_data_get_day_warehouse_statistics.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 日出入库统计
 */
function statistics_data_get_day_in_out_warehouse_statistics(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_day_in_out_warehouse_statistics.url, api.statisticsData.statistics_data_get_day_in_out_warehouse_statistics.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 月供应商结算
 */
function statistics_data_get_month_supplier_statements(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_month_supplier_statements.url, api.statisticsData.statistics_data_get_month_supplier_statements.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 月生产订单api(近半年)
 */
function statistics_data_get_month_product_note(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_month_product_note.url, api.statisticsData.statistics_data_get_month_product_note.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 年生产订单api(近两年)
 */
function statistics_data_get_year_product_note(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_year_product_note.url, api.statisticsData.statistics_data_get_year_product_note.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 年销售订单(近两年)
 */
function statistics_data_get_year_order_data(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_year_order_data.url, api.statisticsData.statistics_data_get_year_order_data.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
/**
 * 年采购单(近两年)
 */
function statistics_data_get_years_supplier_purchases(obj, that = null) {
  setStatus(that, true);
  return new Promise((resolve, reject) => {
    request(api.statisticsData.statistics_data_get_years_supplier_purchases.url, api.statisticsData.statistics_data_get_years_supplier_purchases.method, obj).then(res => {
      resolve(res) 
    }).catch(err => {
      setStatus(that, false);
      reject(err)
    })
  })
}
module.exports = {
  statistics_data_get_day_profits,
  statistics_data_get_month_profits,
  statistics_data_get_year_profits,
  statistics_data_get_salary_cost,
  statistics_data_get_order_data,
  statistics_data_get_product_note,
  statistics_data_get_month_sell_products,
  statistics_data_get_month_customer_data,
  statistics_data_get_day_supplier_purchases,
  statistics_data_get_month_supplier_purchases,
  statistics_data_get_day_warehouse_statistics,
  statistics_data_get_day_in_out_warehouse_statistics,
  statistics_data_get_month_supplier_statements,
  statistics_data_get_month_product_note,
  statistics_data_get_year_product_note,
  statistics_data_get_year_order_data,
  statistics_data_get_years_supplier_purchases
}
