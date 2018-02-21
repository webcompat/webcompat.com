"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function(path, params) {
  var base = intern.config.siteRoot + path;
  return params ? base + params : base;
};

registerSuite("Issue-list", {
  tests: {
    "FilterView renders"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-SearchIssue-filter"
      )
        .findAllByCssSelector(".js-Tag")
        .then(function(elms) {
          assert.equal(elms.length, 6, "All filter buttons are displayed");
        })
        .end();
    },

    "IssueListView renders"() {
      return FunctionalHelpers.openPage(this, url("/issues"), ".js-IssueList")
        .findByCssSelector(".js-IssueList")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList container is visible.");
        })
        .sleep(1000)
        .end()
        .findByCssSelector(".js-list-issue .js-IssueList")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList item is visible.");
        })
        .end()
        .findByCssSelector(".js-IssueList .js-issue-title")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(
            isDisplayed,
            true,
            "IssueList item is has non-empty title."
          );
        })
        .end()
        .findByCssSelector(".js-issue-comments")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /comments:\s\d+$/i,
            "Issue should display number of comments"
          );
        })
        .end()
        .findByCssSelector(".js-issue-date")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /^Opened:\s\d{4}\-\d{2}\-\d{2}/,
            "Issue should display creation date"
          );
        })
        .end();
    },

    "PaginationControlsView tests"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-Pagination-controls"
      )
        .findByCssSelector(".js-Pagination-controls")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList container is visible.");
        })
        .end()
        .findByCssSelector(".js-Pagination-previous.is-disabled")
        .getAttribute("class")
        .then(function(className) {
          assert.include(
            className,
            "is-disabled",
            "First page load should have disabled prev button"
          );
        })
        .end()
        .findByCssSelector(".js-Pagination-next")
        .click()
        .end()
        .findByCssSelector(".js-Pagination-previous:not(.is-disabled)")
        .getAttribute("class")
        .then(function(className) {
          assert.notInclude(
            className,
            "is-disabled",
            "Clicking next enables prev button"
          );
        })
        .end()
        .findByCssSelector(".js-Pagination-previous")
        .click()
        .end()
        .findByCssSelector(".js-Pagination-previous.is-disabled")
        .getAttribute("class")
        .then(function(className) {
          assert.include(
            className,
            "is-disabled",
            "Going back from first next click should have disabled prev button"
          );
        })
        .end();
    },

    "Pagination dropdown tests"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-Pagination-controls"
      )
        .findByCssSelector(".js-Dropdown-pagination")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(
            isDisplayed,
            true,
            "pagination dropdown container is visible."
          );
        })
        .end()
        .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-toggle")
        .click()
        .end()
        .findByCssSelector(".js-Dropdown-pagination")
        .getAttribute("class")
        .then(function(className) {
          assert.include(
            className,
            "is-active",
            "clicking dropdown adds is-active class"
          );
        })
        .end()
        .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-options")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "dropdown options are visible.");
        })
        .end()
        .findByCssSelector(
          ".js-Dropdown-pagination .js-Dropdown-item:nth-child(3) > .js-Dropdown-link:nth-child(1)"
        )
        .click()
        .end()
        .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-label")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "Show 100",
            "Clicking first option updated dropdown label"
          );
        })
        .end()
        .findDisplayedByCssSelector(".js-IssueList:nth-child(51)")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "More than 50 issues were loaded.");
        })
        .end();
    },

    "Pressing g goes to github issues"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-Pagination-controls"
      )
        .findByCssSelector("body")
        .click()
        .type("g")
        .end()
        .sleep(500)
        .getCurrentUrl()
        .then(function(url) {
          assert.match(
            url,
            /[https://github.com/^*/^*/issues/]/,
            "We're at GitHub now."
          );
        })
        .end();
    },

    "Pressing g inside of search input *doesn't* go to github issues"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        "#js-SearchForm-input"
      )
        .findByCssSelector("#js-SearchForm-input")
        .click()
        .type("g")
        .end()
        .setFindTimeout(0)
        .findByCssSelector(".repo-container .issues-listing")
        .then(assert.fail, function(err) {
          assert.isTrue(/NoSuchElement/.test(String(err)));
        })
        .end();
    },

    "Loading issues page has default params in URL"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-IssueList:nth-of-type(1)"
      )
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(
            currUrl,
            "page=1&per_page=50&state=open",
            "Default model params are added to the URL"
          );
        });
    },

    "Loading partial params results in merge with defaults"() {
      var params = "?page=2";
      return FunctionalHelpers.openPage(
        this,
        url("/issues", params),
        ".js-IssueList:nth-of-type(1)"
      )
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(
            currUrl,
            "page=2&per_page=50&state=open",
            "Default model params are merged with partial URL params"
          );
        });
    },

    "Dropdowns reflect state from URL"() {
      var params = "?per_page=25&sort=updated&direction=desc&state=all";

      return FunctionalHelpers.openPage(
        this,
        url("/issues", params),
        ".js-IssueList:nth-of-type(1)"
      )
        .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-label")
        .getVisibleText()
        .then(function(text) {
          assert.equal(
            text,
            "Show 25",
            "Pagination dropdown label is updated from URL params"
          );
        })
        .end()
        .findAllByCssSelector(".js-Dropdown-sort .js-Dropdown-label")
        .getVisibleText()
        .then(function(text) {
          assert.equal(
            text,
            "Recently Updated",
            "Sort dropdown label is updated from URL params"
          );
        })
        .end();
    },

    "Going back in history updates issue list and URL state"() {
      var params = "?per_page=25";

      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues", params),
          ".js-IssueList:nth-of-type(1)"
        )
          .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-label")
          .getVisibleText()
          .then(function(text) {
            assert.equal(
              text,
              "Show 25",
              "Pagination dropdown label is updated from URL params"
            );
          })
          .end()
          // Select "Show 100" from pagination dropdown
          .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-toggle")
          .click()
          .end()
          .findByCssSelector(
            ".js-Dropdown-pagination li.js-Dropdown-item:nth-child(3) > a:nth-child(1)"
          )
          .click()
          .end()
          // find something so we know issues have been loaded
          .findByCssSelector(".js-IssueList:nth-of-type(1)")
          .execute(function() {
            history.back();
          })
          .getCurrentUrl()
          .then(function(currUrl) {
            assert.include(
              currUrl,
              "per_page=25",
              "URL param is back to where we started"
            );
          })
          .end()
          .findByCssSelector(".js-Dropdown-pagination .js-Dropdown-label")
          .getVisibleText()
          .then(function(text) {
            assert.equal(
              text,
              "Show 25",
              "Pagination dropdown label is back to where we started"
            );
          })
          .end()
      );
    },

    "Loading URL with stage param loads issues"() {
      var params =
        "?page=1&per_page=50&state=open&stage=needstriage&sort=created&direction=desc";

      return FunctionalHelpers.openPage(
        this,
        url("/issues", params),
        ".js-IssueList:nth-of-type(1)"
      )
        .findByCssSelector(".js-Tag.is-active")
        .getVisibleText()
        .then(function(text) {
          assert.equal(
            "Needs Triage",
            text,
            "Needs Triage filter is selected."
          );
        })
        .end();
    },

    "Clicking on a stage filter adds the correct param to the URL"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues"),
          ".js-IssueList:nth-of-type(1)"
        )
          .findByCssSelector('[data-filter="contactready"]')
          .click()
          .end()
          // find something so we know the page has loaded
          .findByCssSelector(".js-IssueList:nth-of-type(1)")
          .end()
          .getCurrentUrl()
          .then(function(currUrl) {
            assert.include(
              currUrl,
              "stage=contactready",
              "Stage filter added to URL correctly."
            );
          })
          .end()
      );
    },

    "Toggling a stage filter doesn't leave the param in the URL"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues"),
          ".js-IssueList:nth-of-type(1)"
        )
          .findByCssSelector('[data-filter="closed"]')
          .click()
          .end()
          // find something so we know the page has loaded
          .findByCssSelector(".js-IssueList:nth-of-type(1)")
          .end()
          .findByCssSelector('[data-filter="closed"]')
          .click()
          .end()
          .getCurrentUrl()
          .then(function(currUrl) {
            assert.notInclude(
              currUrl,
              "stage=closed",
              "Stage filter added then removed from URL."
            );
          })
          .end()
      );
    },

    "Toggling between stage filters results in last param in URL"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues"),
          ".js-IssueList:nth-of-type(1)"
        )
          .findByCssSelector('[data-filter="closed"]')
          .click()
          .end()
          // find something so we know the page has loaded
          .findByCssSelector(".js-IssueList:nth-of-type(1)")
          .end()
          .findByCssSelector('[data-filter="sitewait"]')
          .click()
          .end()
          .getCurrentUrl()
          .then(function(currUrl) {
            assert.include(
              currUrl,
              "stage=sitewait",
              "Stage filter added to URL correctly."
            );
            assert.notInclude(
              currUrl,
              "stage=closed",
              "Stage removed from URL correctly."
            );
          })
          .end()
      );
    }
  }
});
