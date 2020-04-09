/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const extractPrettyUrl = (url) => {
  const pathArray = url.trim().split("/");
  return pathArray[2];
};

export const charsPercent = (value, min = 30) => {
  if (typeof value !== "string")
    throw Error("First argument should be a string");

  const total = value.trim().length;
  const progress = (total * 100) / min;

  if (progress > 100) return 100;

  return progress;
};

export const downsampleImage = (dataURI, callback) => {
  let img = document.createElement("img");
  let canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  img.onload = () => {
    // scale the tmp canvas to 50%
    canvas.width = Math.floor(img.width / 2);
    canvas.height = Math.floor(img.height / 2);
    ctx.scale(0.5, 0.5);
    // draw back in the screenshot (at 50% scale)
    // and re-serialize to data URI
    ctx.drawImage(img, 0, 0);
    // Note: this will convert GIFs to JPEG, which breaks
    // animated GIFs. However, this only will happen if they
    // were above the upload limit size. So... sorry?
    const screenshotData = canvas.toDataURL("image/jpeg", 0.8);

    img = null;
    canvas = null;

    callback(screenshotData);
  };

  img.src = dataURI;
};

/*
  If the users browser understands the FileReader API, show a preview
  of the image they're about to load, then invoke the passed in callback
  with the result of reading the blobOrFile as a dataURI.
*/
export const convertToDataURI = (blobOrFile, callback) => {
  if (!(window.FileReader && window.File)) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const dataURI = event.target.result;
    callback(dataURI);
  };
  reader.readAsDataURL(blobOrFile);
};

export const isSelfReport = (href, origin) => {
  const reg = /url=([^&]+)/;
  const url = href.match(reg);

  if (url !== null) {
    return decodeURIComponent(url[0]).includes(origin);
  }

  return false;
};
