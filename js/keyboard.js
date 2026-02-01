const lastKey = document.getElementById("lastKey");
const keyCode = document.getElementById("keyCode");
const responseTime = document.getElementById("responseTime");

let lastPress = null;

function findKey(code) {
  return document.querySelector(`.key[data-key="${code}"]`);
}

window.addEventListener("keydown", (e) => {
  const now = performance.now();

  if (lastPress) {
    responseTime.textContent = Math.round(now - lastPress) + " ms";
  }

  lastPress = now;

  lastKey.textContent = e.key;
  keyCode.textContent = e.code;

  const el = findKey(e.code);
  if (el) {
    el.classList.add("active", "tested");
  }
});

window.addEventListener("keyup", (e) => {
  const el = findKey(e.code);
  if (el) el.classList.remove("active");
});

// Reset la refresh
window.addEventListener("load", () => {
  lastKey.textContent = "-";
  keyCode.textContent = "-";
  responseTime.textContent = "- ms";
});
