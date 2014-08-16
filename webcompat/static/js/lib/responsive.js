function removeQuotes(string) {
    if (typeof string === 'string' || string instanceof String) {
        string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
    }
    return string;
}
function getBreakpoint() {
    var style;
    if ( window.getComputedStyle && window.getComputedStyle(document.body, '::after') ) {
        style = window.getComputedStyle(document.body, '::after');
        style = style.content;
    }
    return JSON.parse( removeQuotes(style) );
}

function resizeHeightLabel() {
  var label = getBreakpoint();
  if(label.resizeHeightLabel) {
    console.info('resize height');
  }
}
document.addEventListener("addEventListener", resizeHeightLabel);
window.onresize = resizeHeightLabel;
