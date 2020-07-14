/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint new-cap: ["error", { "capIsNewExceptions": ["Deferred"] }]*/

function BugForm() {
  // Set up listener for message events from screenshot-enabled add-ons
  // Runs only when the DOM is ready
  var me = this;
  window.addEventListener(
    "message",
    function (event) {
      $(function () {
        me.onReceiveMessage(event);
      });
    },
    false
  );

  // the initialization of the rest of the form happens when the DOM is ready
  $(BugForm.prototype.onDOMReadyInit.bind(this));
}

BugForm.prototype.onDOMReadyInit = function () {
  this.clickedButton = null;
  this.detailsInput = $("#details:hidden");
  this.consoleLogsInput = $("#console_logs_url:hidden");
  this.errorLabel = $(".js-error-upload");
  this.form = $("#js-ReportForm form");
  this.hasImage = null;
  this.loadingIndicator = $(".js-loader");
  this.previewEl = $(".js-image-upload");
  this.removeBanner = $(".js-remove-upload");
  this.submitButtons = $("#js-ReportForm .js-Button");
  this.submitButtonWrappers = $("#js-ReportForm .js-Button-wrapper");
  this.submitTypeInput = $("#submit_type:hidden");
  this.uploadLabel = $(".js-label-upload");
  this.urlParamRegExp = /url=([^&]+)/;
  this.validation = new Validation();

  this.UPLOAD_LIMIT = 1024 * 1024 * 4;

  this.inputs = {
    url: {
      el: $("#url"),
      valid: null,
      helpText: "A valid URL is required.",
      errFunction: "requiredField",
    },
    problem_category: {
      el: $("[name=problem_category]"),
      valid: null,
      helpText: "Problem type required.",
      errFunction: "requiredField",
    },
    description: {
      el: $("#description"),
      valid: null,
      helpText: "A problem summary is required.",
      errFunction: "requiredField",
    },
    steps_reproduce: {
      el: $("#steps_reproduce"),
      valid: true,
      helpText: null,
    },
    image: {
      el: $("#image"),
      // image should be valid by default because it's optional
      valid: true,
      helpText:
        "Image must be one of the following: jpe, jpg, jpeg, png, gif, or bmp.",
      errFunction: "imageField",
    },
    browser: {
      el: $("#browser"),
      valid: true,
      helpText: null,
      errFunction: "optionalField",
    },
    os: {
      el: $("#os"),
      valid: true,
      helpText: null,
      errFunction: "optionalField",
    },
    browser_test_type: {
      el: $("[name=browser_test]"),
      valid: true,
      helpText: null,
    },
    contact: {
      el: $("#contact"),
      valid: true,
      helpText:
        "GitHub nicknames are 39 characters max, alphanumeric and hyphens only.",
      errFunction: "requiredField",
    },
  };

  this.browserField = this.inputs.browser.el;
  this.osField = this.inputs.os.el;
  this.problemType = this.inputs.problem_category.el;
  this.uploadField = this.inputs.image.el;
  this.urlField = this.inputs.url.el;
  this.descField = this.inputs.description.el;
  this.browserTestField = this.inputs.browser_test_type.el;
  this.stepsToReproduceField = this.inputs.steps_reproduce.el;
  this.contactField = this.inputs.contact.el;

  return this.init();
};

BugForm.prototype.init = function () {
  // Make sure we're not getting a report
  // about our own site before checking params.
  if (!this.isSelfReport()) {
    this.checkParams();
  }

  this.disableSubmits();
  this.urlField.on("blur input", this.checkUrl.bind(this));
  this.descField.on("blur input", this.checkDescription.bind(this));
  this.problemType.on("change", this.checkProblemTypeValidity.bind(this));
  this.uploadField.on("change", this.checkImageTypeValidity.bind(this));
  this.osField.on("blur", this.checkOptionalNonEmpty.bind(this, this.osField));
  this.browserField.on(
    "blur",
    this.checkOptionalNonEmpty.bind(this, this.browserField)
  );
  this.contactField.on("blur input", this.checkGitHubUsername.bind(this));
  this.submitButtons.on("click", this.storeClickedButton.bind(this));
  this.submitButtonWrappers.on("click", this.onSubmitAttempt.bind(this));
  this.form.on("submit", this.onFormSubmit.bind(this));

  // prevent submit by hitting enter key for single line input fields
  this.form.on(
    "keypress",
    ":input:not(textarea)",
    this.preventSubmitByEnter.bind(this)
  );

  // See if the user already has a valid form
  // (after a page refresh, back button, etc.)
  this.checkForm();
};

