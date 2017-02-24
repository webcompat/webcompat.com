/* global doTheBigStyleFixing */
(function() {
  var pre = document.createElement("pre");
  pre.className = "wc-CSSFixme-resultat";
  var preParentID = "js-CSSFixme";
  var cssfixmeInit = false;

  window.addEventListener("load", function() {
    if (cssfixmeInit) {
      return;
    }
    function do_fixup() {
      var csscode = document.getElementsByTagName("textarea")[0].value;
      var compact = document.getElementsByName("compact")[0].checked;
      // CSS is fixed and the new code is inserted into the PRE element
      // (it will first empty the PRE)
      doTheBigStyleFixing(csscode, pre, compact);
      // If this is the first time, insert the PRE into the DOM
      // (it would create layout oddities if present and empty)
      if (!pre.parentNode) {
        document.getElementById(preParentID).appendChild(pre);
      }
    }
    // Hook up the UI
    document.getElementById("btn_do_fixup").addEventListener("click", do_fixup);
    // If the TEXTAREA has contents, do the fixup immediately
    if (document.getElementsByTagName("textarea")[0].value.trim()) {
      do_fixup();
    }

    // Make a double-click in the output area select all the code
    document.getElementById(preParentID).addEventListener("dblclick", function(e) {
      window.getSelection().removeAllRanges();
      var rng = document.createRange();
      rng.selectNodeContents(document.getElementById(preParentID));
      window.getSelection().addRange(rng);
      e.preventDefault();
    }, false);
    cssfixmeInit = true;
  }, false);
})();

