/* ============================================================
   SetupProTest v2.0 — app.js  |  All bugs fixed
   ============================================================ */

'use strict';

// ============================================================
// GLOBAL STATE
// ============================================================
const State = {
  theme: localStorage.getItem('spt-theme') || 'dark',
  page: 'home',
  sessionStart: Date.now(),
  devices: { keyboard: false, mouse: false, controller: false },
  stats: JSON.parse(localStorage.getItem('spt-stats') || '{}'),
};

// Session counters (live, across page navigations)
const Session = { keys: 0, clicks: 0 };

// Cleanup registry — call onPageLeave(fn) to register teardown logic
let _cleanup = [];
function onPageLeave(fn) { _cleanup.push(fn); }
function runCleanup() { _cleanup.forEach(fn => { try { fn(); } catch(e){} }); _cleanup = []; }

// ============================================================
// THEME
// ============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const label = document.getElementById('theme-label');
  if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  const chk = document.getElementById('setting-theme');
  if (chk) chk.checked = (theme === 'dark');
  State.theme = theme;
  localStorage.setItem('spt-theme', theme);
}
function toggleTheme() { applyTheme(State.theme === 'dark' ? 'light' : 'dark'); }

// ============================================================
// SIDEBAR
// ============================================================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.querySelector('.main-wrap').classList.toggle('sidebar-collapsed');
}

// ============================================================
// SESSION TIMER
// ============================================================
function startSessionTimer() {
  setInterval(() => {
    const el = document.getElementById('session-time');
    if (!el) return;
    const s = Math.floor((Date.now() - State.sessionStart) / 1000);
    el.textContent = [
      String(Math.floor(s/3600)).padStart(2,'0'),
      String(Math.floor((s%3600)/60)).padStart(2,'0'),
      String(s%60).padStart(2,'0'),
    ].join(':');
  }, 1000);
}

// ============================================================
// ROUTING
// ============================================================
const CRUMBS = { home:'Dashboard', keyboard:'Keyboard Test', mouse:'Mouse Test', controller:'Controller Test', audio:'Audio Test', webcam:'Webcam Test', stats:'Statistics', settings:'Settings' };
const Pages  = {};
const Inits  = {};

function loadPage(page) {
  runCleanup();
  State.page = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  setText('breadcrumb', CRUMBS[page] || page);

  const content = document.getElementById('content');
  content.style.animation = 'none';
  void content.offsetWidth;
  content.style.animation = '';
  content.innerHTML = (Pages[page] || Pages.home)();
  if (Inits[page]) Inits[page]();
}

// ============================================================
// ---- PAGE TEMPLATES ----
// ============================================================

Pages.home = () => `
<div class="hero-banner">
  <div class="hero-title">Welcome to<br><span class="line2">SetupProTest</span></div>
  <p class="hero-subtitle">Your ultimate peripheral testing dashboard. Test, measure, and analyze all your devices.</p>
  <div class="quick-start">
    <button class="btn btn-cyan btn-lg" onclick="loadPage('keyboard')"><i class="fas fa-keyboard"></i> Keyboard</button>
    <button class="btn btn-purple btn-lg" onclick="loadPage('mouse')"><i class="fas fa-mouse"></i> Mouse</button>
    <button class="btn btn-green btn-lg" onclick="loadPage('controller')"><i class="fas fa-gamepad"></i> Controller</button>
  </div>
</div>
<div class="dash-cards">
  ${[
    {p:'keyboard',i:'keyboard',  c:'#00f5ff',n:'Keyboard'},
    {p:'mouse',   i:'mouse',     c:'#bf00ff',n:'Mouse'},
    {p:'controller',i:'gamepad', c:'#00ff88',n:'Controller'},
    {p:'audio',   i:'headphones',c:'#ff6b00',n:'Audio'},
    {p:'webcam',  i:'video',     c:'#0080ff',n:'Webcam'},
    {p:'stats',   i:'chart-line',c:'#ff0080',n:'Statistics'},
  ].map(x=>`
    <div class="dash-card" style="--c:${x.c}" onclick="loadPage('${x.p}')">
      <div class="dc-icon"><i class="fas fa-${x.i}"></i></div>
      <div class="dc-name">${x.n}</div>
      <div class="dc-status">Click to test</div>
      <div class="dc-bar"></div>
    </div>`).join('')}
</div>
<div class="grid-2" style="gap:20px">
  <div class="card">
    <div class="card-title">Session Overview</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div class="metric"><div class="metric-value" id="home-keys">${Session.keys}</div><div class="metric-label">Keys Pressed</div></div>
      <div class="metric"><div class="metric-value" id="home-clicks">${Session.clicks}</div><div class="metric-label">Clicks</div></div>
      <div class="metric"><div class="metric-value" id="home-wpm">${State.stats.bestWpm||'—'}</div><div class="metric-label">Best WPM</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Device Status</div>
    <div id="home-devices" style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
      ${[{n:'Keyboard',i:'keyboard',a:true},{n:'Mouse',i:'mouse',a:true},{n:'Controller',i:'gamepad',a:State.devices.controller}].map(d=>
        `<div style="display:flex;align-items:center;gap:10px;padding:4px 0">
           <i class="fas fa-${d.i}" style="width:18px;color:${d.a?'var(--neon-green)':'var(--text-secondary)'}"></i>
           <span style="font-size:14px">${d.n}</span>
           <span style="margin-left:auto;font-size:11px;letter-spacing:1px;color:${d.a?'var(--neon-green)':'var(--text-secondary)'}">
             ${d.a?'● ACTIVE':'○ NOT FOUND'}
           </span>
         </div>`).join('')}
    </div>
  </div>
</div>`;

Pages.keyboard = () => `
<div class="page-header">
  <div class="page-title">⌨️ <span class="accent">Keyboard</span> Test</div>
  <div class="page-subtitle">Press any key to detect it, then use the typing test below to measure your WPM</div>
</div>
<div class="grid-2" style="gap:20px;margin-bottom:20px">
  <div class="card">
    <div class="card-title">Key Detection</div>
    <div id="kb-last-key" style="display:flex;align-items:center;justify-content:center;height:90px;font-family:'Orbitron',monospace;font-size:46px;color:var(--neon-cyan);text-shadow:var(--shadow-neon-cyan);background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);letter-spacing:2px;transition:all .1s">—</div>
    <div style="display:flex;gap:10px;margin-top:12px">
      <div class="metric" style="flex:1"><div class="metric-value text-cyan" id="kb-count">0</div><div class="metric-label">Total Keys</div></div>
      <div class="metric" style="flex:1"><div class="metric-value" id="kb-code" style="font-size:15px">—</div><div class="metric-label">Key Code</div></div>
      <div class="metric" style="flex:1"><div class="metric-value" id="kb-type" style="font-size:14px">—</div><div class="metric-label">Category</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Recent Key History</div>
    <div id="kb-history" style="display:flex;flex-wrap:wrap;gap:5px;min-height:60px;align-content:flex-start"></div>
    <div style="display:flex;gap:8px;margin-top:14px;align-items:center">
      <div class="metric" style="flex:1"><div class="metric-value text-green" id="kb-unique">0</div><div class="metric-label">Unique Keys</div></div>
      <div class="metric" style="flex:1"><div class="metric-value text-pink" id="kb-combos">0</div><div class="metric-label">Combos</div></div>
      <button class="btn btn-sm btn-red" onclick="resetKb()"><i class="fas fa-redo"></i> Reset</button>
    </div>
  </div>
</div>
<div class="card" style="margin-bottom:20px">
  <div class="card-title">Held Keys</div>
  <div id="kb-held" style="display:flex;flex-wrap:wrap;gap:6px;min-height:34px"><span style="color:var(--text-secondary);font-size:13px">No keys held</span></div>
</div>
<div class="card">
  <div class="flex-between" style="margin-bottom:14px">
    <div class="card-title" style="margin:0">⚡ Typing Speed Test</div>
    <div style="display:flex;gap:8px;align-items:center">
      <select id="typing-dur" style="padding:6px 10px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:6px;color:var(--text-primary);font-family:Rajdhani,sans-serif;cursor:pointer">
        <option value="30">30s</option><option value="60" selected>60s</option><option value="120">120s</option>
      </select>
      <button class="btn btn-sm btn-red" onclick="resetTyping()"><i class="fas fa-redo"></i> Reset</button>
    </div>
  </div>
  <div style="display:flex;gap:12px;margin-bottom:14px">
    <div class="metric" style="flex:1"><div class="metric-value text-cyan" id="t-wpm">0</div><div class="metric-label">WPM</div></div>
    <div class="metric" style="flex:1"><div class="metric-value text-green" id="t-acc">100%</div><div class="metric-label">Accuracy</div></div>
    <div class="metric" style="flex:1"><div class="metric-value" id="t-time">—</div><div class="metric-label">Time Left</div></div>
    <div class="metric" style="flex:1"><div class="metric-value" id="t-chars">0</div><div class="metric-label">Characters</div></div>
  </div>
  <div id="t-hint" style="font-size:12px;color:var(--neon-cyan);text-align:center;margin-bottom:8px;letter-spacing:1px">▶ Click the text box below and start typing to begin</div>
  <div id="t-display" tabindex="0" class="typing-test-area" style="outline:none;cursor:text" onclick="focusTyping()"></div>
  <input id="t-input" type="text" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="off"
    style="position:fixed;left:-9999px;top:0;opacity:0;width:1px;height:1px;border:none;background:none"
    oninput="onTypingInput(this)">
</div>`;

