'use strict';
module.exports = /* intentional newline */
  function () {
  function PowerAssertRecorder() {
    this.captured = [];
  }

  PowerAssertRecorder.prototype._capt = function _capt (value, espath) {
    this.captured.push({value: value, espath: espath});
    return value;
  };

  PowerAssertRecorder.prototype._expr = function _expr (value, source) {
    return {
      powerAssertContext: {
        value: value,
        events: this.captured
      },
      source: source
    };
  };

  return PowerAssertRecorder;
}
