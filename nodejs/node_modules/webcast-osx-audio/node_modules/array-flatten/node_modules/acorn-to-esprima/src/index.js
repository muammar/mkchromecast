exports.attachComments = require("./attachComments");

exports.toTokens       = require("./toTokens"); // requires babel tokTypes
exports.toAST          = require("./toAST"); // requires traversal method

exports.convertComments = function (comments) {
  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    if (comment.type === "CommentBlock") {
      comment.type = "Block";
    } else if (comment.type === "CommentLine") {
      comment.type = "Line";
    }
    // sometimes comments don't get ranges computed,
    // even with options.ranges === true
    if (!comment.range) {
      comment.range = [comment.start, comment.end];
    }
  }
}