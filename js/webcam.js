const cameraSelect = document.getElementById("cameraSelect");
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("webcamVideo");

const resolutionEl = document.getElementById("resolution");
const fpsEl = document.getElementById("fps");
const latencyEl = document.getElementById("latency");

let currentStream = null;

// Listează camerele
async function listCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === "videoinput");

  cameraSelect.innerHTML = "";
  videoDevices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label || `Camera ${index+1}`;
    cameraSelect.appendChild(option);
  });
}

// Pornește camera selectată
async function startCamera() {
  if(currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      deviceId: cameraSelect.value ? { exact: cameraSelect.value } : undefined,
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    }
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;

    // Setează detalii video
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    resolutionEl.textContent = `${settings.width} x ${settings.height}`;
    fpsEl.textContent = settings.frameRate ? `${settings.frameRate} FPS` : "-";

    // Latenta aproximativă (simplă)
    const start = performance.now();
    video.onplaying = () => {
      const end = performance.now();
      latencyEl.textContent = Math.round(end - start) + " ms";
    };

  } catch (err) {
    alert("Nu am putut accesa camera: " + err);
  }
}

startBtn.addEventListener("click", startCamera);
listCameras();
