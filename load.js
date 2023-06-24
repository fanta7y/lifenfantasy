function loadFile(msg,callback) {
    console.log(msg);
    setTimeout(callback, 10000);
}
loadFile('loading File...',function () {
    console.log('file loaded');
});