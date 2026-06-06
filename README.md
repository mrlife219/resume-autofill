# Resume Autofill CN

> 中文简历自动填表扩展 —— 本地优先、隐私安全、开箱即用。

基于 [jobfill](https://github.com/23aaaa/jobfill) 二次开发，针对**中文招聘表单**场景做了专门适配。支持牛客网、智联招聘、BOSS 直聘、各企业校招官网等平台的数据管理、侧边栏展示和一键填写。

---

## 与上游的区别

| 维度 | jobfill（上游） | Resume Autofill CN（本工具） |
|------|----------------|----------------------------|
| 数据结构 | JS 文件硬编码 | JSON 结构化存储，导入/导出/恢复 |
| 数据管理 | 手动编辑 resume-data.js | 图形化设置页，浏览器本地存储 |
| 开箱即用 | 需要修改 JS 文件 | 直接编辑侧边栏字段即可 |
| 构建步骤 | Vanilla / React + Vite 两种方式 | 无构建步骤，纯 Manifest V3 |
| 字段能力 | 支持添加自定义字段 | 支持添加自定义字段 + 自定义匹配词 |
| 隐私 | 本地运行 | 本地运行，数据存 chrome.storage.local |

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 设置页管理 | 独立的 options 页面，分组展示所有简历字段，支持增删改 |
| 侧边栏面板 | 在任意网页右侧弹出可拖拽的侧边栏，分组展示简历数据 |
| 一键填写 | 先点击网页上的输入框，再点击侧边栏中的字段，内容自动填入 |
| 智能搜索 | 输入关键词即时过滤字段，快速定位目标信息 |
| 分组折叠 | 基本信息、教育经历、实习经历等按分组折叠管理 |
| 数据导入/导出 | 侧边栏底部支持导入、导出 JSON，数据可移植 |
| 恢复样例 | 一键恢复仓库内的样例数据 `sample-structured-resume-cn.json` |
| 高置信填充 | 「填充高置信」按钮只填确定性较高的字段，避免误填 |
| 框架兼容 | 适配 React / Vue / Angular 等前端框架渲染的表单 |
| 完全本地 | 数据仅存在浏览器本地，不上传任何服务器 |

---

## 快速开始

### 第 1 步 — 下载项目

```bash
git clone https://github.com/你的用户名/resume-autofill.git
cd resume-autofill
```

> 不会用 git？点击仓库页面右上角的 `Code` → `Download ZIP`，解压即可。

### 第 2 步 — 配置简历数据

打开 `sample-structured-resume-cn.json`，替换为你的真实信息。支持以下模块：

- 基本信息、教育经历、求职意向、实习经历、项目经验
- 社会实践/校内活动、专利发表、论文发表、奖励荣誉
- 技能/爱好、家庭关系、自我评价

也可先加载扩展，在设置页中直接编辑。

### 第 3 步 — 加载扩展到浏览器

1. 打开 Chrome / Edge，地址栏输入 `chrome://extensions/`
2. 打开右上角的 **「开发者模式」**
3. 点击 **「加载已解压的扩展程序」**
4. 选择本项目的**根目录文件夹**
5. 打开任意招聘网页，右下角出现悬浮按钮即安装成功

---

## 使用方法

1. **打开** 任意招聘网站（牛客、智联、BOSS 直聘、企业校招官网等）
2. **点击** 右下角悬浮按钮打开侧边栏
3. **先点击** 网页上的输入框（获得焦点）
4. **再点击** 侧边栏中对应的字段
5. 内容自动填入

> 也可使用「填充高置信」一键填入匹配度高的字段。

### 管理数据

- **设置页**：点击侧边栏底部的「打开设置」进入完整编辑界面
- **导入 JSON**：可导入其他工具导出的简历 JSON
- **导出 JSON**：导出当前数据备份
- **恢复样例**：重置为仓库内置的样例数据

---

## 项目结构

```
resume-autofill/
├── manifest.json                       # Chrome 扩展清单
├── content.js                          # 内容脚本（侧边栏 & 自动填充逻辑）
├── background.js                       # 后台脚本（工具栏图标点击）
├── styles.css                          # 侧边栏样式
├── options.html                        # 设置页
├── options.js                          # 设置页逻辑
├── options.css                         # 设置页样式
├── sample-structured-resume-cn.json    # 简历数据样例
└── README.md
```

---

## 支持的表单元素

- `<input>` / `<textarea>` / `<select>`
- `contenteditable`
- `role="textbox"` / `role="combobox"`
- React / Vue / Angular 受控组件

字段匹配通过 label、placeholder、name、id、aria 属性和中文字段词库综合识别。

---

## 隐私说明

- **完全本地运行**，不请求任何外部服务器
- 简历数据仅保存在 `chrome.storage.local`，不清除浏览器不会丢失
- 所有代码开源透明，可自行审查

---

## Roadmap

- [x] 设置页增删改字段
- [x] JSON 导入 / 导出 / 恢复样例
- [x] 侧边栏一键填写
- [x] 字段智能搜索
- [x] 高置信批量填充
- [x] 自定义匹配词
- [ ] 下拉选择框自动匹配（学历、城市、学校等）
- [ ] 多份简历切换
- [ ] 针对主流招聘网站一键全填

---

## 贡献

欢迎提交 Issue 和 Pull Request。

1. Fork 本仓库
2. `git checkout -b feat/your-feature`
3. `git commit -m "feat: 添加 xxx"`
4. `git push origin feat/your-feature`
5. 提交 Pull Request

---

## License

[MIT](LICENSE)
