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
    function(event) {
      $(function() {
        me.onReceiveMessage(event);
      });
    },
    false
  );

  // the initialization of the rest of the form happens when the DOM is ready
  $(BugForm.prototype.onDOMReadyInit.bind(this));
}

BugForm.prototype.onDOMReadyInit = function() {
  this.clickedButton = null;
  this.detailsInput = $("#details:hidden");
  this.consoleLogsInput = $("#console_logs_url:hidden");
  this.errorLabel = $(".js-error-upload");
  this.form = $("#js-ReportForm form");
  this.hasImage = null;
  this.loadingIndicator = $(".js-loader");
  this.previewEl = $(".js-image-upload");
  this.removeScreenshotButton = $(".js-remove-upload");
  this.uploadOther = $(".screenshot-select-trigger");
  this.submitButtons = $("#js-ReportForm .js-Button");
  this.submitButtonWrappers = $("#js-ReportForm .js-Button-wrapper");
  this.submitTypeInput = $("#submit_type:hidden");
  this.uploadLabel = $(".js-label-upload");
  this.nextStepBtn = $(".next-step");
  this.sitePrettyUrl = $("#website-url");
  this.step1Trigger = $(".next-step.step-1");
  this.step2Trigger = $(".next-step.step-2");
  this.step3Trigger = $("#problem_category input");
  this.step3Btn = $(".next-step.step-3");
  this.step4Btn = $(".next-step.step-4");
  this.step4Trigger = $(".subproblem input[type='radio']");
  this.step5Btn = $(".next-step.issue-btn.step-5");
  this.step6Btn = $("button.next-step.step-6");
  this.step8Btn = $("button.next-step.step-8");
  this.step10Btn = $("button.next-step.step-10");
  this.step3Radio = $(".step-container.step3 input");
  this.step1Container = $(".step-container.step1");
  this.step2Container = $(".step-container.step2");
  this.step3Container = $(".step-container.step3");
  this.step4Container = $(".step-container.step4");
  this.step5Container = $(".step-container.step5");
  this.step6Container = $(".step-container.step6");
  this.step6Radio = $(".step-container.step6 .input-control input");
  this.step7Container = $(".step-container.step7");
  this.step8Container = $(".step-container.step8");
  this.step9Container = $(".step-container.step9");
  this.step10Container = $(".step-container.step10");
  this.step11Container = $(".step-container.step11");
  this.anonUsernameTrigger = $("#open-username");
  this.usernameContainer = $(".optional-username");
  this.noOtherBrowser = "no-other-browser";
  this.urlStep = 1;
  this.problemStep = 2;
  this.subproblemStep = 3;
  this.browserDetectionStep = 4;
  this.customBrowserStep = 5;
  this.browserSelectionStepNo = 7;
  this.descriptionStep = 8;
  this.stepNotDefined = -1;
  this.problemCategoryName = "problem_category";
  this.otherProblemId = "unknown_bug";
  this.browserSelectionName = "tested_browsers";
  this.otherBrowserId = "other";
  this.detectionBugId = "detection_bug";
  this.otherProblemElements = $(".other-problem");
  this.otherBrowserElements = $(".other-browser");
  this.testedOtherBrowsersId = "#browser_test-0";
  this.noOtherBrowserTestedId = "#browser_test-1";
  this.uploadTextElements = $(".up-message");
  this.isSubproblem = false;
  this.blockNext = false;
  this.skipOneStep = false;
  this.slideUpTimeout = 350;
  this.descriptionMinChars = 30;
  this.headerHeight = 130;
  this.progressBar = $(".problem-description .progress .bar");
  this.progressContainer = $(".problem-description .progress");

  this.urlParamRegExp = /url=([^&]+)/;
  this.cssAnimations = {
    slideup: "slideup",
    slidedown: "slidedown",
    slideupdown: "slideupdown",
    slidedownandheight: "slidedownandheight",
    slideupandheight: "slideupandheight",
    slidedownusername: "slidedownusername"
  };

  this.stepsArray = [
    this.step1Container,
    this.step2Container,
    this.step3Container,
    this.step4Container,
    this.step5Container,
    this.step6Container,
    this.step7Container,
    this.step8Container,
    this.step9Container,
    this.step10Container,
    this.step11Container
  ];

  this.uploadFileChoice = 1;

  this.validation = new Validation();

  this.UPLOAD_LIMIT = 1024 * 1024 * 4;

  this.inputs = {
    url: {
      el: $("#url"),
      valid: null,
      helpText: "A valid URL is required.",
      errFunction: "requiredField"
    },
    problem_category: {
      el: $("[name=problem_category]"),
      valid: null,
      helpText: "Problem type required.",
      errFunction: "requiredField"
    },

    site_bug_subcategory: {
      el: $("[name=site_bug_subcategory]"),
      valid: null,
      helpText: "Problem type required.",
      errFunction: "requiredField"
    },
    layout_bug_subcategory: {
      el: $("[name=layout_bug_subcategory]"),
      valid: null,
      helpText: "Problem type required.",
      errFunction: "requiredField"
    },
    video_bug_subcategory: {
      el: $("[name=video_bug_subcategory]"),
      valid: null,
      helpText: "Problem type required.",
      errFunction: "requiredField"
    },
    browsers_selection: {
      el: $("[name=tested_browsers]"),
      valid: null,
      helpText: "Browser selection required.",
      errFunction: "requiredField"
    },

    other_problem: {
      el: $("[name=other_problem]"),
      valid: null,
      helpText: "Problem type required.",
      errFunction: "optionalField"
    },
    description: {
      el: $("#description"),
      valid: null,
      helpText: "A problem summary is required.",
      errFunction: "requiredField"
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
      helpText:
        "Image must be one of the following: jpe, jpg, jpeg, png, gif, or bmp.",
      errFunction: "imageField"
    },
    browser: {
      el: $("#browser"),
      valid: true,
      helpText: null,
      errFunction: "requiredField"
    },
    os: {
      el: $("#os"),
      valid: true,
      helpText: null,
      errFunction: "requiredField"
    },
    browser_test_type: {
      el: $("[name=browser_test]"),
      valid: true,
      helpText: null
    },
    contact: {
      el: $("#contact"),
      valid: true,
      helpText:
        "GitHub nicknames are 39 characters max, alphanumeric and hyphens only.",
      errFunction: "requiredField"
    }
  };

  this.browserField = this.inputs.browser.el;
  this.browserVal = this.inputs.browser.el.val();
  this.osField = this.inputs.os.el;
  this.osVal = this.inputs.os.el.val();
  this.problemType = this.inputs.problem_category.el;
  this.otherProblem = this.inputs.other_problem.el;
  this.otherBrowser = this.inputs.browser_test_type.el;

  this.siteBugType = this.inputs.site_bug_subcategory.el;
  this.layoutBugType = this.inputs.layout_bug_subcategory.el;
  this.videoBugType = this.inputs.video_bug_subcategory.el;
  this.browserSelection = this.inputs.browsers_selection.el;

  this.uploadField = this.inputs.image.el;
  this.urlField = this.inputs.url.el;
  this.descField = this.inputs.description.el;
  this.browserTestField = this.inputs.browser_test_type.el;
  this.stepsToReproduceField = this.inputs.steps_reproduce.el;
  this.contactField = this.inputs.contact.el;

  return this.init();
};