BugForm.prototype.onReceiveMessage = function (event) {
  // We're getting a report about our own site, so let's bail.
  if (this.isSelfReport()) {
    return false;
  }

  // Make sure the data is coming from a trusted source.
  // (i.e., our add-on or some other priviledged code sent it)
  if (location.origin === event.origin) {
    if (
      event.data.hasOwnProperty("screenshot") &&
      event.data.hasOwnProperty("message")
    ) {
      this.handleScreenshot(event.data.screenshot);
      this.handleMessage(event.data.message);
    } else {
      this.handleScreenshot(event.data);
    }
  }
};

BugForm.prototype.handleScreenshot = function (screenshot) {
  if (!screenshot) {
    return;
  }
  // See https://github.com/webcompat/webcompat.com/issues/1252 to track
  // the work of only accepting blobs, which should simplify things.
  if (screenshot instanceof Blob) {
    // convertToDataURI sends the resulting string to the upload
    // callback.
    this.convertToDataURI(screenshot, this.showUploadPreview.bind(this));
  } else {
    // ...the data is already a data URI string
    this.showUploadPreview(screenshot);
  }
};

BugForm.prototype.handleMessage = function (message) {
  if (!message) {
    return;
  }

  prefillForm(message);
  this.checkForm();
};

BugForm.prototype.preventSubmitByEnter = function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

BugForm.prototype.showUploadPreview = function (dataURI) {
  // The final size of Base64-encoded binary data is ~equal to
  // 1.37 times the original data size + 814 bytes (for headers).
  // so, bytes = (encoded_string.length - 814) / 1.37)
  // see https://en.wikipedia.org/wiki/Base64#MIME
  if (String(dataURI).length - 814 / 1.37 > this.UPLOAD_LIMIT) {
    this.downsampleImage(
      dataURI,
      _.bind(function (downsampledData) {
        // Recurse until it's small enough for us to upload.
        this.showUploadPreview(downsampledData);
      }, this)
    );
  } else {
    this.makeValid("image");
    this.addPreviewBackground(dataURI);
  }
};

BugForm.prototype.downsampleImage = function (dataURI, callback) {
  var img = document.createElement("img");
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  img.onload = function () {
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
    var screenshotData = canvas.toDataURL("image/jpeg", 0.8);
    (img = null), (canvas = null);

    callback(screenshotData);
  };

  img.src = dataURI;
};

// Is the user trying to report a site against webcompat.com itself?
BugForm.prototype.isSelfReport = function (href) {
  href = href || location.href;
  var url = href.match(this.urlParamRegExp);
  if (url !== null) {
    if (_.includes(decodeURIComponent(url[0]), location.origin)) {
      return true;
    }
  }
  return false;
};

// Do some extra work based on the GET params that come with the request
BugForm.prototype.checkParams = function () {
  // Don't bother doing any work for bare requests.
  if (!location.search) {
    return;
  }

  var url = location.href.match(this.urlParamRegExp);
  if (url !== null) {
    url = this.trimWyciwyg(decodeURIComponent(url[1]));
    this.urlField.val(url);
    this.makeValid("url");
  }

  // If we have a problem_type param, and it matches the value, select it for
  // the user. see https://github.com/webcompat/webcompat.com/blob/34c3b6b1a1116b401a9a442685131ae747045f67/webcompat/form.py#L38
  // for possible matching values
  var problemType = location.href.match(/problem_type=([^&]*)/);
  if (problemType !== null) {
    $("[value=" + problemType[1] + "]").click();
  }

  // If we have details, put it inside a hidden input and append it to the
  // form.
  var details = location.href.match(/details=([^&]*)/);
  if (details) {
    this.addDetails(details[1]);
  }
};

BugForm.prototype.addDetails = function (detailsParam) {
  // The content of the details param may be encoded via
  // application/x-www-form-urlencoded, so we need to change the
  // + (SPACE) to %20 before decoding
  this.detailsInput.val(decodeURIComponent(detailsParam.replace(/\+/g, "%20")));
};

BugForm.prototype.storeClickedButton = function (event) {
  this.clickedButton = event.target.name;
};

BugForm.prototype.trimWyciwyg = function (url) {
  // Trim wyciwyg://N/ from URL, if found.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=1098037 &
  // https://en.wikipedia.org/wiki/WYCIWYG
  var wyciwygRe = /(wyciwyg:\/\/\d+\/)/i;
  if (url.search(wyciwygRe) !== 0) {
    return url;
  } else {
    return url.replace(wyciwygRe, "");
  }
};

