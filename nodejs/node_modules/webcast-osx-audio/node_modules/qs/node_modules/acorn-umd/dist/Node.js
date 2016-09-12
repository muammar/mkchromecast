var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var merge = require("lodash").merge;

var Node = require("acorn").Node;

var NodeHelper = (function (_Node) {
  function NodeHelper(settings) {
    _classCallCheck(this, NodeHelper);

    merge(this, settings);
  }

  _inherits(NodeHelper, _Node);

  return NodeHelper;
})(Node);

module.exports = NodeHelper;