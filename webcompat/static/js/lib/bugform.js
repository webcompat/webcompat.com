/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function BugForm() {
  this.form = $("#js-ReportForm form");
  this.submitButtons = $("#js-ReportForm .js-Button");
  this.loadingIndicator = $(".js-Loader");
  this.reportButton = $("#js-ReportBug");
  this.uploadLoader = $(".js-Upload-Loader");
  // by default, submission type is anonymous
  this.UPLOAD_LIMIT = 1024 * 1024 * 4;

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
    this.descField.on("focus", _.bind(this.checkProblemTypeValidity, this));
    this.descField.on(
      "blur input",
      _.bind(this.checkDescriptionValidity, this)
    );
    this.problemType.on("change", _.bind(this.checkProblemTypeValidity, this));
    this.uploadField.on("change", _.bind(this.checkImageTypeValidity, this));
    this.osField
      .add(this.browserField)
      .on("blur input", _.bind(this.checkOptionalNonEmpty, this));
    this.submitButtons.on("click", _.bind(this.loadingIndicator.show, this));

    // See if the user already has a valid form
    // (after a page refresh, back button, etc.)
    this.checkForm();

    // Auto Expanding feature for form
    this.autoExpand();

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
            // showUploadPreview will take care of converting from blob to
            // dataURI, and will send the result to resampleIfNecessaryAndUpload.
            this.showUploadPreview(event.data);
          } else {
            // ...the data is already a data URI string
            this.resampleIfNecessaryAndUpload(event.data);
          }
        }
      }, this),
      false
    );
  };

  this.resampleIfNecessaryAndUpload = function(screenshotData) {
    // The final size of Base64-encoded binary data is ~equal to
    // 1.37 times the original data size + 814 bytes (for headers).
    // so, bytes = (encoded_string.length - 814) / 1.37)
    // see https://en.wikipedia.org/wiki/Base64#MIME
    if (String(screenshotData).length - 814 / 1.37 > this.UPLOAD_LIMIT) {
      this.downsampleImageAndUpload(screenshotData);
    } else {
      this.addPreviewBackgroundAndUpload(screenshotData);
    }
  };

  this.downsampleImageAndUpload = function(dataURI) {
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

      // The limit is 4MB (which is crazy big!), so let the user know if their
      // file is unreasonably large at this point (after 1 round of downsampling)
      if (screenshotData > this.UPLOAD_LIMIT) {
        this.makeInvalid("image", { altHelp: true });
        return;
      }

      this.addPreviewBackgroundAndUpload(screenshotData);
      (img = null), (canvas = null);
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

    // If we got a details param, add that to the end of the steps to reproduce field
    var details = location.href.match(/details=([^&]*)/);
    if (details !== null) {
      this.stepsToReproduceField.val(function(idx, value) {
        return (
          value +
          "\n" +
          // The content of the details param may be encoded via
          // application/x-www-form-urlencoded, so we need to change the
          // + (SPACE) to %20 before decoding
          decodeURIComponent(details[1].replace(/\+/g, "%20"))
        );
      });
    }
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
        this.showUploadPreview(event.target.files[0]);
      }
    }
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

    var inlineHelp = $("<span></span>", {
      class: "wc-Form-helpMessage",
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
        $(".wc-Form-helpMessage--imageUpload").remove();

        inlineHelp
          .removeClass("wc-Form-helpMessage")
          .addClass("wc-Form-helpMessage--imageUpload")
          .insertAfter(".js-image-upload-label");

        $(".wc-UploadForm-label").hide();
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
      .find(".wc-Form-helpMessage")
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
    of the image they're about to load.
  */
  this.showUploadPreview = function(blobOrFile) {
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
      this.resampleIfNecessaryAndUpload(dataURI);
    }, this);
    reader.readAsDataURL(blobOrFile);
  };

  this.addPreviewBackgroundAndUpload = function(dataURI) {
    if (!_.startsWith(dataURI, "data:image/")) {
      return;
    }

    var label = $(".js-image-upload").find("label").eq(0);
    label.css({
      background: "url(" + dataURI + ") no-repeat center / contain",
      "background-color": "#eee"
    });

    this.showRemoveUpload(label);
    this.getUploadURL(dataURI);
  };
  /*
    Allow users to remove an image from the form upload.
  */
  this.showRemoveUpload = function(label) {
    var removeBanner = $(".wc-UploadForm-button");
    var uploadWrapper = $(".wc-UploadForm-wrapper");

    // hide upload image errors (this will no-op if the user never saw one)
    $(".wc-Form-helpMessage--imageUpload").remove();
    $(".wc-UploadForm-label").show();

    removeBanner.removeClass("is-hidden");
    removeBanner.attr("tabIndex", "0");
    uploadWrapper.addClass("is-hidden");
    removeBanner.on(
      "click",
      _.bind(function() {
        // remove the preview and hide the banner
        label.css("background", "none");
        removeBanner.addClass("is-hidden");
        removeBanner.attr("tabIndex", "-1");
        uploadWrapper.removeClass("is-hidden");
        removeBanner.off("click");

        // remove the last embedded image URL
        // Note: this could fail in weird ways depending on how
        // the user has edited the descField.
        this.descField.val(function(idx, value) {
          return value.replace(
            /\[!\[[^\]]+\]\([^\)]+\)\]\([^\.]+.(?:bmp|gif|jpe*g*)\)$/,
            ""
          );
        });
      }, this)
    );
  };
  /*
     Upload the image before form submission so we can
     put an image link in the bug description.
  */
  this.getUploadURL = function(dataURI) {
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
      success: _.bind(function(response) {
        this.addImageURL(response);
        this.uploadLoader.removeClass("is-active");
        this.checkForm();
      }, this),
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
  this.addImageURL = function(response) {
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
  };

  // See function autoExpand in issues.js
  this.autoExpand = function() {
    var initialHeight = $("textarea.js-autoExpand").height();
    $("textarea.js-autoExpand").on("input", function() {
      $(this).css("height", initialHeight);
      $(this).css({ overflow: "hidden", height: this.scrollHeight + "px" });
    });
  };

  return this.init();
}

$(function() {
  new BugForm();
});
