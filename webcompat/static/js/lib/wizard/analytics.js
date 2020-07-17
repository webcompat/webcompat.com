/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const sendAnalyticsCS = (campaign, source) => {
  if (window.ga && campaign && source) {
    ga("set", {
      campaignName: campaign,
      campaignSource: source,
    });
  }
};

const sendAnalyticsVpv = (label) => {
  ga("set", "page", `/vpv-${label}`);
  ga("send", "pageview");
};

export const sendAnalyticsEvent = (label, action = "step") => {
  if (window.ga) {
    ga("send", "event", {
      eventCategory: "wizard",
      eventAction: action,
      eventLabel: label,
    });

    sendAnalyticsVpv(label);
  }
};
