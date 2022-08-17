App({
  onLaunch: function (e) {
    let that = this;
    if (e.scene == 1011 || e.scene == 1012 || e.scene == 1013) {
      if (e.path === 'pages/employeeRegistration/employeeRegistration') {
        console.log("扫码注册，入口函数不做登录检查！");
      }
      if (e.path === 'pages/productionOrderDetails/productionOrderDetails') {
        console.log("扫码查看生产单详情，入口函数不做登录检查！");
      }
    }
    try {
      var AccountInfo = wx.getAccountInfoSync()
      if (AccountInfo.miniProgram.envVersion === 'release') {
        that.globalData.server = 'https://mes.westmatrix.cn/api/v1/'
      } else {
        that.globalData.server = 'https://mes.westmatrix.cn/test/api/v1/'
      }
    } catch (error) {
      that.globalData.server = 'https://mes.westmatrix.cn/api/v1/'
    }
  },

  globalData: {
    server: 'https://mes.westmatrix.cn/api/v1/', // 接口地址
    systeminfo: {}, // 系统信息
    headerBtnPosi: {}, // 胶囊按钮位置信息
    //token
    login_token: () => {
      return wx.getStorageSync("login_token")
    },

    //用户微信信息
    userInfoFromWeChat: () => {
      return wx.getStorageSync("userInfoFromWeChat")
    },

    //所有企业 unique_id列表
    enterpriseIdList: () => {
      return wx.getStorageSync("enterpriseIdList")
    },

    //所有企业 名称列表
    enterpriseNameList: () => {
      return wx.getStorageSync("enterpriseNameList")
    },

    //当前选中的企业ID
    chooseedEnterpriseId: () => {
      return wx.getStorageSync("chooseedEnterpriseId")
    },

    //当前选中的企业名称
    chooseedEnterpriseName: () => {
      return wx.getStorageSync("chooseedEnterpriseName")
    },

    //用户在服务器的全部数据
    userInfo: () => {
      return wx.getStorageSync("userInfo")
    },

    //用户的权限列表
    theirOwnRights: () => {
      return wx.getStorageSync("theirOwnRights")
    },

    //产品标签数组
    productTag: () => {
      return wx.getStorageSync("productTag")
    },

    // 订单的标签数组
    orderTag: () => {
      return wx.getStorageSync("orderTag")
    },

    // 客户的标签数组
    clientTag: () => {
      return wx.getStorageSync("clientTag")
    },

    // 鞋子的配码数组
    withCodeArray: () => {
      return wx.getStorageSync("withCodeArray")
    },

    //物料的标签
    tagsOfMaterials: () => {
      return wx.getStorageSync("tagsOfMaterials")
    },

    // 手机号记忆
    phoneNumberMemory: () => {
      return wx.getStorageSync("phoneNumberMemory")
    },



    空订单结构: {
      tags: {},
      unique_id: "",
      上传图片列表: [null, null],
      交货日期: "",
      包含的产品: [],
      客户信息: {
        // tags: {
        //   地区: "北京"
        // },
        // 名称: "北京耐克总代理",
        // 电话: "18888888888",
        // 地址: "北京天安门",
        // 备注: "无备注",
        // …
      },
      已排产生产单列表: [],
      更新时间: "",
      订单备注: "暂时无备注",
      订单完成百分比: 0,
      订单日期: "",
      订单状态: "新订单",
      订单编号: ""
    },

    空员工结构: {
      绑定手机号: '',
      管理角色: '',
      工作状态: '',
      负责工序: [],
      个人信息: {
        姓名: '',
        性别: '',
        出生日期: '',
        身份证号: '',
        地址: '',
        身份证正面照片: '',
        身份证反面照片: ''
      },
      银行卡信息: {
        账户开户姓名: '',
        开户行: '',
        银行账号: '',
        银行卡照片: ''
      }
    },

    订单包含的产品空元素: {
      产品信息: {
        tags: {
          // '楦型',
          // '款号',
          // .....
        },
        unique_id: '',
        产品图片列表: [],
        备注: '',
        产品编号: '',
        成本估算: '',
        更新时间: '',
        部位详情: []
      },
      品牌: '',
      客户产品编号: '',
      结算情况: {
        产品订单实收: 0,
        产品订单应收: 0,
        发货数量: 0,
        发货时间: '',
        备注: '',
        结算状态: '未发货'
      },
      配码数量: {
        已经排产数量: 0,
        总数: 0,
        配码: [
          // {
          //   国标码: 220,
          //   尺码: 34,
          //   已排产数量: 0,
          //   目标数量: 0
          // }
        ]
      },
      // 数据库没这个字段，我自己加的
      配码数量是否展开: false
    },

    空角色结构: {
      description: '', //人员管理, 权限管理, 财务功能...
      unique_id: '', //厂长
      更新时间: '',
      管理权限: {
        // .....
      },
      管理角色: '' //厂长
    },

    空客户结构: {
      tags: {},
      名称: '',
      电话: '',
      地址: '',
      备注: '',
      unique_id: '',
      更新时间: ''
    },

    空的生产单结构: {
      unique_id: '',
      完成百分比: 0,
      对应订单: {
        // tags: {},
        // unique_id: '',
        // 订单编号: '',
        // 客户信息: '',
        // 上传图片列表: [],
        // 订单日期: '',
        // 交货日期: '',
        // 订单备注: ''
      },
      排产产品: {
        产品信息: {},
        排产配码数量: {
          总排产数: 0,
          配码: [
            // {国标码: 220,尺码: 34,目标数量: 20}
          ]
        }
      },
      更新时间: '',
      生产单二维码: '',
      生产单备注: '',
      生产单工序信息: [
        // {
        //   员工计件: [],
        //   员工计件配码总计数:{
        //     总完成数: 0,
        //   },
        //   配码:[
        //     {尺码: 34, 国标码: 220, 目标数量: 20, 完成数量: 0}
        //     ......
        //   ],
        //   工序信息:{unique_id: "开料", 工序名称: "开料"},
        //   工序工资: 0,
        //   配码完成总计数:{
        //     总完成数: 0,
        //     配码:[
        //       {尺码: 34, 国标码: 220, 目标数量: 20, 完成数量: 0}
        //       ......
        //     ]
        //   }
        // }
      ],
      生产单时间: '',
      生产单状态: '', // 新生产单,生产中,完成,
      生产单编号: ''
    },

    空的产品结构: {
      tags: {
        // '楦型',
        // '款号',
        // .....
      },
      unique_id: '',
      产品图片列表: [],
      备注: '',
      产品编号: '',
      成本估算: '暂无',
      更新时间: '',
      部位详情: []
    },

    产品的空部位元素: {
      'unique_id': '',
      '部位名称': '',
      '物料数量': 0,
      '使用物料': {
        'unique_id': '',
        '物料编号': '',
        'tags': {},
        '单位': '',
        '参考市场单价': 0,
        '备注': '',
        '供应商列表': [],
        '所选供应商信息': {}
      }
    },

    物料的空的供应商信息: {
      供应商物料名称: '',
      供应商价格: 0,
      仓库剩余数量: 0,
      说明: '',
      unique_id: '',
      名称: '',
      更新时间: ''
    },

    空的物料结构: {
      unique_id: '',
      tags: {},
      物料编号: '',
      单位: '',
      对应产品列表: [],
      备注: '',
      供应商列表: [],
      供应商历史信息: [],
      仓库剩余数量: 0,
      更新时间: ''
    },

    物料的空的供应商信息: {
      供应商物料名称: '',
      供应商价格: 0,
      仓库剩余数量: 0,
      说明: '',
      unique_id: '',
      名称: '',
      更新时间: ''
    },

    空的供应商送货单: {
      "工厂unique_id": "",
      "供应商unique_id": "",
      "送货单位经手人手机": "",
      "供应商名称": "",
      "送货单": [
        // {
        //   "货号": "m测试",
        //   "名称及规格": "测试",
        //   "单位": "个",
        //   "数量": "1",
        //   "单价": "123",
        //   "总价格": "123",
        //   "备注": "None"
        // }
      ]
    },

    空的供应商送货单元素: {
      "货号": "",
      "名称及规格": "",
      "单位": "",
      "数量": 0,
      "单价": 0,
      "总价格": 0,
      "备注": ""
    },

    // 权限管理选项
    administrativePrivileges: [{
        title: '人员列表|添加新员工',
        isUnfold: true,
        permission: [{
            name: '查看人员列表|查看新人员列表',
            value: '人员管理列表可读',
            checked: false
          },
          {
            name: '添加，删除，编辑人员',
            value: '人员管理可写',
            checked: false
          }
        ]
      },
      {
        title: '权限管理',
        isUnfold: true,
        permission: [{
            name: '查看角色列表',
            value: '权限管理列表可读',
            checked: false
          },
          {
            name: '添加，删除，编辑角色',
            value: '权限管理可写',
            checked: false
          }
        ]
      },
      {
        title: '订单列表|添加新订单',
        isUnfold: true,
        permission: [{
            name: '查看订单列表及详情',
            value: '订单列表可读',
            checked: false
          },
          {
            name: '添加，删除，编辑订单',
            value: '订单管理可写',
            checked: false
          }
        ]
      },
      {
        title: '客户列表|添加新客户',
        isUnfold: true,
        permission: [{
            name: '查看客户列表及详情',
            value: '客户列表可读',
            checked: false
          },
          {
            name: '添加，删除，编辑客户',
            value: '客户管理可写',
            checked: false
          }
        ]
      },
      {
        title: '生产排产',
        isUnfold: true,
        permission: [{
            name: '查看待排产订单列表|查看生产单列表',
            value: '生产单列表可读',
            checked: false
          },
          {
            name: '点击进行排产，确认员工计件，合伙计件',
            value: '生产单详情可写',
            checked: false
          }
        ]
      },
      {
        title: '产品列表|添加新产品',
        isUnfold: true,
        permission: [{
            name: '查看产品列表及详情',
            value: '产品资料可读',
            checked: false
          },
          {
            name: '添加，删除，编辑产品',
            value: '产品资料可写',
            checked: false
          }
        ]
      },
      {
        title: '添加入库',
        isUnfold: true,
        permission: [{
            name: '查看入库事件及详情',
            value: '仓库入库可读',
            checked: false
          },
          {
            name: '手动入库，采购单入库',
            value: '仓库入库可写',
            checked: false
          }
        ]
      },
      {
        title: '添加出库',
        isUnfold: true,
        permission: [{
            name: '查看出库事件及详情',
            value: '仓库出库可读',
            checked: false
          },
          {
            name: '手动出库，生产单出库',
            value: '仓库出库可写',
            checked: false
          }
        ]
      },
      {
        title: '仓库报表',
        isUnfold: true,
        permission: [{
            name: '查看物料列表及详情',
            value: '仓库物料信息可读',
            checked: false
          },
          {
            name: '添加，删除，编辑物料',
            value: '仓库物料信息可写',
            checked: false
          }
        ]
      },
      {
        title: '员工工资',
        isUnfold: true,
        permission: [{
            name: '查看员工工资信息',
            value: '员工工资列表可读',
            checked: false
          },
          {
            name: '查看部门工资信息',
            value: '部门工资列表可读',
            checked: false
          },
          {
            name: '添加工资抵扣费用',
            value: '工资抵扣',
            checked: false
          },
        ]
      },
      {
        title: '供应商流水单',
        isUnfold: true,
        permission: [{
            name: '查看供应商流水单列表',
            value: '供应商流水单列表可读',
            checked: false
          },
          {
            name: '编辑货单(只允许编辑备注)',
            value: '编辑流水单',
            checked: false
          },
          {
            name: '确认送货单',
            value: '确认送货单',
            checked: false
          },
          {
            name: '确认退货单',
            value: '确认退货单',
            checked: false
          },
          {
            name: '添加退货单',
            value: '添加退货单',
            checked: false
          },
          {
            name: '作废退货单',
            value: '退货作废退货单',
            checked: false
          },
          {
            name: '确认作废退货单',
            value: '确认退货作废退货单',
            checked: false
          },
          {
            name: '添加现结单',
            value: '添加现结单',
            checked: false
          },
          {
            name: '结算现结单',
            value: '结算现结单',
            checked: false
          },
          {
            name: '作废现结单',
            value: '作废现结单',
            checked: false
          }
        ]
      },
      {
        title: '订单结算',
        isUnfold: true,
        permission: [{
            name: '查看订单结算列表',
            value: '订单结算列表可读',
            checked: false
          },
          {
            name: '编辑，提交订单',
            value: '订单结算管理可写',
            checked: false
          }
        ]
      },
      {
        title: '采购单列表|添加采购单',
        isUnfold: true,
        permission: [{
          name: '查看采购单列表及详情',
          value: '采购单列表可读',
          checked: false
        }, {
          name: '添加，删除，编辑采购单',
          value: '采购单详情可写',
          checked: false
        }]
      },
      {
        title: '供应商管理',
        isUnfold: true,
        permission: [{
          name: '查看供应商列表及报价单',
          value: '供应商信息可读',
          checked: false
        }, {
          name: '添加供应商/删除',
          value: '供应商信息可写',
          checked: false
        }]
      },
      {
        title: '数据看板',
        isUnfold: true,
        permission: [{
            name: '查看员工自身工资',
            value: '员工自身工资可读',
            checked: false
          }, {
            name: '查看部门统计',
            value: '部门统计可读',
            checked: false
          }, {
            name: '查看收益柱状图',
            value: '收益统计可读',
            checked: false
          }, {
            name: '查看生产订单模块',
            value: '生产订单统计可读',
            checked: false
          }, {
            name: '查看销售订单模块',
            value: '销售订单统计可读',
            checked: false
          }, {
            name: '查看本月热销产品',
            value: '本月热销产品统计可读',
            checked: false
          },
          {
            name: '查看客户统计模块',
            value: '客户统计可读',
            checked: false
          },
          {
            name: '查看采购供应模块',
            value: '采购供应统计可读',
            checked: false
          },

          {
            name: '查看供应商结算模块',
            value: '供应商结算统计可读',
            checked: false
          }
          // {
          //   name: '查看仓库统计模块',
          //   value: '仓库统计可读',
          //   checked: false
          // },
          // {
          //   name: '查看出入库统计模块',
          //   value: '出入库统计可读',
          //   checked: false
          // }
        ]
      },
    ],

    /**************************************************************************** */

    //当前选中的生产单详情信息
    productionOrderDetails: {},

    //在生产单详情页选中的工序名称
    processName: 0,

    // 条件查询回来的生产单列表
    productNoteList: [],

    //条件查询回来的条件
    searchCondition: {},
    // 是否是从搜索页面跳转过来的
    isItAJumpFromTheSearchPage: false,

    // 在数据看板页选中的工序部门名称
    processDepartmentName: '',
    // 在数据看板页组合出来的部门统计列表
    processDepartmentList: [],

    // 当前操作的员工对象
    curOperationStaffObj: {},
    // 查询回来的用户列表
    staffListFromQuery: [],

    //当前选中的订单详情信息
    orderDetails: {},
    //条件查询回来的订单列表
    orderList: [],

    // 当前选中的客户详情信息
    clientDetails: {},
    //条件查询回来的客户列表
    clientList: [],

    //当前选中的产品详情信息
    productDetails: {},
    //条件查询回来的产品列表
    productList: [],

    //当前选中的采购单详情信息
    purchaseDetails: {},
    //条件查询回来的采购单列表
    purchaseList: [],

    // 当前选中的物料详情信息
    materialDetails: {},
    // 条件查询回来的物料列表
    materialList: [],

    // 条件查询回来的出入库人列表
    warehouseEventList: [],

    // 当前进行操作的角色
    curOperationRole: {},
    //条件查询回来的订单结算列表
    orderSettlementList: [],

    // 当前选中的送货单信息
    deliverNoteDetails: {},

    // 员工确认几件记录
    productionOrderList: [],

    // 出入库item详情信息
    importAndExportDetailInfo: {},
    // 微信扫码的带过来的参数
    query: null
  }
})