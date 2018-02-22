/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function BugForm() {
  this.form = $("#js-ReportForm form");
  this.submitButtons = $("#js-ReportForm .js-Button");
  this.loadingIndicator = $(".js-Loader");
  this.reportButton = $("#js-ReportBug");
  this.uploadLoader = $(".js-Upload-Loader");
  this.previewEl = $(".js-image-upload");
  this.UPLOAD_LIMIT = 1024 * 1024 * 4;
  this.clickedButton = null;
  this.hasImage = null;

  this.inputs = {
    url: {
      el: $("#url"),
      valid: null,
      helpText: "A valid URL is required."
    },
    problem_type: {
      el: $("[name=problem_category]"),
      valid: null,
      helpText: "Problem type required."
    },
    description: {
      el: $("#description"),
      valid: null,
      helpText: "Description required."
    },
    steps_reproduce: {
      el: $("#steps_reproduce"),
      valid: true,
      helpText: null
    },
    image: {
      el: $("#image"),
      // image should be valid by default because it's optional
      valid: true,
      helpText: "Image must be one of the following: jpe, jpg, jpeg, png, gif, or bmp.",
      altHelpText: "Please choose a smaller image (< 4MB)"
    },
    browser: {
      el: $("#browser"),
      valid: true,
      helpText: null
    },
    os: {
      el: $("#os"),
      valid: true,
      helpText: null
    },
    browser_test_type: {
      el: $("[name=browser_test]"),
      valid: true,
      helpText: null
    }
  };

  this.browserField = this.inputs.browser.el;
  this.osField = this.inputs.os.el;
  this.problemType = this.inputs.problem_type.el;
  this.uploadField = this.inputs.image.el;
  this.urlField = this.inputs.url.el;
  this.descField = this.inputs.description.el;
  this.browserTestField = this.inputs.browser_test_type.el;
  this.stepsToReproduceField = this.inputs.steps_reproduce.el;

  this.init = function() {
    this.checkParams();
    this.disableSubmits();
    this.urlField.on("blur input", _.bind(this.checkURLValidity, this));
    this.descField.on(
      "blur input",
      _.bind(this.checkDescriptionValidity, this)
    );
    this.problemType.on("change", _.bind(this.checkProblemTypeValidity, this));
    this.uploadField.on("change", _.bind(this.checkImageTypeValidity, this));
    this.osField
      .add(this.browserField)
      .on("blur input", _.bind(this.checkOptionalNonEmpty, this));
    this.submitButtons.on("click", _.bind(this.storeClickedButton, this));
    this.submitButtons.on("click", _.bind(this.loadingIndicator.show, this));
    this.form.on("submit", _.bind(this.maybeUploadImage, this));

    // See if the user already has a valid form
    // (after a page refresh, back button, etc.)
    this.checkForm();

    // Set up listener for message events from screenshot-enabled add-ons
    window.addEventListener(
      "message",
      _.bind(function(event) {
        // Make sure the data is coming from ~*inside the house*~!
        // (i.e., our add-on or some other priviledged code sent it)
        if (location.origin === event.origin) {
          // See https://github.com/webcompat/webcompat.com/issues/1252 to track
          // the work of only accepting blobs, which should simplify things.
          if (event.data instanceof Blob) {
            // convertToDataURI sends the resulting string to the upload
            // callback.
            this.convertToDataURI(event.data, this.showUploadPreview);
          } else {
            // ...the data is already a data URI string
            this.showUploadPreview(event.data);
          }
        }
      }, this),
      false
    );
  };

  this.showUploadPreview = _.bind(function(dataURI) {
    // The final size of Base64-encoded binary data is ~equal to
    // 1.37 times the original data size + 814 bytes (for headers).
    // so, bytes = (encoded_string.length - 814) / 1.37)
    // see https://en.wikipedia.org/wiki/Base64#MIME
    if (String(dataURI).length - 814 / 1.37 > this.UPLOAD_LIMIT) {
      this.downsampleImage(
        dataURI,
        _.bind(function(downsampledData) {
          // Recurse until it's small enough for us to upload.
          this.showUploadPreview(downsampledData);
        }, this)
      );
    } else {
      this.addPreviewBackground(dataURI);
    }
  }, this);

  this.downsampleImage = function(dataURI, callback) {
    var img = document.createElement("img");
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    img.onload = _.bind(function() {
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
    }, this);

    img.src = dataURI;
  };

  // Do some extra work based on the GET params that come with the request
  this.checkParams = function() {
    // Don't bother doing any work for bare requests.
    if (!location.search) {
      return;
    }

    var urlParam = location.href.match(/url=([^&]*)/);
    if (urlParam !== null) {
      // weird Gecko bug. See https://bugzilla.mozilla.org/show_bug.cgi?id=1098037
      urlParam = this.trimWyciwyg(urlParam[1]);
      this.urlField.val(decodeURIComponent(urlParam));
      this.makeValid("url");
    }

    // If we have a problem_type param, and it matches the value, select it for
    // the user. see https://github.com/webcompat/webcompat.com/blob/master/webcompat/form.py#L31
    // for possible matching values
    var problemType = location.href.match(/problem_type=([^&]*)/);
    if (problemType !== null) {
      $("[value=" + problemType[1] + "]").click();
    }

    // If we have details, JSON decode it and add it to the end of STR textarea
    var details = location.href.match(/details=([^&]*)/);
    if (details) {
      this.stepsToReproduceField.val(
        _.bind(function(idx, value) {
          return value + "\n" + this.buildDetails(details[1]);
        }, this)
      );
    }
  };

  this.buildDetails = function(detailsParam) {
    // The content of the details param may be encoded via
    // application/x-www-form-urlencoded, so we need to change the
    // + (SPACE) to %20 before decoding
    var decoded = decodeURIComponent(detailsParam.replace(/\+/g, "%20"));
    var details = JSON.parse(decoded);
    var rv = "";
    Object.keys(details).forEach(function(prop) {
      rv += prop + ": " + details[prop] + "\n";
    });
    return rv;
  };

  this.storeClickedButton = function(event) {
    this.clickedButton = event.target.value;
  };

  this.trimWyciwyg = function(url) {
    //trim wyciwyg://N/ from URL.
    var wyciwygRe = /(wyciwyg:\/\/\d+\/)/i;
    if (url.search(wyciwygRe) !== 0) {
      return url;
    } else {
      return url.replace(wyciwygRe, "");
    }
  };

  this.disableSubmits = function() {
    this.submitButtons.prop("disabled", true);
    this.submitButtons.addClass("is-disabled");
  };

  this.enableSubmits = function() {
    this.submitButtons.prop("disabled", false);
    this.submitButtons.removeClass("is-disabled");
  };

  this.checkProblemTypeValidity = function() {
    if (!$("[name=problem_category]:checked").length) {
      this.makeInvalid("problem_type");
    } else {
      this.makeValid("problem_type");
    }
  };

  this.checkImageTypeValidity = function(event) {
    var splitImg = this.uploadField.val().split(".");
    var ext = splitImg[splitImg.length - 1].toLowerCase();
    var allowed = ["jpg", "jpeg", "jpe", "png", "gif", "bmp"];
    // Bail if there's no image.
    if (!this.uploadField.val()) {
      return;
    }

    if (!_.includes(allowed, ext)) {
      this.makeInvalid("image");
    } else {
      this.makeValid("image");
      if (event) {
        // We can just grab the 0th one, because we only allow uploading
        // a single image at a time (for now)
        this.convertToDataURI(event.target.files[0], this.showUploadPreview);
      }
    }

    // null out input.value so we get a consistent
    // change event across browsers
    event.target.value = null;
  };

  this.isReportableURL = function(url) {
    return (
      url &&
      !(_.startsWith(url, "about:") ||
        _.startsWith(url, "chrome:") ||
        _.startsWith(url, "file:") ||
        _.startsWith(url, "resource:") ||
        _.startsWith(url, "view-source:"))
    );
  };

  /* Check to see that the URL input element is not empty,
     or if it's a non-webby scheme. */
  this.checkURLValidity = function() {
    var val = this.urlField.val();
    if ($.trim(val) === "" || !this.isReportableURL(val)) {
      this.makeInvalid("url");
    } else {
      this.makeValid("url");
    }
  };

  /* Check to see that the description input element is not empty. */
  this.checkDescriptionValidity = function() {
    var val = this.descField.val();
    if ($.trim(val) === "") {
      this.makeInvalid("description");
    } else {
      this.makeValid("description");
    }
  };

  /* Check if Browser and OS are empty or not, only
     so we can set them to valid (there is no invalid state) */
  this.checkOptionalNonEmpty = function() {
    _.forEach(
      [this.browserField, this.osField],
      _.bind(function(input) {
        var inputId = input.prop("id");
        if (input.val()) {
          this.makeValid(inputId);
        } else {
          this.makeInvalid(inputId);
        }
      }, this)
    );
  };

  this.checkForm = function() {
    // Run through and see if there's any user input in the
    // required inputs
    var inputs = [
      this.problemType.filter(":checked").length,
      this.urlField.val(),
      this.descField.val(),
      this.uploadField.val()
    ];
    if (_.some(inputs, Boolean)) {
      // then, check validity
      this.checkURLValidity();
      this.checkDescriptionValidity();
      this.checkProblemTypeValidity();
      this.checkImageTypeValidity();
      // and open the form, if it's not already open
      if (!this.reportButton.hasClass("is-open")) {
        this.reportButton.click();
      }
    }
    // Make sure we only do this if the inputs exist on the page
    if (this.browserField.length || this.osField.length) {
      this.checkOptionalNonEmpty();
    }
  };

  /* makeInvalid can take an {altHelp: true} options argument to select
     alternate helpText to display */
  this.makeInvalid = function(id, opts) {
    // Early return if inline help is already in place.
    if (this.inputs[id].valid === false) {
      return;
    }

    var inlineHelp = $("<small></small>", {
      class: "label-icon-message form-message-error",
      text: opts && opts.altHelp
        ? this.inputs[id].altHelpText
        : this.inputs[id].helpText
    });

    this.inputs[id].valid = false;
    this.inputs[id].el
      .parents(".js-Form-group")
      .removeClass("is-validated js-no-error")
      .addClass("is-error js-form-error");

    switch (id) {
      case "os":
      case "browser":
        // remove error classes, because these inputs are optional
        this.inputs[id].el
          .parents(".js-Form-group")
          .removeClass("is-error js-form-error");
        break;
      case "url":
      case "description":
      case "problem_type":
        inlineHelp.insertAfter("label[for=" + id + "]");
        break;
      case "image":
        // hide the error in case we already saw one
        $(".form-upload-error").remove();

        inlineHelp
          .removeClass("form-message-error")
          .addClass("form-upload-error")
          .appendTo(".js-error-upload");

        $(".js-label-upload").removeClass("is-hidden").addClass("is-hidden");
        $(".js-remove-upload").removeClass("is-hidden").addClass("is-hidden");
        $(".js-error-upload").removeClass("is-hidden");

        $(".form-message-error").hide();
        $(".form-input-validation .error").hide();
        // "reset" the form field, because the file would get rejected
        // from the server anyways.
        this.uploadField.val(this.uploadField.get(0).defaultValue);
        // return early because we just cleared out the input.
        // someone might decide to just not select an image.
        return;
    }

    this.disableSubmits();
  };

  this.makeValid = function(id) {
    this.inputs[id].valid = true;
    this.inputs[id].el
      .parents(".js-Form-group")
      .removeClass("is-error js-form-error")
      .addClass("is-validated js-no-error");

    this.inputs[id].el
      .parents(".js-Form-group")
      .find(".form-message-error")
      .remove();

    if (
      this.inputs["url"].valid &&
      this.inputs["problem_type"].valid &&
      this.inputs["image"].valid &&
      this.inputs["description"].valid
    ) {
      this.enableSubmits();
    }
  };
  /*
    If the users browser understands the FileReader API, show a preview
    of the image they're about to load, then invoke the passed in callback
    with the result of reading the blobOrFile as a dataURI.
  */
  this.convertToDataURI = function(blobOrFile, callback) {
    if (!(window.FileReader && window.File)) {
      return;
    }

    // One last image type validation check.
    if (!blobOrFile.type.match("image.*")) {
      this.makeInvalid("image");
      return;
    }

    var reader = new FileReader();
    reader.onload = _.bind(function(event) {
      var dataURI = event.target.result;
      callback(dataURI);
    }, this);
    reader.readAsDataURL(blobOrFile);
  };

  this.addPreviewBackground = function(dataURI) {
    if (!_.startsWith(dataURI, "data:image/")) {
      return;
    }

    this.previewEl.css({
      background: "url(" + dataURI + ") no-repeat center / contain"
    });

    this.hasImage = true;
    this.showRemoveUpload(this.previewEl);
  };
  /*
    Allow users to remove an image from the form upload.
  */
  this.showRemoveUpload = function(preview) {
    var removeBanner = $(".js-remove-upload");
    var uploadLabel = $(".js-label-upload");
    var errorLabel = $(".js-error-upload");

    // hide upload image errors (this will no-op if the user never saw one)
    $(".form-upload-error").remove();

    errorLabel.addClass("is-hidden");
    uploadLabel.removeClass("visually-hidden");

    removeBanner.removeClass("is-hidden");
    removeBanner.attr("tabIndex", "0");
    uploadLabel.addClass("visually-hidden");
    removeBanner.on(
      "click",
      _.bind(function() {
        // remove the preview and hide the banner
        preview.css("background", "none");
        removeBanner.addClass("is-hidden");
        removeBanner.attr("tabIndex", "-1");
        uploadLabel.removeClass("visually-hidden").removeClass("is-hidden");
        removeBanner.off("click");
        removeBanner.get(0).blur();

        this.hasImage = false;
      }, this)
    );
  };

  this.maybeUploadImage = _.bind(function(event) {
    if (!this.hasImage) {
      // nothing to do if there's no image, so form submission
      // can happen regularly.
      return;
    }

    event.preventDefault();

    this.uploadImage(
      // grab the data URI from background-image property, since it's already
      // in the DOM: 'url("data:image/....")'
      this.previewEl.get(0).style.backgroundImage.slice(5, -2),
      _.bind(function(response) {
        this.addImageURL(
          response,
          _.bind(function() {
            var formEl = this.form.get(0);
            // Calling submit() manually on the form won't contain details
            // about which <button> was clicked (since one wasn't clicked).
            // So we create a hidden <input> to pass along in the form data.
            var hiddenEl = document.createElement("input");
            hiddenEl.type = "hidden";
            hiddenEl.name = "submit-type";
            hiddenEl.value = this.clickedButton;
            formEl.appendChild(hiddenEl);
            formEl.submit();
          }, this)
        );
      }, this)
    );
  }, this);

  /*
     Upload the image before form submission so we can
     put an image link in the bug description.
  */
  this.uploadImage = function(dataURI, callback) {
    this.disableSubmits();
    this.uploadLoader.addClass("is-active");
    var formdata = new FormData();
    formdata.append("image", dataURI);

    $.ajax({
      contentType: false,
      processData: false,
      data: formdata,
      method: "POST",
      url: "/upload/",
      success: callback,
      error: _.bind(function(response) {
        var msg;
        if (response && response.status === 415) {
          wcEvents.trigger("flash:error", {
            message: this.inputs.image.helpText,
            timeout: 5000
          });
        }

        if (response && response.status === 413) {
          msg =
            "The image is too big! Please choose something smaller than 4MB.";
          wcEvents.trigger("flash:error", { message: msg, timeout: 5000 });
        }
        this.loadingIndicator.hide();
      }, this)
    });

    // clear out the input[type=file], because we don't need it anymore.
    this.uploadField.val(this.uploadField.get(0).defaultValue);
  };
  /*
    create the markdown with the URL of a newly uploaded image
    and its thumbnail URL assets to the bug description
  */
  this.addImageURL = function(response, callback) {
    var img_url = response.url;
    var thumb_url = response.thumb_url;
    var imageURL = [
      "[![Screenshot Description](",
      thumb_url,
      ")](",
      img_url,
      ")"
    ].join("");
    this.stepsToReproduceField.val(function(idx, value) {
      return value + "\n" + imageURL;
    });

    callback();
  };

  return this.init();
}

$(function() {
  new BugForm();
});