Pages.mouse = () => `
<div class="page-header">
  <div class="page-title">🖱️ <span class="accent">Mouse</span> Test</div>
  <div class="page-subtitle">Track movement, count clicks, and test your CPS</div>
</div>
<div class="grid-2" style="gap:20px;margin-bottom:20px">
  <div class="card">
    <div class="card-title">Tracking Pad — Move Your Mouse Here</div>
    <div class="mouse-pad" id="mouse-pad">
      <canvas id="trail-canvas" style="position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none"></canvas>
      <div class="mouse-cursor-dot" id="mouse-dot" style="left:50%;top:50%"></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
      <button class="btn btn-sm btn-cyan" onclick="clearTrail()"><i class="fas fa-eraser"></i> Clear Trail</button>
      <button class="btn btn-sm btn-purple" id="trail-btn" onclick="toggleTrail()">Trail: ON</button>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div class="card">
      <div class="card-title">Position & Movement</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="metric"><div class="metric-value" id="m-x">0</div><div class="metric-label">X (px)</div></div>
        <div class="metric"><div class="metric-value" id="m-y">0</div><div class="metric-label">Y (px)</div></div>
        <div class="metric"><div class="metric-value text-cyan" id="m-speed">0</div><div class="metric-label">Speed (px/s)</div></div>
        <div class="metric"><div class="metric-value text-green" id="m-dist">0</div><div class="metric-label">Distance (px)</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Click Counter — Click Anywhere on Page</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
        <div class="metric"><div class="metric-value text-cyan" id="m-left">0</div><div class="metric-label">Left</div></div>
        <div class="metric"><div class="metric-value" id="m-mid">0</div><div class="metric-label">Middle</div></div>
        <div class="metric"><div class="metric-value text-pink" id="m-right">0</div><div class="metric-label">Right</div></div>
      </div>
      <button class="btn btn-sm btn-red" style="width:100%" onclick="resetMouse()"><i class="fas fa-redo"></i> Reset Counts</button>
    </div>
    <div class="card">
      <div class="card-title">CPS Test (10 seconds)</div>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <div class="metric" style="flex:1"><div class="metric-value text-cyan" id="cps-cur">0</div><div class="metric-label">CPS</div></div>
        <div class="metric" style="flex:1"><div class="metric-value text-green" id="cps-best">0</div><div class="metric-label">Best</div></div>
        <div class="metric" style="flex:1"><div class="metric-value" id="cps-total">0</div><div class="metric-label">Clicks</div></div>
      </div>
      <div id="cps-msg" style="text-align:center;font-size:12px;color:var(--text-secondary);margin-bottom:8px;letter-spacing:1px">Press the button to start</div>
      <div class="progress-track" style="margin-bottom:8px"><div class="progress-fill" id="cps-bar" style="width:100%;transition:width 0.1s linear"></div></div>
      <button class="btn btn-cyan" id="cps-btn" style="width:100%;font-size:15px;padding:13px" onclick="cpsClick()">
        <i class="fas fa-hand-pointer"></i> CLICK TO START — THEN CLICK FAST!
      </button>
    </div>
  </div>
</div>`;

Pages.controller = () => `
<div class="page-header">
  <div class="page-title">🎮 <span class="accent">Controller</span> Test</div>
  <div class="page-subtitle">Connect a gamepad and press any button to activate it</div>
</div>
<div class="card" style="margin-bottom:20px">
  <div class="flex-between">
    <div>
      <div id="ct-status" style="font-size:15px;color:var(--text-secondary)">⏳ Waiting — press any button on your gamepad</div>
      <div id="ct-name" style="font-size:11px;color:var(--text-secondary);margin-top:3px;font-family:'Orbitron',monospace;letter-spacing:1px"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-sm btn-green" onclick="doVibrate()"><i class="fas fa-wifi"></i> Vibrate</button>
      <button class="btn btn-sm btn-cyan" onclick="resetCt()"><i class="fas fa-redo"></i> Reset</button>
    </div>
  </div>
</div>
<div class="grid-2" style="gap:20px;margin-bottom:20px">
  <div class="card">
    <div class="card-title">Face Buttons</div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0">
      <div class="pad-btn triangle" id="gb-y">Y / △</div>
      <div style="display:flex;gap:36px">
        <div class="pad-btn square" id="gb-x">X / □</div>
        <div class="pad-btn circle" id="gb-b">B / ○</div>
      </div>
      <div class="pad-btn cross" id="gb-a">A / ✕</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">D-Pad & System</div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0">
      <div class="pad-btn" id="gb-up">▲</div>
      <div style="display:flex;gap:36px">
        <div class="pad-btn" id="gb-left">◀</div>
        <div class="pad-btn" id="gb-right">▶</div>
      </div>
      <div class="pad-btn" id="gb-down">▼</div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <div class="pad-btn" id="gb-select" style="width:58px;border-radius:8px;font-size:9px">SELECT</div>
        <div class="pad-btn" id="gb-start"  style="width:58px;border-radius:8px;font-size:9px">START</div>
      </div>
    </div>
  </div>
</div>
<div class="grid-2" style="gap:20px;margin-bottom:20px">
  <div class="card">
    <div class="card-title">Left Analog Stick</div>
    <div style="display:flex;align-items:center;gap:20px">
      <div class="stick-wrap"><div class="stick-knob" id="stick-l"></div></div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="metric"><div class="metric-value" id="ls-x" style="font-size:17px">0.000</div><div class="metric-label">X</div></div>
        <div class="metric"><div class="metric-value" id="ls-y" style="font-size:17px">0.000</div><div class="metric-label">Y</div></div>
        <div class="metric" style="grid-column:span 2"><div class="metric-value" id="ls-drift" style="font-size:13px;color:var(--neon-green)">No Drift ✓</div><div class="metric-label">Drift</div></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Right Analog Stick</div>
    <div style="display:flex;align-items:center;gap:20px">
      <div class="stick-wrap"><div class="stick-knob" id="stick-r"></div></div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="metric"><div class="metric-value" id="rs-x" style="font-size:17px">0.000</div><div class="metric-label">X</div></div>
        <div class="metric"><div class="metric-value" id="rs-y" style="font-size:17px">0.000</div><div class="metric-label">Y</div></div>
        <div class="metric" style="grid-column:span 2"><div class="metric-value" id="rs-drift" style="font-size:13px;color:var(--neon-green)">No Drift ✓</div><div class="metric-label">Drift</div></div>
      </div>
    </div>
  </div>
</div>
<div class="grid-2" style="gap:20px">
  <div class="card">
    <div class="card-title">Shoulder Buttons & Triggers</div>
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div class="pad-btn" id="gb-lb" style="flex:1;border-radius:8px">LB</div>
      <div class="pad-btn" id="gb-rb" style="flex:1;border-radius:8px">RB</div>
    </div>
    <div style="margin-bottom:10px">
      <div class="flex-between" style="font-size:13px;margin-bottom:5px"><span class="text-muted">L2 / LT</span><span id="lt-val">0%</span></div>
      <div class="progress-track"><div class="progress-fill" id="lt-bar" style="width:0%;background:linear-gradient(90deg,var(--neon-purple),var(--neon-cyan))"></div></div>
    </div>
    <div>
      <div class="flex-between" style="font-size:13px;margin-bottom:5px"><span class="text-muted">R2 / RT</span><span id="rt-val">0%</span></div>
      <div class="progress-track"><div class="progress-fill" id="rt-bar" style="width:0%"></div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Session Stats</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div class="metric"><div class="metric-value text-cyan" id="ct-presses">0</div><div class="metric-label">Total Presses</div></div>
      <div class="metric"><div class="metric-value text-green" id="ct-unique">0</div><div class="metric-label">Unique Btns</div></div>
      <div class="metric" style="grid-column:span 2"><div class="metric-value" id="ct-most" style="font-size:18px">—</div><div class="metric-label">Most Pressed</div></div>
    </div>
    <div id="ct-log" style="display:flex;flex-wrap:wrap;gap:5px"></div>
  </div>
</div>`;

