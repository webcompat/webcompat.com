/* exported prefillForm */
function prefillForm(message) {
  if (!message) return;

  var config = {
    url: {
      element: $("#url")
    },
    details: {
      element: $("#details"),
      stringify: true
    },
    src: {
      element: $("#reported_with")
    },
    extra_labels: {
      element: $("#extra_labels"),
      stringify: true
    }
  };

  var prepareValue = function(field, value) {
    if (field.stringify) {
      return JSON.stringify(value);
    }

    return value;
  };

  var setValues = function(data) {
    Object.keys(config).forEach(function(key) {
      if (data.hasOwnProperty(key)) {
        var field = config[key];
        field.element.val(prepareValue(field, data[key]));
      }
    });
  };

  var setAnalytics = function(campaign, source) {
    if (!window.setAnalyticsData) return;

    if (campaign && source) {
      window.setAnalyticsData({
        campaignName: campaign,
        campaignSource: source
      });
    }
  };

  setValues(message);
  setAnalytics(message["utm_campaign"], message["utm_source"]);
}
