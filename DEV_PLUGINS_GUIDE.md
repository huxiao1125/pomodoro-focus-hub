# Java & Vue 全栈开发环境插件推荐与配置指南

> 本指南专为 **Java + Vue 全栈开发工程师** 量身定制，涵盖 IDE 核心编码插件、全栈效率工具、AI 智能体技能，以及开箱即用的配置模板。

---

## 目录

- [一、Java 后端核心插件（必装）](#一java-后端核心插件必装)
- [二、Vue 前端核心插件（必装）](#二vue-前端核心插件必装)
- [三、全栈通用与工程效率神器](#三全栈通用与工程效率神器)
- [四、AI 智能体专属技能（Agent Skills）](#四ai-智能体专属技能agent-skills)
- [五、推荐 `settings.json` 配置片段](#五推荐-settingsjson-配置片段)

---

## 一、Java 后端核心插件（必装）

| 插件名称 | 插件 ID (Extension ID) | 核心价值与业务意图 |
| :--- | :--- | :--- |
| **Extension Pack for Java** | `vscjava.vscode-java-pack` | **官方全家桶**。包含 Red Hat 语言支持、Java 调试器、Maven 管理器、单元测试运行器。Java 开发的底层基石。 |
| **Spring Boot Extension Pack** | `vmware.vscode-boot-dev-pack` | VMware 官方出品。提供 `@Component`、`@Autowired` 等 Bean 互相导航、`application.yml` 提示补全与 Spring Boot 运行仪表盘。 |
| **MyBatisX** | `baomidou.mybatisx` | **国内开发必备**。支持在 Mapper Java 接口和 XML 之间实现“小蓝鸟”一键相互跳转，支持方法自动生成与 SQL 智能补全。 |
| **Lombok Annotations Support** | `gaborv.lombok-annotations-support` | 完美识别 `@Data`、`@Builder`、`@Slf4j` 等注解，避免编辑器产生虚假的“找不到 Getter/Setter”报错。 |

---

## 二、Vue 前端核心插件（必装）

| 插件名称 | 插件 ID (Extension ID) | 适用场景与核心价值 |
| :--- | :--- | :--- |
| **Vue - Official** | `vue.volar` | **Vue 3 新项目必备（原 Volar）**。为 Vue 3、`<script setup>` 及 TypeScript 提供顶级的语法高亮、类型推导与模板静态类型检查。 |
| **Vetur** | `octref.vetur` | **Vue 2 老项目专用**。维护 Vue 2 + Webpack 项目时推荐安装（*注意：与 Volar 互斥，在 Vue 3 项目中建议禁用*）。 |
| **ESLint** | `dbaeumer.vscode-eslint` | 实时检测 JavaScript/TypeScript 代码语法规范与潜在错误。 |
| **Prettier - Code formatter** | `esbenp.prettier-vscode` | 业界公认的代码美化器，保存时统一团队缩进、单双引号与分号风格。 |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | 修改开标签时闭合标签同步更新，大幅提升写 `<template>` 结构的流畅度。 |
| **Auto Close Tag** | `formulahendry.auto-close-tag` | 输入 HTML/XML 开标签后自动补全对应的闭合标签。 |
| **Path Intellisense** | `christian-kohler.path-intellisense` | 文件路径自动联想补全，支持 `@/` 等 alias 别名快速定位。 |

---

## 三、全栈通用与工程效率神器

| 插件名称 | 插件 ID | 核心价值 |
| :--- | :--- | :--- |
| **Error Lens** | `usernamehw.errorlens` | **找 Bug 提速翻倍**。直接把语法报错和警告文字醒目打在当前行代码末尾，无需鼠标悬停查看。 |
| **GitLens — Git supercharged** | `eamodio.gitlens` | 光标停留行直接显示最后修改者、提交时间与 Commit 信息，提供清晰的可视化分支对比与文件历史。 |
| **Thunder Client** | `rangav.vscode-thunder-client` | 轻量级内嵌 REST API 接口调试器，可在 IDE 内部测试 Controller 接口，替代笨重的外部 Postman。 |
| **Database Client** | `cweijan.vscode-database-client2` | 编辑器内嵌数据库管理工具，直接连接 MySQL、Redis、PostgreSQL，直接查看表结构和执行 SQL。 |

---

## 四、AI 智能体专属技能（Agent Skills）

当前系统已在全局安装部署了针对高级软件工程工作流的技能支持：

1. **`superpowers`**（来自 `roundpilot/superpowers-antigravity`）：
   - **核心理念**：测试驱动开发（TDD）与多智能体分工协同。
   - **使用场景**：编写复杂功能前自动先写单元测试，遇到复杂 Bug 时多视角根因推演。
2. **`conventional-commits`**：
   - **核心理念**：规范化 Git 提交信息。
   - **使用场景**：编码完成后，指示 AI “根据改动生成 commit message”，自动分析 `git diff` 生成符合标准语义的提交描述。
3. **`code-review-pr`**：
   - **核心理念**：工业级代码审查。
   - **使用场景**：提 PR 或合并分支前，指示 AI 针对安全性（OWASP Top 10）、性能瓶颈和坏味道进行多维度 Review。

---

## 五、推荐 `settings.json` 配置片段

按 `Ctrl + Shift + P` 打开命令面板，输入 `Preferences: Open User Settings (JSON)`，推荐加入以下常用优化配置：

```json
{
  // ================= 格式化与保存 =================
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // ================= Vue / 语言专用格式化 =================
  "[vue]": {
    "editor.defaultFormatter": "vue.volar"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // ================= Java 配置 =================
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.compile.nullAnalysis.mode": "automatic",
  "java.format.enabled": true,

  // ================= 路径提示映射 =================
  "path-intellisense.mappings": {
    "@": "${workspaceFolder}/src"
  },

  // ================= Error Lens 告警显示 =================
  "errorLens.enabledDiagnosticLevels": [
    "error",
    "warning"
  ]
}
```
