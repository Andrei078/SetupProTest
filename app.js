function loadPage(page) {
  document.getElementById("content").innerHTML =
    `<iframe src="pages/${page}" style="width:100%;height:100%;border:none;"></iframe>`;
}

function saveSettings() {
  alert("Setările au fost salvate!");
}

function checkUpdates() {
  alert("Se caută update-uri...");
}
function loadPage(page) {
  document.getElementById("content").innerHTML =
    `<iframe src="pages/${page}" style="width:100%;height:100%;border:none;"></iframe>`;
}
