/* exported MarkdownSanitizerMixin */
function MarkdownSanitizerMixin() {
  this.sanitizeMarkdown = function(md) {
    // markdown-it-sanitizer seems to be dead
    // https://github.com/svbergerem/markdown-it-sanitizer/pull/7
    // once this PR is merged and a new version is available, we can safely remove the following lines
    // specify only valid tags. we don't want to inject evil <script> tags or stuff like that
    ["details", "summary"].forEach(function(tag) {
      md = md.replace(
        new RegExp("&lt;(/?)" + tag + "&gt;", "g"),
        "<$1" + tag + ">"
      );
    });
    return md;
  };
}
