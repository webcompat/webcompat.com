import { isUrlValid, isEmpty } from "../validation.js";

const { describe, it } = intern.getPlugin("interface.bdd");
const { assert } = intern.getPlugin("chai");

describe("validation", () => {
  it("isUrlValid detects if url is valid", () => {
    assert.isTrue(isUrlValid("https://example.com"));
    assert.isTrue(isUrlValid("http://example.com"));
    assert.isFalse(isUrlValid("https:example.com"));
    assert.isFalse(isUrlValid("https:// example.com"));
    assert.isFalse(isUrlValid("www.example.com"));
    assert.isFalse(isUrlValid("https://"));
    assert.isFalse(isUrlValid(" "));
  });

  it("isEmpty detects if string is empty trimming spaces", () => {
    assert.isTrue(isEmpty(""));
    assert.isTrue(isEmpty(" "));
    assert.isFalse(isEmpty("test"));
  });
});