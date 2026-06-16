# 建筑施工3D进度管理系统

基于 React + Three.js 的建筑施工进度三维可视化管理平台。

## 功能特性

- **3D 建筑模型**：15 层建筑以不同颜色区分施工状态（绿色已完工、黄色施工中、灰色未开始）
- **楼层交互**：鼠标悬浮显示楼层工序进度和班组信息，点击楼层自动飞到对应视角
- **顶部数据栏**：实时显示总体完成率、计划/已用工期天数、施工人数
- **时间轴滑块**：拖动查看 60 天内不同日期的施工进度快照
- **右侧楼层列表**：按楼层展开，显示水电、砌墙、装修等各工序完成情况

## 技术栈

- Vite 6 + React 18 + TypeScript
- @react-three/fiber + @react-three/drei + three.js
- 纯 CSS 内联样式（无第三方 UI 库）

## 启动

```bash
npm install
npm run dev
```

默认运行在 `http://localhost:3000`。

## 生产构建

```bash
npm run build
npm run preview
```

## 项目结构

```
src/
  main.tsx              # 入口
  App.tsx               # 主组件
  data/
    constructionData.ts # 模拟数据
  components/
    BuildingScene.tsx   # 3D 场景
    FloorList.tsx       # 右侧楼层列表
    HUD.tsx             # 顶部数据栏
    TimeSlider.tsx      # 底部时间轴
    FloorTooltip.tsx    # 悬浮提示
```
