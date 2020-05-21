module.exports = {
  index: [
    "./js/lib/models/label-list.js",
    "./js/lib/models/issue.js",
    "./js/lib/untriaged.js",
  ],
  formv2: [
    "./js/lib/wizard/app.js",
    "./js/lib/issue-wizard-popup.js",
    "./js/lib/issue-wizard-slider.js",
    "./js/lib/autogrow-textfield.js"
  ],
  issuesList: [
    "./js/lib/models/label-list.js",
    "./js/lib/models/issue.js",
    "./js/lib/mixins/pagination.js",
    "./js/lib/issue-list.js"
  ],
  issuePage: [
    "./js/lib/models/label-list.js",
    "./js/lib/editor.js",
    "./js/lib/labels.js",
    "./js/lib/models/milestones.js",
    "./js/lib/milestones.js",
    "./js/lib/models/issue.js",
    "./js/lib/autogrow-textfield.js",
    "./js/lib/issues.js"
  ],
  contributors: [
    "./js/lib/contributors.js"
  ],
  userActivity: [
    "./js/lib/models/label-list.js",
    "./js/lib/models/issue.js",
    "./js/lib/mixins/pagination.js",
    "./js/lib/user-activity.js"
  ],
  navBar: [
    "./js/lib/navbar.js"
  ],
  flashedMessages: [
    "./js/lib/flashed-messages.js"
  ],
  vendors: [
    "jquery",
    "underscore",
    "Backbone",
    "Prism",
    "Mousetrap",
    "BackboneMousetrap"
  ]
};
