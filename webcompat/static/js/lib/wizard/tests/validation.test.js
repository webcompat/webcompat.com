import {
  isUrlValid,
  isEmpty,
  isImageTypeValid,
  blobOrFileTypeValid
} from "../validation.js";

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

  it("isImageTypeValid detects if uploaded image type is valid", () => {
    assert.isTrue(isImageTypeValid("C:\fakepathexample.jpeg"));
    assert.isFalse(isImageTypeValid("C:\fakepathexample.dmg"));
    assert.isFalse(isImageTypeValid("C:\fakepathexample"));
  });

  it("blobOrFileTypeValid detects if uploaded file type is valid", () => {
    assert.isTrue(blobOrFileTypeValid({ type: "image/jpeg" }));
    assert.isTrue(blobOrFileTypeValid({ type: "image/png" }));
    assert.isFalse(blobOrFileTypeValid({ type: undefined }));
    assert.isFalse(blobOrFileTypeValid({}));
    assert.isFalse(blobOrFileTypeValid({ type: "application/x-diskcopy" }));
  });
});