Pages.audio = () => `
<div class="page-header">
  <div class="page-title">🎧 <span class="accent">Audio</span> Test</div>
  <div class="page-subtitle">Test speakers, generate tones, sweep frequencies, and analyze mic input</div>
</div>
<div class="grid-2" style="gap:20px;margin-bottom:20px">
  <div class="card">
    <div class="card-title">Speaker Test</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-cyan"  onclick="playTestTone('left')"><i class="fas fa-arrow-left"></i>  Test Left Channel</button>
      <button class="btn btn-purple" onclick="playTestTone('right')"><i class="fas fa-arrow-right"></i> Test Right Channel</button>
      <button class="btn btn-green"  onclick="playTestTone('both')"><i class="fas fa-headphones"></i> Test Both Channels</button>
      <button class="btn btn-red"    onclick="stopAllAudio()"><i class="fas fa-stop"></i> Stop</button>
    </div>
    <div style="margin-top:16px">
      <div class="flex-between" style="font-size:13px;margin-bottom:6px"><span class="text-muted">Volume</span><span id="vol-lbl">80%</span></div>
      <input type="range" id="vol-sl" min="0" max="100" value="80" style="width:100%;accent-color:var(--neon-cyan);cursor:pointer" oninput="onVol(this.value)">
    </div>
  </div>
  <div class="card">
    <div class="card-title">Frequency Generator</div>
    <div style="margin-bottom:12px">
      <div class="flex-between" style="font-size:13px;margin-bottom:6px"><span class="text-muted">Frequency</span><span id="freq-lbl">440 Hz</span></div>
      <input type="range" id="freq-sl" min="20" max="20000" value="440" style="width:100%;accent-color:var(--neon-purple);cursor:pointer" oninput="onFreq(this.value)">
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
      <button class="btn btn-sm btn-cyan" onclick="playToneHz(60)">60Hz<br><span style="font-size:9px">Sub</span></button>
      <button class="btn btn-sm btn-cyan" onclick="playToneHz(250)">250Hz<br><span style="font-size:9px">Bass</span></button>
      <button class="btn btn-sm btn-cyan" onclick="playToneHz(1000)">1kHz<br><span style="font-size:9px">Mid</span></button>
      <button class="btn btn-sm btn-cyan" onclick="playToneHz(4000)">4kHz<br><span style="font-size:9px">Hi-Mid</span></button>
      <button class="btn btn-sm btn-cyan" onclick="playToneHz(8000)">8kHz<br><span style="font-size:9px">Treble</span></button>
      <button class="btn btn-sm btn-cyan" onclick="playToneHz(16000)">16kHz<br><span style="font-size:9px">Air</span></button>
    </div>
    <button class="btn btn-purple" id="sweep-btn" style="width:100%;margin-bottom:6px" onclick="toggleSweep()"><i class="fas fa-wave-square"></i> Start Sweep</button>
    <button class="btn btn-red btn-sm" style="width:100%" onclick="stopAllAudio()"><i class="fas fa-stop"></i> Stop All</button>
  </div>
</div>
<div class="card" style="margin-bottom:20px">
  <div class="flex-between" style="margin-bottom:12px">
    <div class="card-title" style="margin:0">Audio Visualizer</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-sm btn-cyan" onclick="startMic()"><i class="fas fa-microphone"></i> Start Mic</button>
      <button class="btn btn-sm btn-red"  onclick="stopMic()"><i class="fas fa-microphone-slash"></i> Stop</button>
    </div>
  </div>
  <canvas id="audio-canvas" style="width:100%;height:150px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;display:block"></canvas>
</div>
<div class="card">
  <div class="card-title">Microphone Levels</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
    <div class="metric"><div class="metric-value text-cyan" id="mic-rms">—</div><div class="metric-label">RMS Level</div></div>
    <div class="metric"><div class="metric-value text-green" id="mic-peak">—</div><div class="metric-label">Peak</div></div>
    <div class="metric"><div class="metric-value" id="mic-freq">—</div><div class="metric-label">Dominant Hz</div></div>
  </div>
  <div style="margin-bottom:4px;font-size:11px;letter-spacing:1px;color:var(--text-secondary)">INPUT LEVEL</div>
  <div class="progress-track" style="height:14px"><div class="progress-fill" id="mic-bar" style="width:0%;height:100%;transition:width 0.05s"></div></div>
</div>`;

