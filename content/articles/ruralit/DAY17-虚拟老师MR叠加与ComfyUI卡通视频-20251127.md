# Ruralilt 项目日报 - DAY17

**日期：** 2025年11月27日
**项目：** Ruralilt - MediaPipe驱动的乡村儿童舞蹈学习与社交平台
**目标：** 虚拟老师MR叠加 + ComfyUI实现卡通视频课程转化

---

## 今日工作内容

### 1. 虚拟老师MR叠加实现 ✅

#### 1.1 画中画架构设计

```
┌─────────────────────────────────────┐
│                                     │
│     用户摄像头画面（全屏）            │
│                                     │
│  ┌──────────┐                       │
│  │ 虚拟老师  │  ← 可拖动/缩放        │
│  │ 视频窗口  │     默认左下角         │
│  └──────────┘                       │
│                                     │
└─────────────────────────────────────┘
```

#### 1.2 视频叠加组件

```typescript
interface VirtualTeacherProps {
  videoSrc: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  draggable?: boolean;
}

const VirtualTeacher: React.FC<VirtualTeacherProps> = ({
  videoSrc,
  position = { x: 20, y: 'auto', bottom: 100 },
  size = { width: 120, height: 160 },
  draggable = true
}) => {
  const [pos, setPos] = useState(position);
  
  return (
    <div 
      className="virtual-teacher-container"
      style={{
        position: 'absolute',
        left: pos.x,
        bottom: pos.bottom,
        width: size.width,
        height: size.height,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};
```

#### 1.3 绿幕去除（Chroma Key）

**方案A：CSS滤镜（简单但效果一般）**
```css
.green-screen-video {
  mix-blend-mode: multiply;
  /* 或使用 filter */
}
```

**方案B：Canvas像素处理（效果好）**
```typescript
function removeGreenScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 检测绿色（可调阈值）
    if (g > 100 && g > r * 1.4 && g > b * 1.4) {
      data[i + 3] = 0; // 设置透明
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
```

**最终选择：** 方案B，效果更干净

#### 1.4 视频同步控制

```typescript
// 播放速度控制（0.5x / 1x / 1.5x）
const [playbackRate, setPlaybackRate] = useState(1);

useEffect(() => {
  if (videoRef.current) {
    videoRef.current.playbackRate = playbackRate;
  }
}, [playbackRate]);

// 暂停/继续
const togglePlay = () => {
  if (videoRef.current.paused) {
    videoRef.current.play();
  } else {
    videoRef.current.pause();
  }
};
```

---

### 2. ComfyUI卡通视频转化 ✅

#### 2.1 为什么用ComfyUI？

**需求：** 将真人舞蹈示范视频转化为卡通风格，与IP视觉统一

**方案对比：**
| 方案 | 优点 | 缺点 |
|------|------|------|
| 手绘动画 | 效果最好 | 成本极高，周期长 |
| Live2D | 实时可控 | 需要建模，不适合全身 |
| ComfyUI | 批量处理，风格可控 | 需要调参，有学习成本 |

**选择ComfyUI：** 性价比最高，一次调好工作流可批量出片

#### 2.2 ComfyUI工作流设计

```
输入：真人舞蹈视频（逐帧提取）
         ↓
    帧提取（FFmpeg）
         ↓
    风格迁移（SD + ControlNet）
         ↓
    帧合成（FFmpeg）
         ↓
输出：卡通风格舞蹈视频
```

#### 2.3 关键节点配置

**1. 视频帧提取**
```bash
ffmpeg -i input.mp4 -vf fps=12 frames/frame_%04d.png
```

**2. ComfyUI工作流核心节点**
```
Load Image (Batch)
      ↓
ControlNet Preprocessor (OpenPose)
      ↓
KSampler
├── Model: cartoonify_v1.safetensors
├── ControlNet: control_openpose
├── Strength: 0.8
├── Steps: 20
└── CFG: 7
      ↓
VAE Decode
      ↓
Save Image (Batch)
```

**3. 帧合成视频**
```bash
ffmpeg -framerate 12 -i output/frame_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```

#### 2.4 风格参数调优

