module.exports = function (source, map) {
  source = source.replace(/<script type="text\/template">/, "");
  source = source.replace(/<\/script>/, "");
  this.callback(null, source.trim(), map);
};