Pages.webcam = () => `
<div class="page-header">
  <div class="page-title">📷 <span class="accent">Webcam</span> Test</div>
  <div class="page-subtitle">Live preview, resolution, FPS, and motion detection</div>
</div>
<div class="grid-2" style="gap:20px">
  <div class="card">
    <div class="flex-between" style="margin-bottom:12px">
      <div class="card-title" style="margin:0">Live Preview</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-cyan"   onclick="startWebcam()"><i class="fas fa-play"></i> Start</button>
        <button class="btn btn-sm btn-red"    onclick="stopWebcam()"><i class="fas fa-stop"></i> Stop</button>
        <button class="btn btn-sm btn-purple" onclick="snapPhoto()"><i class="fas fa-camera"></i> Snap</button>
      </div>
    </div>
    <div class="webcam-container">
      <video id="wcam-video" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>
      <div class="webcam-overlay">
        <div class="webcam-corner tl"></div><div class="webcam-corner tr"></div>
        <div class="webcam-corner bl"></div><div class="webcam-corner br"></div>
      </div>
    </div>
    <canvas id="snap-canvas" style="display:none"></canvas>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div class="card">
      <div class="card-title">Camera Info</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="metric"><div class="metric-value" id="cam-w" style="font-size:18px">—</div><div class="metric-label">Width</div></div>
        <div class="metric"><div class="metric-value" id="cam-h" style="font-size:18px">—</div><div class="metric-label">Height</div></div>
        <div class="metric"><div class="metric-value text-cyan" id="cam-fps">—</div><div class="metric-label">FPS</div></div>
        <div class="metric"><div class="metric-value text-green" id="cam-res">—</div><div class="metric-label">Resolution</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Camera Selection</div>
      <select id="cam-sel" style="width:100%;padding:10px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-family:Rajdhani,sans-serif;cursor:pointer;margin-bottom:8px">
        <option>Click Refresh to list cameras</option>
      </select>
      <button class="btn btn-sm btn-cyan" style="width:100%" onclick="enumCams()"><i class="fas fa-sync"></i> Refresh Cameras</button>
    </div>
    <div class="card">
      <div class="card-title">Motion Detection</div>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        <div class="metric" style="flex:1"><div class="metric-value text-cyan" id="mot-level">0%</div><div class="metric-label">Motion</div></div>
        <div class="metric" style="flex:1"><div class="metric-value" id="mot-status" style="font-size:14px;color:var(--neon-green)">🟢 Still</div><div class="metric-label">Status</div></div>
      </div>
      <div class="progress-track" style="margin-bottom:10px"><div class="progress-fill" id="mot-bar" style="width:0%;background:linear-gradient(90deg,var(--neon-green),var(--neon-pink))"></div></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-green" style="flex:1" onclick="startMotion()"><i class="fas fa-running"></i> Detect Motion</button>
        <button class="btn btn-sm btn-red"   style="flex:1" onclick="stopMotion()"><i class="fas fa-stop"></i> Stop</button>
      </div>
    </div>
  </div>
</div>`;

Pages.stats = () => `
<div class="page-header">
  <div class="page-title">📊 <span class="accent">Statistics</span></div>
  <div class="page-subtitle">Session analytics and typing test history</div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
  <div class="metric card" style="padding:20px"><div class="metric-value text-cyan">${Session.keys}</div><div class="metric-label">Keystrokes</div></div>
  <div class="metric card" style="padding:20px"><div class="metric-value" style="color:var(--neon-purple)">${Session.clicks}</div><div class="metric-label">Mouse Clicks</div></div>
  <div class="metric card" style="padding:20px"><div class="metric-value text-green">${State.stats.bestWpm||'—'}</div><div class="metric-label">Best WPM</div></div>
  <div class="metric card" style="padding:20px"><div class="metric-value" style="color:var(--neon-orange)">${State.stats.bestCps||'—'}</div><div class="metric-label">Best CPS</div></div>
</div>
<div class="grid-2" style="gap:20px;margin-bottom:20px">
  <div class="card"><div class="card-title">WPM History (Typing Tests)</div><div style="height:200px;position:relative"><canvas id="s-kb-chart" style="width:100%;height:100%"></canvas></div></div>
  <div class="card"><div class="card-title">Mouse Clicks This Session</div><div style="height:200px;position:relative"><canvas id="s-ms-chart" style="width:100%;height:100%"></canvas></div></div>
</div>
<div class="card">
  <div class="flex-between" style="margin-bottom:14px">
    <div class="card-title" style="margin:0">Typing Test History</div>
    <button class="btn btn-sm btn-red" onclick="clearStats()"><i class="fas fa-trash"></i> Clear All</button>
  </div>
  <div id="s-history"></div>
</div>`;

Pages.settings = () => `
<div class="page-header">
  <div class="page-title">⚙️ <span class="accent">Settings</span></div>
</div>
<div class="grid-2" style="gap:20px">
  <div class="card">
    <div class="card-title">Appearance</div>
    <div class="setting-row">
      <div><div class="setting-label">Dark Theme</div><div class="setting-desc">Switch between dark and light mode</div></div>
      <label class="toggle-switch"><input type="checkbox" id="setting-theme" ${State.theme==='dark'?'checked':''} onchange="toggleTheme()"><span class="toggle-slider"></span></label>
    </div>
    <div class="setting-row">
      <div><div class="setting-label">Animated Background</div><div class="setting-desc">Particle canvas background</div></div>
      <label class="toggle-switch"><input type="checkbox" checked onchange="toggleBg(this.checked)"><span class="toggle-slider"></span></label>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Data</div>
    <div class="setting-row">
      <div><div class="setting-label">Export Statistics</div><div class="setting-desc">Download as JSON</div></div>
      <button class="btn btn-sm btn-cyan" onclick="exportStats()"><i class="fas fa-download"></i> Export</button>
    </div>
    <div class="setting-row">
      <div><div class="setting-label">Clear All Data</div><div class="setting-desc">Wipe all saved stats</div></div>
      <button class="btn btn-sm btn-red" onclick="clearStats()"><i class="fas fa-trash"></i> Clear</button>
    </div>
  </div>
  <div class="card" style="grid-column:span 2">
    <div class="card-title">About</div>
    <div style="font-size:14px;color:var(--text-secondary);line-height:2">
      <span style="font-family:'Orbitron',monospace;font-size:20px;color:var(--neon-cyan)">SetupProTest v2.0</span><br>
      HTML5 · CSS3 · Vanilla JS · Gamepad API · Web Audio API · MediaDevices API<br>
      <span style="font-size:12px">Best experience: Chrome or Edge. Run via local server for full features.</span>
    </div>
  </div>
</div>`;

// ============================================================
// ---- KEYBOARD ----
// ============================================================
let kb = { count:0, held:new Set(), history:[], unique:new Set(), combos:0 };
let typing = { active:false, text:'', typed:'', timer:null, left:60, dur:60, t0:null };

const T_WORDS = ['the','quick','brown','fox','jumps','over','lazy','dog','keyboard','mouse','controller','audio','webcam','performance','latency','speed','accuracy','precision','gaming','hardware','monitor','refresh','rate','input','click','press','button','scroll','setup','test','pro'];

Inits.keyboard = function() {
  kb = { count:0, held:new Set(), history:[], unique:new Set(), combos:0 };
  const dn = e => kbDown(e);
  const up = e => kbUp(e);
  document.addEventListener('keydown', dn);
  document.addEventListener('keyup',   up);
  onPageLeave(() => {
    document.removeEventListener('keydown', dn);
    document.removeEventListener('keyup',   up);
    clearInterval(typing.timer);
    typing.active = false;
  });
  resetTyping();
};

function kbDown(e) {
  kb.count++;
  Session.keys++;
  State.stats.keys = (State.stats.keys||0)+1;
  saveStats();

  const disp = e.key === ' ' ? 'SPACE' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
  setText('kb-last-key', disp);
  setText('kb-code', e.code);
  const cat = e.key.length===1?'Character':e.key.startsWith('Arrow')?'Navigation':(e.key==='Shift'||e.key==='Control'||e.key==='Alt'||e.key==='Meta')?'Modifier':'Special';
  setText('kb-type', cat);
  setText('kb-count', kb.count);

  kb.held.add(e.code);
  if (kb.held.size >= 2) kb.combos++;
  kb.unique.add(e.code);
  setText('kb-unique', kb.unique.size);
  setText('kb-combos', kb.combos);

  kb.history.push(disp);
  if (kb.history.length > 18) kb.history.shift();
  const hEl = document.getElementById('kb-history');
  if (hEl) hEl.innerHTML = kb.history.slice().reverse().map(k=>`<div class="key-chip">${k}</div>`).join('');

  const heldEl = document.getElementById('kb-held');
  if (heldEl) heldEl.innerHTML = kb.held.size ? [...kb.held].map(k=>`<div class="key-chip pressed">${k}</div>`).join('') : '<span style="color:var(--text-secondary);font-size:13px">No keys held</span>';

  // Typing test input
  const inp = document.getElementById('t-input');
  if (inp && document.activeElement === inp) return; // let oninput handle it
}

