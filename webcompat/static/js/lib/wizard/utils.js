/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HEADER_HEIGHT = 130;

const utils = {
  scrollToElement: (element, delay = 250) => {
    // Delay "scroll to element" effect in order to let the animation finish, otherwise the scroll point isn't correct
    setTimeout(() => {
      const topOfElement =
        window.pageYOffset +
        element.getBoundingClientRect().top -
        HEADER_HEIGHT;
      window.scroll({ top: topOfElement, behavior: "smooth" });
    }, delay);

    //@todo figure out why this is needed
    //this.isSubproblem ? 450 : 250
  },
  showContainer: (container, animationName = "slidedown") => {
    container.css("animation-name", animationName);
    container.addClass("open");
    utils.scrollToElement(container[0]);
  },
  hideContainer: (container, animationName = "slideup") => {
    container.css("animation-name", animationName);
    container.removeClass("open");
  }
};

export default utils;
