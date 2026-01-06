import { ArticleCategory, Language } from '../../types';

export interface ArticlesPageContent {
  title: string;
  description: string;
}

export const ARTICLES_PAGE_DATA: Record<Language, ArticlesPageContent> = {
  zh: {
    title: '开发日志',
    description: '项目开发过程中的记录与思考。'
  },
  en: {
    title: 'Dev Log',
    description: 'Records and thoughts during project development.'
  }
};

export const ARTICLE_DATA: {
  id: string;
  common: {
    category: ArticleCategory;
    link?: string;
    coverImage?: string;
    date: string;
  };
  zh: { title: string; content?: string };
  en: { title: string; content?: string };
}[] = [
  {
    "id": "ruralit-day01",
    "common": {
      "category": ArticleCategory.RURALIT,
      "coverImage": "",
      "date": "2025-11-11"
    },
    "zh": {
      "title": "DAY01 - 项目逻辑梳理",
      "content": `# Ruralilt 项目逻辑梳理日报 - DAY01

**日期：** 2025年11月11日  
**项目：** Ruralilt - MediaPipe驱动的乡村儿童MR爵士舞创意平台  
**目标：** 留学作品集项目逻辑梳理

---

## 今日工作内容

### 1. 用户画像审查 ✅

**审查对象：**
- 主要用户：乡村儿童·小宇（9岁，小学3年级）
- 次要用户：在外务工父母·小宇爸妈（32-35岁）

**发现的问题：**
- ❌ 儿童痛点"缺创作工具"无数据支撑
- ❌ "分享渠道不便"逻辑不清
- ⚠️ 需求表述不够具体

**优化建议：**
- 痛点调整为：无专业师资、缺少专业的展示平台、与父母互动方式单一
- 需求具体化为：AI动作纠正、作品拍摄和美化、便捷分享、可视化学习进度

**结论：** 双用户画像策略正确，家长画像完善，儿童画像需微调

### 2. 设计挑战确认 ✅

**最终确定4个设计挑战：**
1. 如何让父母理解和支持孩子的舞蹈学习？
2. 如何保持儿童的学习动力和兴趣？
3. 如何实现低成本轻量化技术落地？
4. 如何通过舞蹈深化亲子情感连接？

**评估结果：**
- ✅ 数量合适（4个）
- ✅ 层次清晰（家长、儿童、技术、情感四个维度）
- ✅ 覆盖全面（所有调研痛点都被覆盖）
- ✅ 不重复、不遗漏

### 3. 方案发散 ✅

| 方案 | 核心形态 | 优势 | 劣势 |
|------|----------|------|------|
| NFC舞蹈学习工具包 | 实体+数字 | 仪式感强、情感载体 | 物流成本高、扩展性差 |
| AR舞蹈卡片收集 | 实体+数字 | 收集性强、社交属性 | 卡片成本、便捷性低 |
| 智能投影地毯 | 智能硬件 | 体感强、家庭娱乐 | 成本高、不便携 |
| 舞蹈盲盒公仔 | 实体+数字 | 吸引力强、陪伴感 | 成本高、可能攀比 |
| MR创意平台 | 纯数字 | 低成本、高便捷、强情感 | 无 |

**方案收敛逻辑：**
- MR平台以纯数字方式融合了所有方案的优点
- 虚拟收集替代实体卡片（零成本、无限扩展）
- 积分兑换实体周边保留"情感连接"的核心价值
- 唯一同时满足四个设计挑战的方案

### 4. 产品定位与设计策略 ✅

**产品定位：**

> Ruralilt - MediaPipe驱动的乡村儿童MR爵士舞创意平台
>
> 一款面向6-12岁乡镇儿童（含留守儿童）的低成本MR爵士舞创意平台，以"舞蹈教学+创作表达+亲情连接"为核心，用轻量化技术适配农村硬件条件，兼顾儿童趣味体验与父母远程互动便捷性，让乡村儿童无需专业师资与复杂硬件就能轻松学舞，同时通过作品分享、反馈互动及积分专属周边，搭建亲子情感沟通与自我展示的桥梁。

**三大设计策略：**

1. **三位一体的体验闭环**
   - 教学：MediaPipe实时动作捕捉 + AI纠错
   - 创作：MR场景化模板 + 特效，降低创作门槛
   - 情感：分享-反馈-积分奖励，搭建亲子桥梁

2. **轻量化技术适配**
   - 仅需安卓手机（覆盖85%乡镇儿童）
   - 优化算法适配中低端机型
   - 碎片化学习，单次10-15分钟

3. **可视化成果展示**
   - 自动生成精美作品视频
   - 学习报告呈现进步轨迹
   - 让家长"看得见"学习效果

### 5. 关键决策：用户体验旅程图 vs 服务蓝图 ✅

**最终决策：** 只保留用户体验旅程图

**决策理由：**
- Ruralilt是情感驱动型产品，不是工具型产品
- 核心价值是"情感连接"，需要展示用户情绪变化
- 双角色互动（儿童+家长）需要展示两者的体验
- 作品集需要展示同理心和洞察力
- 服务蓝图太系统化，失去温度

---

## 最终确定的项目结构

\`\`\`
【前期研究】
1. 灵感来源
2. 背景调研
3. 案例研究
4. 机会点总结
5. 用户调研
6. 用户画像
7. 设计挑战

【方案设计】
8. 方案发散
9. 方案收敛
10. 产品定位
11. 设计策略
12. 核心功能

【设计呈现】
13. 低保真设计
14. 高保真设计 + 界面流程（含故事板）
15. 核心技术实现（MediaPipe + MR）
16. 周边设计

【总结与验证】
17. 用户体验旅程图
18. 用户测试与迭代
19. 最终呈现（实拍+演示）
\`\`\`

---

## 今日关键洞察

### 1. 设计挑战 vs 设计目标的区别
- **设计挑战：** 问题导向（How might we…?）
- **设计目标：** 结果导向（We will…）
- 作品集更适合用"设计策略"而非量化的"设计目标"

### 2. 服务蓝图 vs 用户体验旅程图
- **服务蓝图：** 系统/服务提供者视角，展示系统如何运作
- **用户体验旅程图：** 用户生活场景视角，展示用户如何体验
- 情感驱动型产品必须有用户体验旅程图
- 工具型产品可以只有用户流程图

### 3. 方案发散的重要性
- 展示思考广度和决策逻辑
- 方案要真正拉开差距，不能是同类产品的变体
- 对比维度：产品形态、核心技术、成本、便捷性、情感连接

---

## 待解决问题
- 用户体验旅程图的详细内容规划
- 核心功能互动图的设计方案
- 低保真/高保真界面内容梳理
- 技术实现部分的展示方式
- 周边设计的逻辑关系

## 明日计划
- 细化用户体验旅程图内容
- 设计核心功能互动图
- 开始低保真界面规划

---

**今日进度：** ████████░░ 80%  
**逻辑完整度：** ✅ 高  
**下一步重点：** 用户体验旅程图详细设计`
    },
    "en": {
      "title": "DAY01 - Project Logic Review",
      "content": `# Ruralilt Project Logic Review - DAY01

**Date:** November 11, 2025  
**Project:** Ruralilt - MediaPipe-Powered MR Jazz Dance Creative Platform for Rural Children  
**Goal:** Portfolio project logic review

---

## Today's Work

### 1. User Persona Review ✅

**Review Subjects:**
- Primary User: Rural Child - Xiaoyu (9 years old, 3rd grade)
- Secondary User: Migrant Worker Parents - Xiaoyu's Parents (32-35 years old)

**Issues Found:**
- ❌ Child's pain point "lack of creative tools" has no data support
- ❌ "Inconvenient sharing channels" logic unclear
- ⚠️ Needs are not specific enough

**Optimization Suggestions:**
- Adjust pain points to: No professional teachers, lack of professional showcase platform, limited interaction with parents
- Specify needs as: AI motion correction, work recording and beautification, easy sharing, visual learning progress

**Conclusion:** Dual-user persona strategy is correct, parent persona is complete, child persona needs minor adjustments

### 2. Design Challenge Confirmation ✅

**Final 4 Design Challenges:**
1. How to help parents understand and support their child's dance learning?
2. How to maintain children's learning motivation and interest?
3. How to achieve low-cost lightweight technology implementation?
4. How to deepen parent-child emotional connection through dance?

**Evaluation Results:**
- ✅ Appropriate quantity (4)
- ✅ Clear hierarchy (parent, child, technology, emotion - four dimensions)
- ✅ Comprehensive coverage (all research pain points covered)
- ✅ No duplication, no omission

### 3. Solution Brainstorming ✅

| Solution | Core Form | Advantages | Disadvantages |
|----------|-----------|------------|---------------|
| NFC Dance Learning Kit | Physical+Digital | Strong ritual sense, emotional carrier | High logistics cost, poor scalability |
| AR Dance Card Collection | Physical+Digital | Strong collectibility, social attributes | Card cost, low convenience |
| Smart Projection Carpet | Smart Hardware | Strong physical sense, family entertainment | High cost, not portable |
| Dance Blind Box Figurine | Physical+Digital | High attraction, companionship | High cost, potential comparison |
| MR Creative Platform | Pure Digital | Low cost, high convenience, strong emotion | None |

**Solution Convergence Logic:**
- MR platform combines advantages of all solutions in pure digital form
- Virtual collection replaces physical cards (zero cost, unlimited expansion)
- Points exchange for physical merchandise retains core value of "emotional connection"
- Only solution that simultaneously meets all four design challenges

### 4. Product Positioning & Design Strategy ✅

**Product Positioning:**

> Ruralilt - MediaPipe-Powered MR Jazz Dance Creative Platform for Rural Children
>
> A low-cost MR jazz dance creative platform for 6-12 year old rural children (including left-behind children), with "dance teaching + creative expression + family connection" as the core. Using lightweight technology adapted to rural hardware conditions, balancing children's fun experience with parents' remote interaction convenience, allowing rural children to easily learn dance without professional teachers and complex hardware, while building a bridge for parent-child emotional communication and self-expression through work sharing, feedback interaction, and exclusive merchandise rewards.

**Three Design Strategies:**

1. **Trinity Experience Loop**
   - Teaching: MediaPipe real-time motion capture + AI correction
   - Creation: MR scene templates + effects, lowering creation barriers
   - Emotion: Share-feedback-reward points, building parent-child bridge

2. **Lightweight Technology Adaptation**
   - Only requires Android phone (covers 85% of rural children)
   - Optimized algorithms for mid-to-low-end devices
   - Fragmented learning, 10-15 minutes per session

3. **Visual Achievement Display**
   - Auto-generate beautiful work videos
   - Learning reports showing progress trajectory
   - Let parents "see" learning results

### 5. Key Decision: User Journey Map vs Service Blueprint ✅

**Final Decision:** Keep only User Journey Map

**Decision Rationale:**
- Ruralilt is an emotion-driven product, not a tool-based product
- Core value is "emotional connection", need to show user emotion changes
- Dual-role interaction (child + parent) needs to show both experiences
- Portfolio needs to demonstrate empathy and insight
- Service blueprint is too systematic, loses warmth

---

## Final Project Structure

\`\`\`
【Pre-Research】
1. Inspiration Source
2. Background Research
3. Case Studies
4. Opportunity Summary
5. User Research
6. User Personas
7. Design Challenges

【Solution Design】
8. Solution Brainstorming
9. Solution Convergence
10. Product Positioning
11. Design Strategy
12. Core Features

【Design Presentation】
13. Low-Fidelity Design
14. High-Fidelity Design + Interface Flow (with Storyboard)
15. Core Technology Implementation (MediaPipe + MR)
16. Merchandise Design

【Summary & Validation】
17. User Journey Map
18. User Testing & Iteration
19. Final Presentation (Live Demo)
\`\`\`

---

## Today's Key Insights

### 1. Design Challenge vs Design Goal
- **Design Challenge:** Problem-oriented (How might we…?)
- **Design Goal:** Result-oriented (We will…)
- Portfolio is better suited for "design strategy" rather than quantified "design goals"

### 2. Service Blueprint vs User Journey Map
- **Service Blueprint:** System/service provider perspective, shows how system operates
- **User Journey Map:** User life scenario perspective, shows how user experiences
- Emotion-driven products must have user journey maps
- Tool-based products can have only user flow diagrams

### 3. Importance of Solution Brainstorming
- Demonstrates breadth of thinking and decision logic
- Solutions must truly differentiate, not be variants of similar products
- Comparison dimensions: product form, core technology, cost, convenience, emotional connection

---

## Pending Issues
- Detailed content planning for user journey map
- Design plan for core feature interaction diagram
- Low-fidelity/high-fidelity interface content organization
- Presentation method for technical implementation
- Logical relationship of merchandise design

## Tomorrow's Plan
- Detail user journey map content
- Design core feature interaction diagram
- Begin low-fidelity interface planning

---

**Today's Progress:** ████████░░ 80%  
**Logic Completeness:** ✅ High  
**Next Focus:** Detailed user journey map design`
    }
  },
  {
    "id": "ruralit-day02",
    "common": {
      "category": ArticleCategory.RURALIT,
      "coverImage": "",
      "date": "2025-11-12"
    },
    "zh": {
      "title": "DAY02 - 用户体验旅程图设计",
      "content": ""
    },
    "en": {
      "title": "DAY02 - User Journey Map Design",
      "content": ""
    }
  },
  {
    "id": "ruralit-day03",
    "common": {
      "category": ArticleCategory.RURALIT,
      "coverImage": "",
      "date": "2025-11-13"
    },
    "zh": {
      "title": "DAY03 - 核心功能交互设计",
      "content": ""
    },
    "en": {
      "title": "DAY03 - Core Feature Interaction Design",
      "content": ""
    }
  }
];