function kbUp(e) {
  kb.held.delete(e.code);
  const heldEl = document.getElementById('kb-held');
  if (heldEl) heldEl.innerHTML = kb.held.size ? [...kb.held].map(k=>`<div class="key-chip pressed">${k}</div>`).join('') : '<span style="color:var(--text-secondary);font-size:13px">No keys held</span>';
}

function resetKb() {
  kb = { count:0, held:new Set(), history:[], unique:new Set(), combos:0 };
  ['kb-count','kb-unique','kb-combos'].forEach(id=>setText(id,0));
  setText('kb-last-key','—'); setText('kb-code','—'); setText('kb-type','—');
  const hEl=document.getElementById('kb-history'); if(hEl) hEl.innerHTML='';
  const hdEl=document.getElementById('kb-held'); if(hdEl) hdEl.innerHTML='<span style="color:var(--text-secondary);font-size:13px">No keys held</span>';
}

function genText() {
  let r='';
  while(r.length<350) r+=T_WORDS[Math.floor(Math.random()*T_WORDS.length)]+' ';
  return r.trim();
}

function resetTyping() {
  clearInterval(typing.timer);
  const dur = parseInt(document.getElementById('typing-dur')?.value||'60');
  typing = { active:false, text:genText(), typed:'', timer:null, left:dur, dur, t0:null };
  setText('t-wpm',0); setText('t-acc','100%'); setText('t-time',dur+'s'); setText('t-chars',0);
  setText('t-hint','▶ Click the text box below and start typing to begin');
  renderTyping();
}

function focusTyping() {
  const inp = document.getElementById('t-input');
  if (inp) inp.focus();
  if (!typing.active) startTyping();
}

function startTyping() {
  if (typing.active) return;
  typing.active = true;
  typing.t0 = Date.now();
  setText('t-hint','⌨ Typing test running...');
  typing.timer = setInterval(() => {
    typing.left--;
    setText('t-time', typing.left+'s');
    if (typing.left <= 0) {
      clearInterval(typing.timer);
      typing.active = false;
      const acc = typingAcc();
      const wpm = typingWpm();
      setText('t-hint', `✅ Finished! ${wpm} WPM — ${acc}% accuracy`);
      if (wpm > (State.stats.bestWpm||0)) {
        State.stats.bestWpm = wpm;
        saveStats();
      }
      if (!State.stats.history) State.stats.history=[];
      State.stats.history.push({ts:Date.now(), wpm, acc});
      saveStats();
    }
  }, 1000);
}

function onTypingInput(inp) {
  const val = inp.value;
  if (!typing.active) startTyping();
  typing.typed = val;
  renderTyping();

  const wpm = typingWpm();
  const acc = typingAcc();
  setText('t-wpm', wpm);
  setText('t-acc', acc+'%');
  setText('t-chars', val.length);
}

function typingWpm() {
  if (!typing.t0 || !typing.typed.length) return 0;
  const elapsed = (Date.now()-typing.t0)/60000;
  return elapsed>0 ? Math.round((typing.typed.length/5)/elapsed) : 0;
}
function typingAcc() {
  const t=typing.typed;
  if(!t.length) return 100;
  let ok=0;
  for(let i=0;i<t.length;i++) if(t[i]===typing.text[i]) ok++;
  return Math.round((ok/t.length)*100);
}

function renderTyping() {
  const el = document.getElementById('t-display');
  if (!el) return;
  const text = typing.text;
  const typed = typing.typed;
  const start = Math.max(0, typed.length-15);
  const end   = Math.min(text.length, start+90);
  let html='';
  for(let i=start;i<end;i++){
    const ch = text[i]==' '?'&nbsp;':text[i];
    if(i<typed.length) html+=`<span class="${typed[i]===text[i]?'char-correct':'char-wrong'}">${ch}</span>`;
    else if(i===typed.length) html+=`<span class="char-current">${ch}</span>`;
    else html+=`<span class="char-pending">${ch}</span>`;
  }
  el.innerHTML = html;
}

// ============================================================
// ---- MOUSE ----
// ============================================================
let ms = { trail:true, left:0, mid:0, right:0, dist:0, lp:null, lt:null };
let cps = { active:false, t0:null, clicks:0, best:0, timerId:null };
let trailCtx2 = null, trailFade = null;

