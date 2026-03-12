# Pollinations Avatar Gen - Reforged ⚔️ (高级头像生成重铸版)

**简体中文** | [English](README.md)

[![Built With Pollinations.ai](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjQgMTI0Ij48Y2lyY2xlIGN4PSI2MiIgY3k9IjYyIiByPSI2MiIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

> **致谢**: 本项目是基于 **Nidelon** 开发的原始版本 [Pollinations Avatar Gen](https://github.com/Nidelon/pollinations-avatar-gen) 进行“重铸”的升级版。非常感谢原作者提供的出色构想与后端保存逻辑！

一款专为 [SillyTavern](https://github.com/SillyTavern/SillyTavern) 设计的高级扩展插件，使用 [Pollinations.ai](https://pollinations.ai) API，通过角色卡的文本描述自动提取特征，生成并替换精美的角色头像。

---

## ✨ 重铸版全新特性

* **🌍 全方位多语言支持**: 自动检测浏览器语言，原生支持中（简/繁）、英、日、韩、俄、西 7 种语言环境。
* **🛠️ 防崩溃状态机工作流**: 彻底重构生成流程。完美解决网络波动导致的提示词丢失问题，支持随时在“需求-确认-选图”等步骤中无损回退。
* **🎯 双快捷入口**: 支持通过角色操作栏的新增快捷按钮，或传统的下拉菜单，双通道一键唤出面板。
* **📚 预设与破甲词管理**: 内置强大的预设管理器，可以在设置面板中自由添加、删除、动态切换各种画风模板与魔法破甲词。
* **🏷️ 快捷标签面板**: 在生成阶段，支持一键将自定义的视觉特效标签插入到提示词文本框中，支持在面板中自定义管理。
* **🖼️ 网格选图与放大镜**: 支持单次最高生成 5 张图片，提供多图网格预览与全屏高清放大镜功能，轻松挑选最完美的一张。
* **💰 余额查询**: 支持直接在设置面板中一键查询 Pollen 钻石余额。

---

## ⚠️ 前置依赖 (必看)

**在安装本扩展之前**，您必须先安装服务端插件 `AvatarEdit`。否则本扩展将无法保存并替换生成的头像至本地。

1. **开启 ST 插件功能**
   打开 SillyTavern 根目录下的 `config.yaml`，确保以下设置项已开启：

       enableServerPlugins: true

2. **安装服务端插件**
   进入 SillyTavern 目录下的 `plugins` 文件夹，克隆必要的辅助插件仓库：

       cd plugins
       git clone https://github.com/Nidelon/SillyTavern-AvatarEdit

   *(安装完成后请彻底重启 SillyTavern 服务器)*。

---

## 📥 安装说明

1. 启动并打开 **[SillyTavern](https://github.com/SillyTavern/SillyTavern)**。
2. 点击顶部的 **扩展 (Extensions)** 菜单（积木图标）。
3. 展开并选择 **"安装扩展 (Install extension)"**。
4. 粘贴本仓库的链接：

       https://github.com/sunjichaocom/pollinations-avatar-gen-reforged

5. 点击 **安装 (Install)**。

---

## 🚀 使用指南与工作流

1. 打开任意角色的聊天界面。
2. 点击角色上方操作栏新增的 **头像按钮**，或者点击 **更多 (More...)** 下拉菜单选择 **深度定制头像**。
   <br>
   <img src="assets/menu.png" width="300" alt="入口展示">

3. 按照屏幕上直观的状态机工作流操作：

   **第一步：额外定制需求**
   一键插入想要的画质标签。您可以自由选择云端提取模型，甚至 **直接调用当前 ST 对话正在使用的大模型（Current API）** 进行提示词推敲！
   <br>
   <img src="assets/extra_needs.png" width="350" alt="定制需求"> &nbsp; <img src="assets/extra_needs_current.png" width="350" alt="当前模型提取">

   **第二步：确认绘画提示词**
   在此处自由修改提取出的英文 Tag，选择最终出图的画师模型（如 Flux），并设定单次生成的张数。
   <br>
   <img src="assets/confirm.png" width="400" alt="确认提示词">

   **第三步：画廊选图**
   并发生成完毕后，您可以在网格中进行预览，点击右上方放大镜进入高清全屏模式。挑选最完美的一张，点击替换即可！
   <br>
   <img src="assets/gallery.png" width="400" alt="画廊选图">

---

## ⚙️ 设置面板

您可以在 **扩展设置 -> Pollinations 高级头像生成** 选项卡中全方位配置本插件。
在这里您可以填写 API Key、查询余额、切换文本/绘画大模型，并统一管理您的画风模板、破甲词以及快捷标签库。

<img src="assets/settings.png" width="400" alt="设置面板">

---

## 📜 鸣谢与开源协议

* 原始概念与后端保存插件作者：[Nidelon](https://github.com/Nidelon)。
* 重铸版前端架构、多语言及 UI 状态机重构：**Sun**。
* 图像生成引擎驱动：**[pollinations.ai](https://pollinations.ai)**。
* 采用 **MIT 协议** 开源。
