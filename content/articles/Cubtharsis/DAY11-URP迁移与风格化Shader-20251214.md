# DAY11 - 2025.12.14 (周日)

## 完成内容

### URP 渲染管线迁移

从 Built-in 管线迁移到 URP：
- 安装 Universal RP 包
- 创建 URP Asset 和 Renderer 配置
- Graphics 和 Quality Settings 配置

**材质批量替换工具**：
创建 `Scripts/Editor/MaterialReplacer.cs`
- 一键替换场景中所有 MeshRenderer 的材质
- 解决 Built-in Default-Material 在 URP 下显示粉红色的问题

---

### 风格化 Shader Graph 开发

创建水彩/手绘风格 Shader，参考 Cocoon 等游戏的柔和视觉效果：

**基础明暗**：
- Custom Function 获取 Main Light Direction（需要 hlsl 文件）
- Normal · LightDir 计算明暗
- Smoothstep 柔和过渡
- Lerp 混合亮部/暗部颜色

**水彩纹理效果**：
- Screen Position（Raw）获取屏幕空间 UV
- Tiling And Offset 控制纹理密度
- Sample Texture 2D 采样纸张/水彩纹理
- Multiply 叠加到颜色上

**Voronoi 笔触效果**：
- Voronoi 噪波模拟笔触质感
- Noise 扭曲 UV 产生不规则感
- Smoothstep 控制笔触强度

**UV 边缘检测**：
- Frac + Split 分离 UV 分量
- Smoothstep 检测接近 0 或 1 的区域
- 用于模拟几何边缘的深色描边

---

### 魔方功能完善

**落地旋转复原**：
- 浮空时记录 `originalRotation`
- 落地动画中同步插值位置和旋转
- 使用相同的 EaseInOutExpo 缓动曲线

**摄像机跟随优化**：
- 新增 `puzzleAnimFollowSpeed` 参数
- `useFastFollow` 标志位控制快速跟随
- 只在魔方动画期间启用，避免切换时突兀

**外部魔方复位功能**：
- SimpleCubeRotator 添加 X 键复位
- 记录初始位置/旋转，一键恢复
- 检测 GameManager 状态避免与 Puzzle 模式冲突

---

### 阴影问题修复

**阴影不显示**：
- 原因：正交摄像机距离远，超出 Shadow Distance
- 解决：URP Asset 中调大 Max Distance

**Shadow Acne（阴影条纹）**：
- 原因：阴影贴图精度不足导致自阴影伪影
- 解决：Depth Bias = 0 + Soft Shadows 开启
- 注意：Bias 过大会导致 Peter Panning（阴影漂浮）

---

## 新增文件

```
Assets/
├── Scripts/Editor/
│   └── MaterialReplacer.cs    # 材质批量替换工具
├── Shader/
│   ├── MainLightNode.hlsl     # 获取主光源方向
│   └── SoftToon.shader        # 柔和卡通着色器（代码版）
└── Setting/
    ├── New Universal Render Pipeline Asset
    └── New Universal Render Pipeline Asset_Renderer
```

---

## Memory

- [x] URP 材质转换菜单灰色 → 需要先选中材质文件
- [x] Default-Material 无法转换 → 用批量替换工具直接换成新材质
- [x] Shader Graph 无 Main Light Direction → 用 Custom Function + hlsl 文件
- [x] Custom Function 报错参数不匹配 → Outputs 数量要和 hlsl 函数一致
- [x] Game 视图无阴影 Scene 有 → Shadow Distance 太小，调大到 100+
- [x] Shadow Acne 条纹 → Depth Bias=0 + Soft Shadows
- [x] Bias 过大阴影漂浮 → 保持 Bias=0，用 Soft Shadows 模糊瑕疵

---

### 明暗分界线溶解效果

在光照计算中加入噪波扰动：
- Gradient Noise 生成随机值
- Remap 到 ±0.2 范围
- Add 到 NdotL 后再过 Smoothstep
- 产生不规则的溶解边缘

---

### URP 后处理系统

URP 内置后处理，使用方法：
1. 创建 Global Volume
2. 添加 Volume Profile
3. Add Override 添加效果（Bloom、Color Adjustments、Vignette 等）
4. 摄像机勾选 Post Processing

---

## 当前效果

已实现水彩风格化渲染：
- 柔和的明暗过渡
- 笔触纹理质感
- 溶解边缘效果
- 配合背景山脉形成完整的视觉风格

---

## 下一步

- [ ] 后处理效果调优（Bloom、Color Grading）
- [ ] 完善 Shader Graph 参数默认值
- [ ] 场景美术资产制作
- [ ] 角色/物体细节优化