Inits.mouse = function() {
  ms = { trail:true, left:0, mid:0, right:0, dist:0, lp:null, lt:null };
  cps = { active:false, t0:null, clicks:0, best:State.stats.bestCps||0, timerId:null };
  setText('cps-best', cps.best);

  const pad = document.getElementById('mouse-pad');
  if (!pad) return;

  // Trail canvas
  const cv = document.getElementById('trail-canvas');
  if (cv) {
    trailCtx2 = cv.getContext('2d');
    const resize = () => { cv.width=pad.clientWidth; cv.height=pad.clientHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(pad);
    trailFade = setInterval(() => {
      if (trailCtx2) { trailCtx2.fillStyle='rgba(0,0,0,0.04)'; trailCtx2.fillRect(0,0,cv.width,cv.height); }
    }, 33);
    onPageLeave(() => { clearInterval(trailFade); ro.disconnect(); });
  }

  const onMv = e => msMove(e, pad);
  const onDn = e => msPadDown(e, pad);
  const onCtx= e => e.preventDefault();
  const onGdn= e => msGlobalDown(e);
  pad.addEventListener('mousemove', onMv);
  pad.addEventListener('mousedown', onDn);
  pad.addEventListener('contextmenu', onCtx);
  document.addEventListener('mousedown', onGdn);
  onPageLeave(() => {
    pad.removeEventListener('mousemove',    onMv);
    pad.removeEventListener('mousedown',    onDn);
    pad.removeEventListener('contextmenu',  onCtx);
    document.removeEventListener('mousedown', onGdn);
    clearInterval(cps.timerId);
  });
};

function msMove(e, pad) {
  const r = pad.getBoundingClientRect();
  const x = e.clientX-r.left, y = e.clientY-r.top;
  const dot = document.getElementById('mouse-dot');
  if (dot) { dot.style.left=x+'px'; dot.style.top=y+'px'; }
  setText('m-x', Math.round(x));
  setText('m-y', Math.round(y));

  const now = performance.now();
  if (ms.lp) {
    const dx=x-ms.lp.x, dy=y-ms.lp.y, d=Math.sqrt(dx*dx+dy*dy);
    ms.dist += d;
    const dt=(now-ms.lt)/1000;
    setText('m-speed', dt>0 ? Math.round(d/dt) : 0);
    setText('m-dist', Math.round(ms.dist));
  }
  ms.lp={x,y}; ms.lt=now;

  if (ms.trail && trailCtx2) {
    trailCtx2.beginPath();
    trailCtx2.arc(x,y,2.5,0,Math.PI*2);
    trailCtx2.fillStyle='rgba(0,245,255,0.8)';
    trailCtx2.shadowColor='#00f5ff'; trailCtx2.shadowBlur=6;
    trailCtx2.fill();
    trailCtx2.shadowBlur=0;
  }
}

function msPadDown(e, pad) {
  e.preventDefault();
  const r=pad.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  const color = e.button===0?'#00f5ff':e.button===2?'#ff0080':'#bf00ff';
  const rpl = document.createElement('div');
  rpl.style.cssText=`position:absolute;border-radius:50%;pointer-events:none;left:${x}px;top:${y}px;width:10px;height:10px;transform:translate(-50%,-50%);background:${color};opacity:0.8;animation:ripple-out 0.5s ease forwards`;
  pad.appendChild(rpl);
  setTimeout(()=>rpl.remove(), 550);
}

function msGlobalDown(e) {
  if (e.button===0)      { ms.left++;  Session.clicks++; State.stats.clicks=(State.stats.clicks||0)+1; saveStats(); }
  else if (e.button===1) ms.mid++;
  else if (e.button===2) ms.right++;
  setText('m-left',  ms.left);
  setText('m-mid',   ms.mid);
  setText('m-right', ms.right);
}

function cpsClick() {
  if (!cps.active) {
    // Start
    cps.active=true; cps.clicks=0; cps.t0=Date.now();
    setText('cps-msg','🔥 Click as fast as you can!');
    const btn=document.getElementById('cps-btn');
    if(btn) btn.innerHTML='<i class="fas fa-hand-pointer"></i> KEEP CLICKING!';
    let left=10;
    cps.timerId=setInterval(()=>{
      left-=0.1;
      const bar=document.getElementById('cps-bar');
      if(bar) bar.style.width=Math.max(0,(left/10)*100)+'%';
      if(left<=0){
        clearInterval(cps.timerId);
        cps.active=false;
        const final=(cps.clicks/10).toFixed(1);
        setText('cps-cur', final);
        setText('cps-msg',`Done! ${cps.clicks} clicks = ${final} CPS`);
        if(btn) btn.innerHTML='<i class="fas fa-redo"></i> TEST AGAIN';
        if(parseFloat(final)>cps.best){
          cps.best=parseFloat(final);
          State.stats.bestCps=cps.best;
          saveStats();
          setText('cps-best',cps.best.toFixed(1));
        }
      }
    },100);
  } else {
    cps.clicks++;
    const elapsed=(Date.now()-cps.t0)/1000;
    const live=(cps.clicks/elapsed).toFixed(1);
    setText('cps-cur', live);
    setText('cps-total', cps.clicks);
  }
}

function clearTrail() { if(trailCtx2){ const c=trailCtx2.canvas; trailCtx2.clearRect(0,0,c.width,c.height); } }
function toggleTrail() {
  ms.trail=!ms.trail;
  const b=document.getElementById('trail-btn');
  if(b) b.textContent='Trail: '+(ms.trail?'ON':'OFF');
}
function resetMouse() {
  ms.left=ms.mid=ms.right=ms.dist=0; ms.lp=null;
  ['m-left','m-mid','m-right','m-speed','m-dist'].forEach(id=>setText(id,0));
  clearTrail();
}

// ============================================================
// ---- CONTROLLER ----
// ============================================================
let ct = { connected:false, raf:null, presses:{}, total:0, last:new Array(16).fill(false) };
const CT_NAMES = ['A','B','X','Y','LB','RB','LT','RT','SEL','STR','LS','RS','UP','DN','LF','RT2'];
const CT_IDS   = { 0:'gb-a',1:'gb-b',2:'gb-x',3:'gb-y',4:'gb-lb',5:'gb-rb',8:'gb-select',9:'gb-start',12:'gb-up',13:'gb-down',14:'gb-left',15:'gb-right' };

Inits.controller = function() {
  ct = { connected:false, raf:null, presses:{}, total:0, last:new Array(16).fill(false) };
  const onC=e=>ctConnect(e.gamepad);
  const onD=()=>ctDisconnect();
  window.addEventListener('gamepadconnected',    onC);
  window.addEventListener('gamepaddisconnected', onD);
  ct.raf = requestAnimationFrame(ctPoll);
  onPageLeave(()=>{
    window.removeEventListener('gamepadconnected',    onC);
    window.removeEventListener('gamepaddisconnected', onD);
    cancelAnimationFrame(ct.raf);
  });
  // Already connected?
  const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  const already = pads.find(p=>p&&p.connected);
  if (already) ctConnect(already);
};

function ctConnect(pad) {
  ct.connected=true; State.devices.controller=true;
  setText('ct-status','✅ Controller connected!');
  setText('ct-name', pad.id);
  document.getElementById('dot-controller')?.classList.add('active');
  document.getElementById('badge-controller')?.classList.add('visible');
}
function ctDisconnect() {
  ct.connected=false;
  setText('ct-status','❌ Controller disconnected — press a button to reconnect');
  setText('ct-name','');
  document.getElementById('dot-controller')?.classList.remove('active');
  document.getElementById('badge-controller')?.classList.remove('visible');
}

function ctPoll() {
  if (State.page !== 'controller') return;
  const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  const pad  = pads.find(p=>p&&p.connected);
  if (pad) {
    if (!ct.connected) ctConnect(pad);
    pad.buttons.forEach((btn,i)=>{
      const pressed = btn.pressed || btn.value>0.5;
      const el = CT_IDS[i] ? document.getElementById(CT_IDS[i]) : null;
      if (el) el.classList.toggle('pressed', pressed);
      if (pressed && !ct.last[i]) {
        ct.total++;
        const nm = CT_NAMES[i]||`B${i}`;
        ct.presses[nm]=(ct.presses[nm]||0)+1;
        setText('ct-presses', ct.total);
        setText('ct-unique', Object.keys(ct.presses).length);
        const top=Object.entries(ct.presses).sort((a,b)=>b[1]-a[1])[0];
        setText('ct-most', top?`${top[0]} (${top[1]}×)`:'—');
        const log=document.getElementById('ct-log');
        if(log) log.innerHTML=Object.entries(ct.presses).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>`<div class="key-chip pressed" style="font-size:10px">${k}:${v}</div>`).join('');
      }
      ct.last[i]=pressed;
    });
    const lt=pad.buttons[6]?.value??0, rt=pad.buttons[7]?.value??0;
    setText('lt-val',Math.round(lt*100)+'%'); setWidth('lt-bar',Math.round(lt*100));
    setText('rt-val',Math.round(rt*100)+'%'); setWidth('rt-bar',Math.round(rt*100));
    ctStick('stick-l','ls-x','ls-y','ls-drift',pad.axes[0]??0,pad.axes[1]??0);
    ctStick('stick-r','rs-x','rs-y','rs-drift',pad.axes[2]??0,pad.axes[3]??0);
  }
  ct.raf=requestAnimationFrame(ctPoll);
}
function ctStick(kId,xId,yId,dId,ax,ay){
  const k=document.getElementById(kId);
  if(k) k.style.transform=`translate(${ax*25}px,${ay*25}px)`;
  setText(xId,ax.toFixed(3)); setText(yId,ay.toFixed(3));
  const m=Math.sqrt(ax*ax+ay*ay);
  const d=document.getElementById(dId);
  if(d){ d.textContent=m>0.12?`⚠ Drift! (${m.toFixed(3)})`:'No Drift ✓'; d.style.color=m>0.12?'var(--neon-pink)':'var(--neon-green)'; }
}
function doVibrate(){
  const pads=navigator.getGamepads?[...navigator.getGamepads()]:[];
  const pad=pads.find(p=>p&&p.connected);
  if(!pad){alert('No controller connected');return;}
  if(pad.vibrationActuator){
    pad.vibrationActuator.playEffect('dual-rumble',{startDelay:0,duration:600,weakMagnitude:0.5,strongMagnitude:1.0});
  } else { alert('Vibration not supported in this browser for this controller.'); }
}
function resetCt(){
  ct.presses={};ct.total=0;
  setText('ct-presses',0);setText('ct-unique',0);setText('ct-most','—');
  const l=document.getElementById('ct-log');if(l)l.innerHTML='';
}