BugForm.prototype.init = function() {
  // Make sure we're not getting a report
  // about our own site before checking params.
  if (!this.isSelfReport()) {
    this.checkParams();
  }

  this.disableSubmits();
  this.urlField.on("blur input", this.checkUrl.bind(this));
  this.stepsToReproduceField.on("blur input", this.checkDescription.bind(this));
  this.stepsToReproduceField.on(
    "blur input",
    this.textareaTrackProgress.bind(this)
  );
  this.problemType.on("change", this.checkProblemTypeValidity.bind(this));
  this.siteBugType.on("change", this.checkBugTypeValidity.bind(this));
  this.layoutBugType.on("change", this.checkBugTypeValidity.bind(this));
  this.videoBugType.on("change", this.checkBugTypeValidity.bind(this));
  this.browserSelection.on("change", this.checkBrowserValidity.bind(this));
  this.otherBrowser.on("blur input", this.checkBrowserInput.bind(this));
  this.otherProblem.on("blur input", this.checkOtherProblem.bind(this));
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

  // add event listeners for the elements that trigger next step
  this.nextStepBtn.on("click", this.nextStep.bind(this));
  this.step3Trigger.on("change", this.nextStep.bind(this));
  this.step3Radio.on("change", this.nextStep.bind(this));
  this.step4Btn.on("click", this.resetDefaultDevice.bind(this));
  this.step6Radio.on("change", this.nextStep.bind(this));
  this.anonUsernameTrigger.on("click", this.revealUsernameField.bind(this));

  window.addEventListener("pageshow", this.resetProblemType.bind(this));

  // Send GA event for all the `next` button clicks
  if ("ga" in window) {
    this.stepsArray.forEach(function(element) {
      $(element).on("click", function() {
        let ga_event = {
          eventAction: "click",
          eventCategory: "wizard next-step click",
          eventLabel: this.className
        };
        window.ga("send", "event", ga_event);
      });
      $(element).on("change", function() {
        let ga_event = {
          eventAction: "input",
          eventCategory: "wizard input",
          eventLabel: this.className
        };
        window.ga("send", "event", ga_event);
      });
    });
  }

  // See if the user already has a valid form
  // (after a page refresh, back button, etc.)
  this.checkForm();
};

