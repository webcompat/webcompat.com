/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ALLOWED_IMG_FORMAT = ["jpg", "jpeg", "jpe", "png", "gif", "bmp"];

export const isUrlValid = (value) => {
  return /^https?:\/\/(?!.*:\/\/)\S+/.test(value);
};

export const isEmpty = (value) => {
  if (!value) return true;

  return !value.trim();
};

export const isImageTypeValid = (value) => {
  const splitImg = value.split(".");
  const ext = splitImg[splitImg.length - 1].toLowerCase();

  return ALLOWED_IMG_FORMAT.includes(ext);
};

export const blobOrFileTypeValid = (blobOrFile) => {
  if (!blobOrFile || !blobOrFile.type) return false;

  const matches = blobOrFile.type.match("image.*");
  return !!(matches && matches.length);
};

export const isImageDataURIValid = (dataURI) => {
  return typeof dataURI === "string" && dataURI.startsWith("data:image/");
};
