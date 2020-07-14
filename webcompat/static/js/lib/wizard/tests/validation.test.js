import {
  isUrlValid,
  isEmpty,
  isImageTypeValid,
  blobOrFileTypeValid,
  isImageDataURIValid,
  isGithubUserNameValid,
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

  it("isImageDataURIValid detects is data URI is valid image", () => {
    assert.isFalse(isImageDataURIValid({}));
    assert.isFalse(
      isImageDataURIValid("data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E")
    );
    assert.isFalse(isImageDataURIValid());
    assert.isTrue(
      isImageDataURIValid(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZC"
      )
    );
  });

  it("isGithubUserNameValid detects if github username is valid", () => {
    assert.isTrue(isGithubUserNameValid(""));
    assert.isTrue(isGithubUserNameValid("test"));
    assert.isFalse(isGithubUserNameValid("test test"));
    assert.isFalse(isGithubUserNameValid("test--test"));
    assert.isFalse(isGithubUserNameValid("test*test"));
    assert.isFalse(
      isGithubUserNameValid("testtesttesttesttesttesttesttesttesttest")
    );
  });
});
