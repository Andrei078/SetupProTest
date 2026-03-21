let gamepadIndex = null;

/* =========================
   ELEMENTE UI
========================= */
const statusEl = document.getElementById("status");
const modelEl = document.getElementById("model");

const latencyEl = document.getElementById("latency");
const pressureEl = document.getElementById("pressure");
const driftEl = document.getElementById("drift");
const vibBtn = document.getElementById("vibration-btn");

/* =========================
   STARE GLOBALĂ
========================= */
let vibrationOn = true;
let lastTimestamp = performance.now();

/* =========================
   GAMEPAD CONNECT
========================= */
window.addEventListener("gamepadconnected", (e) => {
  console.log("Controller conectat:", e.gamepad);

  gamepadIndex = e.gamepad.index;
  statusEl.textContent = "Conectat";

  detectModel(e.gamepad.id);
});

window.addEventListener("gamepaddisconnected", () => {
  console.log("Controller deconectat");

  gamepadIndex = null;
  statusEl.textContent = "Deconectat";
  modelEl.textContent = "--";
});

/* =========================
   DETECTARE MODEL
========================= */
function detectModel(id) {
  id = id.toLowerCase();

  if (id.includes("xbox")) {
    modelEl.textContent = "Xbox Controller";
  } 
  else if (id.includes("dualsense")) {
    modelEl.textContent = "PS5 Controller";
  } 
  else if (id.includes("playstation") || id.includes("dualshock")) {
    modelEl.textContent = "PS4 Controller";
  } 
  else {
    modelEl.textContent = "Necunoscut";
  }
}

/* =========================
   DEADZONE
========================= */
function applyDeadzone(value, deadzone = 0.12) {
  if (Math.abs(value) < deadzone) return 0;
  return value;
}

/* =========================
   MOVE STICK
========================= */
function moveStick(el, x, y) {
  if (!el) return;

  const maxMove = 18;

  el.style.transform = `translate(${x * maxMove}px, ${y * maxMove}px)`;
}

/* =========================
   LATENȚĂ
========================= */
function updateLatency() {
  const now = performance.now();
  const latency = now - lastTimestamp;

  if (latencyEl) {
    latencyEl.textContent = latency.toFixed(1) + " ms";
  }

  lastTimestamp = now;
}

/* =========================
   PRESSURE (TRIGGERS)
========================= */
function updatePressure(gp) {
  if (!pressureEl) return;

  const lt = gp.buttons[6]?.value || 0;
  const rt = gp.buttons[7]?.value || 0;

  const pressure = Math.max(lt, rt);

  pressureEl.textContent = pressure.toFixed(2);
}

/* =========================
   STICK DRIFT
========================= */
function updateDrift(gp) {
  if (!driftEl) return;

  const dx = applyDeadzone(gp.axes[0]);
  const dy = applyDeadzone(gp.axes[1]);

  const drift = Math.sqrt(dx * dx + dy * dy);

  driftEl.textContent = drift.toFixed(3);
}

/* =========================
   VIBRAȚIE
========================= */
function handleVibration(gp) {
  if (!vibrationOn) return;

  if (gp.buttons.some(btn => btn.pressed)) {
    const actuator = gp.vibrationActuator;

    if (actuator) {
      actuator.playEffect("dual-rumble", {
        duration: 80,
        strongMagnitude: 1.0,
        weakMagnitude: 0.8
      });
    }
  }
}

/* =========================
   VIB BUTTON UI
========================= */
if (vibBtn) {
  vibBtn.addEventListener("click", () => {
    vibrationOn = !vibrationOn;

    vibBtn.classList.toggle("vib-on", vibrationOn);
    vibBtn.classList.toggle("vib-off", !vibrationOn);

    vibBtn.textContent = vibrationOn ? "Vibrație: ON" : "Vibrație: OFF";
  });
}

/* =========================
   GAME LOOP
========================= */
function update() {
  const gamepads = navigator.getGamepads();

  if (!gamepads || !gamepads[gamepadIndex]) {
    requestAnimationFrame(update);
    return;
  }

  const gp = gamepads[gamepadIndex];

  /* BUTOANE */
  gp.buttons.forEach((btn, i) => {
    const el = document.querySelector(`[data-btn="${i}"]`);
    if (!el) return;

    el.classList.toggle("active", btn.pressed);
  });

  /* STICK STÂNGA */
  const leftStick = document.getElementById("left-stick");

  const lx = applyDeadzone(gp.axes[0]);
  const ly = applyDeadzone(gp.axes[1]);

  moveStick(leftStick, lx, ly);

  /* STICK DREAPTA */
  const rightStick = document.getElementById("right-stick");

  const rx = applyDeadzone(gp.axes[2]);
  const ry = applyDeadzone(gp.axes[3]);

  moveStick(rightStick, rx, ry);

  /* STATISTICI */
  updateLatency();
  updatePressure(gp);
  updateDrift(gp);
  handleVibration(gp);

  requestAnimationFrame(update);
}

/* =========================
   PORNIRE
========================= */
update();

/* =========================
   FIX BRAVE / INTERACTION
========================= */
document.body.addEventListener("click", () => {
  console.log("User interaction OK");
});