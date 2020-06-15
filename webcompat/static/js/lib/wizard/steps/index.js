import url from "./url.js";
import category from "./category.js";
import subCategory from "./sub-category.js";
import confirmBrowser from "./confirm-browser.js";
import differentBrowser from "./different-browser.js";
import testedBrowsers from "./tested-browsers.js";
import warningBrowser from "./warning-browser.js";
import description from "./description.js";
import screenshot from "./screenshot.js";
import submit from "./submit.js";
import hidden from "./hidden.js";

export const STEPS = {
  url: {
    module: url,
    progress: "address",
  },
  category: {
    module: category,
    progress: "issue",
  },
  subCategory: {
    module: subCategory,
    progress: "issue",
  },
  confirmBrowser: {
    module: confirmBrowser,
    progress: "details",
  },
  differentBrowser: {
    module: differentBrowser,
    progress: "details",
  },
  testedBrowsers: {
    module: testedBrowsers,
    progress: "testing",
  },
  warningBrowser: {
    module: warningBrowser,
    progress: "testing",
  },
  description: {
    module: description,
    progress: "description",
  },
  screenshot: {
    module: screenshot,
    progress: "screenshot",
  },
  submit: {
    module: submit,
    progress: "send",
  },
  hidden: {
    module: hidden,
    progress: "",
  },
};
