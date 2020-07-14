/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* This step is for hidden values being prefilled by postMessage from report site issue addon  */

import $ from "jquery";

const prepareValue = (field, value) => {
  if (field.stringify) {
    return JSON.stringify(value);
  }

  return value;
};

const updateMultiple = (data) => {
  const config = {
    details: {
      element: $("#details"),
      stringify: true,
    },
    src: {
      element: $("#reported_with"),
    },
    extra_labels: {
      element: $("#extra_labels"),
      stringify: true,
    },
  };

  Object.keys(config).forEach((key) => {
    if (key in data) {
      const field = config[key];
      field.element.val(prepareValue(field, data[key]));
    }
  });
};

const updateById = ({ elementId, value }) => {
  if (!elementId) return;

  $(elementId).val(value);
};

export default {
  update: ({ data, single }) => {
    if (single) {
      updateById(data);
      return;
    }

    updateMultiple(data);
  },
};
