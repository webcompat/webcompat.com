/* global doTheBigStyleFixing */
addEventListener('load', function() {

  function do_fixup() {
    var csscode = document.getElementsByTagName('textarea')[0].value;
    var pre = document.getElementById('fixedcss');
    var compact = document.getElementsByName('compact')[0].checked;
    doTheBigStyleFixing(csscode, pre, compact);
  }

  document.getElementById('btn_do_fixup').addEventListener('click', do_fixup, false);

  if (document.getElementsByTagName('textarea')[0].value) {
    do_fixup();
  }

  document.getElementById('fixedcss').addEventListener('dblclick', function(e) {
    window.getSelection().removeAllRanges();
    var rng = document.createRange();
    rng.selectNodeContents(document.getElementById('fixedcss'));
    window.getSelection().addRange(rng);
    e.preventDefault();
  }, false);

}, false);

