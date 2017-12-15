/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface("object");
const { assert } = intern.getPlugin("chai");

registerSuite("Comments (non-auth)", {
  whatever() {
    return this.remote
      .get("http://localhost:5000/issues/200")
      .findByCssSelector(".js-Comment-form")
      .then(assert.fail, function(err) {
        assert.isTrue(/NoSuchElement/.test(String(err)));
      })
      .end();
  }
});
