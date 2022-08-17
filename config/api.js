
const app = getApp();
const server = app.globalData.server

export default {
  customer: {
    //获取客户标签配置
    get_client_tag_names: {
      url: server + 'client/get_client_tag_names',
      method: 'post'
    },
    //客户标签自动补全
    client_tags_auto_complete: {
      url: server + 'client/client_tags_auto_complete',
      method: 'post'
    },
    // 添加客户信息
    add_client: {
      url: server + 'client/add_client',
      method: 'post'
    },
    // 条件查询客户信息
    filter_client: {
      url: server + 'client/filter_client',
      method: 'post'
    },
    // 删除客户信息
    delete_client_by_id: {
      url: server + 'client/delete_client_by_id',
      method: 'post'
    },
    // 修改客户信息
    edit_client_by_id: {
      url: server + 'client/edit_client_by_id',
      method: 'post'
    },
  },
  loginAndLogoutTool: {
    //获取手机验证码
    request_verification_message: {
      url: server + 'verification_token/request_verification_message',
      method: 'post'
    },
    //验证验证码信息(登录)
    check_verification_message: {
      url: server + 'verification_token/check_verification_message',
      method: 'post'
    },
    //提示用户是否申请激活账户，如申请，请求账户激活接口
    send_account_activation_request: {
      url: server + 'verification_token/send_account_activation_request',
      method: 'post'
    },
    //生成token（对手机号，验证码，进行检查）
    generate_login_token: {
      url: server + 'verification_token/generate_login_token',
      method: 'post'
    },
    //登陆后绑定企业信息
    bind_company_after_login: {
      url: server + 'verification_token/bind_company_after_login',
      method: 'post'
    },
    //获取用户信息
    get_user_info_by_login_token: {
      url: server + 'verification_token/get_user_info_by_login_token',
      method: 'post'
    },
    //更新企业列表接口
    get_company_list_by_login_token: {
      url: server + 'verification_token/get_company_list_by_login_token',
      method: 'post'
    },
    //使用微信login_code生成login-token
    wx_login:{
      url: server + 'verification_token/wx_login',
      method: 'post'
    },
    // 微信登录生成token
    generate_login_token_by_wx_encrypted_data:{
      url: server + 'verification_token/generate_login_token_by_wx_encrypted_data',
      method: 'post'
    },
    // 小程序端扫码确认登录
    confirm_login_by_qrcode_token:{
      url: server + 'verification_token/confirm_login_by_qrcode_token',
      method: 'post'
    }

  },
  maintenanceOfProcessPartsOfProductLibrary: {
    //获取产品标签信息
    get_product_tag_names: {
      url: server + 'product/get_product_tag_names',
      method: 'post'
    },
    //产品标签自动补全
    product_tags_auto_complete: {
      url: server + 'product/product_tags_auto_complete',
      method: 'post'
    },
    // 条件查询产品信息
    filter_product: {
      url: server + 'product/filter_product',
      method: 'post'
    },
    // 删除产品
    delete_product_by_id: {
      url: server + 'product/delete_product_by_id',
      method: 'post'
    },
    // 条件查询工序信息
    filter_process: {
      url: server + 'process/filter_process',
      method: 'post'
    },
    // 条件查询部位信息
    filter_component: {
      url: server + 'component/filter_component',
      method: 'post'
    },
    // 修改产品信息
    edit_product_by_id: {
      url: server + 'product/edit_product_by_id',
      method: 'post'
    },
    // 添加产品信息
    add_product: {
      url: server + 'product/add_product',
      method: 'post'
    },
    // 添加工序信息
    add_process: {
      url: server + 'process/add_process',
      method: 'post'
    },
    // 提高工序排名
    increase_process_by_id: {
      url: server + 'process/increase_process_by_id',
      method: 'post'
    },
    // 降低工序排名
    decrease_process_by_id: {
      url: server + 'process/decrease_process_by_id',
      method: 'post'
    },
    // 删除工序信息
    delete_process_by_id: {
      url: server + 'process/delete_process_by_id',
      method: 'post'
    },
    // 添加部位信息
    add_component: {
      url: server + 'component/add_component',
      method: 'post'
    },
    // 删除部位信息
    delete_component_by_id: {
      url: server + 'component/delete_component_by_id',
      method: 'post'
    },
    // 提高部位排名
    increase_component_by_id: {
      url: server + 'component/increase_component_by_id',
      method: 'post'
    },
    // 降低部位排名
    decrease_component_by_id: {
      url: server + 'component/decrease_component_by_id',
      method: 'post'
    },
    //获得产品信息详情
    get_product_by_id: {
      url: server + 'product/get_product_by_id',
      method: 'post'
    },
    //返回给该供应商送货单中的产品名称
    get_supplier_goods: {
      url: server + 'product/get_supplier_goods',
      method: 'post'
    },
    //获得企业对应供应商的产品的价格
    get_supplier_goods_price: {
      url: server + 'product/get_supplier_goods_price',
      method: 'post'
    },
  },
  operationLogManagement: {
    //获取某条日志操作记录详情
    get_operation_log_by_id: {
      url: server + 'operation_log/get_operation_log_by_id',
      method: 'post'
    },
    //获取所有操作记录日志
    filter_operation_log: {
      url: server + 'operation_log/filter_operation_log',
      method: 'post'
    },
  },
  ordersForProductionScheduling: {
    //获取订单标签配置
    get_order_tag_names: {
      url: server + 'order/get_order_tag_names',
      method: 'post'
    },
    //订单标签自动补全
    order_tags_auto_complete: {
      url: server + 'order/order_tags_auto_complete',
      method: 'post'
    },
    //添加订单
    add_order: {
      url: server + 'order/add_order',
      method: 'post'
    },
    //修改订单
    edit_order_by_id: {
      url: server + 'order/edit_order_by_id',
      method: 'post'
    },
    //条件查询订单
    filter_order: {
      url: server + 'order/filter_order',
      method: 'post'
    },
    //删除订单
    delete_order_by_id: {
      url: server + 'order/delete_order_by_id',
      method: 'post'
    },
    //获取订单详情
    get_order_by_id: {
      url: server + 'order/get_order_by_id',
      method: 'post'
    },
    //添加生产单
    add_production_note: {
      url: server + 'production_note/add_production_note',
      method: 'post'
    },
    //获取生产单详情
    get_production_note_by_id: {
      url: server + 'production_note/get_production_note_by_id',
      method: 'post'
    },
    //条件查询生产单
    filter_production_note: {
      url: server + 'production_note/filter_production_note',
      method: 'post'
    },
    //删除生产单
    delete_production_note_by_id: {
      url: server + 'production_note/delete_production_note_by_id',
      method: 'post'
    },
    //强行完成一个生产单
    finish_production_note_by_id: {
      url: server + 'production_note/finish_production_note_by_id',
      method: 'post'
    },
    //取回进行中的生产单及其生产情况（生产进度管理页面使用）
    list_ongoing_production_notes: {
      url: server + 'production_control/list_ongoing_production_notes',
      method: 'post'
    },
    //获取配码配置信息
    get_size_config_info: {
      url: server + 'order/get_size_config_info',
      method: 'post'
    },
    //获取生产单打印配置信息
    get_production_note_print_config_info: {
      url: server + 'production_note/get_production_note_print_config_info',
      method: 'post'
    },
    //编辑生产单
    edit_production_note_by_id: {
      url: server + 'production_note/edit_production_note_by_id',
      method: 'post'
    },
    //管理员通过员工的unique_id获得他的工资统计和计件记录
    manager_get_staff_salary_stats_by_unique_id: {
      url: server + 'production_control/manager_get_staff_salary_stats_by_unique_id',
      method: 'post'
    },
    //指定时间 生成工资结算excel表格 给管理人员显示的统计数据和详细数据
    generate_salary_list_for_process_by_time_range: {
      url: server + 'finance/generate_salary_list_for_process_by_time_range',
      method: 'post'
    },
    // 批量修改多个生产单的工序工资
    batch_edit_production_note_process_salary_by_ids: {
      url: server + 'production_note/batch_edit_production_note_process_salary_by_ids',
      method: 'post'
    },
    // 生成所有订单产品的excel数据
    generate_order_list_for_excel: {
      url: server + 'order/generate_order_list_for_excel',
      method: 'post'
    },
    //条件查询用于结算的条目
    order_settle_filter_items: {
      url: server + 'order/order_settle_filter_items',
      method: 'post'
    },
    // 条件查询用于结算统计
    order_settle_stats:{
      url: server + 'order/order_settle_stats',
      method: 'post'
    },
    // 订单的结算状态修改
    order_settle_edit: {
      url: server + 'order/order_settle_edit',
      method: 'post'
    },
    // 管理员获取同批次生产单
    get_same_batches_production_note_by_unique_id: {
      url: server + 'production_note/get_same_batches_production_note_by_unique_id',
      method: 'post'
    },
    // 员工获取同批次生产单记录的接口
    get_same_batches_production_note_by_unique_id_for_staff: {
      url: server + 'production_note/get_same_batches_production_note_by_unique_id_for_staff',
      method: 'post'
    },
    // 获取一批生产单总的工序计件信息
    get_production_notes_process: {
      url: server + 'production_note/get_production_notes_process',
      method: 'post'
    },

    // 员工 获取一批生产单总的工序计件信息
    get_production_notes_process_for_staff:{
      url: server + 'production_note/get_production_notes_process_for_staff',
      method: 'post'
    },

    // 获取同一批次下某工序汇总详情页（管理员调用）
    get_sum_process_detail: {
      url: server + 'production_note/get_sum_process_detail',
      method: 'post'
    },
    // 获取同一批次下某工序汇总详情页（员工调用）
    get_sum_process_detail_for_staff: {
      url: server + 'production_note/get_sum_process_detail_for_staff',
      method: 'post'
    },
    // 获取需要确认的员工计件记录
    production_control_filter_unconfirmed_staff_record: {
      url: server + 'production_control/filter_unconfirmed_staff_record',
      method: 'post'
    },
    // 管理人员批量确认员工计件
    production_control_batch_manager_confirm_staff_record: {
      url: server + 'production_control/batch_manager_confirm_staff_record',
      method: 'post'
    },
    // 获取所有需要确认的员工计件记录
    all_unconfirmed_staff_record: {
      url: server + 'production_control/all_unconfirmed_staff_record',
      method: 'post'
    },
    // 条件查询代排产的订单
    filter_need_schedule_order:{
      url: server + 'order/filter_need_schedule_order',
      method: 'post'
    },
    // 通过产品信息匹配最近此产品的结算信息
    match_recent_product_settle_info_by_product_info: {
      url: server + 'order/match_recent_product_settle_info_by_product_info',
      method: 'post'
    },
    // 重新评估一个生产单
    review_production_note_by_id: {
      url: server + 'production_note/review_production_note_by_id',
      method: 'post'
    }
  },
  //其他工具类
  otherUtilityClasses: {
    //生存年月日序列号
    generate_year_month_sequence_number: {
      url: server + 'utils/generate_year_month_sequence_number',
      method: 'post'
    },
    // 上传图片/附件
    upload_file: {
      url: server + 'utils/upload_file'
    },
  },
  personnelAndAuthorityManagement: {
    // 获取自身权限
    get_role_authority_by_id: {
      url: server + 'role_authority/get_role_authority_by_id',
      method: 'post'
    },
    // 通过id获取用户信息
    get_user_by_id: {
      url: server + 'user/get_user_by_id',
      method: 'post'
    },
    // 添加员工
    add_user: {
      url: server + 'user/add_user',
      method: 'post'
    },
    // 通过id编辑员工
    edit_user_by_id: {
      url: server + 'user/edit_user_by_id',
      method: 'post'
    },
    // 条件查询管理角色
    filter_role_authority: {
      url: server + 'role_authority/filter_role_authority',
      method: 'post'
    },
    // 条件查询管理角色
    edit_role_authority_by_id: {
      url: server + 'role_authority/edit_role_authority_by_id',
      method: 'post'
    },
    // 添加角色
    add_role_authority: {
      url: server + 'role_authority/add_role_authority',
      method: 'post'
    },
    // delete角色
    delete_role_authority_by_id: {
      url: server + 'role_authority/delete_role_authority_by_id',
      method: 'post'
    },
    // 条件查询人员信息
    filter_user: {
      url: server + 'user/filter_user',
      method: 'post'
    },
    //通过公司名查询管理角色
    get_role_authority_names: {
      url: server + 'role_authority/get_role_authority_names',
      method: 'post'
    },
    // 员工注册
    add_user_unconfirmed: {
      url: server + 'user/add_user_unconfirmed',
      method: 'post'
    },
    // 条件查询人员信息
    filter_user: {
      url: server + 'user/filter_user',
      method: 'post'
    },
    // 删除人员信息
    delete_user_by_id: {
      url: server + 'user/delete_user_by_id',
      method: 'post'
    },



  },
  scheduleManagement: {
    // 为管理人员计件接口生产输入数据
    generate_manager_record_count_input: {
      url: server + 'production_control/generate_manager_record_count_input',
      method: 'post'
    },
    //管理员计件接口
    manager_record_count: {
      url: server + 'production_control/manager_record_count',
      method: 'post'
    },
    //管理人员确认员工计件
    manager_confirm_staff_record: {
      url: server + 'production_control/manager_confirm_staff_record',
      method: 'post'
    },
    // 通过提交排产产品信息 获取排产产品工序最近的对应信息缓存信息 用于自动填充
    match_recent_production_note_process_info_by_product_info: {
      url: server + 'production_note/match_recent_production_note_process_info_by_product_info',
      method: 'post'
    },
    //指定时间 员工获得他的工资统计信息
    staff_get_salary_stats: {
      url: server + 'finance/staff_get_salary_stats',
      method: 'post'
    },
    //指定时间 员工获得他的工资记录信息
    staff_get_salary_records: {
      url: server + 'finance/staff_get_salary_records',
      method: 'post'
    },
    // 员工获得本月/昨日/今天的工资小结
    staff_get_recent_salary_summary: {
      url: server + 'finance/staff_get_recent_salary_summary',
      method: 'post'
    },
    // 获取某员工所在各部门列表
    staff_get_process_summary_stats: {
      url: server + 'production_control/staff_get_process_summary_stats',
      method: 'post'
    },
    // 获取某员工在指定时间内部门工资详情统计
    staff_get_process_summary_detail_by_process_id: {
      url: server + 'production_control/staff_get_process_summary_detail_by_process_id',
      method: 'post'
    },
    // 管理员获取自己所管理的部门工序统计信息
    mananger_get_process_summary_stats: {
      url: server + 'production_control/mananger_get_process_summary_stats',
      method: 'post'
    },
    // 管理员获得自己所确认的部门的工资详细信息
    manager_get_process_summary_detail: {
      url: server + 'production_control/manager_get_process_summary_detail',
      method: 'post'
    },
    //员工计件接口
    staff_record_count: {
      url: server + 'production_control/staff_record_count',
      method: 'post'
    },
    //合伙计件接口
    partnership_record_count: {
      url: server + 'production_control/partnership_record_count',
      method: 'post'
    },

    //管理人员批量确认员工计件
    batch_manager_confirm_staff_record: {
      url: server + 'production_control/batch_manager_confirm_staff_record',
      method: 'post'
    },
    // 员工录入同批次生产单数据
    staff_record_count_same_group: {
      url: server + 'production_control/staff_record_count_same_group',
      method: 'post'
    },
  },
  supplier: {
    // 获取供应商标签配置
    get_supplier_tag_names: {
      url: server + 'supplier/get_supplier_tag_names',
      method: 'post'
    },
    // 供应商标签自动补全
    supplier_tags_auto_complete: {
      url: server + 'supplier/supplier_tags_auto_complete',
      method: 'post'
    },
    // 条件查询供应商信息
    filter_supplier: {
      url: server + 'supplier/filter_supplier',
      method: 'post'
    },
    // 查询系统内所有的供应商
    filter_suplier_all: {
      url: server + 'supplier/filter_suplier_all',
      method: 'post'
    },
    // 通过关键字匹配并检测6条供应商信息列表
    check_supplier_info_by_key_word: {
      url: server + 'supplier/check_supplier_info_by_key_word',
      method: 'post'
    },
    // 为产品的物料选择供应商，提供名字直接补全
    auto_complete_supplier_for_product_material: {
      url: server + 'supplier/auto_complete_supplier_for_product_material',
      method: 'post'
    },
    // 添加供应商
    add_supplier: {
      url: server + 'supplier/add_supplier',
      method: 'post'
    },
    // 编辑供应商信息
    edit_supplier_by_id: {
      url: server + 'supplier/edit_supplier_by_id',
      method: 'post'
    },
    // 删除供应商信息
    delete_supplier_by_id: {
      url: server + 'supplier/delete_supplier_by_id',
      method: 'post'
    },
    // 条件查询供应商报价单
    filter_supplier_quotations: {
      url: server + 'supplier/filter_supplier_quotations',
      method: 'post'
    },
    // 获取供应商送货单录入微信跳转二维码
    generate_wx_qr_code: {
      url: server + 'supplier/generate_wx_qr_code',
      method: 'post'
    },
    // 条件查询供应商送货单
    filter_supplier_transactions: {
      url: server + 'supplier/filter_supplier_transactions',
      method: 'post'
    },
    // 通过关键字匹配N条最新添加的供应商送货单信息
    get_supplier_transaction_info_by_key_word: {
      url: server + 'supplier/get_supplier_transaction_info_by_key_word',
      method: 'post'
    },
    // 删除作废供应商送货单
    delete_supplier_transaction_by_id: {
      url: server + 'supplier/delete_supplier_transaction_by_id',
      method: 'post'
    },
    // 确认供应商送货单
    confirm_supplier_transaction_by_id: {
      url: server + 'supplier/confirm_supplier_transaction_by_id',
      method: 'post'
    },
    // 结算供应商货单
    settle_supplier_transaction_by_id: {
      url: server + 'supplier/settle_supplier_transaction_by_id',
      method: 'post'
    },
    // 修改供应商送货单
    edit_supplier_transaction_by_id: {
      url: server + 'supplier/edit_supplier_transaction_by_id',
      method: 'post'
    },
    // 批量确认供应商货单信息
    batch_confirm_supplier_transaction_by_ids: {
      url: server + 'supplier/batch_confirm_supplier_transaction_by_ids',
      method: 'post'
    },
    // 批量结算货单信息
    batch_settle_supplier_transaction_by_ids: {
      url: server + 'supplier/batch_settle_supplier_transaction_by_ids',
      method: 'post'
    },
    // 工厂端 通过关键字获取该匹配某一供应商最新的6条报价单信息
    get_supplier_quotation_info_by_key_word: {
      url: server + 'supplier/get_supplier_quotation_info_by_key_word',
      method: 'post'
    },
    // 工厂端添加现结单
    add_cash_supplier_transaction: {
      url: server + 'supplier/add_cash_supplier_transaction',
      method: 'post'
    },
    // 工厂端结算现结单
    settle_cash_supplier_transaction: {
      url: server + 'supplier/settle_cash_supplier_transaction',
      method: 'post'
    },
    // 工厂端作废现结单
    delete_cash_supplier_transaction_by_id: {
      url: server + 'supplier/delete_cash_supplier_transaction_by_id',
      method: 'post'
    },
    // 工厂生成关联二维码
    generate_unified_match_qr_code: {
      url: server + 'supplier/generate_unified_match_qr_code',
      method: 'post'
    },
    // 工厂关联供应商
    relate_company_to_supplier: {
      url: server + 'supplier/relate_company_to_supplier',
      method: 'post'
    }
  },
  theFinancialManagement: {
    // 通过生产单获取人员工资列表
    generate_salary_list_by_production_note_unique_ids: {
      url: server + 'finance/generate_salary_list_by_production_note_unique_ids',
      method: 'post'
    },
    // 通过采购单获取供应商应付价格
    generate_supplier_settlement_by_purchase_note_unique_ids: {
      url: server + 'finance/generate_supplier_settlement_by_purchase_note_unique_ids',
      method: 'post'
    },
    // 指定时间 生成工资结算在网页端或者小程序端给管理人员显示的统计数据和详细数据
    generate_salary_list_for_frontend_by_time_range: {
      url: server + 'finance/generate_salary_list_for_frontend_by_time_range',
      method: 'post'
    },
    // 指定时间 生成工资结算excel表格 给管理人员显示的统计数据和详细数据
    generate_salary_list_for_excel_by_time_range: {
      url: server + 'finance/generate_salary_list_for_excel_by_time_range',
      method: 'post'
    }
  },
  warehouseProcurement: {
    // 获取物料标签配置
    get_material_tag_names: {
      url: server + 'warehouse/get_material_tag_names',
      method: 'post'
    },
    // 物料标签自动补全
    material_tags_auto_complete: {
      url: server + 'warehouse/material_tags_auto_complete',
      method: 'post'
    },
    // 条件查询物料库存
    filter_warehouse_material: {
      url: server + 'warehouse/filter_warehouse_material',
      method: 'post'
    },
    // 添加物料库存信息
    add_warehouse_matetial: {
      url: server + 'warehouse/add_warehouse_matetial',
      method: 'post'
    },
    // 修改物料库存信息
    edit_warehouse_material_by_id: {
      url: server + 'warehouse/edit_warehouse_material_by_id',
      method: 'post'
    },
    // 提交入库事件
    inventory_change_via_operation: {
      url: server + 'warehouse/inventory_change_via_operation',
      method: 'post'
    },
    // 删除物料库存信息
    delete_warehouse_material_by_id: {
      url: server + 'warehouse/delete_warehouse_material_by_id',
      method: 'post'
    },
    // 条件查询库存操作事件记录
    filter_warehouse_material_event: {
      url: server + 'warehouse/filter_warehouse_material_event',
      method: 'post'
    },
    // 删除物料操作事件记录
    delete_warehouse_material_event_by_id: {
      url: server + 'warehouse/delete_warehouse_material_event_by_id',
      method: 'post'
    },
    // 获取物料库存信息详情
    get_warehouse_material_by_id: {
      url: server + 'warehouse/get_warehouse_material_by_id',
      method: 'post'
    },
    // 根据采购单生成入库API的输入值
    generate_enter_inventory_by_purchase_note: {
      url: server + 'warehouse/generate_enter_inventory_by_purchase_note',
      method: 'post'
    },
    // 条件查询采购单
    filter_purchase_note: {
      url: server + 'warehouse/filter_purchase_note',
      method: 'post'
    },
    // 修改采购单
    edit_purchase_note_by_id: {
      url: server + 'warehouse/edit_purchase_note_by_id',
      method: 'post'
    },
    // 根据生产单生成出库API的输入值
    generate_exit_inventory_by_product_note: {
      url: server + 'warehouse/generate_exit_inventory_by_product_note',
      method: 'post'
    },
    // 添加采购单
    add_purchase_note: {
      url: server + 'warehouse/add_purchase_note',
      method: 'post'
    },
    // 删除采购单
    delete_purchase_note: {
      url: server + 'warehouse/delete_purchase_note_by_id',
      method: 'post'
    },
    // 采购单详情
    detail_purchase_note: {
      url: server + 'warehouse/get_purchase_note_by_id',
      method: 'post'
    },
    // 通过未排产订单列表生成“添加采购单”的API输入
    generate_purchase_note_input_by_order_list: {
      url: server + 'warehouse/generate_purchase_note_input_by_order_list',
      method: 'post'
    },
  },
  // 没有地方用到这俩接口
  supplierDeliveryInformation: {
    // 获取供应商名称列表
    filter_supplier_info: {
      url: server + 'supplier_transactions/filter_supplier_info',
      method: 'post'
    },
    // 添加新的供应商送货单
    add_supplier_transaction: {
      url: server + 'supplier_transactions/add_supplier_transaction',
      method: 'post'
    }
  },
  returnSupplierGoods: {
    // 返回可以退回的商品
    warehouse_return_goods_list: {
      url: server + 'supplier/return_goods_list',
      method: 'post'
    },
    // 生成退货单
    warehouse_add_return_goods_note: {
      url: server + 'supplier/add_return_goods_note',
      method: 'post'
    },
    // 确认退货单
    warehouse_confirm_refund_transaction_by_id: {
      url: server + 'supplier/confirm_refund_transaction_by_id',
      method: 'post'
    },
    // 作废退货单
    warehouse_delete_refund_transaction_by_id: {
      url: server + 'supplier/delete_refund_transaction_by_id',
      method: 'post'
    },
  },
  statisticsData: {
    // 获取日收益
    statistics_data_get_day_profits: {
      url: server + 'statistics_data/get_day_profits',
      method: 'post'
    },
    // 获取月收益
    statistics_data_get_month_profits: {
      url: server + 'statistics_data/get_month_profits',
      method: 'post'
    },
    // 获取年收益
    statistics_data_get_year_profits: {
      url: server + 'statistics_data/get_year_profits',
      method: 'post'
    },
    // 工资支出
    statistics_data_get_salary_cost: {
      url: server + 'statistics_data/get_salary_cost',
      method: 'post'
    },
    // 销售订单数据
    statistics_data_get_order_data: {
      url: server + 'statistics_data/get_order_data',
      method: 'post'
    },
    // 生产订单api
    statistics_data_get_product_note: {
      url: server + 'statistics_data/get_product_note',
      method: 'post'
    },
    // 本月热销产品
    statistics_data_get_month_sell_products: {
      url: server + 'statistics_data/get_month_sell_products',
      method: 'post'
    },
    // 客户统计
    statistics_data_get_month_customer_data: {
      url: server + 'statistics_data/get_month_customer_data',
      method: 'post'
    },
    // 日采购供应数据
    statistics_data_get_day_supplier_purchases: {
      url: server + 'statistics_data/get_day_supplier_purchases',
      method: 'post'
    },
    // 近半年来采购供应数据
    statistics_data_get_month_supplier_purchases: {
      url: server + 'statistics_data/get_month_supplier_purchases',
      method: 'post'
    },
    // 日仓库统计
    statistics_data_get_day_warehouse_statistics: {
      url: server + 'statistics_data/get_day_warehouse_statistics',
      method: 'post'
    },
    // 日出入库统计
    statistics_data_get_day_in_out_warehouse_statistics: {
      url: server + 'statistics_data/get_day_in_out_warehouse_statistics',
      method: 'post'
    },
    // 月供应商结算
    statistics_data_get_month_supplier_statements: {
      url: server + 'statistics_data/get_month_supplier_statements',
      method: 'post'
    },

    // 月生产订单api(近半年)
    statistics_data_get_month_product_note: {
      url: server + 'statistics_data/get_month_product_note',
      method: 'post'
    },
    // 年生产订单api(近两年)
    statistics_data_get_year_product_note: {
      url: server + 'statistics_data/get_year_product_note',
      method: 'post'
    },
    // 年销售订单(近两年)
    statistics_data_get_year_order_data: {
      url: server + 'statistics_data/get_year_order_data',
      method: 'post'
    },
    // 年采购单(近两年)
    statistics_data_get_years_supplier_purchases: {
      url: server + 'statistics_data/get_years_supplier_purchases',
      method: 'post'
    },
  },
  employeeDeductionInformation:{
    // 员工获取自己的工资抵扣统计信息
    staff_get_staff_costs_stats: {
      url: server + 'staff_costs/staff_get_staff_costs_stats',
      method: 'post'
    },
    // 员工条件查询自己的工资抵扣记录
    staff_filter_staff_costs:{
      url: server + 'staff_costs/staff_filter_staff_costs',
      method: 'post'
    },
    // 管理员条件查询所有人的工资抵扣记录
    manager_filter_staff_costs:{
      url: server + 'staff_costs/manager_filter_staff_costs',
      method: 'post'
    },
    // 管理员添加员工抵扣信息
    manager_add_staff_costs:{
      url: server + 'staff_costs/manager_add_staff_costs',
      method: 'post'
    },
    // 作废员工工资抵扣信息
    manager_delete_staff_costs_by_unique_id: {
      url: server + 'staff_costs/manager_delete_staff_costs_by_unique_id',
      method: 'post'
    },

  }
}