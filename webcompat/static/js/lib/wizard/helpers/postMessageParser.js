/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "../notify.js";
import { isSelfReport, convertToDataURI } from "../utils.js";
import { blobOrFileTypeValid, isImageDataURIValid } from "../validation.js";
import { sendAnalytics } from "../analytics.js";

const updateStep = (id, data) => notify.publish("updateStep", { id, data });
const updateUrl = (url) => updateStep("url", { url });
const updateHidden = (data) => updateStep("hidden", { data });
const updateScreenshot = (dataURI) => updateStep("screenshot", { dataURI });

const setAnalytics = (campaign, source) => {
  if (campaign && source) {
    sendAnalytics({
      campaignName: campaign,
      campaignSource: source,
    });
  }
};

const handleMessage = (message) => {
  if (!message) return;
  const { url, utm_campaign, utm_source, ...additional } = message;

  updateUrl(url);
  updateHidden(additional);
  setAnalytics(utm_campaign, utm_source);
};

const handleScreenshot = (screenshot) => {
  if (!screenshot) {
    return;
  }
  // See https://github.com/webcompat/webcompat.com/issues/1252 to track
  // the work of only accepting blobs, which should simplify things.
  if (screenshot instanceof Blob) {
    if (blobOrFileTypeValid(screenshot))
      convertToDataURI(screenshot, updateScreenshot);
  } else {
    // ...the data is already a data URI string
    if (isImageDataURIValid(screenshot)) updateScreenshot(screenshot);
  }
};

const isNewerAddonVersion = (data) => {
  return (
    typeof data === "object" && ("screenshot" in data || "message" in data)
  );
};

export const onMessageReceived = (event) => {
  // If we're getting a report about our own site let's bail.
  if (isSelfReport(location.href, location.origin)) {
    return false;
  }

  // Make sure the data is coming from a trusted source.
  // (i.e., our add-on or some other priviledged code sent it)
  if (location.origin === event.origin) {
    if (isNewerAddonVersion(event.data)) {
      if ("screenshot" in event.data) {
        handleScreenshot(event.data.screenshot);
      }

      if ("message" in event.data) {
        handleMessage(event.data.message);
      }
    } else {
      // if screenshot or message properties don't exist, assume it's older addon version,
      // therefore passed data is just a screenshot
      handleScreenshot(event.data);
    }
  }
};
