import deleteImage from "./delete-image.js";
import savingError from "./saving-error.js";
import uploadText from "./upload-text.js";
import uploadOther from "./upload-other.js";
import imagePreview from "./preview.js";

const index = [deleteImage, savingError, uploadText, uploadOther, imagePreview];

export default {
  init: () => {
    index.forEach((module) => module.init());
  },
};
