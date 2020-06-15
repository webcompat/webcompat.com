/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";

function Autogrow() {
  this.autogrowField = $(".js-autogrow-field");

  this.init = function () {
    this.handleAutogrowField = this.handleAutogrowField.bind(this);

    this.autogrowField.each(function (index, el) {
      var minRows = parseInt(el.getAttribute("rows"), 10);
      el.dataset.minRows = minRows;
    });
    this.autogrowField.on("focus keyup input", this.handleAutogrowField);
  };

  this.handleAutogrowField = function (event) {
    var target = event.target;
    var $target = $(target);
    var MIN_ROWS = target.dataset.minRows;
    var contentHeight =
      target.scrollHeight -
      parseInt($target.css("padding-top"), 10) -
      parseInt($target.css("padding-bottom"), 10);

    // store initially calculated row height if not already present
    if (event.type === "focus" && !target.dataset.rowHeight) {
      target.dataset.rowHeight = contentHeight / MIN_ROWS;
    }

    var rowHeight = target.dataset.rowHeight;
    // don't let textarea grow more than half the screen size
    var MAX_HEIGHT = window.innerHeight / 2;
    var MAX_ROWS = Math.floor(MAX_HEIGHT / rowHeight);
    // determine amount of used rows to shrink back if necessary
    var usedRows = target.value.split("\n").length;
    var rows = Math.max(Math.ceil(contentHeight / rowHeight), usedRows);
    var newRowsValue =
      rows < MIN_ROWS ? MIN_ROWS : rows > MAX_ROWS ? MAX_ROWS : rows;

    // update rows attribute and respect minimum and maximum values
    target.setAttribute("rows", newRowsValue);
    if (newRowsValue * rowHeight > parseInt(target.style.height, 10)) {
      // reset element style height
      target.style.height = "";
    }
  };

  return this.init();
}

$(function () {
  new Autogrow();
});
