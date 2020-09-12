function hideFindForm() {
    document.getElementById("notify-form").style = "display: none";
    findFlag = true;
}

function showFindForm() {
    document.getElementById("notify-form").style = "display: block";
    findFlag = false;
}

function stopIntervalRequest() {
    document.getElementById("interval-form").style = "display: block";
    intervalFlag = false;
}