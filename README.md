# 🍅 Pomodoro Focus Hub (沉浸式现代番茄钟)

一个基于现代 Web 技术构建的极简科技感番茄工作法（Pomodoro Technique）时钟应用。拥有磨砂玻璃拟物视觉（Glassmorphism）、原生 Web Audio 算法白噪音生成器以及精准高精度倒计时。

---

## ✨ 核心特性

- 🎨 **前沿美学设计**：
  - 玻璃拟态（Glassmorphism）与霓虹光晕设计。
  - SVG 动态圆环平滑进度条。
  - 三套精心调校的沉浸式色彩主题：**Midnight（暗黑赛博）**、**Zen（禅意金）**、**Sunset（落日橘）**。
- 🎵 **原生声学音频引擎（Web Audio API）**：
  - **和弦禅钟**：倒计时归零时触发 C5/E5/G5/C6 和弦共振，免去外部 MP3 加载延迟。
  - **算法白噪音生成器**：纯数学算法实时合成 **雨声（Rain）**、**海浪（Waves）**、**粉红噪音（Pink Noise）**，支持实时音量调节。
- ⏱️ **高精度倒计时与自适应流转**：
  - 采用时间戳差值（Timestamp Delta）校准，页面最小化或切换标签页不漏秒。
  - 专注（25m）、短休息（5m）、长休息（15m）经典周期自适应切换。
- 🔔 **桌面系统原生通知**：
  - 专注达成与休息结束时主动触发系统级桌面通知与专属图标。
- 🎯 **聚焦目标与数据持久化**：
  - 当前专注目标设定。
  - 自动记录今日番茄数、累计专注时长，保存在本地 `localStorage`。
- ⌨️ **生产力快捷键**：
  - `Space`：开始 / 暂停
  - `R`：重置当前倒计时
  - `S`：跳至下一周期
  - `Esc`：关闭设置与统计弹窗

---

## 🛠️ 技术栈

- **Core**：Vanilla HTML5 / Modern JavaScript (ES6+)
- **Styling**：Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Backdrop Filter)
- **Audio**：Web Audio API (OscillatorNode, BiquadFilterNode, AudioBufferSourceNode)
- **Storage**：Browser LocalStorage API
- **Notification**：HTML5 Web Notification API

---

## 🚀 本地快速启动

无需复杂的打包构建流程，任何静态 HTTP 服务器均可直接运行：

### 使用 Python:
```bash
python -m http.server 5500
```
然后在浏览器中打开：`http://localhost:5500`

### 使用 Node.js / npx:
```bash
npx serve .
```

---

## 📄 开源许可

MIT License
