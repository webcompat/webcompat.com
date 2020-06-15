/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const channels = {};

export default {
  subscribe: function (channel, cb) {
    if (!channel) throw Error("Please provide channel name to subscribe");
    if (!cb)
      throw Error(
        "Please provide callback function to be called once there is a publish to a channel"
      );

    if (!channels.hasOwnProperty(channel)) {
      channels[channel] = [];
    }

    const index = channels[channel].push(cb) - 1;

    return {
      unsubscribe: function () {
        delete channels[channel][index];
      },
    };
  },
  publish: function (channel, data) {
    if (!channels.hasOwnProperty(channel) || !channels[channel].length) {
      return;
    }

    channels[channel].forEach((cb) => cb(data || {}));
  },
};
