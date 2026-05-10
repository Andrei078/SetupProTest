# 🎮 SetupProTest v2.0

A next-generation peripheral testing dashboard with neon glassmorphism design, dark/light theme switching, and advanced analytics.

---

## ✨ What's New in v2.0

### Design
- **Neon Glassmorphism UI** — transparent glass cards, animated neon borders, glowing shadows
- **Dark / Light theme toggle** — one click in the header, persisted across sessions
- **Animated background** — particle network with scanning line effect and grid
- **Orbitron + Rajdhani fonts** — bold futuristic typography
- **Transparent ghost buttons** — all CTAs have transparent backgrounds with colored neon borders
- **Animated ring logo** — conic gradient spinning ring on the sidebar logo

### Features Added
- **Session timer** in sidebar footer
- **Device status dots** in header (live keyboard/mouse/controller detection)
- **Typing Speed Test** (WPM + accuracy + configurable duration)
- **CPS Test** (clicks per second, 10-second test)
- **Mouse trail** on tracking pad with ripple effects on click
- **Frequency sweep** in audio test
- **Microphone visualizer** with FFT frequency bars
- **Motion detection** in webcam test
- **Statistics page** with charts and session history
- **Export stats** as JSON
- **Vibration test** for controllers
- **Drift detection** with magnitude readout

---

## 📁 Project Structure

```
SetupProTest/
├── index.html          # Main shell (sidebar + header + content area)
├── css/
│   └── main.css        # All styles: theme variables, glassmorphism, buttons, layouts
├── js/
│   ├── app.js          # Core logic: routing, all page builders, all test functionality
│   └── canvas.js       # Animated particle/grid background
└── README.md
```

---

## 🚀 Running the Project

**Simple:**
```bash
# Open index.html directly in Chrome/Edge/Brave
```

**Recommended (full features like webcam/mic):**
```bash
npx live-server
# or
python -m http.server 8080
```

---

## ⌨️ Keyboard Test
- Live key detection with key code display
- Keystroke latency measurement (press-to-render timing)
- Latency history line chart with min/avg/max
- Currently held keys display
- **Typing Speed Test** — WPM, accuracy, configurable 30s/60s/120s

## 🖱️ Mouse Test
- High-precision tracking pad with animated cursor dot
- Mouse trail with toggle
- Click ripple animations (color-coded by button)
- Real-time X/Y position, movement speed, total distance
- Left / Middle / Right click counters
- **CPS Test** — 10-second clicks per second challenge

## 🎮 Controller Test
- Gamepad API auto-detection (Xbox / PlayStation / Generic)
- All face buttons, D-pad, shoulder buttons with live glow
- Dual analog stick visualization with drift detection
- Trigger pressure bars (L2/R2)
- Vibration test (haptic feedback)
- Session stats: total presses, buttons used, most pressed

## 🎧 Audio Test
- Left/Right/Both speaker tests
- Frequency sweep (20 Hz → 20 kHz)
- Preset tones (100 Hz, 1 kHz, 10 kHz)
- Frequency slider with live readout
- **Microphone input** with FFT visualizer
- Level, peak, and dominant frequency display

## 📷 Webcam Test
- Live camera preview with corner overlay
- Resolution and FPS detection
- Multi-camera enumeration and switching
- Snapshot download
- **Motion detection** with percentage level

## 📊 Statistics
- Session totals (keystrokes, clicks, best WPM, best CPS)
- Keyboard latency chart
- Mouse click bar chart
- Test history log
- JSON export

---

## 🌐 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Edge    | ✅ Full |
| Brave   | ⚠️ Disable Shields for Gamepad |
| Firefox | ⚠️ Limited Gamepad support |

---

## 🛠️ Tech Stack
- **HTML5** — Semantic structure
- **CSS3** — Custom properties, glassmorphism, `@keyframes` animations, `backdrop-filter`
- **JavaScript (ES6+)** — Gamepad API, Web Audio API, MediaDevices API, Canvas 2D, localStorage
- **Fonts** — Google Fonts (Orbitron, Rajdhani)
- **Icons** — Font Awesome 6

---

MIT License
