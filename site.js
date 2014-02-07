var body = window.document.querySelector("body");
var before = window.document.querySelector("#before a");
var after = window.document.querySelector("#after a");

window.onkeydown = function (e) {
    var key = e.keyCode;
    if (key === 37 && before) {
        before.click();
    }
    if (key === 39 && after) {
        after.click();
    }
};