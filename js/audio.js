// Elemente HTML
const audioOutputSelect = document.getElementById("audioOutputSelect");
const audioInputSelect = document.getElementById("audioInputSelect");
const playTestBtn = document.getElementById("playTest");
const toggleMicBtn = document.getElementById("toggleMic");

const volumeLevel = document.getElementById("volumeLevel");
const micLevel = document.getElementById("micLevel");
const audioQuality = document.getElementById("audioQuality");

const testAudio = document.getElementById("testAudio");

// Variabile audio
let micStream = null;
let micAnalyzer = null;
let audioCtx = null;
let micSource = null;
let micGain = null;
let micActive = false;

// Listează dispozitivele audio disponibile
async function listAudioDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const outputs = devices.filter(d => d.kind === "audiooutput");
  const inputs = devices.filter(d => d.kind === "audioinput");

  audioOutputSelect.innerHTML = "";
  outputs.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.text = d.label || `Căști ${i+1}`;
    audioOutputSelect.appendChild(opt);
  });

  audioInputSelect.innerHTML = "";
  inputs.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.text = d.label || `Microfon ${i+1}`;
    audioInputSelect.appendChild(opt);
  });
}

// Redare sunet test
playTestBtn.addEventListener("click", async () => {
  if (testAudio.setSinkId) {
    try {
      await testAudio.setSinkId(audioOutputSelect.value);
    } catch (err) {
      alert("Eroare setare dispozitiv audio: " + err);
    }
  }
  testAudio.play();

  // Simulare volum și calitate
  volumeLevel.textContent = "100%";
  audioQuality.textContent = "Bună";
});

// Start / Stop microfon live
toggleMicBtn.addEventListener("click", async () => {
  if (!micActive) {
    // Start microfon
    try {
      if(micStream) micStream.getTracks().forEach(t => t.stop());

      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: audioInputSelect.value ? { exact: audioInputSelect.value } : undefined }
      });

      if(!audioCtx) audioCtx = new AudioContext();

      micSource = audioCtx.createMediaStreamSource(micStream);
      micGain = audioCtx.createGain();
      micSource.connect(micGain);
      micGain.connect(audioCtx.destination); // live in casti

      // Analyzer pentru nivel microfon
      micAnalyzer = audioCtx.createAnalyser();
      micAnalyzer.fftSize = 256;
      micGain.connect(micAnalyzer);

      const dataArray = new Uint8Array(micAnalyzer.frequencyBinCount);

      function updateMicLevel() {
        if(!micActive) return; // oprește update-ul când stop
        micAnalyzer.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
        micLevel.textContent = Math.round(avg);
        requestAnimationFrame(updateMicLevel);
      }
      updateMicLevel();

      // Update UI
      toggleMicBtn.textContent = "Stop Microfon";
      toggleMicBtn.classList.add("stop");
      micActive = true;

    } catch (err) {
      alert("Nu am putut accesa microfonul: " + err);
    }

  } else {
    // Stop microfon
    if(micStream) micStream.getTracks().forEach(t => t.stop());
    micLevel.textContent = "-";
    toggleMicBtn.textContent = "Start Microfon";
    toggleMicBtn.classList.remove("stop");
    micActive = false;
  }
});

// Listează dispozitivele la încărcare
listAudioDevices();