BugForm.prototype.onReceiveMessage = function(event) {
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

BugForm.prototype.handleScreenshot = function(screenshot) {
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

BugForm.prototype.handleMessage = function(message) {
  if (!message) {
    return;
  }

  prefillForm(message);
  this.checkForm();
};

BugForm.prototype.preventSubmitByEnter = function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

BugForm.prototype.showUploadPreview = function(dataURI) {
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
    this.makeValid("image");
    this.addPreviewBackground(dataURI);
  }
};

BugForm.prototype.downsampleImage = function(dataURI, callback) {
  var img = document.createElement("img");
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  img.onload = function() {
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
BugForm.prototype.isSelfReport = function(href) {
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
BugForm.prototype.checkParams = function() {
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

BugForm.prototype.addDetails = function(detailsParam) {
  // The content of the details param may be encoded via
  // application/x-www-form-urlencoded, so we need to change the
  // + (SPACE) to %20 before decoding
  this.detailsInput.val(decodeURIComponent(detailsParam.replace(/\+/g, "%20")));
};

BugForm.prototype.storeClickedButton = function(event) {
  this.clickedButton = event.target.name;
};

BugForm.prototype.trimWyciwyg = function(url) {
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

BugForm.prototype.disableSubmits = function() {
  this.submitButtons.prop("disabled", true);
  this.submitButtons.addClass("is-disabled");
};

BugForm.prototype.enableSubmits = function() {
  this.submitButtons.prop("disabled", false);
  this.submitButtons.removeClass("is-disabled");
};

/* determines function based on whether validation returns true or false */
BugForm.prototype.determineValidityFunction = function(func, field, silent) {
  if (func(field)) {
    return "makeValid";
  }
  return silent ? "makeInvalidSilent" : "makeInvalid";
};

BugForm.prototype.checkProblemTypeValidity = function(silent) {
  this.resetProblemSubcategory(this.problemType.val() + "_subcategory");
  var func = this.determineValidityFunction(
    this.validation.isProblemTypeValid,
    this.problemType,
    silent
  );
  this[func]("problem_category");
};

BugForm.prototype.checkBrowserValidity = function(silent) {
  var func = this.determineValidityFunction(
    this.validation.isProblemTypeValid,
    this.browserSelection,
    silent
  );
  this[func]("browsers_selection");
};

BugForm.prototype.checkBugTypeValidity = function(e) {
  var subformName = typeof e === "object" ? e.target.attributes.name.value : "";
  var subformElement;
  if (subformName.length > 0) {
    switch (subformName) {
      case "site_bug_subcategory":
        subformElement = this.siteBugType;
        break;
      case "layout_bug_subcategory":
        subformElement = this.layoutBugType;
        break;
      case "video_bug_subcategory":
        subformElement = this.videoBugType;
        break;
    }

    var func = this.determineValidityFunction(
      this.validation.isProblemTypeValid,
      subformElement,
      e
    );
    this[func](subformName);
  } else {
    return false;
  }
};

BugForm.prototype.checkImageTypeValidity = function(event, silent) {
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

BugForm.prototype.checkUrl = function(event) {
  var isSilent = event.type === "input" || !this.urlField.val();
  this.checkURLValidity(isSilent);
  this.setNextBtnStatus(this.urlStep);
};

BugForm.prototype.checkDescription = function() {
  var isSilent = !this.descField.val();
  this.checkDescriptionValidity(isSilent);
};

BugForm.prototype.checkOtherProblem = function() {
  this.checkOtherProblemValidity();
  this.setNextBtnStatus(this.subproblemStep);
};

BugForm.prototype.checkBrowserInput = function() {
  var isSilent = !this.otherBrowser.val();
  this.checkBrowserInputValidity(isSilent);
  this.setNextBtnStatus(this.browserSelectionStepNo);
};

/* Check to see that the URL input element is not empty,
   or if it's a non-webby scheme. */
BugForm.prototype.checkURLValidity = function(silent) {
  var func = this.determineValidityFunction(
    this.validation.isUrlValid,
    this.urlField,
    silent
  );
  this[func]("url");
};

/* Check to see that the description input element is not empty. */
BugForm.prototype.checkDescriptionValidity = function(silent) {
  var func = this.determineValidityFunction(
    this.validation.isDescriptionValid,
    this.descField,
    silent
  );
  this[func]("description");
};

/* Check to see that the browser input element is not empty. */
BugForm.prototype.checkBrowserInputValidity = function(silent) {
  var func = this.determineValidityFunction(
    this.validation.isDescriptionValid,
    this.otherBrowser,
    silent
  );
  this[func]("browser_test_type");
};

/* Check to see that the other problem input is not empty. */
BugForm.prototype.checkOtherProblemValidity = function(silent) {
  var func = this.determineValidityFunction(
    this.validation.isIssueValid,
    this.otherProblem,
    silent
  );
  this[func]("other_problem");
};

/* Check if Browser and OS are empty or not, only
   so we can set them to valid (there is no invalid state)*/
BugForm.prototype.checkOptionalNonEmpty = function(field) {
  var func = this.determineValidityFunction(
    this.validation.isOptionalValid,
    field
  );
  var inputId = field.prop("id");
  this[func](inputId);
  this.setNextBtnStatus(this.customBrowserStep);
};

/* Check to see if the GitHub username has the right syntax.*/
BugForm.prototype.checkGitHubUsername = function(event, silent) {
  var func = this.determineValidityFunction(
    this.validation.isGithubUserNameValid,
    this.contactField,
    silent
  );
  this[func]("contact");
};

BugForm.prototype.onSubmitAttempt = function() {
  this.performChecks();
};

BugForm.prototype.performChecks = function(isSilent) {
  this.checkURLValidity(isSilent);
  this.checkDescriptionValidity(isSilent);
  this.checkProblemTypeValidity(isSilent);
  this.checkImageTypeValidity(null, isSilent);
  this.checkGitHubUsername(null, isSilent);
};

BugForm.prototype.checkForm = function() {
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
    this.performChecks(true);
  }
  // Make sure we only do this if the inputs exist on the page
  if (this.browserField.length) {
    this.checkOptionalNonEmpty(this.browserField);
  }
  if (this.osField.length) {
    this.checkOptionalNonEmpty(this.osField);
  }
  if (this.urlField && this.urlField.val() && this.urlField.val().length) {
    this.urlField.trigger("input");
  }
};

BugForm.prototype.requiredField = function(id, inlineHelp) {
  inlineHelp.insertAfter("label[for=" + id + "]");
};

BugForm.prototype.imageField = function(id, inlineHelp) {
  $(".form-upload-error").remove();

  inlineHelp
    .removeClass("form-message-error")
    .addClass("form-upload-error")
    .appendTo(".js-error-upload");

  this.uploadLabel.addClass("is-hidden");
  this.removeScreenshotButton.addClass("is-hidden");
  $(".js-error-upload").removeClass("is-hidden");

  $(".form-message-error").hide();
  $(".form-input-validation .error").hide();
  this.removeUploadPreview();
};

BugForm.prototype.optionalField = function(id) {
  this.inputs[id].el
    .parents(".js-Form-group")
    .removeClass("is-error js-form-error");
};

/* shows an error based on the errFunction in the config above */
BugForm.prototype.showError = function(id) {
  if (!this.inputs[id].hasOwnProperty("errFunction")) return;

  var inlineHelp = $("<small></small>", {
    class: "label-icon-message form-message-error",
    text: this.inputs[id].helpText
  });

  this.inputs[id].el
    .parents(".js-Form-group")
    .removeClass("is-validated js-no-error")
    .addClass("is-error js-form-error");

  var func = this.inputs[id].errFunction;
  this[func](id, inlineHelp);
};

BugForm.prototype.makeInvalid = function(id) {
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

BugForm.prototype.makeInvalidSilent = function(id) {
  this.removeSuccessStyle(this.inputs[id].el);
  this.disableSubmits();
};

BugForm.prototype.checkAllRequiredValid = function() {
  return (
    this.inputs["url"].valid &&
    this.inputs["problem_category"].valid &&
    this.inputs["image"].valid &&
    this.inputs["description"].valid &&
    this.inputs["contact"].valid
  );
};

BugForm.prototype.checkSpecificRequiredValid = function(fieldId) {
  return this.inputs[fieldId].valid;
};

BugForm.prototype.setNextBtnStatus = function(step) {
  switch (step) {
    case this.urlStep:
      var input = this.inputs["url"].el[0];
      var inputVal = $.trim(input.value);
      if (this.checkSpecificRequiredValid("url") && inputVal.length > 0) {
        this.step1Trigger.removeClass("disabled");
        this.sitePrettyUrl.text(this.extractPrettyUrl(inputVal));
      } else {
        this.step1Trigger.addClass("disabled");
      }
      break;
    case this.subproblemStep:
      var subproblemVal = $.trim(this.inputs["other_problem"].el[0].value);
      if (
        this.checkSpecificRequiredValid("other_problem") &&
        subproblemVal.length > 0
      ) {
        this.step3Btn.removeClass("disabled");
      } else {
        this.step3Btn.addClass("disabled");
      }
      break;
    case this.customBrowserStep:
      var customBrowserVal = $.trim(this.inputs["browser"].el[0].value);
      var osVal = $.trim(this.inputs["os"].el[0].value);
      if (customBrowserVal.length > 0 && osVal.length > 0) {
        this.step5Btn.removeClass("disabled");
      } else {
        this.step5Btn.addClass("disabled");
      }
      break;
    case this.browserSelectionStepNo:
      var otherBrowser = this.otherBrowserElements
        .find(this.testedOtherBrowsersId)
        .prop("checked");

      if (otherBrowser) {
        this.step6Btn.removeClass("disabled");
      } else {
        this.step6Btn.addClass("disabled");
      }
      break;
  }
};

BugForm.prototype.textareaTrackProgress = function(e) {
  var len = $.trim(e.target.value).length;
  var progress = (len * 100) / this.descriptionMinChars;
  this.progressBar.css("width", progress > 100 ? "100%" : progress + "%");
  if (progress >= 100) {
    this.progressContainer.addClass("complete");
    this.step8Btn.removeClass("disabled");
  } else {
    this.progressContainer.removeClass("complete");
    this.step8Btn.addClass("disabled");
  }
};

BugForm.prototype.extractPrettyUrl = function(url) {
  var pathArray = url.split("/");
  var host = pathArray[2];
  return host;
};

BugForm.prototype.nextStep = function(e) {
  e.preventDefault();
  var trigger = $(e.currentTarget);
  if (trigger.hasClass("disabled")) {
    return false;
  }
  var stepToHide = trigger.data("hidestep") || false;
  if (trigger.val() === this.otherProblemId) {
    stepToHide = 4;
  }

  var nextStepNumber =
    trigger.attr("type") === "radio"
      ? trigger.parents(".step-container").data("nextstep")
      : trigger.data("nextstep") || this.stepNotDefined;
  var stepperIndex =
    trigger.parents(".step-container").data("activate-stepper") || false;

  if (nextStepNumber !== this.stepNotDefined) {
    this.subproblemChecks(trigger);
    this.descriptionControl(trigger, nextStepNumber);
    if (
      trigger.attr("type") === "radio" &&
      trigger.attr("name") === this.browserSelectionName
    ) {
      this.otherBrowserElements
        .find(this.testedOtherBrowsersId)
        .prop("checked", true);
      this.setNextBtnStatus(this.browserSelectionStepNo);
      this.hideStep(this.browserSelectionStepNo);
      return;
    }
    // If the user didn't test on other browsers, reset the browser selection
    if (trigger.hasClass(this.noOtherBrowser)) {
      this.resetBrowserSelection();
    }
    this.setActiveStep(stepperIndex);
    this.stepRevealControl(nextStepNumber);
    this.scrollToElement(nextStepNumber);
  }

  if (stepToHide) {
    this.hideStep(stepToHide);
  }
  return false;
};

BugForm.prototype.subproblemChecks = function(trigger) {
  if (
    trigger.attr("type") === "radio" &&
    trigger.attr("name") === this.problemCategoryName
  ) {
    this.problemSubcategoryStep(trigger);
    this.isSubproblem = true;
  } else {
    this.isSubproblem = false;
    this.blockNext = false;
  }
};

BugForm.prototype.descriptionControl = function(trigger, nextStepNumber) {
  var isTriggerSubproblem = trigger.parents(".subproblem").length > 0;
  // If the next step is triggered by subproblem, fill the hidden description field with the according value
  if (isTriggerSubproblem) {
    // Fill the hidden description field with the selected problem subtype
    this.descField.val(
      trigger
        .next("label")
        .text()
        .trim()
    );
  }
  if (nextStepNumber === this.browserDetectionStep) {
    var selectedProblem = this.problemType.filter(":checked").val();
    // If the user selects "Something else" as the problem type, fills the description field with user provided problem
    if (selectedProblem === this.otherProblemId) {
      this.descField.val(this.otherProblem.val().trim());
    }
  }
};

BugForm.prototype.hideStep = function(stepToHide) {
  this.stepsArray[
    stepToHide - 1
  ][0].style.animationName = this.cssAnimations.slideupandheight;
};

BugForm.prototype.stepRevealControl = function(nextStepNumber) {
  if (
    (!this.blockNext && !this.isSubproblem) ||
    (this.isSubproblem && this.skipOneStep)
  ) {
    var nextStep = this.skipOneStep ? nextStepNumber : nextStepNumber - 1;
    this.skipOneStep = false;
    var animation =
      this.stepsArray[nextStep][0].style.animationName !==
      this.cssAnimations.slidedownandheight
        ? this.cssAnimations.slidedown
        : this.cssAnimations.slideupandheight;
    this.stepsArray[nextStep][0].style.animationName = animation;
    this.stepsArray[nextStep][0].classList.add("open");
  }
};

BugForm.prototype.scrollToElement = function(nextStep) {
  var scrollToEl = this.stepsArray[nextStep - 1][0];
  // Delay "scroll to element" effect in order to let the animation finish, otherwise the scroll point isn't correct
  setTimeout(
    function() {
      var topOfElement =
        window.pageYOffset +
        scrollToEl.getBoundingClientRect().top -
        this.headerHeight;
      window.scroll({ top: topOfElement, behavior: "smooth" });
    }.bind(this),
    this.isSubproblem ? 450 : 250
  );
};

BugForm.prototype.setActiveStep = function(nextStep) {
  for (var index = 1; index <= nextStep; index++) {
    $("#step-" + index)
      .addClass("complete")
      .removeClass("active");
  }
  $("#step-" + nextStep)
    .addClass("active")
    .removeClass("complete");
};

BugForm.prototype.problemSubcategoryStep = function(trigger) {
  var subcategoryId = trigger.val() + "_subcategory";
  var isOther = trigger.val() === this.otherProblemId;
  var isDetectionBug = trigger.val() === this.detectionBugId;
  this.skipOneStep = isDetectionBug; // Detection bug doesn't have subcategories, therefore skips one step
  var animatedElement = $(".step" + this.subproblemStep)[0];
  var timeout =
    animatedElement.style.animationName === this.cssAnimations.slideupdown
      ? this.slideUpTimeout
      : 0;

  if (!isOther) {
    this.inputs["other_problem"].el[0].value = "";
    this.makeInvalidSilent("other_problem");
  }

  $(".step" + this.subproblemStep)
    .find("ul")
    .each(function() {
      setTimeout(
        function() {
          this.parentNode.style.display = "none";
        }.bind(this),
        timeout
      ); // First time animation should be without options switch off
    });

  if (animatedElement.style.animationName) {
    animatedElement.classList.add("slower-animation");
    // Empty the animationName to trigger animation change, otherwise the animation does not repeat
    var isSlideUp =
      animatedElement.style.animationName === this.cssAnimations.slideup; // If the step was previously closed, avoid doing the up and down animation
    animatedElement.style.animationName = "";
    setTimeout(
      function() {
        var animation =
          !isOther && !isDetectionBug
            ? this.cssAnimations.slideupdown
            : this.cssAnimations.slideup;
        animation =
          isSlideUp && !isOther && !isDetectionBug
            ? this.cssAnimations.slidedown
            : animation;
        animatedElement.style.animationName = animation;
      }.bind(this),
      10
    );
  } else {
    animatedElement.style.animationName =
      !isOther && !isDetectionBug ? this.cssAnimations.slidedown : "";
  }

  // Skip non relevant problem subcategory step for the issues that don't have one
  this.skipOneStep = isOther || isDetectionBug ? true : false;

  this.blockNext = false;
  // Check if user selected "Something else" or "Detection bug"
  if (!isOther && !isDetectionBug) {
    setTimeout(
      function() {
        document.getElementById(subcategoryId).parentNode.style.display =
          "block";
      }.bind(this),
      timeout
    );
    this.toggleOtherProblem("hide");
  } else {
    $(
      ".step" + this.subproblemStep
    )[0].style.animationName = this.cssAnimations.slideup;
    if (isDetectionBug) {
      this.toggleOtherProblem("hide");
      // Detection bug desn't have subcategories, filling the description with the category instead
      this.descField.val(
        trigger
          .next("label")
          .text()
          .trim()
      );
      return;
    }

    // Skip next step and show input with button in the same container
    this.toggleOtherProblem("show");
    this.blockNext = true;
  }
};

BugForm.prototype.toggleOtherProblem = function(action) {
  var obj = this;
  if (action === "hide") {
    this.otherProblemElements.each(function() {
      $(this)[0].style.animationName = obj.cssAnimations.slideupandheight;
    });
  } else {
    this.otherProblemElements.each(function() {
      $(this)[0].style.animationName = obj.cssAnimations.slidedownandheight;
    });
  }
};

BugForm.prototype.toggleOtherBrowser = function(action) {
  var obj = this;
  if (action === "hide") {
    this.otherBrowserElements.each(function() {
      $(this)[0].style.animationName = obj.cssAnimations.slideupandheight;
    });
  } else {
    this.otherBrowserElements.each(function() {
      $(this)[0].style.animationName = obj.cssAnimations.slidedownandheight;
    });
  }
};

BugForm.prototype.enableSubmitsIfFormValid = function() {
  if (this.checkAllRequiredValid()) {
    this.enableSubmits();
  }
};

BugForm.prototype.removeSuccessStyle = function(el) {
  el.parents(".js-Form-group").removeClass("is-validated js-no-error");
};

BugForm.prototype.showSuccess = function(el) {
  el.parents(".js-Form-group")
    .removeClass("is-error js-form-error")
    .addClass("is-validated js-no-error");

  el.parents(".js-Form-group")
    .find(".form-message-error")
    .remove();
};

BugForm.prototype.makeValid = function(id) {
  this.inputs[id].valid = true;
  this.showSuccess(this.inputs[id].el);
  this.enableSubmitsIfFormValid();
};

/*
  If the users browser understands the FileReader API, show a preview
  of the image they're about to load, then invoke the passed in callback
  with the result of reading the blobOrFile as a dataURI.
*/
BugForm.prototype.convertToDataURI = function(blobOrFile, callback) {
  if (!(window.FileReader && window.File)) {
    return;
  }

  // One last image type validation check.
  if (!blobOrFile.type.match("image.*")) {
    this.makeInvalid("image");
    return;
  }

  var reader = new FileReader();
  reader.onload = function(event) {
    var dataURI = event.target.result;
    callback(dataURI);
  };
  reader.readAsDataURL(blobOrFile);
};

BugForm.prototype.addPreviewBackground = function(dataURI) {
  if (!_.startsWith(dataURI, "data:image/")) {
    return;
  }

  this.previewEl.css({
    background: "url(" + dataURI + ") no-repeat center / cover"
  });

  this.hasImage = true;
  this.showRemoveUpload();
};

/*
  Allow users to remove an image from the form upload.
*/
BugForm.prototype.showRemoveUpload = function() {
  // hide upload image errors (this will no-op if the user never saw one)
  $(".form-upload-error").remove();

  this.errorLabel.addClass("is-hidden");
  this.uploadLabel.removeClass("visually-hidden");

  this.removeScreenshotButton.removeClass("is-hidden");
  this.uploadOther.removeClass("is-hidden");
  this.removeScreenshotButton.attr("tabIndex", "0");
  this.uploadLabel.addClass("visually-hidden");
  this.removeScreenshotButton.on("click", this.removeUploadPreview.bind(this));

  this.changeUploadText("uploaded-screenshot");
  this.step10Btn.text("Continue");
  this.step10Btn.removeClass("disabled");
};

BugForm.prototype.changeUploadText = function(textId) {
  this.uploadTextElements.each(function() {
    $(this).hide();
  });
  $("." + textId).show();
};

/*
  Remove the upload image preview and hide the remove screenshot button.
*/
BugForm.prototype.removeUploadPreview = function(event) {
  if (event && event.originalEvent instanceof Event) {
    // show the upload label when we're responding to a click event
    // (instead of being called from an error handler, which will
    // display its own error label)
    event.preventDefault();
    this.uploadLabel.removeClass("visually-hidden").removeClass("is-hidden");
  }
  this.previewEl.css("background", "none");
  this.removeScreenshotButton.addClass("is-hidden");
  this.uploadOther.addClass("is-hidden");
  this.removeScreenshotButton.attr("tabIndex", "-1");
  this.removeScreenshotButton.off("click");
  this.removeScreenshotButton.get(0).blur();

  this.hasImage = false;

  // clear out the input[type=file] as well
  this.uploadField.val(this.uploadField.get(0).defaultValue);

  this.step10Btn.text("Continue without");
  this.changeUploadText("deleted-screenshot");
};

BugForm.prototype.showLoadingIndicator = function() {
  this.loadingIndicator.addClass("is-active");
};

BugForm.prototype.hideLoadingIndicator = function() {
  this.loadingIndicator.removeClass("is-active");
};

BugForm.prototype.onFormSubmit = function(event) {
  event.preventDefault();
  this.disableSubmits();
  this.showLoadingIndicator();
  this.uploadConsoleLogs().always(
    function() {
      this.uploadImage().then(this.submitForm.bind(this));
    }.bind(this)
  );
};

/*
   Upload console logs before form submission so we can
   put a link to it in the hidden field.
*/
BugForm.prototype.uploadConsoleLogs = function() {
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
    success: function(response) {
      var path = location.origin + "/console_logs/";
      this.consoleLogsInput.val(path + response.url);
    }.bind(this)
  });
};

/*
   Upload the image before form submission so we can
   put an image link in the bug description.
*/
BugForm.prototype.uploadImage = function() {
  if (!this.hasImage) {
    var dfd = $.Deferred();
    return dfd.resolve();
  }

  var dataURI = this.getDataURIFromPreviewEl();
  this.removeScreenshotButton.addClass("is-hidden");

  var formdata = new FormData();
  formdata.append("image", dataURI);

  return $.ajax({
    contentType: false,
    processData: false,
    data: formdata,
    method: "POST",
    url: "/upload/",
    success: this.addImageURL.bind(this),
    error: this.handleUploadError.bind(this)
  });
};

/*
   React to server-side errors related to images by showing a flash
   message to the user, and clearing out the bad image and preview.

   If we're here, the attempted form submission failed.
*/
BugForm.prototype.handleUploadError = function(response) {
  if (response && response.status === 415) {
    wcEvents.trigger("flash:error", {
      message: this.inputs.image.helpText,
      timeout: 5000
    });
  }

  if (response && response.status === 413) {
    wcEvents.trigger("flash:error", {
      message:
        "The image is too big! Please choose something smaller than 4MB.",
      timeout: 5000
    });
  }

  this.hideLoadingIndicator();
  this.removeUploadPreview();
};

BugForm.prototype.revealUsernameField = function(e) {
  e.preventDefault();
  e.target.classList.add("disabled");
  this.contactField.focus();
  this.usernameContainer[0].style.animationName = this.cssAnimations.slidedownusername;
};

BugForm.prototype.resetProblemType = function() {
  this.resetRadio(this.step3Trigger);
};

BugForm.prototype.resetDefaultDevice = function() {
  this.browserField.val(this.browserVal);
  this.browserField.trigger("blur");
  this.osField.val(this.osVal);
  this.osField.trigger("blur");
};

BugForm.prototype.resetBrowserSelection = function() {
  this.otherBrowserElements
    .find(this.noOtherBrowserTestedId)
    .prop("checked", true);
  this.resetRadio(this.step6Radio);
};

BugForm.prototype.resetProblemSubcategory = function(subformName) {
  var resetElements =
    subformName && subformName.length > 0
      ? this.step4Trigger.not("input[name='" + subformName + "']")
      : this.step4Trigger;
  this.resetRadio(resetElements);
};

BugForm.prototype.resetRadio = function(element) {
  element.each(function() {
    $(this).prop("checked", false);
  });
};

BugForm.prototype.submitForm = function() {
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
BugForm.prototype.getDataURIFromPreviewEl = function() {
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
BugForm.prototype.addImageURL = function(response) {
  var img_url = response.url;
  var imageURL = [
    "<details><summary>View the screenshot</summary>",
    "<img alt='Screenshot' src='",
    img_url,
    "'></details>"
  ].join("");

  this.stepsToReproduceField.val(function(idx, value) {
    return value + "\n" + imageURL;
  });
};

new BugForm();