**Prompt模板：**
```
cartoon style, cute character, soft colors, 
children illustration, smooth lines, 
dancing pose, full body, white background
```

**Negative Prompt：**
```
realistic, photo, ugly, deformed, 
blurry, low quality, text, watermark
```

**ControlNet设置：**
- Preprocessor: `openpose_full`
- Control Weight: `0.85`
- 保持动作准确性，同时允许风格化

#### 2.5 批处理脚本

```python
import os
import subprocess

def process_dance_video(input_video, output_video):
    # 1. 提取帧
    os.makedirs('temp_frames', exist_ok=True)
    subprocess.run([
        'ffmpeg', '-i', input_video,
        '-vf', 'fps=12',
        'temp_frames/frame_%04d.png'
    ])
    
    # 2. ComfyUI批处理（通过API调用）
    # ... 调用ComfyUI API处理每一帧
    
    # 3. 合成视频
    subprocess.run([
        'ffmpeg', '-framerate', '12',
        '-i', 'output_frames/frame_%04d.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        output_video
    ])
    
    # 4. 清理临时文件
    # ...
```

#### 2.6 转化效果示例

| 原始视频 | 转化后 |
|----------|--------|
| 真人老师示范 | 卡通风格，线条柔和 |
| 复杂背景 | 纯色/简化背景 |
| 写实光影 | 平面插画风格 |

**处理时间：** 1分钟视频约需30分钟（RTX 3060）

---

### 3. 练习界面整合 ✅

#### 3.1 完整界面层级

```
┌─────────────────────────────────────┐
│  [90 score]              顶部评分   │
│                                     │
│     "Reach higher!"    纠错提示     │
│                                     │
│        🐨               考拉IP      │
│      ✨✨✨             粒子特效     │
│                                     │
│  ┌──────────┐                       │
│  │ 卡通老师  │         虚拟老师      │
│  └──────────┘                       │
│                                     │
│  [🐨][0.5x][⏸️][👤][📷]  底部控制栏  │
└─────────────────────────────────────┘
```

#### 3.2 控制栏功能

```typescript
const ControlBar: React.FC = () => {
  return (
    <div className="control-bar">
      <button onClick={toggleIP}>🐨</button>      {/* 切换IP角色 */}
      <button onClick={changeSpeed}>x0.5</button> {/* 速度调节 */}
      <button onClick={togglePause}>⏸️</button>   {/* 暂停/继续 */}
      <button onClick={toggleSkeleton}>👤</button> {/* 骨骼显示 */}
      <button onClick={capture}>📷</button>       {/* 截图 */}
    </div>
  );
};
```

---

## 今日关键洞察

### 1. 绿幕去除的坑
- 纯CSS方案效果差，边缘有绿边
- Canvas逐像素处理效果好但性能开销大
- 折中：预处理视频去绿幕，运行时直接用透明视频（WebM格式）

### 2. ComfyUI的学习曲线
- 节点式操作需要适应
- ControlNet是保持动作一致性的关键
- 批处理需要写脚本，不能纯GUI操作

### 3. 视频风格一致性
- 同一套Prompt + Seed可以保证风格统一
- 不同课程可以用不同色调区分难度
- 建议：初级课程暖色调，高级课程冷色调

---

## 待解决问题

1. **视频文件体积**
   - 卡通视频比原始视频大（细节增加）
   - 需要压缩优化

2. **实时绿幕去除性能**
   - Canvas处理30fps有压力
   - 考虑预处理成WebM透明视频

3. **ComfyUI部署**
   - 本地处理OK，但无法给用户用
   - 后续考虑云端API

---

## 明日计划

### DAY17 目标：扫码功能 + 整体联调

1. **ML Kit扫码集成**
2. **扫码→解锁→弹窗流程**
3. **学习流程完整测试**

---

## 今日成果总结

✅ 虚拟老师画中画叠加实现，支持拖动/速度控制
✅ 绿幕去除方案验证（Canvas像素处理）
✅ ComfyUI卡通视频转化工作流搭建完成
✅ 练习界面控制栏功能完整

**核心突破：** 真人视频→卡通风格的pipeline跑通，视觉统一性有保障！

---

**项目进度：** ██████████ 55%（MR叠加+视频转化完成）
