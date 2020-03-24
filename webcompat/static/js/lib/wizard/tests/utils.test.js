import { extractPrettyUrl } from "../utils.js";

const { describe, it } = intern.getPlugin("interface.bdd");
const { assert } = intern.getPlugin("chai");

describe("utils", () => {
  it("extractPrettyUrl ", () => {
    assert.equal(extractPrettyUrl("https://example.com"), "example.com");
    assert.equal(extractPrettyUrl("http://example.com/test"), "example.com");
    assert.equal(
      extractPrettyUrl("http://www.example.com/test"),
      "www.example.com"
    );
  });
});