// ============================================================
// ---- AUDIO ----
// ============================================================
let aCtx=null, curOsc=null, curGain=null, micStream=null, micAn=null, vizRaf=null, sweepOn=false, sweepIv=null, masterVol=0.8;

Inits.audio = function(){
  onPageLeave(()=>{ stopAllAudio(); stopMic(); });
};

function getACtx(){
  if(!aCtx||aCtx.state==='closed') aCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(aCtx.state==='suspended') aCtx.resume();
  return aCtx;
}
function stopAllAudio(){
  sweepOn=false; clearInterval(sweepIv);
  try{curOsc?.stop();}catch(e){}
  curOsc=null; curGain=null;
  const sb=document.getElementById('sweep-btn');
  if(sb) sb.innerHTML='<i class="fas fa-wave-square"></i> Start Sweep';
}
function makeOsc(freq,pan){
  stopAllAudio();
  const ctx=getACtx();
  curOsc=ctx.createOscillator();
  curGain=ctx.createGain();
  const pn=ctx.createStereoPanner();
  curOsc.type='sine';
  curOsc.frequency.setValueAtTime(freq,ctx.currentTime);
  curGain.gain.setValueAtTime(masterVol*0.35,ctx.currentTime);
  pn.pan.setValueAtTime(pan,ctx.currentTime);
  curOsc.connect(curGain); curGain.connect(pn); pn.connect(ctx.destination);
  curOsc.start();
}
function playTestTone(ch){ makeOsc(440, ch==='left'?-1:ch==='right'?1:0); }
function playToneHz(f){
  makeOsc(f,0);
  setText('freq-lbl',f+' Hz');
  const sl=document.getElementById('freq-sl'); if(sl) sl.value=f;
}
function onFreq(v){
  setText('freq-lbl',parseInt(v)+' Hz');
  if(curOsc&&aCtx) curOsc.frequency.setValueAtTime(parseInt(v),aCtx.currentTime);
}
function onVol(v){
  masterVol=parseInt(v)/100; setText('vol-lbl',v+'%');
  if(curGain&&aCtx) curGain.gain.setValueAtTime(masterVol*0.35,aCtx.currentTime);
}
function toggleSweep(){
  if(sweepOn){ stopAllAudio(); return; }
  sweepOn=true;
  const sb=document.getElementById('sweep-btn'); if(sb) sb.innerHTML='<i class="fas fa-stop"></i> Stop Sweep';
  makeOsc(20,0);
  let f=20,dir=1;
  sweepIv=setInterval(()=>{
    if(!sweepOn){clearInterval(sweepIv);return;}
    f+=dir*100; if(f>=20000){f=20000;dir=-1;} if(f<=20){f=20;dir=1;}
    if(curOsc&&aCtx) curOsc.frequency.setValueAtTime(f,aCtx.currentTime);
    const sl=document.getElementById('freq-sl'); if(sl) sl.value=f;
    setText('freq-lbl',Math.round(f)+' Hz');
  },60);
}
async function startMic(){
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    const ctx=getACtx();
    const src=ctx.createMediaStreamSource(micStream);
    micAn=ctx.createAnalyser(); micAn.fftSize=2048; micAn.smoothingTimeConstant=0.6;
    src.connect(micAn); // NOT to destination — no feedback
    drawViz();
  }catch(e){alert('Mic access denied: '+e.message);}
}
function stopMic(){
  micStream?.getTracks().forEach(t=>t.stop()); micStream=null; micAn=null;
  cancelAnimationFrame(vizRaf);
}
function drawViz(){
  const canvas=document.getElementById('audio-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr;
  ctx.scale(dpr,dpr);
  const W=canvas.clientWidth, H=canvas.clientHeight;
  const fBuf=new Uint8Array(micAn?micAn.frequencyBinCount:512);
  const tBuf=new Uint8Array(micAn?micAn.fftSize:2048);
  function draw(){
    vizRaf=requestAnimationFrame(draw);
    if(!micAn){ctx.clearRect(0,0,W,H);return;}
    micAn.getByteFrequencyData(fBuf);
    micAn.getByteTimeDomainData(tBuf);
    ctx.clearRect(0,0,W,H);
    // Bars
    const bw=(W/fBuf.length)*3;
    let x=0;
    for(let i=0;i<fBuf.length;i++){
      const bh=(fBuf[i]/255)*H*0.9;
      const hue=190+(i/fBuf.length)*100;
      ctx.fillStyle=`hsla(${hue},100%,55%,0.9)`;
      ctx.shadowColor=`hsl(${hue},100%,55%)`; ctx.shadowBlur=4;
      ctx.fillRect(x,H-bh,bw-1,bh);
      x+=bw; if(x>W) break;
    }
    // Waveform
    ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1.5; ctx.shadowBlur=0;
    const sw=W/tBuf.length; let wx=0;
    for(let i=0;i<tBuf.length;i++){
      const wy=(tBuf[i]/128)*(H/2);
      i===0?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy); wx+=sw;
    }
    ctx.stroke();
    // Meters
    const rms=Math.sqrt(fBuf.reduce((s,v)=>s+(v/255)*(v/255),0)/fBuf.length);
    const peak=Math.max(...fBuf);
    setText('mic-rms',(rms*100).toFixed(1)+'%');
    setText('mic-peak',peak);
    setWidth('mic-bar',rms*100);
    const pi=Array.from(fBuf).indexOf(peak);
    if(pi>0&&aCtx) setText('mic-freq',Math.round((pi/fBuf.length)*(aCtx.sampleRate/2))+' Hz');
  }
  draw();
}

// ============================================================
// ---- WEBCAM ----
// ============================================================
let wcStream=null, motRaf=null, prevFr=null, fpsC=0, fpsL=0, fpsRaf=null;

Inits.webcam = function(){
  onPageLeave(()=>{ stopWebcam(); stopMotion(); });
};

