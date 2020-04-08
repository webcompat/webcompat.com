import { extractPrettyUrl, charsPercent } from "../utils.js";

const { describe, it } = intern.getPlugin("interface.bdd");
const { assert } = intern.getPlugin("chai");

describe("utils", () => {
  it("extractPrettyUrl extracts url without protocol and slashes", () => {
    assert.equal(extractPrettyUrl("https://example.com"), "example.com");
    assert.equal(extractPrettyUrl("http://example.com/test"), "example.com");
    assert.equal(
      extractPrettyUrl("http://www.example.com/test"),
      "www.example.com"
    );
  });

  it("charsPercent returns percent of entered chars limiting percent to 100", () => {
    assert.equal(charsPercent("example text example text text", 30), 100);
    assert.equal(
      charsPercent("example text example text example text", 30),
      100
    );
    assert.equal(charsPercent("test12", 30), 20);
    assert.equal(charsPercent("123", 30), 10);
    assert.throws(
      () => charsPercent(123, 30),
      Error,
      "First argument should be a string"
    );
  });
});
