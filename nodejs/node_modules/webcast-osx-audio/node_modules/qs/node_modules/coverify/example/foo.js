module.exports = function (cb) {
    var i = 0;
    var iv = setInterval(function () {
        if (i++ === 10 || (false && neverFires())) {
            clearInterval(iv);
            cb(null, 111);
        }
    }, 10);
};