async function startWebcam(){
  try{
    if(wcStream) stopWebcam();
    const sel=document.getElementById('cam-sel');
    const did=sel?.value;
    const v={
      video: did&&!did.startsWith('Click')
        ?{deviceId:{exact:did},width:{ideal:1920},height:{ideal:1080}}
        :{width:{ideal:1920},height:{ideal:1080}}
    };
    wcStream=await navigator.mediaDevices.getUserMedia(v);
    const vid=document.getElementById('wcam-video'); if(!vid) return;
    vid.srcObject=wcStream;
    await vid.play();
    vid.onloadedmetadata=()=>{
      const w=vid.videoWidth,h=vid.videoHeight;
      setText('cam-w',w); setText('cam-h',h);
      setText('cam-res',w>=3840?'4K':w>=1920?'1080p':w>=1280?'720p':w>=640?'480p':'SD');
    };
    doFps(vid);
    enumCams();
  }catch(e){alert('Camera error: '+e.message);}
}
function doFps(vid){
  cancelAnimationFrame(fpsRaf); fpsC=0; fpsL=performance.now();
  function f(now){ if(!wcStream)return; fpsC++; if(now-fpsL>=1000){setText('cam-fps',fpsC);fpsC=0;fpsL=now;} fpsRaf=requestAnimationFrame(f); }
  fpsRaf=requestAnimationFrame(f);
}
function stopWebcam(){
  wcStream?.getTracks().forEach(t=>t.stop()); wcStream=null;
  cancelAnimationFrame(fpsRaf);
  const v=document.getElementById('wcam-video'); if(v){v.srcObject=null;}
}
function snapPhoto(){
  const v=document.getElementById('wcam-video');
  if(!v||!v.videoWidth){alert('Start webcam first!');return;}
  const c=document.getElementById('snap-canvas');
  c.width=v.videoWidth; c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);
  const a=document.createElement('a'); a.download=`snap-${Date.now()}.png`; a.href=c.toDataURL(); a.click();
}
async function enumCams(){
  try{
    const devs=await navigator.mediaDevices.enumerateDevices();
    const cams=devs.filter(d=>d.kind==='videoinput');
    const sel=document.getElementById('cam-sel'); if(!sel)return;
    sel.innerHTML=cams.length
      ?cams.map((c,i)=>`<option value="${c.deviceId}">${c.label||`Camera ${i+1}`}</option>`).join('')
      :'<option>No cameras found</option>';
  }catch(e){}
}
function startMotion(){
  const v=document.getElementById('wcam-video');
  if(!v||!wcStream){alert('Start the webcam first!');return;}
  prevFr=null; stopMotion();
  const off=document.createElement('canvas'); off.width=160; off.height=90;
  const offCtx=off.getContext('2d');
  function det(){
    if(!wcStream)return;
    offCtx.drawImage(v,0,0,160,90);
    const fr=offCtx.getImageData(0,0,160,90).data;
    if(prevFr){
      let d=0;
      for(let i=0;i<fr.length;i+=4) d+=Math.abs(fr[i]-prevFr[i])+Math.abs(fr[i+1]-prevFr[i+1])+Math.abs(fr[i+2]-prevFr[i+2]);
      const lv=Math.min(100,Math.round(d/(160*90*3)*15));
      setText('mot-level',lv+'%'); setWidth('mot-bar',lv);
      const s=document.getElementById('mot-status');
      if(s){s.textContent=lv>20?'🔴 Moving!':'🟢 Still'; s.style.color=lv>20?'var(--neon-pink)':'var(--neon-green)';}
    }
    prevFr=new Uint8ClampedArray(fr); motRaf=requestAnimationFrame(det);
  }
  motRaf=requestAnimationFrame(det);
}
function stopMotion(){ cancelAnimationFrame(motRaf); prevFr=null; }

// ============================================================
// ---- STATS ----
// ============================================================
Inits.stats = function(){
  setTimeout(()=>{ drawKbChart(); drawMsChart(); renderHistory(); },60);
};

function drawKbChart(){
  const canvas=document.getElementById('s-kb-chart'); if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const par=canvas.parentElement;
  canvas.width=par?par.clientWidth:400; canvas.height=200;
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const hist=(State.stats.history||[]).filter(h=>h.wpm);
  if(!hist.length){
    ctx.fillStyle='rgba(0,245,255,0.06)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(0,245,255,0.4)'; ctx.font='13px Rajdhani,sans-serif'; ctx.textAlign='center';
    ctx.fillText('No typing test data yet',W/2,H/2); return;
  }
  const max=Math.max(...hist.map(h=>h.wpm),1);
  const bw=(W-40)/hist.length;
  hist.forEach((h,i)=>{
    const bh=(h.wpm/max)*(H-40);
    const x=20+i*bw; const y=H-20-bh;
    const g=ctx.createLinearGradient(0,y,0,H-20);
    g.addColorStop(0,'rgba(0,245,255,0.9)'); g.addColorStop(1,'rgba(0,245,255,0.1)');
    ctx.fillStyle=g; ctx.shadowColor='#00f5ff'; ctx.shadowBlur=8;
    ctx.fillRect(x+2,y,bw-4,bh);
    ctx.shadowBlur=0; ctx.fillStyle='rgba(0,245,255,0.8)'; ctx.font='9px Orbitron,monospace'; ctx.textAlign='center';
    if(bh>16) ctx.fillText(h.wpm,x+bw/2,y-3);
  });
  ctx.fillStyle='rgba(150,200,220,0.5)'; ctx.font='11px Rajdhani'; ctx.textAlign='left';
  ctx.fillText('WPM per typing test (latest →)',4,13);
}
function drawMsChart(){
  const canvas=document.getElementById('s-ms-chart'); if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const par=canvas.parentElement;
  canvas.width=par?par.clientWidth:400; canvas.height=200;
  const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(0,245,255,0.03)'; ctx.fillRect(0,0,W,H);
  const data=[ms.left,ms.mid,ms.right];
  const labels=['Left','Middle','Right'];
  const colors=['#00f5ff','#bf00ff','#ff0080'];
  const max=Math.max(...data,1);
  const pad=40, bw=(W-pad*2)/3;
  data.forEach((v,i)=>{
    const bh=(v/max)*(H-pad*2);
    const x=pad+i*bw+bw*0.15, y=H-pad-bh;
    const g=ctx.createLinearGradient(0,y,0,H-pad);
    g.addColorStop(0,colors[i]); g.addColorStop(1,colors[i]+'22');
    ctx.fillStyle=g; ctx.shadowColor=colors[i]; ctx.shadowBlur=8;
    ctx.fillRect(x,y,bw*0.7,bh);
    ctx.shadowBlur=0; ctx.fillStyle=colors[i]; ctx.font='12px Rajdhani'; ctx.textAlign='center';
    ctx.fillText(labels[i],x+bw*0.35,H-pad+14);
    if(v>0) ctx.fillText(v,x+bw*0.35,y-4);
  });
}
function renderHistory(){
  const el=document.getElementById('s-history'); if(!el)return;
  const h=(State.stats.history||[]).slice().reverse().slice(0,10);
  if(!h.length){el.innerHTML='<div style="color:var(--text-secondary);text-align:center;padding:30px">No history yet — complete a typing test first</div>';return;}
  el.innerHTML=h.map(e=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 15px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;margin-bottom:7px">
      <span style="font-size:12px;color:var(--text-secondary)">${new Date(e.ts).toLocaleString()}</span>
      <div style="display:flex;gap:14px;font-family:'Orbitron',monospace;font-size:12px">
        ${e.wpm?`<span style="color:var(--neon-cyan)">${e.wpm} WPM</span>`:''}
        ${e.acc?`<span style="color:var(--neon-green)">${e.acc}% acc</span>`:''}
      </div>
    </div>`).join('');
}
function clearStats(){
  if(!confirm('Clear all saved statistics?'))return;
  State.stats={}; localStorage.removeItem('spt-stats');
  ms.left=ms.mid=ms.right=0;
  loadPage('stats');
}

// ============================================================
// ---- SETTINGS ----
// ============================================================
Inits.settings = function(){};
function toggleBg(show){
  const c=document.getElementById('bg-canvas'); if(c) c.style.opacity=show?'0.6':'0';
}
function exportStats(){
  const d={...State.stats,session:Session,exportedAt:new Date().toISOString()};
  const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`spt-stats-${Date.now()}.json`; a.click();
}

// ============================================================
// UTILITIES
// ============================================================
function setText(id,v){ const e=document.getElementById(id); if(e) e.textContent=v; }
function setWidth(id,p){ const e=document.getElementById(id); if(e) e.style.width=Math.max(0,Math.min(100,p))+'%'; }
function saveStats(){ localStorage.setItem('spt-stats',JSON.stringify(State.stats)); }

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme(State.theme);
  startSessionTimer();
  loadPage('home');

  // Global passive counters (outside page-specific handlers)
  document.addEventListener('keydown', ()=>{ if(State.page!=='keyboard') Session.keys++; });
  document.addEventListener('mousedown',()=>{ if(State.page!=='mouse') Session.clicks++; });
});
