## 2.1.2 - 2015-11-30

* Update imagemin version  [Pull #836](https://github.com/webcompat/webcompat.com/pull/836)[Issue #833](https://github.com/webcompat/webcompat.com/issues/833)
* Add missing import for endpoints.py [Pull #837](https://github.com/webcompat/webcompat.com/pull/837)

## 2.1.1 - 2015-11-19

* Update Markdown sanitizer lib [Pull #830](https://github.com/webcompat/webcompat.com/pull/830) [Issue #764](https://github.com/webcompat/webcompat.com/issues/764)
* Fix UI if gravatar images are blocked [Pull #820](https://github.com/webcompat/webcompat.com/pull/829) [Issue #822](https://github.com/webcompat/webcompat.com/issues/822)
* Refactor GitHub API communication [Pull #828](https://github.com/webcompat/webcompat.com/pull/828) [Issue #827](https://github.com/webcompat/webcompat.com/issues/827)
* Fix title overflow for small devices [Pull #823](https://github.com/webcompat/webcompat.com/pull/823) [Related to Issue #818](https://github.com/webcompat/webcompat.com/issues/818)

## 2.1.0 - 2015-11-05

* [Pull #780](https://github.com/webcompat/webcompat.com/pull/780) [Issue #788](https://github.com/webcompat/webcompat.com/issues/788)
* Add a "My Activity" page and refactor a ton of things in the process [Pull #801](https://github.com/webcompat/webcompat.com/pull/801) [Issue #749](https://github.com/webcompat/webcompat.com/issues/749)
* Replace JSHint with ESLint (and add some style linting rules) [Pull #817](https://github.com/webcompat/webcompat.com/pull/817) [Issue #813](https://github.com/webcompat/webcompat.com/issues/813)
* Update ua-parser to 0.5.0 [Pull #820](https://github.com/webcompat/webcompat.com/pull/820) [Issue #819](https://github.com/webcompat/webcompat.com/issues/819)

## 2.0.2

* Fix bug in validation code that would close the form [Pull #816](https://github.com/webcompat/webcompat.com/pull/816) [Issue #815](https://github.com/webcompat/webcompat.com/issues/815)
* Create a local database of issues (on creation) [Pull #780](https://github.com/webcompat/webcompat.com/pull/780) [Issue #165](https://github.com/webcompat/webcompat.com/issues/165)

## 2.0.1

* Make labels on frontpage clickable [Pull #809](https://github.com/webcompat/webcompat.com/pull/809) [Issue #787](https://github.com/webcompat/webcompat.com/issues/787)
* Bug status should be mutually exclusive [Pull #808](https://github.com/webcompat/webcompat.com/pull/808) [Issue #448](https://github.com/webcompat/webcompat.com/issues/448)
* Update isse state when changing bug status [Pull #807](https://github.com/webcompat/webcompat.com/pull/807) [Issue #806](https://github.com/webcompat/webcompat.com/issues/806)
* Do case-insensitive file extension checking [Pull #804](https://github.com/webcompat/webcompat.com/pull/804) [Issue #802](https://github.com/webcompat/webcompat.com/issues/802)

## 2.0.0

* Re-write label handling model and UI code [Pull #796](https://github.com/webcompat/webcompat.com/pull/796) [Issue #783](https://github.com/webcompat/webcompat.com/issues/783) [Issue #784](https://github.com/webcompat/webcompat.com/issues/784) [Issue #797](https://github.com/webcompat/webcompat.com/issues/797) [Issue #799](https://github.com/webcompat/webcompat.com/issues/799)
* Mock some of the GitHub interactions for functional tests [Pull #774](https://github.com/webcompat/webcompat.com/pull/774) [Issue #712](https://github.com/webcompat/webcompat.com/pull/712)

## 1.9.3

* Add `/issues/new` route for issue creation. [Pull #770](https://github.com/webcompat/webcompat.com/pull/770) [Issue #317](https://github.com/webcompat/webcompat.com/issues/317)
* Remove caching for labels (and Flask-Cache) [Pull #782](https://github.com/webcompat/webcompat.com/pull/782) [Issue #773](https://github.com/webcompat/webcompat.com/issues/773)
* Perform form validation on page load [Pull #779](https://github.com/webcompat/webcompat.com/pull/779) [Issue #769](https://github.com/webcompat/webcompat.com/issues/769)
* Escape label names [Pull #790](https://github.com/webcompat/webcompat.com/pull/790) [Issue #789](https://github.com/webcompat/webcompat.com/issues/789)

## 1.9.2

* Don't depend on POSIX `cat` to check dependencies. [Pull #759](https://github.com/webcompat/webcompat.com/pull/759) [Issue #758](https://github.com/webcompat/webcompat.com/issues/758)
* Move db connection to dedicated module [Pull #757](https://github.com/webcompat/webcompat.com/pull/757)
* Change `BOT_OAUTH_TOKEN` to `OAUTH_TOKEN` [Pull #756](https://github.com/webcompat/webcompat.com/pull/756) [Issue #754](https://github.com/webcompat/webcompat.com/issues/754)
* Import issue labeler into webcompat app [Pull #752](https://github.com/webcompat/webcompat.com/pull/752) [Issue #751](https://github.com/webcompat/webcompat.com/issues/751)
* Write helper methods for logging in and out for func tests [Pull #735](https://github.com/webcompat/webcompat.com/pull/735) [Issue #718](https://github.com/webcompat/webcompat.com/issues/718)

## 1.9.1

* Block fb.com as a spam domain. No issue.
* Fix code comment overflow [Pull #748](https://github.com/webcompat/webcompat.com/pull/748)
* Fix autofocus issue in homepage search on iOS [Pull #744](https://github.com/webcompat/webcompat.com/pull/744) [Issue #743](https://github.com/webcompat/webcompat.com/issues/743)
* Add dropdown to user avatar for navbar [Pull #738](https://github.com/webcompat/webcompat.com/pull/738)
* Make some helper login/logout methods for functional testing [Pull #735](https://github.com/webcompat/webcompat.com/pull/735) [Issue #718](https://github.com/webcompat/webcompat.com/issues/718)

## 1.9.0

* Improve the QR code layout [Pull #691](https://github.com/webcompat/webcompat.com/pull/691)
* Reorg tests and add setup and tearDown methods for logging in and out [Pull #714](https://github.com/webcompat/webcompat.com/pull/714) [Issue #711](https://github.com/webcompat/webcompat.com/issues/711)
* Linkify GitHub usernames and issues [Pull #721](https://github.com/webcompat/webcompat.com/pull/721)
* Add search bar to homepage [Pull #725](https://github.com/webcompat/webcompat.com/pull/725)
* Make search visible and usable by all users [Pull #726](https://github.com/webcompat/webcompat.com/pull/726) [Issue #563](https://github.com/webcompat/webcompat.com/issues/563)
* Focus search input when opened [Pull #732](https://github.com/webcompat/webcompat.com/pull/732) [Issue #730](https://github.com/webcompat/webcompat.com/pull/732)
* Fancy bug tracker markdown links [Pull #733](https://github.com/webcompat/webcompat.com/pull/733)
* Set IssueView._urlParams each time we call loadIssues [Pull #734](https://github.com/webcompat/webcompat.com/pull/734) [Issue #728](https://github.com/webcompat/webcompat.com/issues/728)
* Fix height of search bar [Pull 737](https://github.com/webcompat/webcompat.com/pull/737)
* Non-logged in searches from home page should have all params in URL bar [Pull #739](https://github.com/webcompat/webcompat.com/pull/739) [Issue #729](https://github.com/webcompat/webcompat.com/pull/729)

## 1.8.0

* Fix some inconsistent quoting [Pull #709](https://github.com/webcompat/webcompat.com/pull/709)
* Add simple logging ability to the Flask app [Pull #704](https://github.com/webcompat/webcompat.com/pull/704) [Issue #245](https://github.com/webcompat/webcompat.com/issues/245)
* Add ability to upload images for an issue (in a comment) [Pull #703](https://github.com/webcompat/webcompat.com/pull/703) [Issue #687](https://github.com/webcompat/webcompat.com/issues/687)
* Fix bug when clicking a label to perform a search [Pull #700](https://github.com/webcompat/webcompat.com/pull/700) [Issue #693](https://github.com/webcompat/webcompat.com/pull/693)

## 1.7.4

* Add more breathing room for comments [Pull #699](https://github.com/webcompat/webcompat.com/pull/699)
* Change how we compute `user_id` in Session.db [Pull #696](https://github.com/webcompat/webcompat.com/pull/696)

## 1.7.3

* Homepage now shows 10 of the latest bugs, rather than all categories. [Pull #692](https://github.com/webcompat/webcompat.com/pull/692) [Issue #571](https://github.com/webcompat/webcompat.com/issues/571)
* Expose NeedsContact UI on all issues page. [Pull #685](https://github.com/webcompat/webcompat.com/pull/685) [Issue #434](https://github.com/webcompat/webcompat.com/issues/434)
* Temporarily disable **all** reporting for Facebook.com issues [No issue](https://github.com/webcompat/webcompat.com/commit/2fc80ef90a8265c03c23e6347735d0e3e1464165)
* Update Prism.js version [Issue #614](https://github.com/webcompat/webcompat.com/issues/614)

## 1.7.2

* Temporarily disable anonymous reporting for Facebook.com issues (lolwat) [Pull #689](https://github.com/webcompat/webcompat.com/pull/689) [Issue #688](https://github.com/webcompat/webcompat.com/issues/688)

## 1.7.1

* More useful alt text for image uploads [Pull #684](https://github.com/webcompat/webcompat.com/pull/684) [Issue #682](https://github.com/webcompat/webcompat.com/issues/682)
* Fix bug where we sent 404 when receiving cached responses from GitHub [Pull #686](https://github.com/webcompat/webcompat.com/pull/686) [Issue #683](https://github.com/webcompat/webcompat.com/issues/683)

## 1.7

* Add ability to upload and embed images in a new bug report [Pull #679](https://github.com/webcompat/webcompat.com/pull/679) [Issue #24](https://github.com/webcompat/webcompat.com/issues/24)
* Fix centering of home arrow icon [Pull #677](https://github.com/webcompat/webcompat.com/pull/677)
* Improvements to API error handling [Pull #678](https://github.com/webcompat/webcompat.com/pull/678) [Issue #667](https://github.com/webcompat/webcompat.com/issues/667)

## 1.6.12

* Handle unknown category keywords at API level [Pull #676](https://github.com/webcompat/webcompat.com/pull/676) [Issue #669](https://github.com/webcompat/webcompat.com/issues/669)
* Add tests for labels [Pull #675](https://github.com/webcompat/webcompat.com/pull/675) [Issue #272](https://github.com/webcompat/webcompat.com/issues/272)
* Add status- prefix to new query params [Pull #674](https://github.com/webcompat/webcompat.com/pull/674) [Issue #668](https://github.com/webcompat/webcompat.com/issues/668)

## 1.6.11

* Move all label namespacing operations to happen at the model level. [Pull #661](https://github.com/webcompat/webcompat.com/pull/661) [Issue #660](https://github.com/webcompat/webcompat.com/issues/660)

## 1.6.10

Fix a regression related to namespaced labels. [Pull #659](https://github.com/webcompat/webcompat.com/pull/659) [Issue #658](https://github.com/webcompat/webcompat.com/issues/658)

## 1.6.9

* Allow non-logged in users to load search results from URL params [Pull #650](https://github.com/webcompat/webcompat.com/pull/650) [Issue #639](https://github.com/webcompat/webcompat.com/issues/639)
* Fix a few bugs related to moving to `status-` labels. [Pull #653](https://github.com/webcompat/webcompat.com/pull/653) [Issue #652](https://github.com/webcompat/webcompat.com/issues/652)

## 1.6.8

Add namespaces for statuses and browsers to labels. [Pull #640](https://github.com/webcompat/webcompat.com/pull/640) [Issue #436](https://github.com/webcompat/webcompat.com/issues/436)

## 1.6.7

* Add QR code modal thingy to the issues page. [Pull #643](https://github.com/webcompat/webcompat.com/pull/643) [Issue #636](https://github.com/webcompat/webcompat.com/issues/636)

## 1.6.6

* Layout and visual design improvements to issue page [Pull #630](https://github.com/webcompat/webcompat.com/pull/630)
* Load search result from URL param for logged in users [Pull #638](https://github.com/webcompat/webcompat.com/pull/638) [Issue #634](https://github.com/webcompat/webcompat.com/issues/634)

## 1.6.5 - 2014-06-11


* Fix issues search (which apparently was broken oops) [Pull #618](https://github.com/webcompat/webcompat.com/pull/618) [Issue #612](https://github.com/webcompat/webcompat.com/issues/612)
* Add a Comment CSS component [Pull #625](https://github.com/webcompat/webcompat.com/pull/625)
* Add some `wc-` CSS namespaceing [Pull #626](https://github.com/webcompat/webcompat.com/pull/626)
* Optimize SVG (and fix filename extension) [Issue #627](https://github.com/webcompat/webcompat.com/pull/627)
* Add webapp manifest [Pull #628](https://github.com/webcompat/webcompat.com/pull/628) [Issue #624](https://github.com/webcompat/webcompat.com/issues/624)

## 1.6.4 - 2014-04-13

* Add line break to bug form to increase readability[Pull #610](https://github.com/webcompat/webcompat.com/pull/610)
* Fix conditional requests (i.e., smarter HTTP caching) for non-authed users [Pull #608](https://github.com/webcompat/webcompat.com/pull/608) [Issue #590](https://github.com/webcompat/webcompat.com/issues/590)
* Nicer images on /contributors [Pull #607](https://github.com/webcompat/webcompat.com/pull/607) [Issue #428](https://github.com/webcompat/webcompat.com/issues/428)
* Go back to using the Issues API for label filters [Pull #606](https://github.com/webcompat/webcompat.com/pull/606) [Issue #592](https://github.com/webcompat/webcompat.com/pull/592)
* Get rid of marked.js and switch to markdown-it.js for clientside Markdown rendering (for now @name linking won't work, to be fixed in a later update!). [Pull #605](https://github.com/webcompat/webcompat.com/pull/605) [Issue #604](https://github.com/webcompat/webcompat.com/issues/604)

## 1.6.3 - 2014-04-07

* Fix bug that broke back button navigation on /issues page [Pull #603](https://github.com/webcompat/webcompat.com/pull/603) [Issue #564](https://github.com/webcompat/webcompat.com/issues/564)
* Fix "wyciwcg://" bug (uh, actually fix it this time) [Pull #601](https://github.com/webcompat/webcompat.com/pull/601) [Issue #600](https://github.com/webcompat/webcompat.com/issues/600)
* Add logged in username to "Report" button, for logged-in users [Issue #589](https://github.com/webcompat/webcompat.com/issues/589)

## 1.6.2 - 2014-03-25

* CSS refactor around forms [Pull #585](https://github.com/webcompat/webcompat.com/pull/585)
* md5 checksum-based cache busting for static assets [Pull #594](https://github.com/webcompat/webcompat.com/pull/594) [Issue #368](https://github.com/webcompat/webcompat.com/issues/368)
* Better dependency checking for PIP [Pull #597](https://github.com/webcompat/webcompat.com/pull/597) [Issue #583](https://github.com/webcompat/webcompat.com/issues/583)
* Add a grunt task to check NPM dependencies [Pull #593](https://github.com/webcompat/webcompat.com/pull/593) [Issue #587](https://github.com/webcompat/webcompat.com/issues/587)
* Update list style [Pull #598](https://github.com/webcompat/webcompat.com/pull/598) [Issue #588](https://github.com/webcompat/webcompat.com/issues/588)

## 1.6.1 - 2014-03-10

* Typo fix (lol) [Issue #591](https://github.com/webcompat/webcompat.com/issues/591)

## 1.6.0 - 2014-03-09

* Fix bug with Issue back arrow & history [Pull #570](https://github.com/webcompat/webcompat.com/pull/570) [Issue #569](https://github.com/webcompat/webcompat.com/issues/569)
* Add link to "G takes you to GitHub" note for mobile users [Pull #573](https://github.com/webcompat/webcompat.com/pull/573) [Issue #572](https://github.com/webcompat/webcompat.com/issues/572)
* Link to HTTPS [Pull #574](https://github.com/webcompat/webcompat.com/pull/574)
* Add anchors to headings on contributors page [Pull #578](https://github.com/webcompat/webcompat.com/pull/578) [Issue #577](https://github.com/webcompat/webcompat.com/issues/577)
* Remove text-overflow on titles [Pull #580](https://github.com/webcompat/webcompat.com/pull/580)
* Provide "Greatest hits" for compat issues in bug form [Pull #579](https://github.com/webcompat/webcompat.com/pull/579) [Issue #432](https://github.com/webcompat/webcompat.com/issues/432)
* Update some css-related modules (`cssnext`, `cssrecipes-utils`, `cssrecipes-reset`) [Pull #581](https://github.com/webcompat/webcompat.com/pull/581)
* Update contribution links on homepage [Pull #584](https://github.com/webcompat/webcompat.com/pull/584) [Issue #576](https://github.com/webcompat/webcompat.com/issues/576)
* Refactor CSS related to new form changes [Pull #585](https://github.com/webcompat/webcompat.com/pull/585)

## 1.5.3 - 2014-02-26

* Add a "Report an Issue" link to the global nav [Pull #568](https://github.com/webcompat/webcompat.com/pull/568) [Issue #565](https://github.com/webcompat/webcompat.com/issues/565)
* Make "My Issues" a link to filtered Issues page (from the homepage) [Pull #561](https://github.com/webcompat/webcompat.com/pull/561) [Issue #560](https://github.com/webcompat/webcompat.com/pull/561)

## 1.5.2 - 2014-02-14

* Change pagination buttons to links with meaninful hrefs [Pull #553](https://github.com/webcompat/webcompat.com/pull/553) [Issue #511](https://github.com/webcompat/webcompat.com/issues/511)
* Fix mis-quoted class attribute [PUll #559](https://github.com/webcompat/webcompat.com/pull/559)

## 1.5.1 - 2014-02-10

* Refactor back end Link header parsing [Pull #550](https://github.com/webcompat/webcompat.com/pull/550) [Issue #451](https://github.com/webcompat/webcompat.com/issues/451)
* Refactor back end code handling categories [Pull #534](https://github.com/webcompat/webcompat.com/pull/534) [Issue #533](https://github.com/webcompat/webcompat.com/issues/533)
* Don't warp to GitHub if you're just searching for a word with the letter g in it (oops) [Pull #552](https://github.com/webcompat/webcompat.com/pull/552) [Issue #549](https://github.com/webcompat/webcompat.com/issues/549) [Issue #555](https://github.com/webcompat/webcompat.com/issues/555)
* Use history traversal when using the back arrow button from issue -> all isues [Pull #547](https://github.com/webcompat/webcompat.com/pull/547) [Issue #546](https://github.com/webcompat/webcompat.com/issues/546)

## 1.5.0 - 2014-01-29

* Keep track of /issues state via the URL bar [Issue #399](https://github.com/webcompat/webcompat.com/issues/399) [Issue #516](https://github.com/webcompat/webcompat.com/issues/516) [Pull #542](https://github.com/webcompat/webcompat.com/pull/542)
* Update docs and `run.py` script to recommend using localhost:5000 rather than 127.0.0.1 [Issue #537](https://github.com/webcompat/webcompat.com/issues/537) [Pull #539](https://github.com/webcompat/webcompat.com/pull/539)
* Introduce concept of "needscontact" label (no UI yet) [Issue #531](https://github.com/webcompat/webcompat.com/issues/531) [Pull #534](https://github.com/webcompat/webcompat.com/pull/534)

## 1.4.0 - 2014-01-13

* Rename "Untriaged" to "New" [Pull #531](https://github.com/webcompat/webcompat.com/pull/531) [Issue #286](https://github.com/webcompat/webcompat.com/issues/286)
* Fix bug where WebKit/Blink users couldn't open dropdown by clicking arrow [Pull #530](https://github.com/webcompat/webcompat.com/pull/530) [Issue #529](https://github.com/webcompat/webcompat.com/issues/529)
* New color palette [Pull #521](https://github.com/webcompat/webcompat.com/pull/521)
* Refactoring around "new" filter (and adds notion of "needscontact" label) [Pull #534](https://github.com/webcompat/webcompat.com/pull/534) [Issue #533](https://github.com/webcompat/webcompat.com/issues/533)

## 1.3.5 - 2014-01-06

* Update Intern to 2.2.0 and enable pretty reporter [Pull #528](https://github.com/webcompat/webcompat.com/pull/528) [Issue #527](https://github.com/webcompat/webcompat.com/issues/527)
* Link remote debugging resources from contributors page [Issue #406](https://github.com/webcompat/webcompat.com/issues/406)
* Change label borders to gray on /issues page [Pull #525](https://github.com/webcompat/webcompat.com/pull/525)
* Bugfix: clicking on filter dropdown causes HTTP request [Pull #520](https://github.com/webcompat/webcompat.com/pull/520) [Issue #507](https://github.com/webcompat/webcompat.com/issues/507)
* Bugfix: logging in from /issues page returned the user to the homepage [Pull #523](https://github.com/webcompat/webcompat.com/pull/523) [Issue #512](https://github.com/webcompat/webcompat.com/issues/512)

## 1.3.4 - 2014-01-02

* Display avatar for logged in users with small viewports [Pull #517](https://github.com/webcompat/webcompat.com/pull/517) [Issue #514](https://github.com/webcompat/webcompat.com/issues/514)
* Fix broken DOM :bomb: [Pull #508](https://github.com/webcompat/webcompat.com/pull/508)
* Fix missing arrow from dropdown component [Pull #506](https://github.com/webcompat/webcompat.com/pull/506)
* Unit tests for `normalize_api_params` [Pull #502](https://github.com/webcompat/webcompat.com/issues/502)
* Add links to resources for remote debugging (no pull, cherry picked) [Issue #406](https://github.com/webcompat/webcompat.com/issues/406)

## 1.3.3 - 2014-12-23

* Add icons to page navigation [Pull #499](https://github.com/webcompat/webcompat.com/pull/499) [Issue #450](https://github.com/webcompat/webcompat.com/issues/450)
* a11y: Add heading to /issues page [Pull #481](https://github.com/webcompat/webcompat.com/pull/481) [Issue #481](https://github.com/webcompat/webcompat.com/issues/481)
* a11y: Use empty `alt` for decorative avatars [Pull #494](https://github.com/webcompat/webcompat.com/pull/494) [Issue #483](https://github.com/webcompat/webcompat.com/issues/483)
* Add tests for comments [Pull #498](https://github.com/webcompat/webcompat.com/pull/498) [Issue #270](https://github.com/webcompat/webcompat.com/issues/270)

## 1.3.2 - 2014-12-16

* Make filter and sort interaction possible for /issues [Pull #490](https://github.com/webcompat/webcompat.com/pull/490) [Issue #479](https://github.com/webcompat/webcompat.com/issues/479)

## 1.3.1 - 2014-12-15

* Bug fix: only serialize params once (oops). [Pull #489](https://github.com/webcompat/webcompat.com/pull/489) [Issue #485](https://github.com/webcompat/webcompat.com/issues/485)
* Update Makefile and docs [Pull #488](https://github.com/webcompat/webcompat.com/pull/488) [Issue #359](https://github.com/webcompat/webcompat.com/issue/359)

## 1.3.0 - 2014-12-12

* Enable "filter" dropdown for /issues page, (which includes a refactor of maintaining model state) [Pull #471](https://github.com/webcompat/webcompat.com/pull/471) [Issue #373](https://github.com/webcompat/webcompat.com/issues/373)
* A11y fixes Round 2 [Pull #468](https://github.com/webcompat/webcompat.com/pull/468) [Issue #464](https://github.com/webcompat/webcompat.com/issues/464)

## 1.2.1 - 2014-12-10

* Fix misaligned report buttons for small viewports [Pull #472](https://github.com/webcompat/webcompat.com/pull/472) [Issue #459](https://github.com/webcompat/webcompat.com/issues/459)
* Tests for 'g' key warping to GitHub [Pull #463](https://github.com/webcompat/webcompat.com/pull/463)
* Make links underlined by default [Pull #438](https://github.com/webcompat/webcompat.com/pull/438) [Issue #421](https://github.com/webcompat/webcompat.com/issues/421)
* Enable issues page "sort" dropdown [Pull #466](https://github.com/webcompat/webcompat.com/pull/466) [Issue #371](https://github.com/webcompat/webcompat.com/issues/371)

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

