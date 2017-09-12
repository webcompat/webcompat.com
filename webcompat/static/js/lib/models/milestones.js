/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

issues.MilestonesModel = Backbone.Model.extend({
  initialize: function(options) {
    // transform the format from the server into something that our templates
    // are expecting.
    var milestones = [];
    _.forOwn(options.statuses, function(value, key) {
      var milestone = {};
      milestone["name"] = key;
      milestones.push(_.merge(milestone, value));
    });

    var orderedMilestones = _.sortByOrder(
      milestones,
      // sort first by state, in desc order (because open comes after closed, alphabetically)
      // then sort by order, in ascending order to get 1, 2, 3... etc.
      ["state", "order"],
      ["desc", "asc"]
    );
    this.set("milestones", orderedMilestones);
  },
  updateMilestones: function(data) {
    // prevent talking to server in case we somehow got bogus data
    if (!_.isObject(data)) {
      return;
    }

    $.ajax({
      contentType: "application/json",
      data: JSON.stringify(data),
      type: "PATCH",
      url: "/api/issues/" + $("main").data("issueNumber") + "/edit",
      success: _.bind(function() {
        var currentMilestone = _.find(this.get("milestones"), function(status) {
          return status.id === data.id;
        });

        this.set("milestone", currentMilestone);
      }, this),
      error: function() {
        var msg = "There was an error editing this issues's status.";
        wcEvents.trigger("flash:error", { message: msg, timeout: 4000 });
      }
    });
  },
  toArray: function() {
    return _.pluck(this.get("milestones"), "name");
  }
});
