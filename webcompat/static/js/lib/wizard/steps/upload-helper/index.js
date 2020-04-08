import removeUpload from "./remove-upload.js";
import uploadError from "./error.js";
import uploadText from "./upload-text.js";
import uploadOther from "./upload-other.js";
import uploadPreview from "./preview.js";

const index = [
  removeUpload,
  uploadError,
  uploadText,
  uploadOther,
  uploadPreview
];

export default {
  init: () => {
    index.forEach(module => module.init());
  }
};
