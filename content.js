(function () {
  if (window.__RACN_LOADED__) return;
  window.__RACN_LOADED__ = true;

  const ROOT_ID = "racn-root";
  const STORAGE_KEY = "resumeAutofillCn.resumeData";
  const SAMPLE_FILE = "sample-structured-resume-cn.json";
  const CUSTOM_META_KEY = "_customFieldMeta";
  const HIGH_CONFIDENCE_SCORE = 18;

  const GROUP_LABELS = {
    "基本信息": "基本信息",
    "教育经历": "教育经历",
    "求职意向": "求职意向",
    "实习经历": "实习经历",
    "项目经验": "项目经验",
    "社会实践/校内活动": "社会实践/校内活动",
    "专利发表": "专利发表",
    "论文发表": "论文发表",
    "奖励荣誉": "奖励荣誉",
    "技能/爱好": "技能/爱好",
    "家庭关系": "家庭关系",
    "自我评价": "自我评价",
    personalInformation: "个人信息",
    workDescription: "求职信息",
    socialPracticeActivities: "社会实践",
    patentPublications: "专利出版",
    academicPaperPublications: "论文发表",
    skillsAndHobbies: "技能证书",
    awardsAndHonors: "奖励荣誉",
    familyRelations: "家庭关系",
    educationExperience: "教育经历",
  };

  const ARRAY_NAME_FIELDS = {
    "教育经历": ["学校名称", "学历", "专业名称"],
    "实习经历": ["企业名称", "职位名称"],
    "项目经验": ["项目名称", "项目职务"],
    "社会实践/校内活动": ["活动名称", "职务"],
    "专利发表": ["专利名称", "专利类型"],
    "论文发表": ["论文名称", "期刊或会议名称"],
    "奖励荣誉": ["奖励名称", "奖励级别"],
    "家庭关系": ["关系", "姓名"],
    socialPracticeActivities: ["activityName", "organization", "role"],
    patentPublications: ["title", "patentName", "publicationName", "name"],
    academicPaperPublications: ["title", "journalOrConferenceName"],
    awardsAndHonors: ["awardName", "awardLevel"],
    familyRelations: ["relationship", "name"],
    educationExperience: ["schoolName", "educationLevel", "major"],
  };

  const FIELD_META = {
    "personalInformation.name": {
      label: "姓名",
      aliases: ["姓名", "名字", "真实姓名", "中文姓名", "应聘者姓名"],
    },
    "personalInformation.idNumber": {
      label: "身份证号",
      aliases: ["身份证号", "身份证号码", "证件号码", "证件号", "居民身份证", "身份证"],
    },
    "personalInformation.gender": {
      label: "性别",
      aliases: ["性别"],
    },
    "personalInformation.ethnicity": {
      label: "民族",
      aliases: ["民族"],
    },
    "personalInformation.politicalStatus": {
      label: "政治面貌",
      aliases: ["政治面貌", "政治身份", "党员", "党派"],
    },
    "personalInformation.hukouLocation.full": {
      label: "户口所在地",
      aliases: ["户口所在地", "户籍所在地", "户口地址", "户籍地址", "户口"],
    },
    "personalInformation.hukouLocation.province": {
      label: "户口所在地省份",
      aliases: ["户籍省份", "户口省份", "户口所在地省", "户籍所在地省", "户籍所在省"],
    },
    "personalInformation.hukouLocation.city": {
      label: "户口所在地城市",
      aliases: ["户籍城市", "户口城市", "户口所在地市", "户籍所在地市", "户籍所在市"],
    },
    "personalInformation.collegeLocation.full": {
      label: "院校所在地",
      aliases: ["院校所在地", "学校所在地", "高校所在地", "毕业院校所在地"],
    },
    "personalInformation.collegeLocation.province": {
      label: "院校所在地省份",
      aliases: ["院校所在省", "学校所在省", "高校所在省", "毕业院校省份"],
    },
    "personalInformation.collegeLocation.city": {
      label: "院校所在地城市",
      aliases: ["院校所在市", "学校所在市", "高校所在市", "毕业院校城市"],
    },
    "personalInformation.graduationDate": {
      label: "毕业日期",
      aliases: ["毕业日期", "毕业时间", "毕业年月", "预计毕业时间", "预计毕业日期"],
    },
    "personalInformation.mobilePhone": {
      label: "手机号",
      aliases: ["手机号", "手机号码", "联系电话", "联系手机", "移动电话", "电话"],
    },
    "personalInformation.email": {
      label: "邮箱",
      aliases: ["邮箱", "电子邮箱", "邮件", "email", "e-mail"],
    },
    "personalInformation.emergencyContactName": {
      label: "紧急联系人姓名",
      aliases: ["紧急联系人", "紧急联系人姓名", "应急联系人", "联系人姓名"],
    },
    "personalInformation.emergencyContactNumber": {
      label: "紧急联系人电话",
      aliases: ["紧急联系电话", "紧急联系人电话", "应急联系人电话", "联系人电话"],
    },
    "workDescription.expectedSalary": {
      label: "期望薪资",
      aliases: ["期望薪资", "薪资要求", "期望月薪", "期望年薪", "待遇要求"],
    },
    "workDescription.startDate": {
      label: "可入职日期",
      aliases: ["可入职时间", "到岗时间", "预计到岗时间", "入职日期", "开始工作时间"],
    },
    "socialPracticeActivities[].activityName": {
      label: "活动名称",
      aliases: ["社会实践名称", "实践名称", "活动名称", "项目名称"],
    },
    "socialPracticeActivities[].organization": {
      label: "组织单位",
      aliases: ["组织单位", "实践单位", "活动单位", "主办单位", "所在组织"],
    },
    "socialPracticeActivities[].role": {
      label: "担任角色",
      aliases: ["角色", "担任职务", "职务", "岗位", "职责"],
    },
    "socialPracticeActivities[].startDate": {
      label: "开始日期",
      aliases: ["开始时间", "开始日期", "起始时间"],
    },
    "socialPracticeActivities[].endDate": {
      label: "结束日期",
      aliases: ["结束时间", "结束日期", "截止时间"],
    },
    "socialPracticeActivities[].description": {
      label: "实践描述",
      aliases: ["实践描述", "活动描述", "经历描述", "主要内容", "工作内容"],
    },
    "academicPaperPublications[].title": {
      label: "论文题目",
      aliases: ["论文题目", "论文标题", "文章标题", "题目"],
    },
    "academicPaperPublications[].journalOrConferenceName": {
      label: "期刊/会议",
      aliases: ["期刊", "会议", "期刊会议", "发表刊物", "刊物名称", "会议名称"],
    },
    "academicPaperPublications[].level": {
      label: "论文级别",
      aliases: ["论文级别", "期刊级别", "收录级别", "级别"],
    },
    "academicPaperPublications[].authorRank": {
      label: "作者排名",
      aliases: ["作者排名", "作者顺序", "第几作者", "排名"],
    },
    "academicPaperPublications[].status": {
      label: "发表状态",
      aliases: ["发表状态", "录用状态", "状态"],
    },
    "skillsAndHobbies.englishLevel": {
      label: "英语水平",
      aliases: ["英语水平", "英语等级", "外语水平", "CET", "四六级"],
    },
    "skillsAndHobbies.otherLanguages": {
      label: "其他语言",
      aliases: ["其他语言", "第二外语", "外语语种", "小语种"],
    },
    "skillsAndHobbies.itSkills": {
      label: "IT 技能",
      aliases: ["IT技能", "计算机技能", "专业技能", "技能", "技术能力", "熟悉软件"],
    },
    "skillsAndHobbies.certificateName": {
      label: "证书名称",
      aliases: ["证书名称", "资格证书", "获得证书", "证书"],
    },
    "skillsAndHobbies.certificateLevel": {
      label: "证书等级",
      aliases: ["证书等级", "证书级别", "等级"],
    },
    "skillsAndHobbies.certificateDate": {
      label: "证书取得日期",
      aliases: ["证书日期", "取得日期", "获得时间", "发证时间"],
    },
    "awardsAndHonors[].awardName": {
      label: "奖项名称",
      aliases: ["奖项名称", "奖励名称", "荣誉名称", "获奖名称"],
    },
    "awardsAndHonors[].awardLevel": {
      label: "奖项级别",
      aliases: ["奖项级别", "奖励级别", "荣誉级别", "级别"],
    },
    "awardsAndHonors[].awardDate": {
      label: "获奖日期",
      aliases: ["获奖时间", "获奖日期", "奖励时间"],
    },
    "awardsAndHonors[].description": {
      label: "获奖说明",
      aliases: ["获奖说明", "奖励说明", "荣誉描述", "描述"],
    },
    "familyRelations[].name": {
      label: "家庭成员姓名",
      aliases: ["家庭成员姓名", "成员姓名", "亲属姓名", "姓名"],
    },
    "familyRelations[].relationship": {
      label: "关系",
      aliases: ["关系", "与本人关系", "家庭关系", "亲属关系"],
    },
    "familyRelations[].worksAtTelecomGroup": {
      label: "是否在电信集团工作",
      aliases: ["是否在电信集团工作", "电信集团", "是否中国电信", "亲属是否在本集团"],
    },
    "familyRelations[].workUnit": {
      label: "工作单位",
      aliases: ["工作单位", "所在单位", "任职单位", "单位名称"],
    },
    "familyRelations[].position": {
      label: "职务",
      aliases: ["职务", "岗位", "职位", "担任职务"],
    },
    "educationExperience[].enrollmentDate": {
      label: "入学日期",
      aliases: ["入学日期", "入学时间", "开始时间", "起始时间"],
    },
    "educationExperience[].graduationDate": {
      label: "毕业日期",
      aliases: ["毕业日期", "毕业时间", "结束时间"],
    },
    "educationExperience[].schoolName": {
      label: "学校名称",
      aliases: ["学校名称", "毕业院校", "院校名称", "学校", "高校名称"],
    },
    "educationExperience[].isHighestDegree": {
      label: "是否最高学历",
      aliases: ["是否最高学历", "最高学历", "最高学位"],
    },
    "educationExperience[].educationLevel": {
      label: "学历",
      aliases: ["学历", "学历层次", "教育程度", "最高学历"],
    },
    "educationExperience[].degreeTitle": {
      label: "学位",
      aliases: ["学位", "学位名称", "获得学位"],
    },
    "educationExperience[].duration": {
      label: "学制",
      aliases: ["学制", "培养年限", "学习年限"],
    },
    "educationExperience[].educationType": {
      label: "教育类型",
      aliases: ["教育类型", "培养方式", "学习形式", "学历类型"],
    },
    "educationExperience[].department": {
      label: "院系",
      aliases: ["院系", "学院", "所在院系", "院系名称"],
    },
    "educationExperience[].major": {
      label: "专业",
      aliases: ["专业", "专业名称", "所学专业"],
    },
  };

  const FIELD_KEY_META = {
    "姓名": { label: "姓名", aliases: ["姓名", "名字", "真实姓名", "中文姓名", "应聘者姓名"] },
    "证件类型": { label: "证件类型", aliases: ["证件类型", "证件类别", "身份证件类型"] },
    "证件号码": { label: "证件号码", aliases: ["证件号码", "证件号", "身份证号", "身份证号码", "居民身份证号码"] },
    "性别": { label: "性别", aliases: ["性别"] },
    "出生日期": { label: "出生日期", aliases: ["出生日期", "出生时间", "生日", "出生年月"] },
    "民族": { label: "民族", aliases: ["民族"] },
    "政治面貌": { label: "政治面貌", aliases: ["政治面貌", "政治身份", "党派", "党员"] },
    "籍贯": { label: "籍贯", aliases: ["籍贯", "祖籍"] },
    "健康状况": { label: "健康状况", aliases: ["健康状况", "身体状况"] },
    "高考生源地": { label: "高考生源地", aliases: ["高考生源地", "生源地", "考生生源地"] },
    "户口所在地": { label: "户口所在地", aliases: ["户口所在地", "户籍所在地", "户口地址", "户籍地址"] },
    "现居住城市": { label: "现居住城市", aliases: ["现居住城市", "现居地", "当前居住城市", "居住城市", "现住址"] },
    "就读院校所在城市": { label: "就读院校所在城市", aliases: ["就读院校所在城市", "学校所在城市", "院校所在城市", "高校所在城市"] },
    "是否为应届毕业生": { label: "是否为应届毕业生", aliases: ["是否为应届毕业生", "应届毕业生", "是否应届", "应届生"] },
    "毕业时间": { label: "毕业时间", aliases: ["毕业时间", "毕业日期", "预计毕业时间", "毕业年月"] },
    "是否有运营商实习经验": { label: "是否有运营商实习经验", aliases: ["是否有运营商实习经验", "运营商实习经验", "运营商经历"] },
    "是否接受岗位调剂": { label: "是否接受岗位调剂", aliases: ["是否接受岗位调剂", "接受岗位调剂", "是否服从调剂", "服从调剂"] },
    "移动电话": { label: "移动电话", aliases: ["移动电话", "手机号", "手机号码", "联系电话", "联系手机", "电话"] },
    "电子邮箱": { label: "电子邮箱", aliases: ["电子邮箱", "邮箱", "邮件", "email", "e-mail"] },
    "通信地址": { label: "通信地址", aliases: ["通信地址", "通讯地址", "联系地址", "现住址"] },
    "紧急联系人姓名": { label: "紧急联系人姓名", aliases: ["紧急联系人姓名", "紧急联系人", "应急联系人", "紧急联系人名字"] },
    "紧急联系方式": { label: "紧急联系方式", aliases: ["紧急联系方式", "紧急联系电话", "紧急联系人电话", "应急联系人电话"] },
    "个人照片": { label: "个人照片", aliases: ["个人照片", "证件照", "照片", "头像"] },
    "内推码": { label: "内推码", aliases: ["内推码", "推荐码", "内推编号", "推荐人编号"] },
    "入学时间": { label: "入学时间", aliases: ["入学时间", "入学日期", "开始时间", "起始时间"] },
    "学校名称": { label: "学校名称", aliases: ["学校名称", "毕业院校", "院校名称", "学校", "高校名称"] },
    "是否最高学历": { label: "是否最高学历", aliases: ["是否最高学历", "最高学历", "最高学位"] },
    "学历": { label: "学历", aliases: ["学历", "学历层次", "教育程度", "最高学历"] },
    "学位": { label: "学位", aliases: ["学位", "学位名称", "获得学位"] },
    "学制": { label: "学制", aliases: ["学制", "培养年限", "学习年限"] },
    "受教育类型": { label: "受教育类型", aliases: ["受教育类型", "教育类型", "培养方式", "学习形式", "学历类型"] },
    "院系": { label: "院系", aliases: ["院系", "学院", "所在院系", "院系名称"] },
    "专业名称": { label: "专业名称", aliases: ["专业名称", "专业", "所学专业"] },
    "年级排名": { label: "年级排名", aliases: ["年级排名", "专业排名", "综合排名", "成绩排名"] },
    "必修课平均分": { label: "必修课平均分", aliases: ["必修课平均分", "平均分", "平均成绩", "GPA", "绩点"] },
    "专业课程": { label: "专业课程", aliases: ["专业课程", "主修课程", "核心课程", "所学课程"] },
    "期望工作地点1": { label: "期望工作地点1", aliases: ["期望工作地点1", "第一期望工作地点", "期望工作地1", "意向城市1"] },
    "期望工作地点2": { label: "期望工作地点2", aliases: ["期望工作地点2", "第二期望工作地点", "期望工作地2", "意向城市2"] },
    "期望薪酬": { label: "期望薪酬", aliases: ["期望薪酬", "期望薪资", "薪资要求", "期望月薪", "期望年薪"] },
    "到岗时间": { label: "到岗时间", aliases: ["到岗时间", "可入职时间", "预计到岗时间", "入职时间"] },
    "期望工作性质": { label: "期望工作性质", aliases: ["期望工作性质", "工作性质", "岗位性质", "就业类型"] },
    "了解该招聘信息渠道": { label: "了解该招聘信息渠道", aliases: ["了解该招聘信息渠道", "招聘信息渠道", "信息来源", "招聘渠道", "获知渠道"] },
    "开始时间": { label: "开始时间", aliases: ["开始时间", "开始日期", "起始时间"] },
    "结束时间": { label: "结束时间", aliases: ["结束时间", "结束日期", "截止时间"] },
    "企业名称": { label: "企业名称", aliases: ["企业名称", "公司名称", "实习单位", "单位名称"] },
    "职位名称": { label: "职位名称", aliases: ["职位名称", "岗位名称", "实习岗位", "职务"] },
    "证明人姓名": { label: "证明人姓名", aliases: ["证明人姓名", "证明人", "联系人姓名"] },
    "证明人职务": { label: "证明人职务", aliases: ["证明人职务", "证明人职位", "证明人岗位"] },
    "证明人联系方式": { label: "证明人联系方式", aliases: ["证明人联系方式", "证明人电话", "证明人手机", "联系人电话"] },
    "工作描述": { label: "工作描述", aliases: ["工作描述", "实习描述", "工作内容", "主要职责", "职责描述"] },
    "项目名称": { label: "项目名称", aliases: ["项目名称", "项目题目"] },
    "项目职务": { label: "项目职务", aliases: ["项目职务", "项目角色", "担任角色", "项目职责"] },
    "项目描述": { label: "项目描述", aliases: ["项目描述", "项目内容", "项目简介", "主要工作"] },
    "活动名称": { label: "活动名称", aliases: ["活动名称", "社会实践名称", "校内活动名称", "实践名称"] },
    "活动描述": { label: "活动描述", aliases: ["活动描述", "社会实践描述", "实践内容", "活动内容"] },
    "职务": { label: "职务", aliases: ["职务", "职位", "岗位", "担任职务"] },
    "专利类型": { label: "专利类型", aliases: ["专利类型", "专利类别"] },
    "专利名称": { label: "专利名称", aliases: ["专利名称", "专利题目"] },
    "发表日期": { label: "发表日期", aliases: ["发表日期", "发表时间", "公开日期"] },
    "发表阶段": { label: "发表阶段", aliases: ["发表阶段", "专利状态", "申请阶段", "授权状态"] },
    "作者排序": { label: "作者排序", aliases: ["作者排序", "作者排名", "第几作者", "排名"] },
    "论文名称": { label: "论文名称", aliases: ["论文名称", "论文题目", "论文标题", "文章标题"] },
    "接收/发表日期": { label: "接收/发表日期", aliases: ["接收/发表日期", "接收日期", "发表日期", "录用日期"] },
    "期刊或会议名称": { label: "期刊或会议名称", aliases: ["期刊或会议名称", "期刊名称", "会议名称", "发表刊物"] },
    "期刊或会议水平": { label: "期刊或会议水平", aliases: ["期刊或会议水平", "期刊级别", "会议级别", "收录级别"] },
    "论文发表状态": { label: "论文发表状态", aliases: ["论文发表状态", "发表状态", "录用状态", "论文状态"] },
    "影响因子": { label: "影响因子", aliases: ["影响因子", "IF"] },
    "奖项类别": { label: "奖项类别", aliases: ["奖项类别", "奖励类别", "荣誉类别"] },
    "奖励名称": { label: "奖励名称", aliases: ["奖励名称", "奖项名称", "荣誉名称", "获奖名称"] },
    "奖励级别": { label: "奖励级别", aliases: ["奖励级别", "奖项级别", "荣誉级别"] },
    "奖励等级": { label: "奖励等级", aliases: ["奖励等级", "奖项等级", "获奖等级"] },
    "获奖时间": { label: "获奖时间", aliases: ["获奖时间", "获奖日期", "奖励时间"] },
    "颁发单位": { label: "颁发单位", aliases: ["颁发单位", "授予单位", "发证单位"] },
    "英语水平": { label: "英语水平", aliases: ["英语水平", "英语等级", "外语水平", "CET", "四六级"] },
    "英语成绩得分": { label: "英语成绩得分", aliases: ["英语成绩得分", "英语成绩", "英语分数", "四六级分数"] },
    "其他外语水平及成绩": { label: "其他外语水平及成绩", aliases: ["其他外语水平及成绩", "其他外语", "第二外语", "小语种"] },
    "IT技能": { label: "IT技能", aliases: ["IT技能", "计算机技能", "专业技能", "技术能力"] },
    "IT技能掌握程度": { label: "IT技能掌握程度", aliases: ["IT技能掌握程度", "掌握程度", "熟练程度"] },
    "其他IT技能水平": { label: "其他IT技能水平", aliases: ["其他IT技能水平", "其他IT技能", "其他计算机技能"] },
    "专业资格证书": { label: "专业资格证书", aliases: ["专业资格证书", "资格证书", "证书名称", "获得证书"] },
    "专业资格证书等级": { label: "专业资格证书等级", aliases: ["专业资格证书等级", "证书等级", "证书级别"] },
    "专业资格证书获得时间": { label: "专业资格证书获得时间", aliases: ["专业资格证书获得时间", "证书获得时间", "取证时间", "发证时间"] },
    "个人爱好": { label: "个人爱好", aliases: ["个人爱好", "兴趣爱好", "爱好", "特长"] },
    "关系": { label: "关系", aliases: ["关系", "与本人关系", "家庭关系", "亲属关系"] },
    "是否在电信集团及下属单位工作": { label: "是否在电信集团及下属单位工作", aliases: ["是否在电信集团及下属单位工作", "电信集团", "中国电信", "亲属是否在本集团"] },
    "工作单位": { label: "工作单位", aliases: ["工作单位", "所在单位", "任职单位", "单位名称"] },
    "职位": { label: "职位", aliases: ["职位", "职务", "岗位"] },
    "评价内容": { label: "评价内容", aliases: ["评价内容", "自我评价", "个人评价", "自我介绍"] },
    title: { label: "标题", aliases: ["标题", "名称", "题目"] },
    name: { label: "姓名", aliases: ["姓名", "名称"] },
    description: { label: "描述", aliases: ["描述", "说明", "主要内容"] },
    startDate: { label: "开始日期", aliases: ["开始时间", "开始日期", "起始时间"] },
    endDate: { label: "结束日期", aliases: ["结束时间", "结束日期", "截止时间"] },
    level: { label: "级别", aliases: ["级别", "等级"] },
    status: { label: "状态", aliases: ["状态"] },
    organization: { label: "组织单位", aliases: ["组织", "单位", "机构"] },
    role: { label: "角色", aliases: ["角色", "职务", "职责"] },
    position: { label: "职务", aliases: ["职务", "职位", "岗位"] },
    workUnit: { label: "工作单位", aliases: ["工作单位", "单位名称"] },
  };

  const BAD_CONTEXT = ["验证码", "密码", "确认密码", "图形码", "短信码"];

  const state = {
    resumeData: null,
    sampleData: null,
    groups: [],
    flatItems: [],
    open: false,
    hideValues: false,
    search: "",
    message: "",
    messageType: "",
    currentInput: null,
    collapsedGroups: new Set(),
    addFieldForm: null,
  };

  function iconSvg(path) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  const ICONS = {
    fileText: iconSvg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>'),
    close: iconSvg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    edit: iconSvg('<path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>'),
  };

  async function chromeStorageGet(key) {
    if (!chrome?.storage?.local) return undefined;
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => resolve(result?.[key]));
    });
  }

  async function chromeStorageSet(key, value) {
    if (!chrome?.storage?.local) return;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async function chromeStorageRemove(key) {
    if (!chrome?.storage?.local) return;
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  }

  async function loadSampleData() {
    const url = chrome.runtime.getURL(SAMPLE_FILE);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot load ${SAMPLE_FILE}`);
    return response.json();
  }

  async function loadResumeData() {
    const sample = await loadSampleData();
    state.sampleData = sample;
    const stored = await chromeStorageGet(STORAGE_KEY);
    return mergeResumeData(sample, stored);
  }

  function cloneData(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function mergeResumeData(sample, stored) {
    const base = cloneData(sample || {});
    if (!isPlainObject(stored)) return base;

    const merged = mergeValue(base, stored);
    if (isPlainObject(stored[CUSTOM_META_KEY])) {
      merged[CUSTOM_META_KEY] = cloneData(stored[CUSTOM_META_KEY]);
    }
    return merged;
  }

  function mergeValue(base, override) {
    if (Array.isArray(base)) return mergeArrayValue(base, override);
    if (isPlainObject(base)) {
      const result = cloneData(base);
      if (!isPlainObject(override)) return result;
      for (const [key, value] of Object.entries(override)) {
        if (key === CUSTOM_META_KEY) continue;
        result[key] = key in result ? mergeValue(result[key], value) : cloneData(value);
      }
      return result;
    }
    return override === undefined ? cloneData(base) : cloneData(override);
  }

  function mergeArrayValue(base, override) {
    if (!Array.isArray(override)) return cloneData(base);
    const template = base[0];
    return override.map((entry, index) => {
      const baseEntry = base[index] !== undefined ? base[index] : template;
      return mergeValue(baseEntry, entry);
    });
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\s　:：,，.。;；/\\|、\-—_()[\]【】{}<>《》"'“”‘’]/g, "");
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function canonicalPath(path) {
    return path.replace(/\[\d+\]/g, "[]");
  }

  function pathKey(path) {
    return path.split(".").pop()?.replace(/\[\d+\]/g, "") || path;
  }

  function formatValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "是" : "否";
    if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join("，");
    if (isPlainObject(value)) {
      if ("province" in value || "city" in value) {
        return [value.province, value.city].filter(Boolean).join("");
      }
      return Object.values(value).map(formatValue).filter(Boolean).join("，");
    }
    return String(value);
  }

  function getMeta(path) {
    const canonical = canonicalPath(path);
    const key = pathKey(path);
    const baseMeta = FIELD_META[canonical] || FIELD_KEY_META[key] || { label: key, aliases: [key] };
    const customMeta = state.resumeData?.[CUSTOM_META_KEY]?.[canonical];
    const rawAliases = isPlainObject(customMeta) ? customMeta["匹配词"] || customMeta.aliases || [] : [];
    const customAliases = Array.isArray(rawAliases) ? rawAliases : [rawAliases];
    return {
      label: baseMeta.label || key,
      aliases: unique([...(baseMeta.aliases || []), ...customAliases, key]),
    };
  }

  function getValueAtPath(data, path) {
    const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let cur = data;
    for (const part of parts) {
      if (cur === null || cur === undefined) return undefined;
      cur = cur[part];
    }
    return cur;
  }

  function makeItem({ groupKey, groupLabel, subgroup, path, value, derived = false }) {
    const meta = getMeta(path);
    const displayValue = formatValue(value);
    const aliases = unique([
      meta.label,
      ...(meta.aliases || []),
      groupLabel,
      subgroup,
      pathKey(path),
      canonicalPath(path),
    ]).filter(Boolean);

    return {
      id: path,
      groupKey,
      groupLabel,
      subgroup,
      path,
      label: meta.label,
      value: displayValue,
      rawValue: value,
      aliases,
      derived,
      searchable: normalizeText([meta.label, displayValue, groupLabel, subgroup, path, ...aliases].join(" ")),
    };
  }

  function unique(values) {
    return Array.from(new Set(values.filter((value) => value !== null && value !== undefined && value !== "")));
  }

  function makeSubgroupTitle(groupKey, index, entry) {
    const fields = ARRAY_NAME_FIELDS[groupKey] || ["name", "title"];
    const parts = [];
    for (const field of fields) {
      const value = entry?.[field];
      if (value !== null && value !== undefined && value !== "") parts.push(formatValue(value));
    }
    const suffix = parts.slice(0, 2).join(" / ");
    return suffix ? `第 ${index + 1} 条 - ${suffix}` : `第 ${index + 1} 条`;
  }

  function addPrimitiveItems(items, groupKey, groupLabel, subgroup, basePath, value) {
    if (isPlainObject(value)) {
      for (const [key, child] of Object.entries(value)) {
        addPrimitiveItems(items, groupKey, groupLabel, subgroup, `${basePath}.${key}`, child);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((child, index) => {
        addPrimitiveItems(items, groupKey, groupLabel, subgroup, `${basePath}[${index}]`, child);
      });
      return;
    }

    items.push(makeItem({ groupKey, groupLabel, subgroup, path: basePath, value }));
  }

  function addLocationItems(items, groupKey, groupLabel, subgroup, path, value) {
    if (!isPlainObject(value)) return;
    items.push(makeItem({ groupKey, groupLabel, subgroup, path: `${path}.full`, value, derived: true }));
    if ("province" in value) {
      items.push(makeItem({ groupKey, groupLabel, subgroup, path: `${path}.province`, value: value.province }));
    }
    if ("city" in value) {
      items.push(makeItem({ groupKey, groupLabel, subgroup, path: `${path}.city`, value: value.city }));
    }
  }

  function buildFlatGroups(data) {
    const groups = [];

    const groupKeys = unique([...Object.keys(GROUP_LABELS), ...Object.keys(data || {})]).filter(
      (key) => key !== CUSTOM_META_KEY,
    );

    for (const groupKey of groupKeys) {
      const groupLabel = GROUP_LABELS[groupKey] || groupKey;
      const value = data?.[groupKey];
      const group = { key: groupKey, label: groupLabel, subgroups: [] };

      if (Array.isArray(value)) {
        value.forEach((entry, index) => {
          const subgroup = makeSubgroupTitle(groupKey, index, entry);
          const items = [];
          if (isPlainObject(entry)) {
            for (const [key, child] of Object.entries(entry)) {
              addPrimitiveItems(items, groupKey, groupLabel, subgroup, `${groupKey}[${index}].${key}`, child);
            }
          } else {
            addPrimitiveItems(items, groupKey, groupLabel, subgroup, `${groupKey}[${index}]`, entry);
          }
          group.subgroups.push({ title: subgroup, items });
        });
      } else if (isPlainObject(value)) {
        const subgroup = groupLabel;
        const items = [];
        for (const [key, child] of Object.entries(value)) {
          if (key === "hukouLocation" || key === "collegeLocation") {
            addLocationItems(items, groupKey, groupLabel, subgroup, `${groupKey}.${key}`, child);
          } else {
            addPrimitiveItems(items, groupKey, groupLabel, subgroup, `${groupKey}.${key}`, child);
          }
        }
        group.subgroups.push({ title: subgroup, items });
      }

      groups.push(group);
    }

    return groups;
  }

  function flattenGroups(groups) {
    return groups.flatMap((group) => group.subgroups.flatMap((subgroup) => subgroup.items));
  }

  function mount() {
    if (document.getElementById(ROOT_ID)) return;

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = `
      <button class="racn-toggle" type="button" title="Resume Autofill CN" aria-label="Resume Autofill CN">${ICONS.fileText}</button>
      <aside class="racn-panel" data-open="false" aria-label="Resume Autofill CN">
        <header class="racn-header">
          <div>
            <h2 class="racn-title">Resume Autofill CN</h2>
            <div class="racn-status"></div>
          </div>
          <button class="racn-icon-btn" type="button" data-action="close" title="关闭" aria-label="关闭">${ICONS.close}</button>
        </header>
        <div class="racn-controls">
          <input class="racn-search" type="search" placeholder="搜索字段" autocomplete="off" />
          <button class="racn-text-btn" type="button" data-action="jump-next">下一个</button>
          <button class="racn-text-btn" type="button" data-action="fill-page" data-primary="true">填充高置信</button>
          <button class="racn-text-btn" type="button" data-action="toggle-privacy">隐藏</button>
        </div>
        <main class="racn-body">
          <section class="racn-section">
            <h3 class="racn-section-title">当前字段</h3>
            <div class="racn-current"></div>
          </section>
          <section class="racn-section">
            <h3 class="racn-section-title">简历资料</h3>
            <div class="racn-groups"></div>
          </section>
        </main>
        <footer class="racn-footer">
          <div class="racn-footer-actions">
            <button class="racn-text-btn" type="button" data-action="settings">编辑简历</button>
            <button class="racn-text-btn" type="button" data-action="import">导入 JSON</button>
            <button class="racn-text-btn" type="button" data-action="export">导出 JSON</button>
          </div>
          <button class="racn-text-btn" type="button" data-action="reset" data-danger="true">恢复样例</button>
          <input class="racn-file-input" type="file" accept="application/json,.json" />
        </footer>
      </aside>
    `;

    document.documentElement.appendChild(root);
    bindEvents(root);
  }

  function bindEvents(root) {
    root.querySelector(".racn-toggle").addEventListener("click", () => {
      state.open = true;
      render();
    });

    root.querySelector(".racn-search").addEventListener("input", (event) => {
      state.search = event.target.value || "";
      renderGroups();
    });

    root.querySelector(".racn-file-input").addEventListener("change", handleImportFile);

    root.addEventListener("click", async (event) => {
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl || !root.contains(actionEl)) return;
      const action = actionEl.getAttribute("data-action");

      if (action === "close") {
        state.open = false;
        render();
      } else if (action === "jump-next") {
        jumpNextInput();
      } else if (action === "fill-page") {
        fillHighConfidenceFields();
      } else if (action === "toggle-privacy") {
        state.hideValues = !state.hideValues;
        render();
      } else if (action === "show-add-field") {
        showAddFieldForm();
      } else if (action === "cancel-add-field") {
        state.addFieldForm = null;
        renderCurrentInput();
      } else if (action === "save-add-field") {
        await saveAddFieldFromSidebar(root);
      } else if (action === "fill-item") {
        const item = state.flatItems.find((candidate) => candidate.id === actionEl.getAttribute("data-id"));
        if (item) fillCurrentInput(item);
      } else if (action === "edit-item") {
        const item = state.flatItems.find((candidate) => candidate.id === actionEl.getAttribute("data-id"));
        if (item) openResumeEditor(item.groupKey, item.path);
      } else if (action === "toggle-group") {
        const key = actionEl.getAttribute("data-key");
        if (state.collapsedGroups.has(key)) state.collapsedGroups.delete(key);
        else state.collapsedGroups.add(key);
        renderGroups();
      } else if (action === "import") {
        root.querySelector(".racn-file-input").click();
      } else if (action === "export") {
        exportResumeData();
      } else if (action === "reset") {
        if (!confirm("确定恢复样例？当前自定义字段和值会被清除。")) return;
        await chromeStorageRemove(STORAGE_KEY);
        const sample = await loadSampleData();
        state.sampleData = sample;
        await setResumeData(cloneData(sample), "已恢复样例");
      } else if (action === "settings") {
        openResumeEditor();
      }
    });

    document.addEventListener("focusin", (event) => {
      const target = event.target;
      if (!isFillableElement(target)) return;
      if (document.getElementById(ROOT_ID)?.contains(target)) return;

      state.currentInput = target;
      state.addFieldForm = null;
      renderCurrentInput();
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.action === "toggle-resume-autofill") {
        state.open = !state.open;
        render();
        sendResponse({ ok: true });
        return true;
      }
      return false;
    });

    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(async (changes, areaName) => {
        if (areaName !== "local" || !(STORAGE_KEY in changes)) return;
        try {
          await setResumeData(await loadResumeData());
          setMessage(`${state.flatItems.length} 个字段`, "");
        } catch (error) {
          console.error("[Resume Autofill CN] storage refresh failed", error);
          setMessage("简历数据刷新失败", "err");
        }
      });
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const json = JSON.parse(await file.text());
      const sample = state.sampleData || (await loadSampleData());
      state.sampleData = sample;
      const merged = mergeResumeData(sample, json);
      await chromeStorageSet(STORAGE_KEY, merged);
      await setResumeData(merged, "已导入 JSON");
    } catch (error) {
      console.error("[Resume Autofill CN] import failed", error);
      setMessage("导入失败", "err");
    }
  }

  function exportResumeData() {
    const blob = new Blob([JSON.stringify(state.resumeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "structured-resume-cn.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    setMessage("已导出 JSON", "ok");
  }

  function openResumeEditor(group, path) {
    chrome.runtime.sendMessage({ action: "open-options", group, path }, (response) => {
      if (chrome.runtime.lastError) {
        setMessage("无法打开编辑页", "err");
        return;
      }
      if (!response?.ok) setMessage("无法打开编辑页", "err");
    });
  }

  async function setResumeData(data, message) {
    state.resumeData = data;
    state.groups = buildFlatGroups(data);
    state.flatItems = flattenGroups(state.groups);
    if (message) setMessage(message, "ok", false);
    render();
  }

  function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    root.querySelector(".racn-panel").dataset.open = String(state.open);
    root.querySelector(".racn-toggle").style.display = state.open ? "none" : "grid";
    root.querySelector('[data-action="toggle-privacy"]').textContent = state.hideValues ? "显示" : "隐藏";

    const searchEl = root.querySelector(".racn-search");
    if (document.activeElement !== searchEl) searchEl.value = state.search;

    renderStatus();
    renderCurrentInput();
    renderGroups();
  }

  function renderStatus() {
    const status = document.querySelector(`#${ROOT_ID} .racn-status`);
    if (!status) return;
    status.dataset.type = state.messageType || "";
    status.textContent = state.message || `${state.flatItems.length} 个字段`;
  }

  function renderCurrentInput() {
    const current = document.querySelector(`#${ROOT_ID} .racn-current`);
    if (!current) return;

    if (!state.currentInput || !document.contains(state.currentInput)) {
      state.currentInput = null;
      current.innerHTML = `<div class="racn-empty">未选中输入框</div>`;
      return;
    }

    const context = getElementContext(state.currentInput);
    const label = context.display || describeElement(state.currentInput);
    const suggestions = rankCandidates(state.currentInput).slice(0, 5);
    const suggestionHtml = suggestions.length
      ? `<div class="racn-suggestions">${suggestions.map(renderSuggestion).join("")}</div>`
      : `<div class="racn-empty">暂无推荐</div>`;
    const addFieldHtml =
      state.addFieldForm
        ? renderAddFieldForm()
        : shouldShowAddFieldAction(suggestions)
          ? `<button class="racn-add-field-trigger" type="button" data-action="show-add-field">新增字段</button>`
          : "";

    current.innerHTML = `
      <div class="racn-current-label">${escapeHtml(label)}</div>
      ${suggestionHtml}
      ${addFieldHtml}
    `;
  }

  function shouldShowAddFieldAction(suggestions) {
    const top = suggestions[0];
    return !top || top.score < HIGH_CONFIDENCE_SCORE || top.ambiguous;
  }

  function renderAddFieldForm() {
    const draft = state.addFieldForm || {};
    const targets = getSaveTargets();
    const options = targets
      .map((target) => {
        const selected = target.value === draft.target ? " selected" : "";
        return `<option value="${escapeHtml(target.value)}"${selected}>${escapeHtml(target.label)}</option>`;
      })
      .join("");

    return `
      <form class="racn-add-form">
        <label class="racn-field-label">
          <span>保存位置</span>
          <select class="racn-add-target">${options}</select>
        </label>
        <label class="racn-field-label">
          <span>字段名</span>
          <input class="racn-add-name" type="text" value="${escapeHtml(draft.fieldName || "")}" placeholder="例如：专利摘要" />
        </label>
        <label class="racn-field-label">
          <span>字段值</span>
          <textarea class="racn-add-value" rows="3" placeholder="保存到该字段的值">${escapeHtml(draft.fieldValue || "")}</textarea>
        </label>
        <label class="racn-field-label">
          <span>匹配词</span>
          <input class="racn-add-aliases" type="text" value="${escapeHtml((draft.aliases || []).join("，"))}" placeholder="多个词用逗号分隔" />
        </label>
        <div class="racn-add-actions">
          <button class="racn-text-btn" type="button" data-action="cancel-add-field">取消</button>
          <button class="racn-text-btn" type="button" data-action="save-add-field" data-primary="true">保存字段</button>
        </div>
      </form>
    `;
  }

  function showAddFieldForm() {
    if (!state.currentInput || !document.contains(state.currentInput)) {
      setMessage("未选中输入框", "warn");
      return;
    }

    const context = getElementContext(state.currentInput);
    const suggestions = rankCandidates(state.currentInput);
    const fieldName = inferFieldName(context);
    state.addFieldForm = {
      target: inferSaveTarget(suggestions, context),
      fieldName,
      fieldValue: readElementValue(state.currentInput),
      aliases: unique([fieldName, ...context.parts]).slice(0, 5),
    };
    renderCurrentInput();
  }

  async function saveAddFieldFromSidebar(root) {
    const form = root.querySelector(".racn-add-form");
    if (!form) return;

    const target = form.querySelector(".racn-add-target")?.value || "";
    const fieldName = cleanFieldName(form.querySelector(".racn-add-name")?.value || "");
    const fieldValue = form.querySelector(".racn-add-value")?.value || "";
    const aliases = parseAliases(form.querySelector(".racn-add-aliases")?.value || "");

    if (!target) {
      setMessage("请选择保存位置", "warn");
      return;
    }
    if (!fieldName) {
      setMessage("请输入字段名", "warn");
      return;
    }

    const data = cloneData(state.resumeData || {});
    const targetObject = ensureTargetObject(data, target);
    if (!targetObject) {
      setMessage("保存位置无效", "err");
      return;
    }

    targetObject[fieldName] = fieldValue;
    upsertCustomFieldMeta(data, target, fieldName, aliases);
    await chromeStorageSet(STORAGE_KEY, data);
    state.addFieldForm = null;
    await setResumeData(data, "已保存新增字段");
  }

  function getSaveTargets() {
    const data = state.resumeData || {};
    const groupKeys = unique([...Object.keys(state.sampleData || {}), ...Object.keys(data)])
      .filter((key) => key !== CUSTOM_META_KEY);
    const targets = [];

    for (const groupKey of groupKeys) {
      const value = data[groupKey];
      const label = GROUP_LABELS[groupKey] || groupKey;
      if (Array.isArray(value)) {
        if (value.length === 0) {
          targets.push({ value: `${groupKey}[0]`, label: `${label} / 第 1 条（新建）` });
        } else {
          value.forEach((entry, index) => {
            targets.push({ value: `${groupKey}[${index}]`, label: `${label} / ${makeSubgroupTitle(groupKey, index, entry)}` });
          });
        }
      } else if (isPlainObject(value)) {
        targets.push({ value: groupKey, label });
      }
    }

    return targets;
  }

  function inferSaveTarget(suggestions, context) {
    const fromSuggestion = suggestions[0]?.item?.path ? pathToTarget(suggestions[0].item.path) : "";
    const targets = getSaveTargets();
    if (fromSuggestion && targets.some((target) => target.value === fromSuggestion)) return fromSuggestion;

    const matchedGroup = targets.find((target) => context.normalized.includes(normalizeText(target.label.split(" / ")[0])));
    if (matchedGroup) return matchedGroup.value;

    return targets.find((target) => target.value === "基本信息")?.value || targets[0]?.value || "";
  }

  function pathToTarget(path) {
    const arrayMatch = path.match(/^(.+\[\d+\])(?:\.|$)/);
    if (arrayMatch) return arrayMatch[1];
    return path.split(".")[0] || "";
  }

  function ensureTargetObject(data, target) {
    const arrayMatch = target.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const groupKey = arrayMatch[1];
      const index = Number(arrayMatch[2]);
      if (!Array.isArray(data[groupKey])) data[groupKey] = [];
      while (data[groupKey].length <= index) data[groupKey].push({});
      if (!isPlainObject(data[groupKey][index])) data[groupKey][index] = {};
      return data[groupKey][index];
    }

    if (!isPlainObject(data[target])) data[target] = {};
    return data[target];
  }

  function upsertCustomFieldMeta(data, target, fieldName, aliases) {
    if (!isPlainObject(data[CUSTOM_META_KEY])) data[CUSTOM_META_KEY] = {};
    const metaPath = `${canonicalPath(target)}.${fieldName}`;
    const existing = data[CUSTOM_META_KEY][metaPath];
    const existingAliases = isPlainObject(existing) && Array.isArray(existing["匹配词"]) ? existing["匹配词"] : [];
    data[CUSTOM_META_KEY][metaPath] = {
      "匹配词": unique([fieldName, ...existingAliases, ...aliases]),
    };
  }

  function inferFieldName(context) {
    const preferred = context.parts.find((part) => normalizeText(part).length >= 2) || "";
    return cleanFieldName(preferred.replace(/[（(]?(必填|选填|required)[）)]?/gi, ""));
  }

  function cleanFieldName(value) {
    return cleanContextText(value)
      .replace(/[.[\]]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^[*＊\s]+/, "")
      .replace(/[:：]$/, "")
      .trim()
      .slice(0, 40);
  }

  function parseAliases(value) {
    return unique(
      String(value || "")
        .split(/[，,、;；\n]+/)
        .map((part) => cleanFieldName(part))
        .filter(Boolean),
    );
  }

  function readElementValue(el) {
    if (el instanceof HTMLSelectElement) {
      const selected = el.selectedOptions?.[0];
      return selected?.textContent?.trim() || el.value || "";
    }
    if (el instanceof HTMLInputElement) {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (type === "checkbox" || type === "radio") return el.checked ? "是" : "否";
      return el.value || "";
    }
    if (el instanceof HTMLTextAreaElement) return el.value || "";
    if (el.isContentEditable) return el.textContent?.trim() || "";
    return el.getAttribute("value") || el.textContent?.trim() || "";
  }

  function renderSuggestion(match) {
    const item = match.item;
    const value = state.hideValues ? "已隐藏" : item.value || "空";
    const disabled = item.value ? "" : " disabled";
    return `
      <button class="racn-suggestion" type="button" data-action="fill-item" data-id="${escapeHtml(item.id)}"${disabled}>
        <span class="racn-suggestion-main">
          <span class="racn-item-label">${escapeHtml(item.label)}</span>
          <span class="racn-item-value">${escapeHtml(value)}</span>
        </span>
        <span class="racn-score">${Math.round(match.score)}</span>
      </button>
    `;
  }

  function renderGroups() {
    const container = document.querySelector(`#${ROOT_ID} .racn-groups`);
    if (!container) return;

    const query = normalizeText(state.search);
    const groupsHtml = state.groups
      .map((group) => renderGroup(group, query))
      .filter(Boolean)
      .join("");

    container.innerHTML = groupsHtml || `<div class="racn-empty">没有匹配字段</div>`;
  }

  function renderGroup(group, query) {
    const filteredSubgroups = group.subgroups
      .map((subgroup) => ({
        ...subgroup,
        items: subgroup.items.filter((item) => !query || item.searchable.includes(query)),
      }))
      .filter((subgroup) => subgroup.items.length > 0 || (!query && group.subgroups.length === 1));

    if (filteredSubgroups.length === 0) return "";

    const count = filteredSubgroups.reduce((sum, subgroup) => sum + subgroup.items.length, 0);
    const collapsed = state.collapsedGroups.has(group.key);
    const body = collapsed
      ? ""
      : `<div class="racn-items">${filteredSubgroups.map(renderSubgroup).join("")}</div>`;

    return `
      <article class="racn-group">
        <button class="racn-group-header" type="button" data-action="toggle-group" data-key="${escapeHtml(group.key)}">
          <span class="racn-group-name">${escapeHtml(group.label)}</span>
          <span class="racn-count">${count}</span>
        </button>
        ${body}
      </article>
    `;
  }

  function renderSubgroup(subgroup) {
    const title = subgroup.title
      ? `<div class="racn-subgroup-title">${escapeHtml(subgroup.title)}</div>`
      : "";
    const itemsHtml = subgroup.items.length
      ? subgroup.items.map(renderItemButton).join("")
      : `<div class="racn-empty">暂无字段</div>`;
    return `<div class="racn-subgroup">${title}${itemsHtml}</div>`;
  }

  function renderItemButton(item) {
    const value = state.hideValues ? "已隐藏" : item.value || "空";
    const disabled = item.value ? "" : " disabled";
    return `
      <div class="racn-item-row">
        <button class="racn-fill-btn" type="button" data-action="fill-item" data-id="${escapeHtml(item.id)}"${disabled}>
          <span class="racn-item-main">
            <span class="racn-item-label">${escapeHtml(item.label)}</span>
            <span class="racn-item-value">${escapeHtml(value)}</span>
          </span>
          <span class="racn-path">${escapeHtml(shortPath(item.path))}</span>
        </button>
        <button class="racn-edit-btn" type="button" data-action="edit-item" data-id="${escapeHtml(item.id)}" title="编辑此项" aria-label="编辑 ${escapeHtml(item.label)}">${ICONS.edit}</button>
      </div>
    `;
  }

  function shortPath(path) {
    return path
      .replace("基本信息.", "基本.")
      .replace("教育经历", "教育")
      .replace("求职意向.", "意向.")
      .replace("实习经历", "实习")
      .replace("项目经验", "项目")
      .replace("社会实践/校内活动", "实践")
      .replace("专利发表", "专利")
      .replace("论文发表", "论文")
      .replace("奖励荣誉", "奖励")
      .replace("技能/爱好.", "技能.")
      .replace("家庭关系", "家庭")
      .replace("自我评价.", "评价.")
      .replace("personalInformation.", "PI.")
      .replace("workDescription.", "JOB.")
      .replace("socialPracticeActivities", "SPA")
      .replace("academicPaperPublications", "PAPER")
      .replace("patentPublications", "PAT")
      .replace("skillsAndHobbies.", "SKILL.")
      .replace("awardsAndHonors", "AWARD")
      .replace("familyRelations", "FAM")
      .replace("educationExperience", "EDU");
  }

  function setMessage(message, type = "", shouldRender = true) {
    state.message = message;
    state.messageType = type;
    if (shouldRender) renderStatus();
  }

  function describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const type = el.getAttribute("type");
    const id = el.getAttribute("id");
    const name = el.getAttribute("name");
    return [tag, type, id, name].filter(Boolean).join(" / ");
  }

  function isFillableElement(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest(`#${ROOT_ID}`)) return false;
    if (target.isContentEditable) return true;

    const tag = target.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return !target.disabled;

    if (tag === "INPUT") {
      const input = target;
      const type = (input.getAttribute("type") || "text").toLowerCase();
      return !["hidden", "submit", "button", "reset", "file", "image"].includes(type) && !input.disabled && !input.readOnly;
    }

    const role = target.getAttribute("role");
    return role === "textbox" || role === "combobox";
  }

  function scanInputs() {
    const root = document.getElementById(ROOT_ID);
    const selector = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"])',
      "textarea",
      "select",
      '[contenteditable="true"]',
      '[role="textbox"]',
      '[role="combobox"]',
    ].join(",");

    return Array.from(document.querySelectorAll(selector))
      .filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        if (root?.contains(el)) return false;
        if (!isFillableElement(el)) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      })
      .sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return Math.abs(ra.top - rb.top) < 8 ? ra.left - rb.left : ra.top - rb.top;
      });
  }

  function jumpNextInput() {
    const inputs = scanInputs();
    if (inputs.length === 0) {
      setMessage("未找到输入框", "warn");
      return;
    }

    let index = 0;
    if (state.currentInput) {
      const currentIndex = inputs.indexOf(state.currentInput);
      if (currentIndex >= 0) index = (currentIndex + 1) % inputs.length;
    }

    const next = inputs[index];
    state.currentInput = next;
    next.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    next.focus();
    flashElement(next);
    setMessage(`第 ${index + 1}/${inputs.length} 个`, "ok");
    renderCurrentInput();
  }

  function flashElement(el) {
    el.classList.add("racn-highlight");
    setTimeout(() => el.classList.remove("racn-highlight"), 1200);
  }

  function fillCurrentInput(item) {
    if (!state.currentInput || !document.contains(state.currentInput)) {
      setMessage("未选中输入框", "warn");
      return;
    }

    if (!item.value) {
      setMessage("字段为空", "warn");
      return;
    }

    const ok = fillElement(state.currentInput, item.value);
    if (ok) {
      flashElement(state.currentInput);
      setMessage(`已填写：${item.label}`, "ok");
    } else {
      setMessage("填写失败", "err");
    }
  }

  function inputHasValue(el) {
    if (el instanceof HTMLSelectElement) return Boolean(el.value);
    if (el instanceof HTMLInputElement) {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (type === "checkbox" || type === "radio") return el.checked;
      return Boolean(el.value);
    }
    if (el instanceof HTMLTextAreaElement) return Boolean(el.value);
    if (el.isContentEditable) return Boolean(el.textContent?.trim());
    return Boolean(el.getAttribute("value") || el.textContent?.trim());
  }

  function fillHighConfidenceFields() {
    const inputs = scanInputs();
    let filled = 0;
    let skipped = 0;

    for (const el of inputs) {
      if (inputHasValue(el)) continue;
      const ranked = rankCandidates(el);
      const top = ranked[0];
      if (!top || top.score < HIGH_CONFIDENCE_SCORE || top.ambiguous || !top.item.value) {
        skipped += 1;
        continue;
      }

      if (fillElement(el, top.item.value)) {
        filled += 1;
        flashElement(el);
      }
    }

    setMessage(`已填 ${filled} 个，跳过 ${skipped} 个`, filled ? "ok" : "warn");
  }

  function fillElement(el, content) {
    try {
      el.focus();
      simulateClick(el);

      if (el instanceof HTMLSelectElement) {
        return fillSelect(el, content);
      }

      if (el instanceof HTMLInputElement) {
        const type = (el.getAttribute("type") || "text").toLowerCase();
        if (type === "checkbox" || type === "radio") return fillCheckable(el, content);
        if (type === "date") return fillTextLike(el, normalizeDateForInput(content, "date"));
        if (type === "month") return fillTextLike(el, normalizeDateForInput(content, "month"));
      }

      return fillTextLike(el, content);
    } catch (error) {
      console.error("[Resume Autofill CN] fill failed", error);
      return false;
    }
  }

  function fillTextLike(el, content) {
    clearElement(el);
    setElementValue(el, content);
    fireInputSequence(el, content);
    return true;
  }

  function clearElement(el) {
    if (el.isContentEditable) {
      el.textContent = "";
      el.innerHTML = "";
    } else if ("value" in el) {
      setNativeValue(el, "");
    }
    fireEvent(el, "input");
    fireEvent(el, "change");
  }

  function setElementValue(el, content) {
    if (el.isContentEditable) {
      el.textContent = content;
      return;
    }
    if ("value" in el) setNativeValue(el, content);
    else el.textContent = content;
  }

  function setNativeValue(el, value) {
    const prototype = Object.getPrototypeOf(el);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    const ownDescriptor = Object.getOwnPropertyDescriptor(el, "value");
    const setter = descriptor?.set || ownDescriptor?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
  }

  function fireInputSequence(el, content) {
    try {
      el.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: content,
        }),
      );
    } catch {
      fireEvent(el, "input");
    }

    fireEvent(el, "compositionstart");
    for (const type of ["keydown", "keypress", "keyup"]) {
      el.dispatchEvent(
        new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          key: "a",
          keyCode: 65,
          which: 65,
          view: window,
        }),
      );
    }
    fireEvent(el, "compositionend");
    fireEvent(el, "change");
    el.dispatchEvent(new CustomEvent("ngModelChange", { bubbles: true, cancelable: true, detail: content }));

    setTimeout(() => {
      el.blur();
      fireEvent(el, "blur");
      fireEvent(el, "focusout");
      setTimeout(() => {
        el.focus();
        fireEvent(el, "focus");
        fireEvent(el, "focusin");
      }, 80);
    }, 80);
  }

  function fillSelect(select, content) {
    const normalizedContent = normalizeText(content);
    const options = Array.from(select.options);
    const match =
      options.find((option) => normalizeText(option.textContent) === normalizedContent || normalizeText(option.value) === normalizedContent) ||
      options.find((option) => normalizeText(option.textContent).includes(normalizedContent) || normalizedContent.includes(normalizeText(option.textContent))) ||
      options.find((option) => normalizeText(option.value).includes(normalizedContent));

    if (!match) return false;

    select.value = match.value;
    match.selected = true;
    fireEvent(select, "input");
    fireEvent(select, "change");
    return true;
  }

  function fillCheckable(input, content) {
    const normalized = normalizeText(content);
    const label = normalizeText(getElementContext(input).display);
    const positive = ["是", "有", "true", "yes", "男"].some((word) => normalized.includes(normalizeText(word)));
    const negative = ["否", "无", "false", "no", "女"].some((word) => normalized.includes(normalizeText(word)));
    const optionMatches = label && (normalized.includes(label) || label.includes(normalized));

    if (input.type === "radio") {
      if (!optionMatches && !positive && !negative) return false;
      if (!input.checked) input.click();
      input.checked = true;
    } else {
      const desired = optionMatches || positive || (!negative && Boolean(content));
      if (input.checked !== desired) input.click();
      input.checked = desired;
    }

    fireEvent(input, "input");
    fireEvent(input, "change");
    return true;
  }

  function normalizeDateForInput(content, type) {
    const match = String(content).match(/(\d{4})[/-](\d{1,2})[/-]?(\d{0,2})/);
    if (!match) return content;
    const year = match[1];
    const month = match[2].padStart(2, "0");
    const day = (match[3] || "01").padStart(2, "0");
    return type === "month" ? `${year}-${month}` : `${year}-${month}-${day}`;
  }

  function fireEvent(el, type) {
    el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  }

  function simulateClick(el) {
    for (const type of ["mousedown", "mouseup", "click"]) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    }
  }

  function getElementContext(el) {
    const parts = [];
    const attrNames = [
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "placeholder",
      "name",
      "id",
      "title",
      "autocomplete",
      "data-qa",
      "data-testid",
      "data-automation-id",
      "data-automation-label",
      "data-vv-name",
    ];

    for (const attr of attrNames) {
      const value = el.getAttribute?.(attr);
      if (value) {
        if (attr === "aria-labelledby" || attr === "aria-describedby") {
          value.split(/\s+/).forEach((id) => {
            const ref = document.getElementById(id);
            if (ref) parts.push(ref.textContent || "");
          });
        } else {
          parts.push(value);
        }
      }
    }

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      Array.from(el.labels || []).forEach((label) => parts.push(label.textContent || ""));
      if (el.id) {
        const label = document.querySelector(`label[for="${cssEscape(el.id)}"]`);
        if (label) parts.push(label.textContent || "");
      }
    }

    const closestLabel = el.closest?.("label");
    if (closestLabel) parts.push(closestLabel.textContent || "");

    let parent = el.parentElement;
    for (let depth = 0; parent && depth < 5 && parent !== document.body; depth += 1) {
      collectContextFromElement(parent, parts);
      parent = parent.parentElement;
    }

    const display = unique(parts.map(cleanContextText).filter(Boolean)).slice(0, 8).join(" / ");
    return {
      display,
      raw: parts.join(" "),
      normalized: normalizeText(parts.join(" ")),
      parts: unique(parts.map(cleanContextText).filter(Boolean)),
    };
  }

  function collectContextFromElement(el, parts) {
    const selectors = [
      "label",
      "legend",
      ".ant-form-item-label",
      ".el-form-item__label",
      ".form-label",
      ".field-label",
      ".control-label",
      ".label",
      ".title",
      ".name",
      "[class*='label']",
      "[class*='Label']",
    ];

    for (const selector of selectors) {
      const found = el.querySelector?.(selector);
      if (found) parts.push(found.textContent || "");
    }

    const direct = Array.from(el.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || "")
      .join(" ");
    if (direct.trim().length <= 120) parts.push(direct);

    let sibling = el.previousElementSibling;
    for (let i = 0; sibling && i < 3; i += 1) {
      const text = cleanContextText(sibling.textContent || "");
      if (text.length <= 120) parts.push(text);
      sibling = sibling.previousElementSibling;
    }
  }

  function cleanContextText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function rankCandidates(el) {
    const context = getElementContext(el);
    const bad = BAD_CONTEXT.some((word) => context.normalized.includes(normalizeText(word)));
    if (bad) return [];

    const ranked = state.flatItems
      .filter((item) => item.value)
      .map((item) => ({ item, score: scoreItem(item, context) }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label, "zh-Hans-CN"));

    if (ranked.length > 1) {
      const first = ranked[0];
      const second = ranked[1];
      first.ambiguous = first.score - second.score <= 2 && first.item.value !== second.item.value;
      const firstCanonical = canonicalPath(first.item.path);
      const sameFieldConflict = ranked.some(
        (match) =>
          match !== first &&
          canonicalPath(match.item.path) === firstCanonical &&
          match.item.value !== first.item.value &&
          match.score >= Math.max(HIGH_CONFIDENCE_SCORE, first.score - 4),
      );
      if (sameFieldConflict) first.ambiguous = true;
    }

    return ranked;
  }

  function scoreItem(item, context) {
    let score = 0;
    const ctx = context.normalized;
    const groupKey = item.groupKey;

    for (const alias of item.aliases) {
      const normalizedAlias = normalizeText(alias);
      if (!normalizedAlias || normalizedAlias.length < 2) continue;
      if (ctx.includes(normalizedAlias)) score += Math.min(26, 8 + normalizedAlias.length * 2);
    }

    if (ctx.includes(normalizeText(item.label))) score += 12;
    if (ctx.includes(normalizeText(item.groupLabel))) score += 8;
    if (ctx.includes(normalizeText(item.subgroup))) score += 4;
    if (groupKey === "基本信息" && !ctx.includes(normalizeText("家庭")) && !ctx.includes(normalizeText("证明人"))) score += 2;

    const canonical = canonicalPath(item.path);
    if (canonical.includes("emergencyContact") && context.normalized.includes(normalizeText("紧急"))) score += 12;
    if (canonical.includes("紧急") && context.normalized.includes(normalizeText("紧急"))) score += 12;
    if (!canonical.includes("emergencyContact") && context.normalized.includes(normalizeText("紧急"))) {
      if (["personalInformation.name", "personalInformation.mobilePhone", "基本信息.姓名", "基本信息.移动电话"].includes(canonical)) score -= 16;
    }

    if (!["familyRelations", "家庭关系"].includes(groupKey) && context.normalized.includes(normalizeText("家庭"))) score -= 10;
    if (!["educationExperience", "教育经历"].includes(groupKey) && context.normalized.includes(normalizeText("教育"))) score -= 6;
    if (!["socialPracticeActivities", "社会实践/校内活动"].includes(groupKey) && context.normalized.includes(normalizeText("社会实践"))) score -= 8;
    if (!["awardsAndHonors", "奖励荣誉"].includes(groupKey) && context.normalized.includes(normalizeText("奖励"))) score -= 8;
    if (!["academicPaperPublications", "论文发表"].includes(groupKey) && context.normalized.includes(normalizeText("论文"))) score -= 8;
    if (groupKey !== "实习经历" && context.normalized.includes(normalizeText("证明人"))) score -= 12;
    if (groupKey !== "项目经验" && context.normalized.includes(normalizeText("项目"))) score -= 6;

    if (context.normalized.includes(normalizeText("证件类型")) && !["personalInformation.idNumber", "基本信息.证件号码"].includes(canonical)) score -= 10;
    if (context.normalized.includes(normalizeText("证件类型")) && ["personalInformation.idNumber", "基本信息.证件号码"].includes(canonical)) score -= 24;

    return score;
  }

  async function init() {
    mount();
    try {
      await setResumeData(await loadResumeData());
      setMessage(`${state.flatItems.length} 个字段`, "");
    } catch (error) {
      console.error("[Resume Autofill CN] init failed", error);
      setMessage("简历数据加载失败", "err");
    }
  }

  init();
})();
