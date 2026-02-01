const posXEl = document.getElementById("posX");
const posYEl = document.getElementById("posY");
const clickTypeEl = document.getElementById("clickType");
const distanceEl = document.getElementById("distance");
const latencyEl = document.createElement("span"); // nou element pentru latenta
const tracker = document.getElementById("cursorTracker");

let lastPos = null;
let totalDistance = 0;
let lastMoveTime = null;

// Adaugă span în info-box pentru latenta click
const mouseInfo = document.querySelector(".mouse-info");
const latencyBox = document.createElement("div");
latencyBox.className = "info-box";
latencyBox.innerHTML = `<span class="label">Latenta Click:</span><span id="clickLatency">- ms</span>`;
mouseInfo.appendChild(latencyBox);
const clickLatencyEl = document.getElementById("clickLatency");

document.querySelector(".mouse-area").addEventListener("mousemove", (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  posXEl.textContent = Math.round(x);
  posYEl.textContent = Math.round(y);

  tracker.style.transform = `translate(${x}px, ${y}px)`;

  const now = performance.now();
  lastMoveTime = now;

  if (lastPos) {
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    totalDistance += Math.sqrt(dx*dx + dy*dy);
    distanceEl.textContent = Math.round(totalDistance) + " px";
  }

  lastPos = {x, y};
});

document.querySelector(".mouse-area").addEventListener("mousedown", (e) => {
  const now = performance.now();
  let latency = lastMoveTime ? Math.round(now - lastMoveTime) : 0;

  if(e.button === 0) clickTypeEl.textContent = "Click stânga";
  if(e.button === 1) clickTypeEl.textContent = "Click mijloc";
  if(e.button === 2) clickTypeEl.textContent = "Click dreapta";

  clickLatencyEl.textContent = latency + " ms";
});

document.querySelector(".mouse-area").addEventListener("mouseup", () => {
  clickTypeEl.textContent = "-";
  clickLatencyEl.textContent = "- ms";
});

// Prevent context menu in test area
document.querySelector(".mouse-area").addEventListener("contextmenu", (e) => e.preventDefault());
