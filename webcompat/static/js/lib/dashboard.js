/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Handle visibility of ActivityIndicator */
const shouldRenderActivityIndicator = (render = true) => {
  const activityIndicator = document.getElementById("js-ActiviyIndicator");
  if (render) {
    activityIndicator.classList.remove("is-hidden");
  }
  if (!render) {
    activityIndicator.classList.add("is-hidden");
  }
};

/* Handle visibility of NoResult */
const shouldRenderNoResult = (render = true) => {
  const noResult = document.getElementById("js-NoResult");
  if (render) {
    noResult.classList.remove("is-hidden");
  }
  if (!render) {
    noResult.classList.add("is-hidden");
  }
};

/* Handle visibility of NeedsTriageList */
const shouldRenderNeedsTriageList = (render = true) => {
  const triages = document.getElementById("js-Triages");
  if (render) {
    triages.classList.remove("is-hidden");
  }
  if (!render) {
    triages.classList.add("is-hidden");
  }
};

/* Filtering (newest or oldest) list of Triage */
const filteringSort = (issuesNumber, initForm = false) => {
  const select = document.getElementById("js-Filter-sort");
  const lastSelectvalue = issuesNumber.selectValue;
  // By default the oldest option is selected
  // But if someone selects oldest option and refresh it browser
  // the current option selected is save
  // so we must test the value for the initform
  if (initForm && select.value === "newest") {
    issuesNumber.list.reverse();
  } else if (select.value !== lastSelectvalue && null !== lastSelectvalue) {
    issuesNumber.list.reverse();
  }
  // save select value
  issuesNumber.selectValue = select.value;
  const triageList = Array.from(document.getElementsByClassName("wc-Triage"));
  triageList.forEach(issue => {
    issue.style.order = issuesNumber.list.indexOf(issue.dataset["number"]);
  });
};

/* viewMode */
const viewMode = () => {
  const view = document.getElementById("js-Filter-view").value;
  const triages = document.getElementById("js-Triages");
  const currentView = document.getElementById("js-Triages").dataset["view"];
  if (currentView === view) {
    return;
  }
  /* set value */
  triages.dataset["view"] = view;
  localStorage.setItem("DashboardTriageView", view);
};

const setView = (view = null) => {
  if (null == view) {
    return;
  }
  const select = document.getElementById("js-Filter-view");
  select.value = view;
};

/* excluded issue including special filter different from current filter  */
const handleSpecialFilter = (
  filterSelected,
  classList = [],
  result = [],
  filterSpecial = ""
) => {
  let currentResult = result;
  if (filterSpecial !== filterSelected) {
    const result = classList.filter(className =>
      className.match(filterSpecial)
    );
    if (result.length > 0) {
      return [];
    }
  }
  return currentResult;
};

/* Filtering List of triage */
const filteringList = (initForm = false, issuesNumber) => {
  /* init nbItem visible */
  let nbItemVisible = 0;

  if (!initForm) {
    shouldRenderActivityIndicator();
  }
  /* Triage list */
  const triageList = Array.from(document.getElementsByClassName("wc-Triage"));
  triageList.forEach(issue => {
    /* By default all element are visible except for needsinfo ones */
    let mustBeHidden = false;
    /* push issue number */
    if (initForm) {
      issuesNumber.list.push(issue.dataset["number"]);
    }
    const selectList = Array.from(
      document.getElementsByClassName("wc-Filter-select")
    );
    selectList.forEach(select => {
      let result = [];
      /* no value */
      if (!select.value) {
        return;
      }
      /* value does not contain in class list */
      const classList = Array.from(issue.classList);
      /* generic test */
      result = classList.filter(className => className.match(select.value));
      /* exclude issue including special filter different from current filter */
      result = handleSpecialFilter(
        select.value,
        classList,
        result,
        "needsinfo"
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
  filteringSort(issuesNumber, initForm);
  viewMode();
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

/* init View */
/* init an object of list of issue */
const issuesNumber = {
  list: [],
  selectValue: null
};
/* init list with filters by default */
setView(localStorage.getItem("DashboardTriageView"));
filteringList(true, issuesNumber);

/* Added an event onChane form elements */
document.getElementById("js-Filters").addEventListener("change", e => {
  e.preventDefault();
  filteringList(false, issuesNumber);
});
