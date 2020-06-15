/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "../notify.js";
import { isSelfReport } from "../utils.js";

const updateStep = (id, data) => notify.publish("updateStep", { id, data });
const TYPE_REGEX = /problem_type=([^&]*)/;
const DETAILS_REGEX = /details=([^&]*)/;

const addDetails = function (detailsParam) {
  // The content of the details param may be encoded via
  // application/x-www-form-urlencoded, so we need to change the
  // + (SPACE) to %20 before decoding

  const value = decodeURIComponent(detailsParam.replace(/\+/g, "%20"));
  const toUpdate = {
    data: { elementId: "#details:hidden", value },
    single: true,
  };

  updateStep("hidden", toUpdate);
};

export const parseGetParams = () => {
  if (!location.search || isSelfReport(location.href, location.origin)) {
    return;
  }

  // If we have a problem_type param, and it matches the value, select it for
  // the user. see https://github.com/webcompat/webcompat.com/blob/34c3b6b1a1116b401a9a442685131ae747045f67/webcompat/form.py#L38
  // for possible matching values
  const problemType = location.href.match(TYPE_REGEX);
  if (problemType !== null) {
    updateStep("category", { categoryName: problemType[1] });
  }

  // If we have details, put it inside a hidden input and append it to the
  // form.
  const details = location.href.match(DETAILS_REGEX);
  if (details) {
    addDetails(details[1]);
  }
};
