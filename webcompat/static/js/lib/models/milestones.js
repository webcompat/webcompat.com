/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

issues.MilestonesModel = Backbone.Model.extend({
  initialize: function(options) {
    this.issueModel = options.issueModel;
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

  updateMilestone: function(newMilestone) {
    // prevent talking to server in case we somehow got useless data
    if (
      !_.isString(newMilestone) ||
      newMilestone === this.issueModel.get("milestone")
    ) {
      return;
    }

    var statusObject = _.find(this.get("milestones"), function(status) {
      return status.name === newMilestone;
    });

    $.ajax({
      contentType: "application/json",
      data: JSON.stringify({
        milestone: statusObject.id,
        state: statusObject.state
      }),
      type: "PATCH",
      url: "/api/issues/" + $("main").data("issueNumber") + "/edit",
      success: _.bind(function() {
        var currentMilestone = _.find(this.get("milestones"), function(status) {
          return status.id === statusObject.id;
        });

        this.set("milestone", currentMilestone);
        this.issueModel.set("milestone", currentMilestone.name);
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
