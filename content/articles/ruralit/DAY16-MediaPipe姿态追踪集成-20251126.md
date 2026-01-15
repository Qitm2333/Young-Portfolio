# Ruralilt 项目日报 - DAY16

**日期：** 2025年11月26日
**项目：** Ruralilt - MediaPipe驱动的乡村儿童舞蹈学习与社交平台
**目标：** MediaPipe Pose集成 + 骨骼点实时渲染

---

## 今日工作内容

### 1. MediaPipe Pose环境配置 ✅

#### 1.1 依赖安装

```bash
npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils
```

#### 1.2 核心配置参数

```typescript
const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

pose.setOptions({
  modelComplexity: 1,        // 0=轻量 1=标准 2=重型
  smoothLandmarks: true,     // 平滑处理
  enableSegmentation: false, // 不需要人体分割
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

**参数选择理由：**
- `modelComplexity: 1` — 平衡精度和性能，中端设备友好
- `smoothLandmarks: true` — 减少骨骼点抖动，动作更流畅
- `enableSegmentation: false` — 不需要背景分割，节省性能

---

### 2. 骨骼点实时渲染 ✅

#### 2.1 Canvas叠加层架构

```
┌─────────────────────────────┐
│      Canvas (骨骼绘制)       │  ← z-index: 2
├─────────────────────────────┤
│      Video (摄像头画面)      │  ← z-index: 1
└─────────────────────────────┘
```

#### 2.2 33个关键点定义

```typescript
// MediaPipe Pose 关键点索引
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};
```

#### 2.3 骨骼连接线配置

```typescript
// 舞蹈学习重点关注的连接
const DANCE_CONNECTIONS = [
  // 躯干
  [11, 12], // 双肩
  [11, 23], // 左肩-左髋
  [12, 24], // 右肩-右髋
  [23, 24], // 双髋
  
  // 手臂（舞蹈核心）
  [11, 13], [13, 15], // 左臂
  [12, 14], [14, 16], // 右臂
  
  // 腿部
  [23, 25], [25, 27], // 左腿
  [24, 26], [26, 28], // 右腿
];
```

#### 2.4 绘制样式

```typescript
// 骨骼线样式
const lineStyle = {
  color: '#00FF00',      // 绿色
  lineWidth: 4,
  lineCap: 'round'
};

// 关键点样式
const pointStyle = {
  color: '#FF0000',      // 红色
  radius: 6,
  fillColor: '#FFFFFF'   // 白色填充
};
```

---

### 3. 坐标系统处理 ✅

#### 3.1 关键发现：归一化坐标

**MediaPipe输出的是归一化坐标(0-1)，不是像素坐标！**

```typescript
// ❌ 错误做法：手动转换
const x = landmark.x * canvas.width;
const y = landmark.y * canvas.height;

// ✅ 正确做法：直接使用MediaPipe绘制函数
drawConnectors(ctx, landmarks, connections, {
  color: '#00FF00',
  lineWidth: 4
});
drawLandmarks(ctx, landmarks, {
  color: '#FF0000',
  radius: 6
});
```

#### 3.2 镜像处理（前置摄像头）

```typescript
// 前置摄像头需要水平翻转
ctx.save();
ctx.scale(-1, 1);
ctx.translate(-canvas.width, 0);
// 绘制骨骼...
ctx.restore();
```

---

### 4. 性能优化 ✅

#### 4.1 帧率控制

```typescript
let lastTime = 0;
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

function onResults(results) {
  const now = performance.now();
  if (now - lastTime < frameInterval) return;
  lastTime = now;
  
  // 绘制逻辑...
}
```

#### 4.2 性能测试结果

| 设备 | 帧率 | CPU占用 | 状态 |
|------|------|---------|------|
| 高端机（骁龙8 Gen2） | 30fps | 25% | ✅ 流畅 |
| 中端机（骁龙778G） | 28fps | 45% | ✅ 可用 |
| 低端机（骁龙680） | 18fps | 70% | ⚠️ 勉强 |

#### 4.3 低端设备降级策略

```typescript
// 检测设备性能
const isLowEnd = navigator.hardwareConcurrency <= 4;

if (isLowEnd) {
  pose.setOptions({
    modelComplexity: 0,  // 使用轻量模型
    smoothLandmarks: false
  });
}
```

---

### 5. 组件封装 ✅

**文件：** `src/components/PoseDetection.tsx`

```typescript
interface PoseDetectionProps {
  onPoseDetected: (landmarks: NormalizedLandmark[]) => void;
  showSkeleton?: boolean;
  mirrorMode?: boolean;
}

export const PoseDetection: React.FC<PoseDetectionProps> = ({
  onPoseDetected,
  showSkeleton = true,
  mirrorMode = true
}) => {
  // 实现...
};
```

---

## 今日关键洞察

### 1. 坐标系统是最大坑点
- MediaPipe的`drawConnectors`和`drawLandmarks`内部处理坐标转换
- 手动转换会导致骨骼点位置错误
- 文档没有明确说明这一点，靠踩坑发现

### 2. 前置摄像头镜像问题
- 用户习惯看镜像画面（像照镜子）
- 但骨骼点数据是非镜像的
- 解决：Canvas绘制时做镜像变换

### 3. 性能与精度的权衡
- `modelComplexity: 2` 精度最高但太卡
- `modelComplexity: 0` 流畅但手指识别差
- 舞蹈场景选择 `modelComplexity: 1` 最合适

---

## 待解决问题

1. **手部细节追踪**
   - Pose模型手部精度有限
   - 考虑是否需要额外集成Hand模型

2. **多人场景**
   - 当前只追踪单人
   - 多人场景需要额外处理

3. **遮挡处理**
   - 部分身体被遮挡时骨骼点会跳动
   - 需要加入置信度过滤

---

## 明日计划

### DAY16 目标：评分算法实现

1. **标准动作数据采集**
   - 录制示范动作
   - 导出关键帧骨骼数据（JSON）

2. **余弦相似度算法**
   - 向量化骨骼点
   - 实时计算相似度

3. **评分UI实现**
   - 实时分数显示
   - 分数变化动画

---

## 今日成果总结

✅ MediaPipe Pose成功集成，骨骼点实时渲染
✅ 解决坐标系统和镜像问题
✅ 中端设备28fps，满足基本需求
✅ 封装可复用的PoseDetection组件

**核心突破：** 理解MediaPipe坐标系统，骨骼点终于正确显示了！

---

**项目进度：** █████████░ 50%（姿态追踪核心完成）
