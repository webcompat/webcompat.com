## 1.2.0 - 2014-12-08

* Better docs around running tests [Pull #461](https://github.com/webcompat/webcompat.com/pull/461)
* Pressing 'g' from /issues page will navigate to corresponding GitHub issues page (functional bits, UI to come) [Pull #460](https://github.com/webcompat/webcompat.com/pull/460) [Issue #449](https://github.com/webcompat/webcompat.com/issues/449)
* ARIA + markup a11y fixes [Pull #363](https://github.com/webcompat/webcompat.com/pull/363) [Issue #390](https://github.com/webcompat/webcompat.com/issues/390)
* Tweaks to search input + filter button UX [Pull #440](https://github.com/webcompat/webcompat.com/pull/440) [Issue #416](https://github.com/webcompat/webcompat.com/issues/416)
* Follow Link header URIs for pagination [Pull #446](https://github.com/webcompat/webcompat.com/pull/446) [Issue #420](https://github.com/webcompat/webcompat.com/issues/420)

## 1.1.2 - 2014-12-05

* Regression fix: search results should be scoped to web-bugs repo [Issue #444](https://github.com/webcompat/webcompat.com/issues/444)

## 1.1.1 - 2014-12-04

* Update to privacy policy (re: [Issue #419](https://github.com/webcompat/webcompat.com/issues/419))

## 1.1.0 - 2014-12-04

* Add full user agent header to report metadata (hidden by default) [Issue #419](https://github.com/webcompat/webcompat.com/issues/419) [Pull #441](https://github.com/webcompat/webcompat.com/pull/441)
* Update cssnext dependency to v0.3.0  [Pull #427](https://github.com/webcompat/webcompat.com/pull/427)
* Align pagination controls with dropdowns [Pull #426](https://github.com/webcompat/webcompat.com/pull/426) [Issue #424](https://github.com/webcompat/webcompat.com/issues/424)
* Use flash:error events in issue model [Pull #423](https://github.com/webcompat/webcompat.com/pull/423) [Issue #343](https://github.com/webcompat/webcompat.com/issues/343)
* Enable issue list pagination dropdown [Pull #418](https://github.com/webcompat/webcompat.com/pull/418) [Issue #372](https://github.com/webcompat/webcompat.com/issues/372)
* Fix "close" class on Browse Issues key item [Pull #417](https://github.com/webcompat/webcompat.com/pull/417)

## 1.0.5 - 2014-11-21

#### Testing
* Start linting our functional tests [Issue #414](https://github.com/webcompat/webcompat.com/issues/414) [Pull #415](https://github.com/webcompat/webcompat.com/pull/415)
* Fix "My Issues" functional tests [Issue #412](https://github.com/webcompat/webcompat.com/issues/412) [Pull #413](https://github.com/webcompat/webcompat.com/pull/413)
* Upgrade to Intern 2.1.1 [Issue #277](https://github.com/webcompat/webcompat.com/issues/277) [Pull #410](https://github.com/webcompat/webcompat.com/pull/410)

#### Issues page updates
* Add border for labels on issues page (+labels component) [Issue #402](https://github.com/webcompat/webcompat.com/issues/402) [Pull #403](https://github.com/webcompat/webcompat.com/pull/403) [Pull #409](https://github.com/webcompat/webcompat.com/pull/409)
* Hide pagination from issues page when they don't make sense [Issue #405](https://github.com/webcompat/webcompat.com/issues/405) [Pull #408](https://github.com/webcompat/webcompat.com/pull/408)

#### Bugfixes

* Work around Gecko bug, (trim wysiwyg:// from URL field if it's there)[Issue #391](https://github.com/webcompat/webcompat.com/issues/391) [Pull #392](https://github.com/webcompat/webcompat.com/pull/392)
* Fix SOP bug preventing us from persisting logins during tests :skull: [Issue #277](https://github.com/webcompat/webcompat.com/issues/277) [Pull #411](https://github.com/webcompat/webcompat.com/pull/411)

## 1.0.4 - 2014-11-17

* Improved No Results for search or filters (with clickable suggested labels) [Issue #382](https://github.com/webcompat/webcompat.com/issues/382)
* New dark lightbulb and arrow on homepage header [Issue #350](https://github.com/webcompat/webcompat.com/issues/350)
* Set up [Travis CI](https://travis-ci.org/webcompat/webcompat.com) to run functional and unit tests [Issue #338](https://github.com/webcompat/webcompat.com/issues/338)


## 1.0.3 - 2014-11-12

#### CSS

* Update CSS org prefix [Pull #379](https://github.com/webcompat/webcompat.com/pull/379)
* Create `wc-Filter` component [Issue #374](https://github.com/webcompat/webcompat.com/issues/374)
* Create `wc-Pagination` component [Issue #380](https://github.com/webcompat/webcompat.com/issues/380)
* Basic styling for `<main>` element in IE [Pull #376](https://github.com/webcompat/webcompat.com/pull/376)

#### Issues Page

* Tell the user no results were found... if no results were found. [Issue #357](https://github.com/webcompat/webcompat.com/issues/357)
* Support deep linking to pre-selected filter on issues page, e.g., `https://webcompat.com/issues?closed=1` [Issue #340](https://github.com/webcompat/webcompat.com/issues/340)

#### Other stuff

* Various improvements on how we handle Link headers [Issue #375](https://github.com/webcompat/webcompat.com/issues/375)
* Deploy minified assets to staging server [Issue #344](https://github.com/webcompat/webcompat.com/issues/344)

## 1.0.2 - 2014-11-11

* :bomb: @miketaylr broke the site in 1.0.2 and immediately reverted back to 1.0.1. :bomb:

## 1.0.1 - 2014-11-10

* Update docs with new review process - [Issue #360](https://github.com/webcompat/webcompat.com/issues/360)
* Add experimental Share on Facebook link - [Issue #352](https://github.com/webcompat/webcompat.com/issues/352)
* Bug fix: clicking on label when not logged in shouldn't throw [Issue #345](https://github.com/webcompat/webcompat.com/issues/345)

## 1.0.0 - 2014-11-06

First release version for an app that's been released for quite a while. There's lot of stuff in it. ^_^

