import {
  extractPrettyUrl,
  charsPercent,
  isSelfReport,
  getDataURIFromPreview,
} from "../utils.js";

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

  it("isSelfReport determines if report was filed for our own site", () => {
    assert.isFalse(
      isSelfReport(
        "http://localhost:5000/issues/new?url=http://example.com/",
        "http://localhost:5000"
      )
    );
    assert.isFalse(
      isSelfReport("http://localhost:5000/issues/new", "http://localhost:5000")
    );
    assert.isFalse(
      isSelfReport(
        "http://localhost:5000/issues/new?url=test",
        "http://localhost:5000"
      )
    );
    assert.isTrue(
      isSelfReport(
        "http://localhost:5000/issues/new?url=http://localhost:5000/",
        "http://localhost:5000"
      )
    );
  });

  it("getDataURIFromPreview gets the data URI portion inside of a serialized data URI", () => {
    const base64String =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC";
    const bgImage = `url(${base64String})`;
    const bgImageInQuotes = `url("${base64String}")`;

    assert.equal(getDataURIFromPreview(bgImage), base64String);
    assert.equal(getDataURIFromPreview(bgImageInQuotes), `${base64String}"`);
    assert.strictEqual(
      getDataURIFromPreview("invalid background..."),
      undefined
    );
    assert.strictEqual(getDataURIFromPreview("url('test.jpg')"), undefined);
  });
});