BugForm.prototype.disableSubmits = function () {
  this.submitButtons.prop("disabled", true);
  this.submitButtons.addClass("is-disabled");
};

BugForm.prototype.enableSubmits = function () {
  this.submitButtons.prop("disabled", false);
  this.submitButtons.removeClass("is-disabled");
};

/* determines function based on whether validation returns true or false */
BugForm.prototype.determineValidityFunction = function (func, field, silent) {
  if (func(field)) {
    return "makeValid";
  }
  return silent ? "makeInvalidSilent" : "makeInvalid";
};

BugForm.prototype.checkProblemTypeValidity = function (silent) {
  var func = this.determineValidityFunction(
    this.validation.isProblemTypeValid,
    this.problemType,
    silent
  );
  this[func]("problem_category");
};

BugForm.prototype.checkImageTypeValidity = function (event, silent) {
  // Bail if there's no image.
  if (!this.uploadField.val()) {
    return;
  }

  var func = this.determineValidityFunction(
    this.validation.isImageTypeValid,
    this.uploadField,
    silent
  );
  this[func]("image");

  if (func === "makeValid" && event) {
    // We can just grab the 0th one, because we only allow uploading
    // a single image at a time (for now)
    this.convertToDataURI(
      event.target.files[0],
      this.showUploadPreview.bind(this)
    );
  }
  // null out input.value so we get a consistent
  // change event across browsers
  if (event) {
    event.target.value = null;
  }
};

BugForm.prototype.checkUrl = function (event) {
  var isSilent = event.type === "input" || !this.urlField.val();
  this.checkURLValidity(isSilent);
};

BugForm.prototype.checkDescription = function () {
  var isSilent = !this.descField.val();
  this.checkDescriptionValidity(isSilent);
};

/* Check to see that the URL input element is not empty,
   or if it's a non-webby scheme. */
BugForm.prototype.checkURLValidity = function (silent) {
  var func = this.determineValidityFunction(
    this.validation.isUrlValid,
    this.urlField,
    silent
  );
  this[func]("url");
};

/* Check to see that the description input element is not empty. */
BugForm.prototype.checkDescriptionValidity = function (silent) {
  var func = this.determineValidityFunction(
    this.validation.isDescriptionValid,
    this.descField,
    silent
  );
  this[func]("description");
};

/* Check if Browser and OS are empty or not, only
   so we can set them to valid (there is no invalid state)*/
BugForm.prototype.checkOptionalNonEmpty = function (field) {
  var func = this.determineValidityFunction(
    this.validation.isOptionalValid,
    field
  );
  var inputId = field.prop("id");
  this[func](inputId);
};

/* Check to see if the GitHub username has the right syntax.*/
BugForm.prototype.checkGitHubUsername = function (event, silent) {
  var func = this.determineValidityFunction(
    this.validation.isGithubUserNameValid,
    this.contactField,
    silent
  );
  this[func]("contact");
};

BugForm.prototype.onSubmitAttempt = function () {
  this.performChecks();
};

BugForm.prototype.performChecks = function (isSilent) {
  this.checkURLValidity(isSilent);
  this.checkDescriptionValidity(isSilent);
  this.checkProblemTypeValidity(isSilent);
  this.checkImageTypeValidity(null, isSilent);
  this.checkGitHubUsername(null, isSilent);
};

BugForm.prototype.checkForm = function () {
  // Run through and see if there's any user input in the
  // required inputs
  var inputs = [
    this.problemType.filter(":checked").length,
    this.urlField.val(),
    this.descField.val(),
    this.uploadField.val(),
  ];
  if (_.some(inputs, Boolean)) {
    // then, check validity
    this.performChecks(true);
  }
  // Make sure we only do this if the inputs exist on the page
  if (this.browserField.length) {
    this.checkOptionalNonEmpty(this.browserField);
  }
  if (this.osField.length) {
    this.checkOptionalNonEmpty(this.osField);
  }
};

BugForm.prototype.requiredField = function (id, inlineHelp) {
  inlineHelp.insertAfter("label[for=" + id + "]");
};

BugForm.prototype.imageField = function (id, inlineHelp) {
  $(".form-upload-error").remove();

  inlineHelp
    .removeClass("form-message-error")
    .addClass("form-upload-error")
    .appendTo(".js-error-upload");

  this.uploadLabel.addClass("is-hidden");
  this.removeBanner.addClass("is-hidden");
  $(".js-error-upload").removeClass("is-hidden");

  $(".form-message-error").hide();
  $(".form-input-validation .error").hide();
  this.removeUploadPreview();
};

