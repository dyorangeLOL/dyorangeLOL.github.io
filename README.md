<img src="Lily-Accounting/logo.png" alt="Lily Accounting" width="72" height="72">

# Lily Accounting

一个用于记录日常收支的中文记账网站。前端运行在 GitHub Pages，使用 Supabase 进行邮箱登录和云端数据存储，提供账单记录、收支分析、支出日历和主题设置。

[在线使用](https://dyorangelol.github.io/Lily-Accounting/) · [项目源码](./Lily-Accounting/) · [更新日志](https://dyorangelol.github.io/Lily-Accounting/update-log.html)

## 功能

| 模块 | 当前功能 |
| --- | --- |
| 账户 | 邮箱注册、登录、退出，以及页面登录检查 |
| 记一笔 | 收入与支出、备注、分类、账单日期，金额支持两位小数 |
| 账单记录 | 按日期查看账单、搜索备注、删除记录，显示保存时间 |
| 数据分析 | 今日、本周、本月的收入、支出与净额；分类支出图和收支趋势图 |
| 支出日历 | 按月汇总每日支出，切换月份、点击日期查看明细 |
| 个人设置 | 初始资金、月度预算、货币、主题 |
| 数据导出 | 导出全部账单，或导出当前统计周期的 JSON |
| 界面 | 40 枚自绘平面 SVG 图标、响应式布局和六种主题 |

新建账单支持九个分类：餐饮、交通、学习、数码、购物、娱乐、医疗、生活、其他。旧英文分类在读取时映射为中文；部分已移除的新建分类仍保留历史显示兼容。

货币设置提供 CNY、SGD、HKD、USD、JPY；主题提供浅色、深色、GitHub 白、GitHub 黑、午夜蓝和薰衣草。

## 开始使用

1. 打开[网站](https://dyorangelol.github.io/Lily-Accounting/)，使用邮箱注册或登录。如果项目启用了邮箱确认，请先完成邮箱验证。
2. 在“设置”中填写初始资金、月度预算，选择货币和主题后保存。
3. 在“记一笔”中选择收支类型，填写金额、分类、备注和日期。
4. 在“账单记录”“数据分析”或“支出日历”中查看记录；需要备份时导出 JSON。

当前余额的计算方式为：

```text
当前余额 = 初始资金 + 全部收入 - 全部支出
```

统计使用账单的 `date`。本周从星期一开始；日历只汇总支出，不计收入。历史页中的“记录时间”来自 `created_at`，表示保存时间，按浏览器本地时区显示，不是另外填写的交易时分秒。

## 技术与数据存储

- 原生 HTML、CSS、JavaScript，无前端构建步骤。
- Supabase Auth：邮箱注册、登录与会话管理。
- Supabase PostgreSQL：账单与个人设置。
- Chart.js：分类支出与收支趋势图，通过 CDN 加载。
- SVG symbol 图标集：24 × 24 网格，使用 `currentColor` 随界面变色。
- GitHub Pages：静态页面托管。

账单和设置通过 Supabase 读写。`localStorage` 用于缓存主题，登录会话由 Supabase Auth SDK 管理；账单不再仅保存在当前浏览器中。

## 本地运行

需要 Git 和 Python 3。克隆仓库后，在仓库根目录启动静态服务器：

```bash
git clone https://github.com/dyorangeLOL/dyorangeLOL.github.io.git
cd dyorangeLOL.github.io
python -m http.server 8000 --bind 127.0.0.1
```

访问 [http://127.0.0.1:8000/Lily-Accounting/](http://127.0.0.1:8000/Lily-Accounting/)。

无需运行 `npm install` 或打包命令。使用 HTTP 服务器预览，避免直接通过 `file://` 打开页面。登录、账单读写和 CDN 依赖需要网络连接。

## 配置自己的 Supabase

如需部署自己的版本，请先准备独立的 Supabase 项目，再修改 [auth.js](./Lily-Accounting/auth.js) 中的配置：

```javascript
const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_PUBLIC_ANON_KEY";
```

前端只能使用适合浏览器公开使用的密钥，不能放入 `service_role` 或 secret key。密钥类型与使用范围见 [Supabase API keys 文档](https://supabase.com/docs/guides/getting-started/api-keys)。

当前前端依赖以下数据表与字段：

| 表 | 字段 |
| --- | --- |
| `public.expenses` | `id`、`user_id`、`description`、`amount`、`category`、`date`、`type`、`created_at` |
| `public.settings` | `user_id`、`budget`、`currency`、`theme`、`initial_funds`、`updated_at` |

`expenses.type` 使用 `expense` 或 `income`；新建分类保存为中文。`settings` 按 `user_id` 执行 upsert，因此该列需要相应的唯一约束。主题字段需要允许 `light`、`dark`、`github`、`github-dark`、`midnight`、`lavender` 六个值。

仓库暂未提供建表和迁移脚本，部署前需要自行配置数据库类型、默认值、约束与访问策略。为两张表启用行级安全（RLS），按登录用户的 `auth.uid()` 与 `user_id` 限制各项读写操作，并分别验证不同账号及未登录访问。前端页面的登录检查不能替代数据库授权，配置方法见 [Supabase RLS 文档](https://supabase.com/docs/guides/database/postgres/row-level-security)。

同时配置邮箱登录及网站地址；使用邮箱确认等跳转流程时，按 [Redirect URLs 文档](https://supabase.com/docs/guides/auth/redirect-urls)设置本地与正式站点的地址。以上是部署要求，现有线上数据库的实际策略仍需在对应 Supabase 项目中核验。

## GitHub Pages 部署

前端代码位于 `Lily-Accounting/`。保持该目录下 HTML、CSS、JavaScript、Logo 和 `assets/` 的相对路径完整，使用仓库对应的 GitHub Pages 发布配置即可，无需额外运行应用服务器。

当前站点地址：

```text
https://dyorangelol.github.io/Lily-Accounting/
```

更换仓库或访问路径后，同步检查页面资源路径、Supabase 网站地址与允许的跳转地址。提交代码后，需要等待 Pages 发布完成，再检查实际网页和图标资源。

## 目录结构

```text
Lily-Accounting/
├── index.html               # 首页
├── add.html                 # 新增账单
├── history.html             # 历史记录与备注搜索
├── analytics.html           # 数据分析页面
├── analytics.js             # 收支图表与周期导出
├── calendar.html            # 支出日历页面
├── calendar.js              # 日历数据与交互
├── calendar.css             # 日历样式
├── settings.html            # 个人设置与数据操作
├── auth.html                # 登录与注册页面
├── auth.js                  # 身份验证与会话
├── data.js                  # Supabase 账单与设置读写
├── script.js                # 常规页面初始化与账单渲染
├── icons.js                 # 图标创建、分类映射与状态更新
├── assets/icons/lily-icons.svg # 40 枚平面 SVG 图标
├── style.css                # 公共样式与主题
├── update-log.html          # 手工维护的更新日志
├── logo.png                 # 品牌 Logo 与 favicon
└── LICENSE                  # MIT 许可证与原作者版权声明
```

## 当前限制

- 货币设置尚未统一到所有页面：历史记录和数据分析仍有固定的 `¥` 显示；不进行汇率换算，也没有逐笔币种字段。
- 日历查询已分页；通用账单查询尚未分页，数据量较大时可能受到接口返回行数上限影响。
- 分析页目前主要使用缓存主题，云端主题同步仍有待完善。
- 表单可阻止同一页面的连续提交，但尚无数据库级请求幂等，多标签页或超时重试仍可能重复记账。
- “清理重复账单”按相同字段与 60 秒时间窗口识别记录，目前没有逐条候选预览。相同消费也可能是真实交易，清理前应先导出备份并确认适用范围。
- JSON 目前用于导出，尚无导入恢复入口。清理、删除和清空操作会影响云端记录。

## 许可证与致谢

Lily Accounting 基于 [SiddheshJadhav1234/expense-tracker](https://github.com/SiddheshJadhav1234/expense-tracker) 继续开发，采用 MIT 许可证。

原作者版权声明保留在 [Lily-Accounting/LICENSE](./Lily-Accounting/LICENSE) 中。后续复制、修改和分发应保留许可证及相关版权声明。
