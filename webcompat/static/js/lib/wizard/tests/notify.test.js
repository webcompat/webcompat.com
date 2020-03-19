import notify from "../notify.js";
import sinon from "sinon";

const { describe, it, afterEach } = intern.getPlugin("interface.bdd");
const { assert } = intern.getPlugin("chai");

describe("notify", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("subscribe throws an error if no channel or callback provided", () => {
    assert.throws(
      notify.subscribe,
      Error,
      "Please provide channel name to subscribe"
    );
    assert.throws(
      () => notify.subscribe("test"),
      Error,
      "Please provide callback function to be called once there is a publish to a channel"
    );
  });

  it("subscribe returns and object with unsubscribe property", () => {
    const sb = notify.subscribe("test", () => {});
    assert.property(sb, "unsubscribe", "object contains unsubscribe");
  });

  it("publishing to a channel calls callback fn", () => {
    const cb = sinon.spy();
    notify.subscribe("test1", cb);
    notify.publish("test1");
    assert.isTrue(cb.called);
  });

  it("publishing to a channel with no listeners doesn't call callback fn", () => {
    const cb = sinon.spy();
    notify.subscribe("test2", cb);
    notify.publish("test3");
    assert.isFalse(cb.called);
  });

  it("publishing data to callback makes it to callback fn", () => {
    const cb = sinon.spy();
    const data = { id: 4 };
    notify.subscribe("test4", cb);
    notify.publish("test4", data);

    assert.strictEqual(data, cb.args[0][0]);
  });

  it("publishing no data to callback results in an empty object being passed to callback fn", () => {
    const cb = sinon.spy();
    const data = {};
    notify.subscribe("test4", cb);
    notify.publish("test4");

    assert.deepEqual(data, cb.args[0][0]);
  });

  it("callback fn is not called after unsubscribe", () => {
    const cb = sinon.spy();
    const subscription = notify.subscribe("test5", cb);
    subscription.unsubscribe();
    notify.publish("test5");
    assert.isFalse(cb.called);
  });
});