BugForm.prototype.optionalField = function (id) {
  this.inputs[id].el
    .parents(".js-Form-group")
    .removeClass("is-error js-form-error");
};

/* shows an error based on the errFunction in the config above */
BugForm.prototype.showError = function (id) {
  if (!this.inputs[id].hasOwnProperty("errFunction")) return;

  var inlineHelp = $("<small></small>", {
    class: "label-icon-message form-message-error",
    text: this.inputs[id].helpText,
  });

  this.inputs[id].el
    .parents(".js-Form-group")
    .removeClass("is-validated js-no-error")
    .addClass("is-error js-form-error");

  var func = this.inputs[id].errFunction;
  this[func](id, inlineHelp);
};

BugForm.prototype.makeInvalid = function (id) {
  // Early return if inline help is already in place.
  if (this.inputs[id].valid === false) {
    return;
  }

  this.inputs[id].valid = false;
  this.showError(id);
  // someone might decide to just not select an image after seeing the error,
  // so buttons shouldn't be disabled
  if (id !== "image") {
    this.disableSubmits();
  }
};

BugForm.prototype.makeInvalidSilent = function (id) {
  this.removeSuccessStyle(this.inputs[id].el);
  this.disableSubmits();
};

BugForm.prototype.checkAllRequiredValid = function () {
  return (
    this.inputs["url"].valid &&
    this.inputs["problem_category"].valid &&
    this.inputs["image"].valid &&
    this.inputs["description"].valid &&
    this.inputs["contact"].valid
  );
};

BugForm.prototype.enableSubmitsIfFormValid = function () {
  if (this.checkAllRequiredValid()) {
    this.enableSubmits();
  }
};

BugForm.prototype.removeSuccessStyle = function (el) {
  el.parents(".js-Form-group").removeClass("is-validated js-no-error");
};

BugForm.prototype.showSuccess = function (el) {
  el.parents(".js-Form-group")
    .removeClass("is-error js-form-error")
    .addClass("is-validated js-no-error");

  el.parents(".js-Form-group").find(".form-message-error").remove();
};

BugForm.prototype.makeValid = function (id) {
  this.inputs[id].valid = true;
  this.showSuccess(this.inputs[id].el);
  this.enableSubmitsIfFormValid();
};

