---
layout: post
title: "【教程操作】博客的多种搭建方式"
subtitle: ""
date: 2025-06-09 12:00:00 +0800
tags: [教程操作]
---

## 1. 局限性说明

由于本人学识浅薄，在讲解一些专业技术时可能不够深刻，或存在些许错漏，请各位读者多多担待。

---

## 2. 博客主要分类与示例

### 2.1 原生开发

我的个人博客即采用原生开发，可以通过以下链接访问本网页：

* **演示地址**：[https://kobezyx.com/](https://kobezyx.com/) 或 [https://kobezyx.xx.kg/](https://www.google.com/search?q=https://kobezyx.xx.kg/)
* **开源代码**：[点击这里访问 GitHub](https://github.com/Kobe-zyx/blog-demo)

### 2.2 Hexo 框架

我之前的个人博客是基于 Hexo 框架开发的（现已弃用，但仍可访问），此网站目前已经闭源。在此特别感谢 **【安知鱼】** 大佬的开源精神！

* **历史演示地址**：[点击这里访问](https://kobeblog.dpdns.org/)
* **相关资源**：
* [Hexo 官方网站](https://hexo.io/zh-cn/)
* [Hexo 官方主题库](https://hexo.io/themes/)
* [我使用的主题 (Anzhiyu)](https://github.com/anzhiyu-c/hexo-theme-anzhiyu)



---

## 3. 实际操作指南

### 3.1 原生开发 (HTML/CSS/JavaScript)

如果你已经了解如何编写 HTML/CSS/JavaScript，请直接跳转到下方的**推送全网**步骤。如果还不熟悉，可以参考以下借助 AI 的简易开发流程：

**第一步：利用 AI 工具生成代码**
你可以通过以下网页端 AI 或集成 AI 的代码编辑器来辅助编写代码：

| 工具类型 | 推荐工具与链接 | 适用模型示例 | 效果评价 |
| --- | --- | --- | --- |
| **网页端 AI** | [Gemini](https://gemini.google.com/app) | Gemini 2.5 Flash / Pro | 响应迅速 |
| **网页端 AI** | [Claude](https://claude.ai/onboarding) | Claude 3.7 / 4 Sonnet | **Claude 4 Sonnet 效果最佳** |
| **AI 代码编辑器** | [Cursor](https://www.cursor.com/cn) | 聚合多种大模型 | **效果最佳** |
| **AI 代码编辑器** | [Trae](https://www.trae.ai/) | 聚合多种大模型 | 值得一试 |

**第二步：本地预览代码**
将 AI 生成的代码保存在本地文件夹中，并在代码编辑器中点击 HTML 文件进行本地预览。建议的命名规范如下：

* **主页代码**：`index.html`
* **样式代码**：`style.css`
* **脚本代码**：`script.js`

**第三步：推送到 CloudFlare 全球网络 (简易实现方式)**

1. 打开 [CloudFlare 官网](https://www.cloudflare.com/zh-cn/) 并注册/登录账号。
2. 在左侧菜单点击**计算 (Workers)**，然后点击**创建**。
3. 选择 **Pages**，并选择**使用直接上传**。
4. 为项目命名后，直接上传你的代码文件夹。
5. 部署完成后，使用系统分配的 `pages.dev` 域名即可访问。

> **预告**：有条件的同学可以配置自定义域名，我以后会出一期专门讲解如何将域名托管到 CloudFlare 的博文，敬请期待！

**第四步：普通实现方式 (进阶推荐)**
代码生成及预览部分与上述简易方式相同，区别在于部署流程：

1. 在 GitHub 中创建一个存储库（Repository），并将代码推送到该库。
2. 在 CloudFlare Pages 中选择**导入现有 Git 存储库**。
3. 连接并授权你的 GitHub 账号，选择刚才创建的存储库进行部署，同样使用 `pages.dev` 域名访问。

**普通实现方式的优势：**

* 有助于代码开源，方便实现商用。
* 在本地源码丢失时，方便从云端找回。
* 方便与其他开发者进行技术交流。

### 3.2 Hexo 框架搭建

> **注意**：请务必先阅读相关的【GitHub Pages + Hexo 搭建个人博客】基础教程，本文将省略基础环境配置步骤。网络环境问题请自行解决，本文不提供相关帮助。

**第一步：安装与配置主题**
本文以安装 Anzhiyu 主题为例，你也可以根据喜好选择其他主题。

1. 访问安知鱼的 [GitHub 项目页](https://github.com/anzhiyu-c/hexo-theme-anzhiyu) 或阅读 [作者官方安装文档](https://docs.anheyu.com/)。
2. 根据文档安装 Git 并拉取主题资源。
3. 打开推荐的代码编辑器（如 [VS Code](https://code.visualstudio.com/)）。
4. 修改 Hexo 根目录的配置文件 `_config.yml`，将 `theme` 字段改为 `anzhiyu`。
5. 安装渲染器依赖（如果没有的话）：执行命令 `npm install hexo-renderer-pug hexo-renderer-stylus --save`。

**第二步：配置覆盖 (强烈建议)**
为了避免在更新主题时丢失自定义配置，建议将主题配置提取到根目录。通过 npm 安装主题的用户可忽略此步。

* **Mac OS / Linux**：在博客根目录运行 `cp -rf ./themes/anzhiyu/_config.yml ./_config.anzhiyu.yml`
* **Windows**：手动复制 `/themes/anzhiyu/_config.yml` 文件到 Hexo 根目录，并重命名为 `_config.anzhiyu.yml`。
以后只需修改根目录下的 `_config.anzhiyu.yml` 即可。

**第三步：推送与部署**
将 GitHub 链接到本地存储库后即可推送。

* **仓库命名限制**：必须命名为 `用户名.github.io`。
* **Repository 格式**：`用户名/用户名.github.io.git`（如图所示）。

**常用 Hexo 终端命令速查表：**

| 操作目的 | 终端命令 |
| --- | --- |
| **清空缓存** | `hexo cl` (或 `hexo clean`) |
| **生成静态文件** | `hexo g` (或 `hexo generate`) |
| **本地预览 (开放端口)** | `hexo s` (或 `hexo server`) |
| **部署全网** | `hexo d` (或 `hexo deploy`) |

---

## 4. 结语

目前我对这两种搭建方式比较熟悉。如果后续在学习中有了新的体会和技术积累，我会继续完善这篇博文，感谢大家的阅读！

