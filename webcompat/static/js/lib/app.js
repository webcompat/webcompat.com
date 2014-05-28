/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

window.App = Ember.Application.create({
  rootElement: '#browse-issues',
  LOG_TRANSITIONS: true
});

App.Router.map(function() {});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    var ownerURI = 'https://api.github.com/repos/webcompat/web-bugs/issues?creator=' + window.__username;
    return Ember.RSVP.hash({
      myIssues: Ember.$.getJSON(ownerURI),
      //Only show 4 results for the non-mine issues
      needsDiagnosis: Ember.$.getJSON('https://api.github.com/repos/webcompat/web-bugs/issues').then(function(data) {
        return data.filter(function(issue){
          if (issue.labels.indexOf("contactready") === -1) {
            return true;
          }
        }).slice(0,4);
      }),
      contactReady: Ember.$.getJSON('https://api.github.com/repos/webcompat/web-bugs/issues?labels=contactready').then(function(data) {
         return data.slice(0,4);
      })
    });
  }
});