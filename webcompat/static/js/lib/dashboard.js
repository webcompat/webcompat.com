/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Handle visibility of ActivityIndicator */
const shouldRenderActivityIndicator = (render = true) => {
  const ActivityIndicator = document.getElementById("js-ActiviyIndicator");
  if (render) {
    ActivityIndicator.classList.remove("is-hidden");
  }
  if (!render) {
    ActivityIndicator.classList.add("is-hidden");
  }
};

/* Handle visibility of NoResult */
const shouldRenderNoResult = (render = true) => {
  const NoResult = document.getElementById("js-NoResult");
  if (render) {
    NoResult.classList.remove("is-hidden");
  }
  if (!render) {
    NoResult.classList.add("is-hidden");
  }
};

/* Handle visibility of NeedsTriageList */
const shouldRenderNeedsTriageList = (render = true) => {
  const Triages = document.getElementById("js-Triages");
  if (render) {
    Triages.classList.remove("is-hidden");
  }
  if (!render) {
    Triages.classList.add("is-hidden");
  }
};

/* Filtering (newest or oldest) list of Triage */
const filteringSort = issuesNumber => {
  const select = document.getElementById("js-Filter-sort");
  if ("oldest" === select.value) {
    issuesNumber.reverse();
  }
  const triageList = Array.from(document.getElementsByClassName("wc-Triage"));
  triageList.forEach(issue => {
    issue.style.order = issuesNumber.indexOf(issue.dataset["number"]);
  });
};

/* Filtering List of triage */
const filteringList = (renderActivityIndicator = true) => {
  /* init nbItem visible */
  let nbItemVisible = 0;
  /* init an array of list of issue */
  const issuesNumber = [];

  if (renderActivityIndicator) {
    shouldRenderActivityIndicator();
  }
  /* Triage list */
  const triageList = Array.from(document.getElementsByClassName("wc-Triage"));
  triageList.forEach(issue => {
    /* By default all element are visible */
    let mustBeHidden = false;
    /* push issue number */
    issuesNumber.push(issue.dataset["number"]);
    const selectList = Array.from(
      document.getElementsByClassName("wc-Filter-select")
    );
    selectList.forEach(select => {
      /* no value */
      if (!select.value) {
        return;
      }
      /* value does not contain in class list */
      const classList = Array.from(issue.classList);
      const result = classList.filter(className =>
        className.match(select.value)
      );
      if (result.length === 0) {
        mustBeHidden = true;
        return;
      }
    });
    /* Show or hide */
    if (mustBeHidden) {
      issue.classList.add("is-hidden");
    } else {
      issue.classList.remove("is-hidden");
      nbItemVisible += 1;
    }
  });
  /* Filtering Sort, it's a global fiilter */
  filteringSort(issuesNumber);
  /* Render components */
  shouldRenderActivityIndicator(false);
  shouldRenderNoResult(nbItemVisible === 0);
  shouldRenderNeedsTriageList(nbItemVisible > 0);
};

/* Readable date */
(() => {
  const dateList = Array.from(
    document.getElementsByClassName("wc-Triage-date")
  );
  dateList.forEach(element => {
    element.textContent = element.getAttribute("datetime").slice(0, 10);
  });
})();

/* init list with filters by default */
filteringList(false);

/* Added an event onSubmit form */
document.getElementById("js-Filters").addEventListener("submit", e => {
  e.preventDefault();
  filteringList();
});
