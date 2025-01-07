var getElementById = function (id) {
  document.body.getElementById(id);
}
var jscode = getElementById("jscode").value;
var evalbtn = getElementById("evalbtn");
evalbtn.click = function () {
  jscode = getElementById("jscode").value;
  chrome.runtime.sendMessage("runcodeasext"+jscode, () => {alert("code evaluated")});
}
