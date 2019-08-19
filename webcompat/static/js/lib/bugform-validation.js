/* exported Validation */
function Validation() {
  var GITHUB_REGEXP = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  var ALLOWED_IMG_FORMAT = ["jpg", "jpeg", "jpe", "png", "gif", "bmp"];

  var isReportableURL = function(url) {
    var ok = url && (_.startsWith(url, "http:") || _.startsWith(url, "https:"));
    ok &= !(_.startsWith(url, "http:// ") || _.startsWith(url, "https:// "));
    return ok;
  };

  /**
   Check a string is a valid GitHub username
   - maximum 39 chars
   - alphanumerical characters and hyphens
   - no two consecutive hyphens
   */
  var isValidGitHubUsername = function(contact) {
    return GITHUB_REGEXP.test(contact);
  };

  return {
    isDescriptionValid: function(descField) {
      var val = descField.val();
      return $.trim(val) !== "";
    },
    isUrlValid: function(urlField) {
      var val = urlField.val();
      return $.trim(val) !== "" && isReportableURL(val);
    },
    isGithubUserNameValid: function(contactField) {
      var contact = contactField.val();
      return isValidGitHubUsername(contact) || $.trim(contact) === "";
    },
    isProblemTypeValid: function(problemTypeField) {
      return problemTypeField.filter(":checked").length;
    },
    isProblemSubtypeValid: function(problem) {
      var val = problem.val();
      return $.trim(val) !== "";
    },
    isImageTypeValid: function(uploadField) {
      var splitImg = uploadField.val().split(".");
      var ext = splitImg[splitImg.length - 1].toLowerCase();

      return _.includes(ALLOWED_IMG_FORMAT, ext);
    },
    isOptionalValid: function(input) {
      return !!input.val();
    }
  };
}