/*
  If the users browser understands the FileReader API, show a preview
  of the image they're about to load, then invoke the passed in callback
  with the result of reading the blobOrFile as a dataURI.
*/
BugForm.prototype.convertToDataURI = function (blobOrFile, callback) {
  if (!(window.FileReader && window.File)) {
    return;
  }

  // One last image type validation check.
  if (!blobOrFile.type.match("image.*")) {
    this.makeInvalid("image");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (event) {
    var dataURI = event.target.result;
    callback(dataURI);
  };
  reader.readAsDataURL(blobOrFile);
};

BugForm.prototype.addPreviewBackground = function (dataURI) {
  if (!_.startsWith(dataURI, "data:image/")) {
    return;
  }

  this.previewEl.css({
    background: "url(" + dataURI + ") no-repeat center / contain",
  });

  this.hasImage = true;
  this.showRemoveUpload();
};

/*
  Allow users to remove an image from the form upload.
*/
BugForm.prototype.showRemoveUpload = function () {
  // hide upload image errors (this will no-op if the user never saw one)
  $(".form-upload-error").remove();

  this.errorLabel.addClass("is-hidden");
  this.uploadLabel.removeClass("visually-hidden");

  this.removeBanner.removeClass("is-hidden");
  this.removeBanner.attr("tabIndex", "0");
  this.uploadLabel.addClass("visually-hidden");
  this.removeBanner.on("click", this.removeUploadPreview.bind(this));
};

/*
  Remove the upload image preview and hide the banner.
*/
BugForm.prototype.removeUploadPreview = function (event) {
  if (event && event.originalEvent instanceof Event) {
    // show the upload label when we're responding to a click event
    // (instead of being called from an error handler, which will
    // display its own error label)
    this.uploadLabel.removeClass("visually-hidden").removeClass("is-hidden");
  }
  this.previewEl.css("background", "none");
  this.removeBanner.addClass("is-hidden");
  this.removeBanner.attr("tabIndex", "-1");
  this.removeBanner.off("click");
  this.removeBanner.get(0).blur();

  this.hasImage = false;

  // clear out the input[type=file] as well
  this.uploadField.val(this.uploadField.get(0).defaultValue);
};

BugForm.prototype.showLoadingIndicator = function () {
  this.loadingIndicator.addClass("is-active");
};

BugForm.prototype.hideLoadingIndicator = function () {
  this.loadingIndicator.removeClass("is-active");
};

BugForm.prototype.onFormSubmit = function (event) {
  event.preventDefault();
  this.disableSubmits();
  this.showLoadingIndicator();
  this.uploadConsoleLogs().always(
    function () {
      this.uploadImage().then(this.submitForm.bind(this));
    }.bind(this)
  );
};

/*
   Upload console logs before form submission so we can
   put a link to it in the hidden field.
*/
BugForm.prototype.uploadConsoleLogs = function () {
  var details = JSON.parse(this.detailsInput.val());

  if (!details || !details.consoleLog) {
    var dfd = $.Deferred();
    return dfd.resolve();
  }

  var formdata = new FormData();
  formdata.append("console_logs", JSON.stringify(details.consoleLog));

  return $.ajax({
    contentType: false,
    processData: false,
    data: formdata,
    method: "POST",
    url: "/upload/",
    success: function (response) {
      var path = location.origin + "/console_logs/";
      this.consoleLogsInput.val(path + response.url);
    }.bind(this),
  });
};

/*
   Upload the image before form submission so we can
   put an image link in the bug description.
*/
BugForm.prototype.uploadImage = function () {
  if (!this.hasImage) {
    var dfd = $.Deferred();
    return dfd.resolve();
  }

  var dataURI = this.getDataURIFromPreviewEl();
  this.removeBanner.addClass("is-hidden");

  var formdata = new FormData();
  formdata.append("image", dataURI);

  return $.ajax({
    contentType: false,
    processData: false,
    data: formdata,
    method: "POST",
    url: "/upload/",
    success: this.addImageURL.bind(this),
    error: this.handleUploadError.bind(this),
  });
};

/*
   React to server-side errors related to images by showing a flash
   message to the user, and clearing out the bad image and preview.

   If we're here, the attempted form submission failed.
*/
BugForm.prototype.handleUploadError = function (response) {
  if (response && response.status === 415) {
    wcEvents.trigger("flash:error", {
      message: this.inputs.image.helpText,
      timeout: 5000,
    });
  }

  if (response && response.status === 413) {
    wcEvents.trigger("flash:error", {
      message:
        "The image is too big! Please choose something smaller than 4MB.",
      timeout: 5000,
    });
  }

  this.hideLoadingIndicator();
  this.removeUploadPreview();
};

BugForm.prototype.submitForm = function () {
  var dfd = $.Deferred();
  var formEl = this.form.get(0);
  // Calling submit() manually on the form won't contain details
  // about which <button> was clicked (since one wasn't clicked).
  // So we send that with the form data via a hidden input.
  this.submitTypeInput.val(this.clickedButton);
  formEl.submit();
  dfd.resolve();
  return dfd.promise();
};

/*
  Grab the data URI portion inside of a serialized data URI
  backgroundImage, i.e, for the following two possible strings,
  'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACAAAAAYACAIAAABt)'
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACAAAAAYACAIAAABt")'
  we expect "data:image/ping;base64,iVBORw0KGgoAAAANSUhEUgAACAAAAAYACAIAAABt"
  to be matched.

  Note: browsers are inconsistent in quoting CSSOM serialization
*/
BugForm.prototype.getDataURIFromPreviewEl = function () {
  var bgImage = this.previewEl.get(0).style.backgroundImage;
  var re = /url\(['"]{0,1}(data:image\/(?:jpeg*|jpg|png|gif|bmp);\s*base64,.+)['"]{0,1}\)/;
  var match = re.exec(bgImage);
  if (match === null) {
    // In theory it shouldn't be possible for there to not be a match at this
    // point, but handle it just in case.
    this.makeInvalid("image");
    return;
  }

  return match[1];
};

/*
  create the markdown with the URL of a newly uploaded image
  and its thumbnail URL assets to the bug description
*/
BugForm.prototype.addImageURL = function (response) {
  var img_url = response.url;
  var imageURL = [
    "<details><summary>View the screenshot</summary>",
    "<img alt='Screenshot' src='",
    img_url,
    "'></details>",
  ].join("");

  this.stepsToReproduceField.val(function (idx, value) {
    return value + "\n" + imageURL;
  });
};

new BugForm();
