if (/Mobi/.test(navigator.userAgent)) {
  document.documentElement.className += " font-mobile";
  var sourceSansPro300 = new window.FontFaceObserver("Source Sans Pro", {
    weight: 300
  });

  var sourceSansPro400 = new window.FontFaceObserver("Source Sans Pro", {
    weight: 400
  });

  var openSans400 = new window.FontFaceObserver("Open Sans", {
    weight: 400
  });

  var openSans600 = new window.FontFaceObserver("Open Sans", {
    weight: 600
  });

  Promise.all([
    sourceSansPro300.load(null, 20000),
    sourceSansPro400.load(null, 20000),
    openSans400.load(null, 20000),
    openSans600.load(null, 20000)
  ]).then(function() {
    document.documentElement.className += " fonts-loaded";
  });
}
