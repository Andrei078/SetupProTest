window.onload = function () {
  loadSettings();
};

function saveSettings() {
  let lang = document.getElementById("language").value;

  localStorage.setItem("appLanguage", lang);

  alert("Setările au fost salvate cu succes!");
}

function loadSettings() {
  let lang = localStorage.getItem("appLanguage");

  if (lang) {
    document.getElementById("language").value = lang;
  }
}

function checkUpdates() {
  let status = document.getElementById("updateStatus");

  status.innerText = "Se verifică update-urile...";

  setTimeout(() => {
    status.innerText = "Aplicația este la zi!";
  }, 2000);
}
