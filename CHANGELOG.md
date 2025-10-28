### webcompat.com versioning:

1. Bug fixes, docs updates, etc.: affect patch number
2. New features: affect minor number
3. API endpoint changes or (major) dependency version updates: affect major number

## 51.2.0 - 2025-10-28

* Fixes #3836 - Update bugbug URL to https://bugbug.moz.tools [Pull #3837](https://github.com/webcompat/webcompat.com/pull/3837)
* Fixes #3829 - Migrate to Prettier v3 [Pull #3830](https://github.com/webcompat/webcompat.com/pull/3830)

## 51.1.0 - 2023-10-12

* Fixes #3785 - Prefill description from the new in-product reporter [Pull #3788](https://github.com/webcompat/webcompat.com/pull/3788)

## 51.0.0 - 2023-10-04

* Fixes #3784 - Revert BQ and simple form changes [Pull #3786](https://github.com/webcompat/webcompat.com/pull/3786)

## 50.0.1 - 2023-07-12

* Fixes #3775 - Add UA string to details (if it's missing in the additional data from the reporter) [Pull #3776](https://github.com/webcompat/webcompat.com/pull/3776)

## 50.0.0 - 2023-07-05

* Fixes #3773 - Fix an issue with auth report not being saved to BQ [Pull #3774](https://github.com/webcompat/webcompat.com/pull/3774)
* Fixes #3769 - Dual form reporter [Pull #3771](https://github.com/webcompat/webcompat.com/pull/3771)

## 49.0.4 - 2023-05-24

* Fixes #3767 - Don't save additional information from the reporter [Pull #3768](https://github.com/webcompat/webcompat.com/pull/3768)

## 49.0.3 - 2023-04-14

* Fixes #3758 - Fix a problem with issue getting lost when filing an auth report [Pull #3759](https://github.com/webcompat/webcompat.com/pull/3759)

## 49.0.2 - 2023-02-02

* Fixes #3748 - Temporary disable outreach comment [Pull #3750](https://github.com/webcompat/webcompat.com/pull/3750)
* Fixes #3505 - Remove animations/scrolling for prefers-reduced-motion [Pull #3747](https://github.com/webcompat/webcompat.com/pull/3747)

## 49.0.1 - 2022-09-15

* Fixes #3681 - Remove analytics for the form wizard [Pull #3729](https://github.com/webcompat/webcompat.com/pull/3729)
* Fixes #3713 - Fixes for broken/invalid links and typos [Pull #3728](https://github.com/webcompat/webcompat.com/pull/3728)
* Fixes #3717 - Change whois link to Google registry [Pull #3718](https://github.com/webcompat/webcompat.com/pull/3718)

## 49.0.0 - 2022-06-16

* Fixes #3703 - Automatically label nsfw issues [Pull #3704](https://github.com/webcompat/webcompat.com/pull/3704)

## 48.0.1 - 2022-06-01

* Fixes #3697 - Save classification result to elasticsearch db [Pull #3701](https://github.com/webcompat/webcompat.com/pull/3701)

## 48.0.0 - 2022-05-03

* Fixes #3016 - Remove current browser from list of tested browsers [Pull #3691](https://github.com/webcompat/webcompat.com/pull/3691)
* Fixes #3656 - Top sites priority change [Pull #3690](https://github.com/webcompat/webcompat.com/pull/3690)

## 47.1.2 - 2022-04-06

* Fixes #3685 - Automatically add labels for issues reopened after ML triage [Pull #3686](https://github.com/webcompat/webcompat.com/pull/3686)

## 47.1.1 - 2022-03-02

* Fixes #3610 - Add explanation of our ML process to the contributing documentation [Pull #3678](https://github.com/webcompat/webcompat.com/pull/3678)
* Fixes #3672 - Remove "Share on facebook" button [Pull #3677](https://github.com/webcompat/webcompat.com/pull/3677)
* Fixes #3596 - Fixes overlapped check-marks [Pull #3665](https://github.com/webcompat/webcompat.com/pull/3665)
* Fixes #3655 - Avoid flaky tests [Pull #3663](https://github.com/webcompat/webcompat.com/pull/3663)


## 47.1.0 - 2021-11-22

* Fixes #3644 - Add a "moved" milestone [Pull #3645](https://github.com/webcompat/webcompat.com/pull/3645)

## 47.0.1 - 2021-11-09

* Fixes #3639 - Add a required parameter to request only issues [Pull #3641](https://github.com/webcompat/webcompat.com/pull/3641)

## 47.0.0 - 2021-11-03

* Fixes #655 - Convert OAuth app to GitHub app to limit permissions we request  [Pull #3629](https://github.com/webcompat/webcompat.com/pull/3629)
* Fixes #3624 - Add `version100` to the `label` GET param list [Pull #3625](https://github.com/webcompat/webcompat.com/pull/3625)

## 46.0.0 - 2021-09-29

* Fixes #3572 - Update Flask, Flask-WTF, Werkzeug versions [Pull #3621](https://github.com/webcompat/webcompat.com/pull/3621)

## 45.0.1 - 2021-09-14

* Fixes #3618 - Fix unset submit_type [Pull #3619](https://github.com/webcompat/webcompat.com/pull/3619)

## 45.0.0 - 2021-07-26

* Fixes #3607 - Make modify_labels and edit_issue expect tuple instead of Request [Pull #3609](https://github.com/webcompat/webcompat.com/pull/3609)
* Fixes #3114 - Fix excessive labels assignment [Pull #3606](https://github.com/webcompat/webcompat.com/pull/3606)
* Fixes #3555 - Add Raul Bucata to the contributors page [Pull #3605](https://github.com/webcompat/webcompat.com/pull/3605)
* Fixes #3348 - Update contributing documentation [Pull #3601](https://github.com/webcompat/webcompat.com/pull/3601)
* Fixes #3585 - fixes the misspelled dependabot label [Pull #3586](https://github.com/webcompat/webcompat.com/pull/3586)
* Fixes #3578 - Adds device-tablet to the list of accepted extra labels [Pull #3584](https://github.com/webcompat/webcompat.com/pull/3584)

## 44.0.0 - 2021-05-31

* Fixes #3574 - Incorporate bugbug ml labelling into moderation process [Pull #3576](https://github.com/webcompat/webcompat.com/pull/3576)
* Fixes #3571 - Use bugbug to classify issues [Pull #3573](https://github.com/webcompat/webcompat.com/pull/3573)

## 43.0.0 - 2021-05-20

* Fixes #3571 - Use bugbug to classify issues [Pull #3573](https://github.com/webcompat/webcompat.com/pull/3573)

## 42.0.0 - 2021-05-04

* Fixes #3562 - Adds better detection for Firefox iOS [Pull #3570](https://github.com/webcompat/webcompat.com/pull/3570)
* NPM update - Upgrade stylelint-config-standard from 20.0.0 to 22.0.0. [Pull #3566](https://github.com/webcompat/webcompat.com/pull/3566)
* NPM update - Upgrade pillow from 8.1.0 to 8.1.1 in /config. [Pull #3556](https://github.com/webcompat/webcompat.com/pull/3556)
* Fixes #3547 - Removes unused Requests library import [Pull #3549](https://github.com/webcompat/webcompat.com/pull/3549)
* NPM update - Upgrade eslint-config-prettier from 7.2.0 to 8.1.0. [Pull #3545](https://github.com/webcompat/webcompat.com/pull/3545)
* NPM update - Upgrade postcss-import from 12.0.1 to 14.0.0. [Pull #3544](https://github.com/webcompat/webcompat.com/pull/3544)


## 41.0.0 - 2021-03-23

* Fixes #3541 - Adds detection for firefox iOS mobile reporter [Pull #3548](https://github.com/webcompat/webcompat.com/pull/3548)
* NPM update - Upgrade husky from 4.3.8 to 5.1.2. [Pull #3543](https://github.com/webcompat/webcompat.com/pull/3543)
* NPM update - Upgrade svgo from 1.3.2 to 2.1.0. [Pull #3542](https://github.com/webcompat/webcompat.com/pull/3542)
* Fixes #3528 - Fix CSS for description textarea [Pull #3535](https://github.com/webcompat/webcompat.com/pull/3535)
* Fixes #3528 - Fix CSS for description textarea [Pull #3534](https://github.com/webcompat/webcompat.com/pull/3534)
* Fixes #3532 - Move to python 3.9.1 [Pull #3533](https://github.com/webcompat/webcompat.com/pull/3533)
* Fixes #3529 - Fixes broken badges in README [Pull #3530](https://github.com/webcompat/webcompat.com/pull/3530)
* Fixes #3526 - Make get_description regex less greedy [Pull #3527](https://github.com/webcompat/webcompat.com/pull/3527)


## 40.0.0 - 2021-02-10

* Fixes #3528 - Fix CSS for description textarea [Pull #3535](https://github.com/webcompat/webcompat.com/pull/3535)
* Fixes #3532 - Move to python 3.9.1 [Pull #3533](https://github.com/webcompat/webcompat.com/pull/3533)
* Fixes #3526 - Make get_description regex less greedy [Pull #3527](https://github.com/webcompat/webcompat.com/pull/3527)

## 39.0.1 - 2021-01-27

* Fixes #3522 - Fix outreach comment for auth reports [Pull #3525](https://github.com/webcompat/webcompat.com/pull/3525)
* Fixes #3520 - Bring back min characters rule for description field [Pull #3521](https://github.com/webcompat/webcompat.com/pull/3521)

## 39.0.0 - 2021-01-22

* Fixes #3207 - Adds Terms of Service message to user upload [Pull #3519](https://github.com/webcompat/webcompat.com/pull/3519)
* Fixes #3447 - Replaces custom link parsing with requests one [Pull #3517](https://github.com/webcompat/webcompat.com/pull/3517)
* Fixes #3456 - Add aria-labelled-by attributes to wizard step icons [Pull #3516](https://github.com/webcompat/webcompat.com/pull/3516)
* Fixes #3161 - Adds action keyword for labels regex [Pull #3515](https://github.com/webcompat/webcompat.com/pull/3515)
* NPM update - Upgrade eslint-config-prettier from 6.15.0 to 7.1.0. [Pull #3513](https://github.com/webcompat/webcompat.com/pull/3513)
* NPM update - Upgrade prettier from 2.1.2 to 2.2.1. [Pull #3511](https://github.com/webcompat/webcompat.com/pull/3511)
* Fixes #3506 - Removes useless print statement [Pull #3507](https://github.com/webcompat/webcompat.com/pull/3507)
* Fixes #3494 - Update Mike with generic email [Pull #3504](https://github.com/webcompat/webcompat.com/pull/3504)
* Fixes #3502 - Adds .flaskenv to deploy.ignore [Pull #3503](https://github.com/webcompat/webcompat.com/pull/3503)
* NPM update - Upgrade css-loader from 4.3.0 to 5.0.1. [Pull #3501](https://github.com/webcompat/webcompat.com/pull/3501)
* Fixes #3374 - Adds a link to the github issue that will point to the outreach generator [Pull #3500](https://github.com/webcompat/webcompat.com/pull/3500)
* NPM update - Upgrade css-loader from 4.3.0 to 5.0.0. [Pull #3499](https://github.com/webcompat/webcompat.com/pull/3499)
* NPM update - Upgrade postcss-url from 8.0.0 to 9.0.0. [Pull #3498](https://github.com/webcompat/webcompat.com/pull/3498)
* NPM update - Upgrade webpack-cli from 3.3.12 to 4.1.0. [Pull #3497](https://github.com/webcompat/webcompat.com/pull/3497)
* NPM update - Upgrade mini-css-extract-plugin from 0.11.3 to 1.2.1. [Pull #3496](https://github.com/webcompat/webcompat.com/pull/3496)
* Fixes #2859 - Remove addon link for mobile Firefox users [Pull #3495](https://github.com/webcompat/webcompat.com/pull/3495)
* Fixes #3491 - Remove unused yargs dependency [Pull #3492](https://github.com/webcompat/webcompat.com/pull/3492)
* NPM update - Upgrade yargs from 15.4.1 to 16.0.3. [Pull #3488](https://github.com/webcompat/webcompat.com/pull/3488)

## 38.0.1 - 2020-10-01

* NPM update - Upgrade prettier from 2.1.1 to 2.1.2. [Pull #3489](https://github.com/webcompat/webcompat.com/pull/3489)
* Fixes #3483 - Update some references to Mike Taylor [Pull #3486](https://github.com/webcompat/webcompat.com/pull/3486)
* Fixes #3430 - Improve sliding animations on slow mobile phones [Pull #3484](https://github.com/webcompat/webcompat.com/pull/3484)
* NPM update - Upgrade terser-webpack-plugin from 3.1.0 to 4.1.0. [Pull #3473](https://github.com/webcompat/webcompat.com/pull/3473)
* Fixes #3326 - Adds a static issue generator [Pull #3406](https://github.com/webcompat/webcompat.com/pull/3406)

## 38.0.0 - 2020-09-02

* NPM update - Upgrade prettier from 2.0.5 to 2.1.1. [Pull #3475](https://github.com/webcompat/webcompat.com/pull/3475)
* NPM update - Upgrade mini-css-extract-plugin from 0.9.0 to 0.11.0. [Pull #3474](https://github.com/webcompat/webcompat.com/pull/3474)
* Fixes #3467 - Comment the reason why an issue was accepted but closed [Pull #3472](https://github.com/webcompat/webcompat.com/pull/3472)
* Fixes #3419 - Make image upload keyboard navigable [Pull #3470](https://github.com/webcompat/webcompat.com/pull/3470)
* Fixes #3456 - Add empty alt='' to form icons [Pull #3469](https://github.com/webcompat/webcompat.com/pull/3469)
* Fixes #3454 - Improve contrast for --link-color [Pull #3468](https://github.com/webcompat/webcompat.com/pull/3468)
* Fixes #3396 - Add ability to navigate and select categories via keyboard [Pull #3462](https://github.com/webcompat/webcompat.com/pull/3462)

## 37.1.0 - 2020-08-24

* Fixes #3429 - Skip step 1 if a report is made through "Report site issue". [Pull #3466](https://github.com/webcompat/webcompat.com/pull/3466)
* Fixes #3464 - Only reject an issue for action==closed [Pull #3465](https://github.com/webcompat/webcompat.com/pull/3465)
* Fixes #3458 - remove optional GitHub username field [Pull #3461](https://github.com/webcompat/webcompat.com/pull/3461)
* Fixes #2964 - Add focus for url and "Briefly describe the issue" fields [Pull #3459](https://github.com/webcompat/webcompat.com/pull/3459)
* Fixes #3417 - Add ability to navigate modal via left & right keys [Pull #3453](https://github.com/webcompat/webcompat.com/pull/3453)
* Fixes #3445 - Add 2 more moderation milestones [Pull #3452](https://github.com/webcompat/webcompat.com/pull/3452)
* Fixes #3450 - Remove is--visible class check, instead block on element being visible [Pull #3451](https://github.com/webcompat/webcompat.com/pull/3451)
* Fixes #3448 - removes `git add` in lint-staged [Pull #3449](https://github.com/webcompat/webcompat.com/pull/3449)
* Fixes #3391 - Add ability to close modals with Esc key [Pull #3446](https://github.com/webcompat/webcompat.com/pull/3446)
* Fixes #3422 - Improve color contrast for disabled buttons [Pull #3444](https://github.com/webcompat/webcompat.com/pull/3444)
* Fixes #3421 - Use a non-hidden <label> for the url input [Pull #3443](https://github.com/webcompat/webcompat.com/pull/3443)

## 37.0.0 - 2020-08-10

* Fixes #3440 - Actually add browser-android-components to EXTRA_LABELS [Pull #3442](https://github.com/webcompat/webcompat.com/pull/3442)
* Fixes #3440 - Add browser-android-components to EXTRA_LABELS [Pull #3441](https://github.com/webcompat/webcompat.com/pull/3441)
* Fixes #3437 - updates CircleCI to python 3.8.5 [Pull #3438](https://github.com/webcompat/webcompat.com/pull/3438)
* NPM update - Upgrade css-loader from 3.6.0 to 4.2.0. [Pull #3434](https://github.com/webcompat/webcompat.com/pull/3434)
* NPM update - Upgrade yargs from 15.3.1 to 15.4.1. [Pull #3433](https://github.com/webcompat/webcompat.com/pull/3433)
* Fixes #3291 - Make issue moderation slightly more efficient #3379  [Pull #3415](https://github.com/webcompat/webcompat.com/pull/3415)


## 36.1.0 - 2020-08-03

* Fixes #3427 - Remove min char requirement from description field [Pull #3428](https://github.com/webcompat/webcompat.com/pull/3428)
* Fixes #3425 - Adds a pytest.ini [Pull #3426](https://github.com/webcompat/webcompat.com/pull/3426)
* Fixes #3395 - Change copy after filing an issue with "Report site issue" reporter [Pull #3424](https://github.com/webcompat/webcompat.com/pull/3424)
* Fixes #3392 - Refactor css after original form removal [Pull #3416](https://github.com/webcompat/webcompat.com/pull/3416)
* Fixes #3318 - Remove AB testing initialization [Pull #3414](https://github.com/webcompat/webcompat.com/pull/3414)

## 36.0.0 - 2020-07-27

* Fixes #3412 - Udate python dependencies [Pull #3413](https://github.com/webcompat/webcompat.com/pull/3413)

## 35.0.2 - 2020-07-20

* Fixes #3401 - Don't modify the file_path inside bust_cache [Pull #3407](https://github.com/webcompat/webcompat.com/pull/3407)

## 35.0.1 - 2020-07-20 (known bad, do not deploy)

* Fixes #3401 - Unbreak bust_cache [Pull #3402](https://github.com/webcompat/webcompat.com/pull/3402)

## 35.0.0 - 2020-07-17 (known bad, do not deploy)

* Fixes #3386 - Separate input validation animation from other checkmarks [Pull #3400](https://github.com/webcompat/webcompat.com/pull/3400)
* Fixes #3398 - Add analytics event and vurtual page view tracking [Pull #3399](https://github.com/webcompat/webcompat.com/pull/3399)
* Fixes #3391 - Remove js files for the old form and adjust eslint config [Pull #3394](https://github.com/webcompat/webcompat.com/pull/3394)
* Fixes #3378 - IE 11 fixes [Pull #3390](https://github.com/webcompat/webcompat.com/pull/3390)
* Fixes #3388 - message requesting multiple browser selection [Pull #3389](https://github.com/webcompat/webcompat.com/pull/3389)
* Fixes #3380 - Makes Wizard Form the default (python) [Pull #3384](https://github.com/webcompat/webcompat.com/pull/3384)
* Fixes #3382 - fixes the failing route. [Pull #3383](https://github.com/webcompat/webcompat.com/pull/3383)
* Fixes #3350 - fixed overflow modal [Pull #3377](https://github.com/webcompat/webcompat.com/pull/3377)
* Fixes #3360 - creates controled values list for reported_with [Pull #3371](https://github.com/webcompat/webcompat.com/pull/3371)
* NPM update - Upgrade ejs-loader from 0.3.7 to 0.5.0. [Pull #3370](https://github.com/webcompat/webcompat.com/pull/3370)
* Fixes #3368 - adds .coverage to .gitignore [Pull #3369](https://github.com/webcompat/webcompat.com/pull/3369)
* Fixes #3362 - Remove grunt tasks and clean up package.json [Pull #3367](https://github.com/webcompat/webcompat.com/pull/3367)
* Fixes #3364 - Updated README.md [Pull #3365](https://github.com/webcompat/webcompat.com/pull/3365)
* Fixes #3316 - fixed misaligned check-marks [Pull #3363](https://github.com/webcompat/webcompat.com/pull/3363)
* Fixes #3349 - Updates documentation for webpack and JS unit tests [Pull #3358](https://github.com/webcompat/webcompat.com/pull/3358)
* Fixes #3351 - Moves the analytics comment [Pull #3357](https://github.com/webcompat/webcompat.com/pull/3357)
* Fixes #3354 - Handles FileNotFoundError for assets [Pull #3355](https://github.com/webcompat/webcompat.com/pull/3355)

## 34.0.1 - 2020-06-16

* Fixes #3352 - correct script location for es5 version of flashed-messages.js [Pull #3353](https://github.com/webcompat/webcompat.com/pull/3353)

## 34.0.0 - 2020-06-16 (known broken, don't deploy)

* Fixes #3229 - Form v2 refactor and webpack bundling [Pull #3346](https://github.com/webcompat/webcompat.com/pull/3346)
* Fixes #3336 - Replace is with == for checking string value [Pull #3343](https://github.com/webcompat/webcompat.com/pull/3343)

## 33.0.0 - 2020-06-09

* NPM update - Upgrade eslint from 6.8.0 to 7.1.0. [Pull #3327](https://github.com/webcompat/webcompat.com/pull/3327)
* Fixes #3319 - Removes the form building from home-page [Pull #3325](https://github.com/webcompat/webcompat.com/pull/3325)
* Fixes #3315 - Removes type-hunt-from-home from EXTRA_LABELS [Pull #3324](https://github.com/webcompat/webcompat.com/pull/3324)
* Fixes #3321 - Converts to pytest and improves coverage [Pull #3322](https://github.com/webcompat/webcompat.com/pull/3322)
* Fixes #2086 - Creates an alumni contributor list [Pull #2853](https://github.com/webcompat/webcompat.com/pull/2853)

## 32.0.0 - 2020-05-26

* Fixes #3310 - improves tests documentation [Pull #3312](https://github.com/webcompat/webcompat.com/pull/3312)
* Fixes #3295 - Fetch and render existing issue comments as HTML [Pull #3308](https://github.com/webcompat/webcompat.com/pull/3308)
* Fixes #2980 - Adding correct border for Invalid form [Pull #3306](https://github.com/webcompat/webcompat.com/pull/3306)
* Fixes #3297 - Adjust changelog for dependabot [Pull #3301](https://github.com/webcompat/webcompat.com/pull/3301)

## 31.0.0 - 2020-05-04

* NPM update - Bump grunt from 1.0.4 to 1.1.0 [Pull #3296](https://github.com/webcompat/webcompat.com/pull/3296)
* Fixes #3281 - Convert issue page to be server rendered (part 1) [Pull #3294](https://github.com/webcompat/webcompat.com/pull/3294)
* NPM update - Update intern to the latest version. [Pull #3293](https://github.com/webcompat/webcompat.com/pull/3293)

## 30.1.0 - 2020-04-23

* NPM update - Update prettier to the latest version. [Pull #3292](https://github.com/webcompat/webcompat.com/pull/3292)
* Fixes #3289 - Add support for nested ul in browser details [Pull #3290](https://github.com/webcompat/webcompat.com/pull/3290)
* NPM update - Update intern to the latest version. [Pull #3288](https://github.com/webcompat/webcompat.com/pull/3288)

## 30.0.0 - 2020-04-10

* Fixes #3282 - Update Privacy policy to mention GPU data collection [Pull #3286](https://github.com/webcompat/webcompat.com/pull/3286)
* Fixes #2198 - Pass in targetOrigin from intern config for tests [Pull #3280](https://github.com/webcompat/webcompat.com/pull/3280)
* Fixes #3277 - Add a type-hunt-from-home label to EXTRA_LABELS [Pull #3278](https://github.com/webcompat/webcompat.com/pull/3278)
* NPM update - Update intern to the latest version. [Pull #3276](https://github.com/webcompat/webcompat.com/pull/3276)
* NPM update - Update prettier to the latest version. [Pull #3274](https://github.com/webcompat/webcompat.com/pull/3274)
* NPM update - Update intern to the latest version. [Pull #3271](https://github.com/webcompat/webcompat.com/pull/3271)
* NPM update - Update grunt-contrib-imagemin to the latest version. [Pull #3270](https://github.com/webcompat/webcompat.com/pull/3270)

## 29.0.0 - 2020-03-30

* Fixes #3250 - Makes form wizard the default [Pull #3252](https://github.com/webcompat/webcompat.com/pull/3252)
* Fixes #3248 - pin grunt to 1.0.4 [Pull #3248](https://github.com/webcompat/webcompat.com/pull/3248)
* NPM update - Update yargs to the latest version. [Pull #3242](https://github.com/webcompat/webcompat.com/pull/3242)
* Fixes #3239 - Remove IRC info, replace it with Matrix info [Pull #3240](https://github.com/webcompat/webcompat.com/pull/3240)
* Fixes #3235 - pin yargs to 15.2.0 [Pull #3237](https://github.com/webcompat/webcompat.com/pull/3237)
* Fixes #3199 - Changed blacklisted by blocked [Pull #3228](https://github.com/webcompat/webcompat.com/pull/3228)
* NPM update - Update lint-staged to the latest version. [Pull #3227](https://github.com/webcompat/webcompat.com/pull/3227)
* Fixes #3226 - Update Code of Conduct contact points. [Pull #3225](https://github.com/webcompat/webcompat.com/pull/3225)
* Fixes #3196 - Add functional tests for the new form UI [Pull #3221](https://github.com/webcompat/webcompat.com/pull/3221)
* Fixes #2807 - Upgrade lodash to 4.17.5 [Pull #3220](https://github.com/webcompat/webcompat.com/pull/3220)
* Fixes #3211 - Use _bp naming convention consistently [Pull #3219](https://github.com/webcompat/webcompat.com/pull/3219)
* Fixes #3208 - Use more Pythonic get default value [Pull #3218](https://github.com/webcompat/webcompat.com/pull/3218)
* Fixes #3208 - Moves to boolean flag for anonymous reporting [Pull #3217](https://github.com/webcompat/webcompat.com/pull/3217)

## 28.0.0 - 2020-02-21

* Fixes #3201 - adds public uri to the private issue [Pull #3215](https://github.com/webcompat/webcompat.com/pull/3215)
* Fixes #3210 - Add missing space [Pull #3213](https://github.com/webcompat/webcompat.com/pull/3213)
* Fixes #3206 - Switch from Nosetests to pytest [Pull #3209](https://github.com/webcompat/webcompat.com/pull/3209)
* Fixes #2981 - Fixes "Learn more about web compatibility" and "Learn more" popups [Pull #3198](https://github.com/webcompat/webcompat.com/pull/3198)
* Fixes #3174 - Adds link to matrix [Pull #3194](https://github.com/webcompat/webcompat.com/pull/3194)
* Fixes #3187 - Update Python dependencies [Pull #3191](https://github.com/webcompat/webcompat.com/pull/3191)

## 27.0.0 - 2020-02-11

* NPM update - Update stylelint-config-standard to the latest version. [Pull #3193](https://github.com/webcompat/webcompat.com/pull/3193)
* NPM update - Update stylelint to the latest version. [Pull #3192](https://github.com/webcompat/webcompat.com/pull/3192)
* Fixes #3183 - Fixes the anonymous reporting through env [Pull #3185](https://github.com/webcompat/webcompat.com/pull/3185)
* Fixes #3178 - Adds public_url for action: closed [Pull #3182](https://github.com/webcompat/webcompat.com/pull/3182)
* Fixes #2830 - Create local list of labels with a cron script [Pull #3171](https://github.com/webcompat/webcompat.com/pull/3171)
* Fixes #3165 - Create Terms of Service page [Pull #3168](https://github.com/webcompat/webcompat.com/pull/3168)
* Fixes #3140 - Publish private issue in public after moderation [Pull #3167](https://github.com/webcompat/webcompat.com/pull/3167)
* Fixes #3163 - Scopes the URL of the repo before making actions on opened issues. [Pull #3164](https://github.com/webcompat/webcompat.com/pull/3164)
* Fixes #3145 - Adds an action-needsmoderation label to anonymous issue [Pull #3159](https://github.com/webcompat/webcompat.com/pull/3159)
* Fixes #3150 - Send the "moderation in process" message to the public issue [Pull #3156](https://github.com/webcompat/webcompat.com/pull/3156)
* Fixes #3136 - Adds inline images but inside details/summary markup [Pull #3154](https://github.com/webcompat/webcompat.com/pull/3154)
* Fixes #3146 - Assigns unmoderated milestone to private repo issues [Pull #3153](https://github.com/webcompat/webcompat.com/pull/3153)
* Fixes #3139 - Implement first stages of private reporting flow [Pull #3147](https://github.com/webcompat/webcompat.com/pull/3147)
* NPM update - Update husky to the latest version. [Pull #3135](https://github.com/webcompat/webcompat.com/pull/3135)
* Fixes #3132 - Control anonymous reporting via config option [Pull #3133](https://github.com/webcompat/webcompat.com/pull/3133)
* Fixes #3122 - Removes code related to images thumbnail [Pull #3131](https://github.com/webcompat/webcompat.com/pull/3131)

## 26.0.0 - 2020-01-03

* Fixes #3123 - Prevent .onion URLs from being reported [Pull #3128](https://github.com/webcompat/webcompat.com/pull/3128)
* Fixes #3121 - Remove inline screenshot images [Pull #3127](https://github.com/webcompat/webcompat.com/pull/3127)
* Fixes #3121 - Disable anonymous reporting [Pull #3126](https://github.com/webcompat/webcompat.com/pull/3126)
* Fixes #3118 - Display maintenance page for /issues/new route" [Pull #3125](https://github.com/webcompat/webcompat.com/pull/3125)
* NPM update - Update stylelint-order to the latest version. [Pull #3116](https://github.com/webcompat/webcompat.com/pull/3116)

## 25.0.0 - 2020-01-03

* Fixes #3118 - Display maintenance page for /issues/new route [Pull #3119](https://github.com/webcompat/webcompat.com/pull/3119)

## 24.1.0 - 2019-12-17

* Fixes #3110 - Change step10 button text depending on state [Pull #3111](https://github.com/webcompat/webcompat.com/pull/3111)
* Fixes #2659 - Make console logs in browser configuration details easier to read [Pull #3103](https://github.com/webcompat/webcompat.com/pull/3103)

## 24.0.0 - 2019-12-12

* Fixes #3004 - Description step has no intro copy [Pull #3108](https://github.com/webcompat/webcompat.com/pull/3108)
* Fixes #3096 - Wrong button label for screenshot step [Pull #3107](https://github.com/webcompat/webcompat.com/pull/3107)
* Fixes #2945 - Update Intern to 4.7.0 [Pull #3105](https://github.com/webcompat/webcompat.com/pull/3105)

## 23.0.0 - 2019-12-04

* Fixes #2952 - Fixes husky pre-commit deprecation [Pull #3102](https://github.com/webcompat/webcompat.com/pull/3102)
* Fixes #3100 - Send GA events for issue-wizard clicks/input changes [Pull #3101](https://github.com/webcompat/webcompat.com/pull/3101)
* Fixes #3098 - Built with Grunt SVG badge (URL) is broken [Pull #3099](https://github.com/webcompat/webcompat.com/pull/3099)

## 22.0.0 - 2019-11-18

* Fixes #3092 - Add bugform-prefill.js to grunt-tasks concat [Pull #3093](https://github.com/webcompat/webcompat.com/pull/3093)
* NPM update - Update yargs to the latest version. [Pull #3091](https://github.com/webcompat/webcompat.com/pull/3091)
* Fixes #3025 - expose tested browsers in issue body [Pull #3089](https://github.com/webcompat/webcompat.com/pull/3089)
* NPM update - Update stylelint to the latest version. [Pull #3088](https://github.com/webcompat/webcompat.com/pull/3088)

## 21.2.0 - 2019-11-13

* Fixes #3070 - Add additional logging of experiment branch and IP [Pull #3086](https://github.com/webcompat/webcompat.com/pull/3086)
* NPM update - Update prettier to the latest version. [Pull #3083](https://github.com/webcompat/webcompat.com/pull/3083)
* Fixes #3052 - Adjust positioning and padding related to validation badges [Pull #3080](https://github.com/webcompat/webcompat.com/pull/3080)
* Fixes #2985 - Add postMessage support for report site issue data [Pull #3012](https://github.com/webcompat/webcompat.com/pull/3012)

## 21.1.2 - 2019-11-08

* Fixes #3041 - Use Operating System instead of Device [Pull #3081](https://github.com/webcompat/webcompat.com/pull/3081)
* Fixes #3070 - Rewrite is_valid_issue_form [Pull #3079](https://github.com/webcompat/webcompat.com/pull/3079)
* Fixes #3076 - Remove maxlength for textarea [Pull #3078](https://github.com/webcompat/webcompat.com/pull/3078)

## 21.1.1 - 2019-11-05

* Fixes #3071 - Change page title based on form [Pull #3074](https://github.com/webcompat/webcompat.com/pull/3074)
* Fixes #3049 - Clear the image preview when hitting an error [Pull #3067](https://github.com/webcompat/webcompat.com/pull/3067)
* Fixes #3050 - Disable submits on form submit [Pull #3065](https://github.com/webcompat/webcompat.com/pull/3065)
* Fixes #3063 - Move search bar handling into shared navbar.js [Pull #3064](https://github.com/webcompat/webcompat.com/pull/3064)

## 21.1.0 - 2019-10-28

* Fixes #3061 - Moves the template at the right place [Pull #3062](https://github.com/webcompat/webcompat.com/pull/3062)
* Fixes #3034 - Make Report Bug on homepage a hyperlink [Pull #3059](https://github.com/webcompat/webcompat.com/pull/3059)

## 21.0.3 - 2019-10-24

* Fixes #3033 - Include bugform regardless of env (oops) [Pull #3036](https://github.com/webcompat/webcompat.com/pull/3036)

## 21.0.2 - 2019-10-24

* Fixes #3033 - Include bugform.js on homepage for form-v2 experiment [Pull #3035](https://github.com/webcompat/webcompat.com/pull/3035)

## 21.0.1 - 2019-10-24

* Fixes #3031 - Update privacy policy around experiments [Pull #3032](https://github.com/webcompat/webcompat.com/pull/3032)
* Fixes #3024 - Move dropdownHandler into shared navbar.js [Pull #3027](https://github.com/webcompat/webcompat.com/pull/3027)
* Fixes #3022 - Define variation defaults if env vars are missing [Pull #3023](https://github.com/webcompat/webcompat.com/pull/3023)
* Fixes #3005 - Don't disable button when deleting a screenshots [Pull #3019](https://github.com/webcompat/webcompat.com/pull/3019)
* Fixes #3005 - Screenshot submit button shouldn't be disabled by default [Pull #3017](https://github.com/webcompat/webcompat.com/pull/3017)

## 21.0.0 - 2019-10-23

This updates contains updates for an A/B experiment which is not yet activated. It should continue to work as-is.

* Bump pillow from 6.1.0 to 6.2.0 in /config [Pull #3013](https://github.com/webcompat/webcompat.com/pull/3013)
* Fixes #2983 - Upload a different image keeps the original image unless a new one is chosen [Pull #3011](https://github.com/webcompat/webcompat.com/pull/3011)
* Fixes #2974 - Browser selection to say Yes/No as on current bug form [Pull #3010](https://github.com/webcompat/webcompat.com/pull/3010)
* Fixes #2976 - Prevent user from leaving blank Browser and Device fields [Pull #2993](https://github.com/webcompat/webcompat.com/pull/2993)
* Fixes #2975 - Briefly describe the issue" fix & validation [Pull #2991](https://github.com/webcompat/webcompat.com/pull/2991)
* Fixes #2989 - Create static bundle for form-v2 experiment. [Pull #2990](https://github.com/webcompat/webcompat.com/pull/2990)
* Fixes #2741 - Changes text "Reproduce a Bug" to text "Triage a Bug" [Pull #2987](https://github.com/webcompat/webcompat.com/pull/2987)
* Fixes #2938 - Implement mobile redesign on bug form [Pull #2984](https://github.com/webcompat/webcompat.com/pull/2984)
* Fixes #2955 - Move the no-top-padding class to the codebase of the ex… [Pull #2960](https://github.com/webcompat/webcompat.com/pull/2960)
* Fixes #2958 - Fix `ab_active` to populate cookies on first request [Pull #2959](https://github.com/webcompat/webcompat.com/pull/2959)
* Fixes #2940 - Add a label to v2 form issues [Pull #2957](https://github.com/webcompat/webcompat.com/pull/2957)
* Fixes #2944 - 2947 - Read experiment variation values from envvars [Pull #2951](https://github.com/webcompat/webcompat.com/pull/2951)
* Fixes #2912 - Implement login functionality [Pull #2942](https://github.com/webcompat/webcompat.com/pull/2942)
* Fixes #2934 - Fix stylelint-order version [Pull #2936](https://github.com/webcompat/webcompat.com/pull/2936)
* Fixes #2904 - chore(package): update husky to version 3.0.5 [Pull #2935](https://github.com/webcompat/webcompat.com/pull/2935)
* NPM update - Update stylelint-config-standard to the latest version. [Pull #2930](https://github.com/webcompat/webcompat.com/pull/2930)
* NPM update - Update stylelint to the latest version. [Pull #2929](https://github.com/webcompat/webcompat.com/pull/2929)
* Fixes #2927 - Adds context and refines documentation for the new webcompat [Pull #2928](https://github.com/webcompat/webcompat.com/pull/2928)
* Fixes #2922 - 2921 - Initial redesigned bug form integration [Pull #2923](https://github.com/webcompat/webcompat.com/pull/2923)


## 20.0.0 - 2019-09-15

This is a major upgrade of our server. We are now running the project under Python 3 (Python 3.7.3). We are definitely saying goodbye to python 2.7. For coding and/or using the project you will need to set your environment with Python 3. We recommend you to start fresh by erasing your previous directory and cloning again the project. If you have ongoing work, make a patch before deleting, so you can reimport it later or you may push the branch to your own fork.

* Fixes #2348 - Converts the source code to python 3 [Pull #2825](https://github.com/webcompat/webcompat.com/pull/2825)
* Fixes #2905 - Adjust documentation and command for python 3.7 [Pull #2908](https://github.com/webcompat/webcompat.com/pull/2908)
* Fixes #2899 - update eslint to version 6.1.0 [Pull #2907](https://github.com/webcompat/webcompat.com/pull/2907)
* Fixes #2903 - update lint-staged to version 9.2.1 [Pull #2906](https://github.com/webcompat/webcompat.com/pull/2906)
* NPM update - Update eslint-config-prettier to the latest version. [Pull #2901](https://github.com/webcompat/webcompat.com/pull/2901)
* NPM update - Update yargs to the latest version. [Pull #2909](https://github.com/webcompat/webcompat.com/pull/2909)
* Fixes #2268 - moved navbar handler [Pull #2896](https://github.com/webcompat/webcompat.com/pull/2896)
* NPM update - Update eslint-config-prettier to the latest version. [Pull #2894](https://github.com/webcompat/webcompat.com/pull/2894)
* NPM update - Update prettier to the latest version. [Pull #2891](https://github.com/webcompat/webcompat.com/pull/2891)
* NPM update - Update intern to the latest version. [Pull #2890](https://github.com/webcompat/webcompat.com/pull/2890)

## 19.3.0 - 2019-06-06

* Fixes #2725 - Bugform validation improvements [Pull #2886](https://github.com/webcompat/webcompat.com/pull/2886)
* Fixes #2509 - Fixed race condition when image didn't get transferred from report site issue extension [Pull #2885](https://github.com/webcompat/webcompat.com/pull/2885)
* Fixes #2844 - Adds type-marfeel to EXTRA_LABELS [Pull #2884](https://github.com/webcompat/webcompat.com/pull/2884)
* Fixes #2881 - Removes the needstriage dashboard code [Pull #2883](https://github.com/webcompat/webcompat.com/pull/2883)

## 19.2.0 - 2019-05-29

* NPM update - Update load-grunt-tasks to the latest version. [Pull #2882](https://github.com/webcompat/webcompat.com/pull/2882)
* Fixes #2871 - removed release population "thanks" workaround [Pull #2876](https://github.com/webcompat/webcompat.com/pull/2876)
* Fixes #2866 - added CORS header for localhost [Pull #2875](https://github.com/webcompat/webcompat.com/pull/2875)
* Fixes #2845 - Adds type-mobify to EXTRA_LABELS [Pull #2870](https://github.com/webcompat/webcompat.com/pull/2870)
* NPM update - Update prettier to the latest version. [Pull #2868](https://github.com/webcompat/webcompat.com/pull/2868)


## 19.1.0 - 2019-05-13

* Fixes #2846 - Adds friendlier title for the homepage [Pull #2864](https://github.com/webcompat/webcompat.com/pull/2864)
* Fixes #2817 - Adds Ciprian to the contributors list [Pull #2863](https://github.com/webcompat/webcompat.com/pull/2863)
* Fixes #2854 - Drops the github contact name after auth [Pull #2862](https://github.com/webcompat/webcompat.com/pull/2862)
* Fixes #2754 - updates postcss to version 7.0.13 [Pull #2860](https://github.com/webcompat/webcompat.com/pull/2860)
* Fixes #2856 - Add 'engine-gecko' label for Mozilla browsers [Pull #2858](https://github.com/webcompat/webcompat.com/pull/2858)
* NPM update - Update husky to the latest version. [Pull #2852](https://github.com/webcompat/webcompat.com/pull/2852)
* NPM update - Update stylelint-order to the latest version. [Pull #2847](https://github.com/webcompat/webcompat.com/pull/2847)
* NPM update - Update stylelint to the latest version. [Pull #2842](https://github.com/webcompat/webcompat.com/pull/2842)

## 19.0.4 - 2019-05-02

* Fixes #2754 - updates postcss to version 7.0.13 [Pull #2860](https://github.com/webcompat/webcompat.com/pull/2860)
* Fixes #2856 - Add 'engine-gecko' label for Mozilla browsers [Pull #2858](https://github.com/webcompat/webcompat.com/pull/2858)
* NPM update - Update husky to the latest version. [Pull #2852](https://github.com/webcompat/webcompat.com/pull/2852)
* NPM update - Update stylelint-order to the latest version. [Pull #2847](https://github.com/webcompat/webcompat.com/pull/2847)
* NPM update - Update stylelint to the latest version. [Pull #2842](https://github.com/webcompat/webcompat.com/pull/2842)

## 19.0.3 - 2019-04-25

* Fixes #2728 - Ignores browser label when extra labels already provides it [Pull #2850](https://github.com/webcompat/webcompat.com/pull/2850)


## 19.0.2 - 2019-04-24

* Fixes #2839 - Changes checksum algorithm for fixtures. Updates fixtures. [Pull #2843](https://github.com/webcompat/webcompat.com/pull/2843)
* NPM update - Update prettier to the latest version. [Pull #2841](https://github.com/webcompat/webcompat.com/pull/2841)
* Fixes #2837 - Lowercase the format before checking if it's valid [Pull #2838](https://github.com/webcompat/webcompat.com/pull/2838)
* Fixes #2762 - Removes the autolinking on adding contact [Pull #2833](https://github.com/webcompat/webcompat.com/pull/2833)

## 19.0.1 - 2019-04-08

* Fixes #2080 - Aligns navigation menu in issues list [Pull #2835](https://github.com/webcompat/webcompat.com/pull/2835)
* Fixes #1838 - Separates the python dependencies into prod and dev [Pull #2834](https://github.com/webcompat/webcompat.com/pull/2834)
* Fixes #2828 - Changes from pep8 to pycodestyle [Pull #2829](https://github.com/webcompat/webcompat.com/pull/2829)

## 19.0.0 - 2019-04-03

* NPM update - Update postcss-browser-reporter to the latest version. [Pull #2832](https://github.com/webcompat/webcompat.com/pull/2832)
* Fixes #2759 - Adds more files to ignore on deploy [Pull #2827](https://github.com/webcompat/webcompat.com/pull/2827)
* Fixes #1968 - Updates python modules [Pull #2826](https://github.com/webcompat/webcompat.com/pull/2826)
* Fixes #2823 - Adds type-fastclick to the list of valid extra labels [Pull #2824](https://github.com/webcompat/webcompat.com/pull/2824)
* Fixes #2750 - Improves text rendering [Pull #2821](https://github.com/webcompat/webcompat.com/pull/2821)
* NPM update - Update eslint-config-prettier to the latest version. [Pull #2814](https://github.com/webcompat/webcompat.com/pull/2814)
* NPM update - Update yargs to the latest version. [Pull #2798](https://github.com/webcompat/webcompat.com/pull/2798)

## 18.0.0 - 2019-03-14

* Fixes #2819 - Add browser-fenix to EXTRA_LABELS [Pull #2820](https://github.com/webcompat/webcompat.com/pull/2820)
* Fixes #2811 - Fixes mime type for some endpoints [Pull #2812](https://github.com/webcompat/webcompat.com/pull/2812)
* Fixes #2746 - Renders title with HTML code correctly [Pull #2805](https://github.com/webcompat/webcompat.com/pull/2805)
* Fixes #2771 - Removes unnecessary favicons [Pull #2804](https://github.com/webcompat/webcompat.com/pull/2804)

## 17.0.0 - 2019-02-21

* Fixes #2793 - Comments are sent as markdown to Github [Pull #2800](https://github.com/webcompat/webcompat.com/pull/2800)

## 16.0.1 - 2019-02-14

* Fixes #2802 - Requests for a body instead of a body_html [Pull #2803](https://github.com/webcompat/webcompat.com/pull/2803)


## 16.0.0 - 2019-02-14

* Fixes #2767 - Cut description at 75th char [Pull #2801](https://github.com/webcompat/webcompat.com/pull/2801)
* Fixes #2690 - Adds block about privacy implications of reporting issues [Pull #2795](https://github.com/webcompat/webcompat.com/pull/2795)
* Fixes #2724 - display error messages on a line [Pull #2794](https://github.com/webcompat/webcompat.com/pull/2794)
* Fixes #2778 - Implements HTTP/2 Push through Flask [Pull #2792](https://github.com/webcompat/webcompat.com/pull/2792)
* Fixes #2778 - Adds doc for  push_preload to staging [Pull #2790](https://github.com/webcompat/webcompat.com/pull/2790)
* Fixes #2788 - Make GitHub username regex case-insensitive [Pull #2789](https://github.com/webcompat/webcompat.com/pull/2789)


## 15.6.2 - 2019-01-31

* Fixes #2782 - Edit dev-env-setup.md around GH client ID/secret + typos [Pull #2786](https://github.com/webcompat/webcompat.com/pull/2786)
* Fixes #2747 - Updates Staging to use http2 [Pull #2779](https://github.com/webcompat/webcompat.com/pull/2779)
* Fixes #2751 - Add gzip settings to Staging [Pull #2777](https://github.com/webcompat/webcompat.com/pull/2777)
* Fixes #2768 - Renames highlight class so it doesn't interact with the Github class [Pull #2775](https://github.com/webcompat/webcompat.com/pull/2775)

## 15.6.1 - 2019-01-28

* Fixes #2774 - Fixes code blocks with language identifiers [Pull #2776](https://github.com/webcompat/webcompat.com/pull/2776)
* Fixes #2764 - Updates intern dep. to a version that's not broken [Pull #2773](https://github.com/webcompat/webcompat.com/pull/2773)
* Fixes #2764 - Prints firefox version used by CircleCI [Pull #2766](https://github.com/webcompat/webcompat.com/pull/2766)

## 15.6.0 - 2019-01-21

* Fixes #2753 - only show GitHub username field if not logged in [Pull #2765](https://github.com/webcompat/webcompat.com/pull/2765)
* Fixes #2757 - Adds missing lib to issues on concat.js [Pull #2760](https://github.com/webcompat/webcompat.com/pull/2760)

## 15.5.0 - 2019-01-11 (known broken, don't deploy)

* Fixes #2757 - Add markdown-it to issues on production [Pull #2758](https://github.com/webcompat/webcompat.com/pull/2758)

## 15.4.0 - 2019-01-10 (known broken, don't deploy)

* Fixes #2748 - Pull GA params from POST data and send them inline [Pull #2749](https://github.com/webcompat/webcompat.com/pull/2749)
* Fixes #2727 - Removes unecessary use of markdown-it [Pull #2731](https://github.com/webcompat/webcompat.com/pull/2731)

## 15.3.0 - 2018-12-19

* Fixes #2729 - Remove labels request when they're unnused [Pull #2745](https://github.com/webcompat/webcompat.com/pull/2745)
* Fixes #1822 - Adds GitHub contact form for anonymous reporting [Pull #2744](https://github.com/webcompat/webcompat.com/pull/2744)
* Fixes #2732 - Makes the right number of needstriage requests on webcompat webpage [Pull #2737](https://github.com/webcompat/webcompat.com/pull/2737)

## 15.2.0 - 2018-12-12

* Fixes #2733 - Redirect Release Report Site Issue users to a landing page [Pull #2734](https://github.com/webcompat/webcompat.com/pull/2734)
* NPM update - Update prettier to the latest version. [Pull #2720](https://github.com/webcompat/webcompat.com/pull/2720)

## 15.1.1 - 2018-11-22

* Fixes #2681 - Fixes lists and nested lists display in webcompat.com  [Pull #2715](https://github.com/webcompat/webcompat.com/pull/2715)
* NPM update - Update stylelint-order to the latest version. [Pull #2714](https://github.com/webcompat/webcompat.com/pull/2714)
* NPM update - Update prettier to the latest version. [Pull #2711](https://github.com/webcompat/webcompat.com/pull/2711)
* Fixes #1856 - Better error messaging for unset milestones [Pull #2702](https://github.com/webcompat/webcompat.com/pull/2702)

## 15.1.0 - 2018-11-14

* Fixes #2704 - pin prettier to 1.14.3 [Pull #2705](https://github.com/webcompat/webcompat.com/pull/2705)
* Fixes #2662 - URL with a space in the domain name should not be accepted [Pull #2701](https://github.com/webcompat/webcompat.com/pull/2701)
* Fixes #2698 - Upgrade lint-staged to v8 [Pull #2700](https://github.com/webcompat/webcompat.com/pull/2700)
* NPM update - Revert "Update lint-staged to the latest version ". [Pull #2697](https://github.com/webcompat/webcompat.com/pull/2697)
* Fixes #2688 - Only anonymous users should go through the blacklist domain check [Pull #2696](https://github.com/webcompat/webcompat.com/pull/2696)
* Fixes #2693 - 2694 - Add lock and no-response github apps [Pull #2695](https://github.com/webcompat/webcompat.com/pull/2695)
* Fixes #2689 - Update minimum node version to 10.13.0 [Pull #2691](https://github.com/webcompat/webcompat.com/pull/2691)
* Fixes #2686 - Upgrade requests [Pull #2687](https://github.com/webcompat/webcompat.com/pull/2687)
* NPM update - Update lint-staged to the latest version. [Pull #2685](https://github.com/webcompat/webcompat.com/pull/2685)
* Fixes #2682 - Removes unused markdown-it in issue-list.js [Pull #2683](https://github.com/webcompat/webcompat.com/pull/2683)
* Fixes #2571 - Adds a dashboard route with the list of current dashboards [Pull #2675](https://github.com/webcompat/webcompat.com/pull/2675)
* Fixes #2650 - Modified domain received by `is_blacklisted_domain` [Pull #2667](https://github.com/webcompat/webcompat.com/pull/2667)


## 15.0.0 - 2018-10-30

* Fixes #2686 - Upgrade requests [Pull #2687](https://github.com/webcompat/webcompat.com/pull/2687)
* Fixes #2682 - Removes unused markdown-it in issue-list.js [Pull #2683](https://github.com/webcompat/webcompat.com/pull/2683)
* Fixes #2571 - Adds a dashboard route with the list of current dashboards [Pull #2675](https://github.com/webcompat/webcompat.com/pull/2675)
* Fixes #2650 - Modified domain received by `is_blacklisted_domain` [Pull #2667](https://github.com/webcompat/webcompat.com/pull/2667)


## 14.4.0 - 2018-10-26

* Quick test fix - [Added Greenkeeper](https://github.com/webcompat/webcompat.com/pull/2641) and it failed [Pull #2677](https://github.com/webcompat/webcompat.com/pull/2677)
* Fixes #2670 - Makes sure we are passing a JSON object for processing details. Fixes also v14.3.0 release which was breaking because of #2653. [Pull #2674](https://github.com/webcompat/webcompat.com/pull/2674)
* Fixes #2668 - Add a flag to specify address to listen on [Pull #2669](https://github.com/webcompat/webcompat.com/pull/2669)


## 14.3.0 - 2018-10-24 (known broken, don't deploy)

* Fixes #2663 - Reduce number of untriaged bugs on homepage [Pull #2664](https://github.com/webcompat/webcompat.com/pull/2664)
* Fixes #2416 - Added contributors Abdul and Reinhart [Pull #2661](https://github.com/webcompat/webcompat.com/pull/2661)
* Fixes #2653 - Encode details as JSON before filling input [Pull #2658](https://github.com/webcompat/webcompat.com/pull/2658)
* Fixes #2592 - Fetches a new milestone.json if needed [Pull #2657](https://github.com/webcompat/webcompat.com/pull/2657)
* Fixes #2651 - Update docs around secrets and environment [Pull #2652](https://github.com/webcompat/webcompat.com/pull/2652)
* Fixes #2612 - Moved text messages for certain routes to config [Pull #2649](https://github.com/webcompat/webcompat.com/pull/2649)
* Fixes #2320 - Adds wc-Comment-content-nsfw to new CSS [Pull #2648](https://github.com/webcompat/webcompat.com/pull/2648)
* Fixes #2576 - fix margin top on small screen [Pull #2643](https://github.com/webcompat/webcompat.com/pull/2643)
* Fixes #2630 - Tweak description and textarea labels [Pull #2642](https://github.com/webcompat/webcompat.com/pull/2642)
* Fixes #2639 - Use env vars for prod and staging configuration [Pull #2640](https://github.com/webcompat/webcompat.com/pull/2640)

## 14.2.0 - 2018-10-03

* Fixes #2639 - Use env vars for prod and staging configuration [Pull #2640](https://github.com/webcompat/webcompat.com/pull/2640)

## 14.1.0 - 2018-10-03

* Fixes #2443 - improved readability on field elements [Pull #2625](https://github.com/webcompat/webcompat.com/pull/2625)
* Fixes #2622 - break word to avoid overflow with long string [Pull #2623](https://github.com/webcompat/webcompat.com/pull/2623)
* Fixes #2331 - Remove PurifyCSS. [Pull #2621](https://github.com/webcompat/webcompat.com/pull/2621)
* Fixes #2078 - increase the general width [Pull #2617](https://github.com/webcompat/webcompat.com/pull/2617)
* Fixes #2100 - removing button is now a cross on top right [Pull #2616](https://github.com/webcompat/webcompat.com/pull/2616)
* Fixes #2597 - improve label editor position [Pull #2615](https://github.com/webcompat/webcompat.com/pull/2615)
* Fixes #2610 - Focus search input when clickon on button. [Pull #2614](https://github.com/webcompat/webcompat.com/pull/2614)
* Fixes #1297 - Upgrade Markdown-it Emoji to v1.4.0 [Pull #2613](https://github.com/webcompat/webcompat.com/pull/2613)
* Fixes #2381 - Adds security.txt to /.well-known/ [Pull #2611](https://github.com/webcompat/webcompat.com/pull/2611)

## 14.0.1 - 2018-10-01

* Fixes #2576 - fixed white gap visible in homepage [Pull #2609](https://github.com/webcompat/webcompat.com/pull/2609)
* Fixes #2604 - Fixed the broken link in `run.py` [Pull #2605](https://github.com/webcompat/webcompat.com/pull/2605)
* Fixes #2602 - Adds a list of milestones [Pull #2603](https://github.com/webcompat/webcompat.com/pull/2603)
* Fixes #2595 - Clarifies commit message format [Pull #2600](https://github.com/webcompat/webcompat.com/pull/2600)
* Fixes #2563 - Fixes status change instructions [Pull #2598](https://github.com/webcompat/webcompat.com/pull/2598)
* Fixes #2585 - Adds tmp/ to deploy.ignore [Pull #2594](https://github.com/webcompat/webcompat.com/pull/2594)
* Fixes #2587 - Adds subpath parameter to the wellknown function [Pull #2593](https://github.com/webcompat/webcompat.com/pull/2593)
* Fixes #2590 - Fixes the link in docs/tests.md [Pull #2591](https://github.com/webcompat/webcompat.com/pull/2591)
* Fixes #2468 - Removes backticks from from PR template [Pull #2589](https://github.com/webcompat/webcompat.com/pull/2589)

## 14.0.0 - 2018-09-21

* Fixes #2380 - Removes waffle.io from README.md [Pull #2588](https://github.com/webcompat/webcompat.com/pull/2588)
* Fixes #2559 - Adds Kate to contributors [Pull #2583](https://github.com/webcompat/webcompat.com/pull/2583)
* Fixes #2024 - Adds the ability to receive POST data with a JSON Payload [Pull #2582](https://github.com/webcompat/webcompat.com/pull/2582)


## 13.2.1 - 2018-09-17

* Fixes #2580 - Adds the missing webhooks route to the app [Pull #2581](https://github.com/webcompat/webcompat.com/pull/2581)

## 13.2.0 - 2018-09-14

* Fixes #1835 - Handles unused well-known routes with a 404 [Pull #2578](https://github.com/webcompat/webcompat.com/pull/2578)
* Fixes #1955 - Adds missing tests to webhooks [Pull #2577](https://github.com/webcompat/webcompat.com/pull/2577)
* Fixes #2051 - Remove type-stylo from EXTRA_LABELS allow-list [Pull #2573](https://github.com/webcompat/webcompat.com/pull/2573)

## 13.1.0 - 2018-08-22

* Fixes #2547 - Fix typo in addons link of template for opera [Pull #2570](https://github.com/webcompat/webcompat.com/pull/2570)
* Fixes #2341 - Improves the layout for list and cards [Pull #2569](https://github.com/webcompat/webcompat.com/pull/2569)
* Fixes #2567 - Starts the server for functional tests after nosetests. [Pull #2568](https://github.com/webcompat/webcompat.com/pull/2568)
* Fixes #1942 - Modifies the Image saving parameters for better quality [Pull #2566](https://github.com/webcompat/webcompat.com/pull/2566)
* Fixes #1336 - Add target=_blank to reported URL (only) [Pull #2548](https://github.com/webcompat/webcompat.com/pull/2548)
* Fixes #2507 - Display needsinfo requests in user activity page [Pull #2544](https://github.com/webcompat/webcompat.com/pull/2544)

## 13.0.0 - 2018-08-10

* Fixes #2564 - Change to lax value for samesite cookies. [Issue #2564](https://github.com/webcompat/webcompat.com/commit/6ce9f32bed8f87b934396e222554f149512edf0b)
* Fixes #2567 - Starts the server for functional tests after nosetests. [Pull #2568](https://github.com/webcompat/webcompat.com/pull/2568)
* Fixes #1942 - Modifies the Image saving parameters for better quality [Pull #2566](https://github.com/webcompat/webcompat.com/pull/2566)


## 12.2.0 - 2018-08-02

* Fixes #2560 - Add browser-firefox-reality to EXTRA_LABELS [Pull #2562](https://github.com/webcompat/webcompat.com/pull/2562)
* Fixes #2550 - Adds samesite attribute to session cookie [Pull #2551](https://github.com/webcompat/webcompat.com/pull/2551)

## 12.1.1 - 2018-07-26

* Issue #2557 - Remove form-action until we better understand issue #2557. [Pull #2558](https://github.com/webcompat/webcompat.com/pull/2558)


## 12.1.0 - 2018-07-26 (deploy reverted due to #2557)

* Fixes #2555 - Add type-google to the EXTRA_LABELS list [Pull #2556](https://github.com/webcompat/webcompat.com/pull/2556)
* Fixes #2552 - Adds additional csp directives [Pull #2553](https://github.com/webcompat/webcompat.com/pull/2553)
* Fixes #2537 - Add browser-focus-geckoview to EXTRA_LABELS [Pull #2542](https://github.com/webcompat/webcompat.com/pull/2542)
* Fixes #2538 - Apply HTML change to milestones [Pull #2539](https://github.com/webcompat/webcompat.com/pull/2539)
* Fixes #2535 - Use latest Firefox on Travis [Pull #2536](https://github.com/webcompat/webcompat.com/pull/2536)
* Fixes #2511 - Triage dashboard 'needsinfo' label category doesn't include 'needsinfo-xxx' labels [Pull #2533](https://github.com/webcompat/webcompat.com/pull/2533)
* Fixes #2479 - Refactors the form to be more testable [Pull #2528](https://github.com/webcompat/webcompat.com/pull/2528)


## 12.0.2 - 2018-06-29

* Fixes #2505 - Custom checkbox & flexbox order to move checked labels up [Pull #2521](https://github.com/webcompat/webcompat.com/pull/2521)

## 12.0.1 - 2018-06-29

* Fixes #2519 - Changes the logic for initializing milestones [Pull #2530](https://github.com/webcompat/webcompat.com/pull/2530)
* Fixes #2497 - Normalizes path for windows developers. [Pull #2529](https://github.com/webcompat/webcompat.com/pull/2529)
* Fixes #2526 - fixed filteringSort function [Pull #2527](https://github.com/webcompat/webcompat.com/pull/2527)
* Fixes #2517 - Fixes typo in SVG markup [Pull #2523](https://github.com/webcompat/webcompat.com/pull/2523)
* Fixes #2515 - Make tmp path if it doesn't already exist. [Pull #2516](https://github.com/webcompat/webcompat.com/pull/2516)
* Fixes #2506 - Extract autogrow feature from bugform and apply to comment [Pull #2513](https://github.com/webcompat/webcompat.com/pull/2513)
* Fixes #2375 - Wait a little longer before doing some things on Travis. [Pull #2504](https://github.com/webcompat/webcompat.com/pull/2504)
* Fixes #2267 - Document how to get the server working on Windows 10 [Pull #2503](https://github.com/webcompat/webcompat.com/pull/2503)
* Fixes #2501 - Make temporary logfile location platform independent. [Pull #2502](https://github.com/webcompat/webcompat.com/pull/2502)
* Fixes #2498 - Updated documentation for Windows users [Pull #2500](https://github.com/webcompat/webcompat.com/pull/2500)
* Fixes #2498 - Edited "Installing Project source code" for Windows [Pull #2499](https://github.com/webcompat/webcompat.com/pull/2499)
* Fixes #2453 - Changes regex to fix progressive label filtering [Pull #2496](https://github.com/webcompat/webcompat.com/pull/2496)
* Fixes #2493 - Update some npm deps. [Pull #2495](https://github.com/webcompat/webcompat.com/pull/2495)
* Fixes #2375 - Investigate intermittent Travis failures. [Pull #2492](https://github.com/webcompat/webcompat.com/pull/2492)


## 12.0.0 - 2018-06-08

* Fixes #2490 - inversed name of buttons [Pull #2491](https://github.com/webcompat/webcompat.com/pull/2491)
* Fixes #2487 - webcompat site: tweak/remove aria-label in footer links, make search form in top nav only focusable when visible [Pull #2489](https://github.com/webcompat/webcompat.com/pull/2489)
* Fixes #2484 - Fix typo in footer SVG markup [Pull #2486](https://github.com/webcompat/webcompat.com/pull/2486)
* Fixes #2465 - Upgrades Flask to 1.0.2 [Pull #2485](https://github.com/webcompat/webcompat.com/pull/2485)

## 11.0.2 - 2018-06-06

* Fixes #2483 - Markup fixes (SVG alternatives, invalid code, unnecessary `role="button"`, account dropdown trigger) [Pull #2484](https://github.com/webcompat/webcompat.com/pull/2484)
* Fixes #2474 - Properly send along the submit_type to the server. [Pull #2477](https://github.com/webcompat/webcompat.com/pull/2477)
* Fixes #2409 - Don't pre-fill forms for "self reports" (webcompat.com) [Pull #2439](https://github.com/webcompat/webcompat.com/pull/2439)


## 11.0.1 - 2018-06-01 (known broken, don't deploy)

* No issue. Add env/ to files to be ignored during deploy.

## 11.0.0 - 2018-06-01 (known broken, don't deploy)

* Fixes #2475 - Fixes the lack of python 2.7 dependency in npm run setup [Pull #2476](https://github.com/webcompat/webcompat.com/pull/2476)
* Fixes #2464 - Allow notification-bar to expand in height, if necessary [Pull #2469](https://github.com/webcompat/webcompat.com/pull/2469)
* Fixes #2466 - Fix broken links to contribution guidelines [Pull #2467](https://github.com/webcompat/webcompat.com/pull/2467)
* Fixes #2445 - Re-enables logging capabilities and initialization message [Pull #2462](https://github.com/webcompat/webcompat.com/pull/2462)
* Fixes #2460 - Add pull request template [Pull #2461](https://github.com/webcompat/webcompat.com/pull/2461)
* Fixes #2459 - Add .prettierrc [Pull #2458](https://github.com/webcompat/webcompat.com/pull/2458)
* Fixes #2441 - max-width of images in issue comments to 100% [Pull #2448](https://github.com/webcompat/webcompat.com/pull/2448)
* Fixes #2437 - Upgrades python ua-parser version to 0.8 [Pull #2444](https://github.com/webcompat/webcompat.com/pull/2444)
* Fixes #2422 - Add autogrow to bugform steps to reproduce field [Pull #2442](https://github.com/webcompat/webcompat.com/pull/2442)
* Fixes #2421 - Consolidate usage of js-loader [Pull #2438](https://github.com/webcompat/webcompat.com/pull/2438)
* Fixes #2434 - Add `type-tracking-protection-{basic,strict}` to EXTRA_LABELS [Pull #2436](https://github.com/webcompat/webcompat.com/pull/2436)
* Fixes #2431 - Adds changelog title normalization. [Pull #2433](https://github.com/webcompat/webcompat.com/pull/2433)
* Fixes #2430 - Make {LINE,LOG}_TEMPLATE unicode literals. [Pull #2432](https://github.com/webcompat/webcompat.com/pull/2432)
* Fixes #2288 - Refactor how we do form submission [Pull #2419](https://github.com/webcompat/webcompat.com/pull/2419)

## 10.0.0 - 2018-04-27

* Fixes #2420 - Adds tolerance on milestones initialization [Pull #2426](https://github.com/webcompat/webcompat.com/pull/2426)
* Fixes #2424 - Forbids unauthorized and unauthenticated access on /file [Pull #2425](https://github.com/webcompat/webcompat.com/pull/2425)
* Fixes #2346 - Update eslint and prettier packages. Format JS files [Pull #2423](https://github.com/webcompat/webcompat.com/pull/2423)
* Fixes #2390. Update privacy policy to include GA data retention settings. [Pull #2418](https://github.com/webcompat/webcompat.com/pull/2418)
* Fixes #2404. Cleanup bind usage in bugform.js [Pull #2415](https://github.com/webcompat/webcompat.com/pull/2415)
* Fixes #2411 - Adds Failsafe check for differences in between config and milestones [Pull #2412](https://github.com/webcompat/webcompat.com/pull/2412)

## 9.0.5 - 2018-04-19

* Fixes #2408 - Allow additional safe HTML tags in sanitized markdown [Pull #2410](https://github.com/webcompat/webcompat.com/pull/2410)
* Fixes #2406. Fix KeyError when building details template. [Pull #2407](https://github.com/webcompat/webcompat.com/pull/2407)
* Fixes #2404 - Prevent upscaling of images in issue comments [Pull #2405](https://github.com/webcompat/webcompat.com/pull/2405)
* Fixes #2298 - Remove code dealing with non existant element wc-Form-helpInline [Pull #2403](https://github.com/webcompat/webcompat.com/pull/2403)
* Fixes #2307 - Specific line-height for text-field [Pull #2402](https://github.com/webcompat/webcompat.com/pull/2402)
* Issue #2399 - Add focus styles to upload area [Pull #2400](https://github.com/webcompat/webcompat.com/pull/2400)
* Fixes #1794 - Prevent submit by enter in bugform [Pull #2398](https://github.com/webcompat/webcompat.com/pull/2398)
* Fixes #2396 - Move ga.js to dist folder [Pull #2397](https://github.com/webcompat/webcompat.com/pull/2397)
* Fixes #2042: Send details params content via a hidden input. [Pull #2395](https://github.com/webcompat/webcompat.com/pull/2395)


## 9.0.4 - 2018-04-16

* Fixes #1834 - Move all generated JS files to js/dist [Pull #2394](https://github.com/webcompat/webcompat.com/pull/2394)
* Fixes #2388 - Simplify border definition on active sub nav item [Pull #2392](https://github.com/webcompat/webcompat.com/pull/2392)
* Fixes #2342 - Consolidate submit event handler for issue list search form [Pull #2389](https://github.com/webcompat/webcompat.com/pull/2389)
* Fixes #2337: Refactor contributor routes for simpler nav/sub-nav templates. [Pull #2387](https://github.com/webcompat/webcompat.com/pull/2387)
* Fixes #2375. Add some diagnostic logging for checkServer [Pull #2385](https://github.com/webcompat/webcompat.com/pull/2385)

## 9.0.3 - 2018-04-11

* Fixes #2352. Add TravisBuddy integration [Pull #2386](https://github.com/webcompat/webcompat.com/pull/2386)
* Fixes #2383. Use a staging-specific log file. [Pull #2384](https://github.com/webcompat/webcompat.com/pull/2384)
* Fixes #2378 - add regaddi to contributors [Pull #2379](https://github.com/webcompat/webcompat.com/pull/2379)
* Issue #2376 - add Swarnava [Pull #2377](https://github.com/webcompat/webcompat.com/pull/2377)
* Fixes #2367 - Removed explicit hero button width [Pull #2373](https://github.com/webcompat/webcompat.com/pull/2373)
* Fixes #2368 - Add defined color to pagination buttons [Pull #2371](https://github.com/webcompat/webcompat.com/pull/2371)
* Fixes #2369 - Fixes the Issue URL in changelog tool [Pull #2370](https://github.com/webcompat/webcompat.com/pull/2370)


## 9.0.2 - 2018-04-05

* Fixes #2360 - Add blockquote styles [Pull #2366](https://github.com/repos/webcompat/webcompat.com/issues/2366)
* Fixes #2225 - Add stylelint-order. Fix ordering in CSS src files [Pull #2365](https://github.com/repos/webcompat/webcompat.com/issues/2365)
* Issue #2303. Add some styling to login + keyboard hints. [Pull #2363](https://github.com/repos/webcompat/webcompat.com/issues/2363)
* Issue #2271. Use a regular expression to get image upload data URI. [Pull #2362](https://github.com/repos/webcompat/webcompat.com/issues/2362)
* Fixes #2358 - Inline code multiline wrap on issue template [Pull #2361](https://github.com/repos/webcompat/webcompat.com/issues/2361)
* fixes #2356 - fixed result when older < needsinfo [Pull #2357](https://github.com/repos/webcompat/webcompat.com/issues/2357)
* Fixes #2300. Try to respect DNT preference before talking to GA. [Pull #2353](https://github.com/repos/webcompat/webcompat.com/issues/2353)

## 9.0.1 - 2018-03-30

* Issue #2347 - Break anchor links in issue description and comments [Pull #2349](https://github.com/repos/webcompat/webcompat.com/issues/2349)
* Issue #2344. Switch to @mozilla account GA tracking ID. [Pull #2345](https://github.com/repos/webcompat/webcompat.com/issues/2345)
* Fixes #2339 - Changes the wrong needinfo to needsinfo for Triage dashboard [Pull #2343](https://github.com/repos/webcompat/webcompat.com/issues/2343)


## 9.0.0 - 2018-03-28

* No issue - clean up design + markup, add new content [Comparison](https://github.com/webcompat/webcompat.com/compare/406bd2091e28c72a6ba6433865470af07cdc41b9...refactor)

## 8.1.2 - 2018-03-28

* Fixes #2215 - Tweaks needinfo filtering and design [Pull #2290](https://github.com/repos/webcompat/webcompat.com/issues/2290)
* Fixes issue #2203 UnboundLocalError on milestones_content [Pull #2221](https://github.com/repos/webcompat/webcompat.com/issues/2221)
* Refactor isReportableURL function [Pull #2220](https://github.com/repos/webcompat/webcompat.com/issues/2220)
* Fixes #2193: Add support for --grep when running intern tests. [Pull #2194](https://github.com/repos/webcompat/webcompat.com/issues/2194)
* Fixes #740 - Adds tool to create changelog. [Pull #2105](https://github.com/repos/webcompat/webcompat.com/issues/2105)

## 8.1.1 - 2018-02-27

* Fix #2032 - Adds icons for filtering on issue age and needinfo [Pull #2190](https://github.com/repos/webcompat/webcompat.com/issues/2190)
* Fixes #2188. Handle legacy details param data. [Pull #2189](https://github.com/repos/webcompat/webcompat.com/issues/2189)
* Fixed #2097 - twitter icon url modified [Pull #2185](https://github.com/repos/webcompat/webcompat.com/issues/2185)
* Fixes #1585. Add a method to define img-src CSP policy directive. [Pull #2046](https://github.com/repos/webcompat/webcompat.com/issues/2046)
* Fixes #2033 - Added mode view [Pull #2045](https://github.com/repos/webcompat/webcompat.com/issues/2045)

## 8.1.0 - 20181-01-30

* Handle incoming details as JSON object [Pull #2040](https://github.com/webcompat/webcompat.com/pull/2044)
* Handle a single details param as JSON encoded data [Pull #2041](https://github.com/webcompat/webcompat.com/pull/2041)

## 8.0.0 - 2018-01-12

* Upgrade to Intern 4 [Pull #1987](https://github.com/webcompat/webcompat.com/pull/1987)
* Change style if untriaged issues > 50 [Pull #2016](https://github.com/webcompat/webcompat.com/pull/2016)
* Update topsites.py for IAM user credential [Pull #2021](https://github.com/webcompat/webcompat.com/pull/2021)

## 7.1.2 - 2018-01-12

*Revert #2003 [Pull #2022](https://github.com/webcompat/webcompat.com/pull/2022)

## 7.1.1 - 2018-01-12 (not deployed)

* Append extra labels in correct format [Pull #2020](https://github.com/webcompat/webcompat.com/pull/2020)
* Prevent form submission when pressing enter [Pull #2003](https://github.com/webcompat/webcompat.com/pull/2003)

## 7.1.0 - 2018-01-10

* Make tweaks to get tests passing on master [Pull 2014](https://github.com/webcompat/webcompat.com/pull/2014)
* Add support for multiple label and details params [Pull #2007](https://github.com/webcompat/webcompat.com/pull/2007)
* Updates to build docs [Pull #2005](https://github.com/webcompat/webcompat.com/pull/2005)
* Updates to contribute docs [Pull #2002](https://github.com/webcompat/webcompat.com/pull/2002)
* Handle double schemes in URL [Pull #2001](https://github.com/webcompat/webcompat.com/pull/2001)
* Add proper unicode handling for form data [Pull #1998](https://github.com/webcompat/webcompat.com/pull/1998)
* Add templates watching Grunt task [Pull #1994](https://github.com/webcompat/webcompat.com/pull/1994)
* Add normalization of metadata values [Pull #1974](https://github.com/webcompat/webcompat.com/pull/1974)

## 7.0.2 - 2017-12-07

* Remove dead code from rate_limit [Pull #1970](https://github.com/webcompat/webcompat.com/pull/1970)
* Add type-webrender-enabled to EXTRA_LABELS list [Pull #1962](https://github.com/webcompat/webcompat.com/pull/1962)
* Fix browser filtering for triage dashboard [Pull #1961](https://github.com/webcompat/webcompat.com/pull/1961)
* Remove redundant test for details param [Pull #1956](https://github.com/webcompat/webcompat.com/pull/1956)

## 7.0.1 - 2017-12-04

* Fix a major webhook issue [Pull #1953](https://github.com/webcompat/webcompat.com/pull/1953)

## 7.0.0 - 2017-11-30

* Add a NeedsTriage Issues Dashboard [Pull #1947](https://github.com/webcompat/webcompat.com/pull/1947)
* Add "extra labels" in new issue webhook [Pull #1944](https://github.com/webcompat/webcompat.com/pull/1944)
* Handle when data/milestones.json doesn't exist [Pull #1878](https://github.com/webcompat/webcompat.com/pull/1878)
* Update dev-env-setup docs [Pull #1874](https://github.com/webcompat/webcompat.com/pull/1874)
* Remove css-fixme [Pull #1869](https://github.com/webcompat/webcompat.com/pull/1869)

## 6.0.3 - 2017-11-07

* Add styles for milestone on issue list [Pull #1855](https://github.com/webcompat/webcompat.com/pull/1855)

## 6.0.2 - 2017-11-01

* Add milestone for new issues via our new issue webhook [Pull #1854](https://github.com/webcompat/webcompat.com/pull/1854)

## 6.0.1 - 2017-10-31

### Halloween disappearing issue bugfix edition 🎃👻

* Render an issue even if milestone failed to get set. [Pull #1853](https://github.com/webcompat/webcompat.com/pull/1853)

## 6.0.0 - 2017-10-30

* Use Milestones for issue status [Pull #1841](https://github.com/webcompat/webcompat.com/pull/1841)

## 5.7.4 - 2017-10-23

* Clarify textarea in bugform with a placeholder and a new label [Pull #1843](https://github.com/webcompat/webcompat.com/pull/1843)
* If no existing topsites.db, no archive [Pull #1815](https://github.com/webcompat/webcompat.com/pull/1815)

## 5.7.3 - 2017-09-11

* Change application `SECRET_KEY` to force-evict sessions. [Pull #1818](https://github.com/webcompat/webcompat.com/issues/1818)
* Fixes bogus test for webhook [Pull #1814](https://github.com/webcompat/webcompat.com/pull/1814)

## 5.7.2 - 2017-09-08

* Fixes the issue with unicode translate [Pull #1812](https://github.com/webcompat/webcompat.com/pull/1812)

## 5.7.1 - 2017-09-08

* Fix pep8 whitespace errors. No issue.

## 5.7.0 - 2017-09-08 (not deployed)

* Warns user and aborts tests if server isn't right or if it's not in test mode [Pull #1743](https://github.com/webcompat/webcompat.com/pull/1743)
* Remove all Browserstack related content from website and repo [Pull #1741](https://github.com/webcompat/webcompat.com/pull/1741)
* Remove templates.js [Pull #1739](https://github.com/webcompat/webcompat.com/pull/1739)
* Un-skip Reporting (non-auth) tests [Pull #1728](https://github.com/webcompat/webcompat.com/pull/1728)
* Removes the GitHub link from issues list [Pull #1735](https://github.com/webcompat/webcompat.com/pull/1735)
* Adds test for activity page [Pull #1727](https://github.com/webcompat/webcompat.com/pull/1727)
* Adds a data/ path logic to the code [Pull #1725](https://github.com/webcompat/webcompat.com/pull/1725)
* Removes npm i -g grunt-cli from travis.yml [Pull #1724](https://github.com/webcompat/webcompat.com/pull/1724)
* Removes references to autoExpand in issues.js and bugform.js [Pull #1723](https://github.com/webcompat/webcompat.com/pull/1723)
* change urlparse to urlsplit [Pull #1722](https://github.com/webcompat/webcompat.com/pull/1722)
* Removes unused issues.db from the code [Pull #1720](https://github.com/webcompat/webcompat.com/pull/1720)
* Ensure change event fires when same image is selected [Pull #1718](https://github.com/webcompat/webcompat.com/pull/1718)
* Give Report Anonymously button a gray border [Pull #1713](https://github.com/webcompat/webcompat.com/pull/1713)
* Alexa webhook for priority label [Pull #1615](https://github.com/webcompat/webcompat.com/pull/1615)

## 5.6.0 - 2017-08-14

* Remove form textarea boilerplate text. [Pull #1712](https://github.com/webcompat/webcompat.com/pull/1712)
* Get tests to work from forks [Pull #1710](https://github.com/webcompat/webcompat.com/pull/1710)
* Change default-src policy to self and set object-src to none [Pull #1703](https://github.com/webcompat/webcompat.com/pull/1703)
* Unbreak Save & close label editor button. [Pull #1698](https://github.com/webcompat/webcompat.com/pull/1698)
* Get all unittests to be network independent. [Pull #1697](https://github.com/webcompat/webcompat.com/pull/1697)

## 5.5.1 - 2017-08-08

* Fix Save and Close label editor regression [Pull #1698](https://github.com/webcompat/webcompat.com/pull/1698)

## 5.5.0 - 2017-08-01

* Add npm script for firing up test server [Pull #1692](https://github.com/webcompat/webcompat.com/pull/1692)
* Check if response is defined [Pull #1691](https://github.com/webcompat/webcompat.com/pull/1691)
* Handle non-keyboard event invocations of closeEditor [Pull #1689](https://github.com/webcompat/webcompat.com/pull/1689)
* Upgrade npm dependencies [Pull #1687](https://github.com/webcompat/webcompat.com/pull/1687)
* Link to Code of Conduct [Pull #1684](https://github.com/webcompat/webcompat.com/pull/1684)
* Remove unsafe-eval directive from our CSP policy [Pull #1682](https://github.com/webcompat/webcompat.com/pull/1682)
* Improves the webhook code flexibility [Pull #1681](https://github.com/webcompat/webcompat.com/pull/1681)

## 5.4.1 - 2017-07-26

* Update EXTRA_LABELS whitelist w/ type-stylo [Pull #1676](https://github.com/webcompat/webcompat.com/pull/1676)
* Gets tests to with Chrome as well as Firefox. Travis and Local [Pull #1671](https://github.com/webcompat/webcompat.com/pull/1671)
* Disallow inline scripts via CSP [Pull #1667](https://github.com/webcompat/webcompat.com/pull/1667)
* Add a Code of Conduct [Pull #1660](https://github.com/webcompat/webcompat.com/pull/1660)
* handle multiple image drops [Pull #1634](https://github.com/webcompat/webcompat.com/pull/1634)
* Add keyboard navigation to label editor [Pull #1541](https://github.com/webcompat/webcompat.com/pull/1541)

## 5.4.0 - 2017-07-18

* Fix wrong years in CHANGELOG [Pull #1663](https://github.com/webcompat/webcompat.com/pull/1663)
* Add `npm test`to package.json[Pull #1657](https://github.com/webcompat/webcompat.com/pull/1657)
* Add newline to STR in reported form[Pull #1653](https://github.com/webcompat/webcompat.com/pull/1653)
* Change order of metadata in reported form [Pull #1652](https://github.com/webcompat/webcompat.com/pull/1652)
* Don't upload image until form submission [Pull #1645](https://github.com/webcompat/webcompat.com/pull/1645)
* Description placeholder update [Pull #1639](https://github.com/webcompat/webcompat.com/pull/1639)

## 5.3.1 - 2017-07-11

* Add tests for form.py [Pull #1644](https://github.com/webcompat/webcompat.com/pull/1644)
* Update description placeholder [Pull #1639](https://github.com/webcompat/webcompat.com/pull/1639)
* Update regex and target field for text url removal [Pull #1632](https://github.com/webcompat/webcompat.com/pull/1632)
* Add coco.fr to abuse list >:| [Pull #1628](https://github.com/webcompat/webcompat.com/pull/1628)

## 5.3.0 - 2017-07-07

* Change to validation logic for form description [Pull #1633](https://github.com/webcompat/webcompat.com/pull/1633)
* Fix "going back in history" test [Pull #1626](https://github.com/webcompat/webcompat.com/pull/1626)
* Get functional tests to work offline [Pull #1625](https://github.com/webcompat/webcompat.com/pull/1625)
* Staging docs update [Pull #1624](https://github.com/webcompat/webcompat.com/pull/1624)
* Add priority labels for ranking [Pull #1612](https://github.com/webcompat/webcompat.com/pull/1612)
* Add script to populate a database with Alexa top info [Pull #1591](https://github.com/webcompat/webcompat.com/pull/1591)
* Add pagination below issue list [Pull #1589](https://github.com/webcompat/webcompat.com/pull/1589)
* New form redesign [Pull #1578](https://github.com/webcompat/webcompat.com/pull/1578)

## 5.2.2 - 2017-06-23

* Check form validation in image upload success handler [Pull #1614](https://github.com/webcompat/webcompat.com/pull/1614)
* Fix padding issue in Markdown[Pull #1606](https://github.com/webcompat/webcompat.com/pull/1606)
* Updates CONTRIBUTING.md tests section for mock login [Pull #1604](https://github.com/webcompat/webcompat.com/pull/1604)

## 5.2.1 - 2017-06-20

* Ensure label editor button can receive click events [Pull #1602](https://github.com/webcompat/webcompat.com/pull/1602)

## 5.2.0 - 2017-06-20

(Not deployed, caused a regression. v5.2.1 is the good release)

* Add CSS linter [Pull #1509](https://github.com/webcompat/webcompat.com/pull/1509)
* Add pre-commit linter [Pull #1538](https://github.com/webcompat/webcompat.com/pull/1538)
* Fix broke code layout in issue page [Pull #1583](https://github.com/webcompat/webcompat.com/pull/1583)
* Get mock GitHub login working [Pull #1588](https://github.com/webcompat/webcompat.com/pull/1588)
* Remove test_login unit test (obsolete now) [Pull #1598](https://github.com/webcompat/webcompat.com/pull/1598)
* Remove unused query-params.js file [Pull #1599](https://github.com/webcompat/webcompat.com/pull/1599)

## 5.1.0 - 2017-05-24

* Prevent overflow in code elements in issue description [Pull #1568](https://github.com/webcompat/webcompat.com/pull/1568)
* Improves webhooks to send labels at once [Pull #1566](https://github.com/webcompat/webcompat.com/pull/1566)
* Enable CSP header [Pull #1563](https://github.com/webcompat/webcompat.com/pull/1563)
* Adds thumbnails to image upload and link them [Pull #1557](https://github.com/webcompat/webcompat.com/pull/1557)
* Fixes length and quote style issues [Pull #1500](https://github.com/webcompat/webcompat.com/pull/1500)

## 5.0.0 - 2017-05-12

* Fix regression that prevents closing or re-opening an issue. [Pull #1561](https://github.com/webcompat/webcompat.com/pull/1561)
* Restrict comments and constrain the closing of issue (updates to issues and edit API endpoints)[Pull #1559](https://github.com/webcompat/webcompat.com/pull/1559)
* Handles crash scenario (500) and validation of the form [Pull #1556](https://github.com/webcompat/webcompat.com/pull/1556)
* Removes dead code and method [Pull #1555](https://github.com/webcompat/webcompat.com/pull/1555)
* Fixes length and quote style issues [Pull #1500](https://github.com/webcompat/webcompat.com/pull/1500)

## 4.0.3 - 2017-05-08

* Add GitHub API to CSP connect-src [Pull #1550](https://github.com/webcompat/webcompat.com/pull/1550)
* Fix UTF-8 decoding error [Pull #1545](https://github.com/webcompat/webcompat.com/pull/1545)
* Split up CONTRIBUTING.md into multiple files [Pull #1532](https://github.com/webcompat/webcompat.com/pull/1532)
* Remove main dropdown from issues page [Pull #1531](https://github.com/webcompat/webcompat.com/pull/1531)
* Fix SVG overflow for small viewports [Pull #1511](https://github.com/webcompat/webcompat.com/pull/1511)

## 4.0.2 - 2017-04-25

* Fix a disappearing label gear [Pull #1525](https://github.com/webcompat/webcompat.com/pull/1525)
* Adds a list of files to ignore for deploy [Pull #1524](https://github.com/webcompat/webcompat.com/pull/1524)

## 4.0.1 - 2017-04-24

* Fixed encoding param bugs [Pull #1518](https://github.com/webcompat/webcompat.com/pull/1518)
* Unified code for UA string version parsing [Pull #1504](https://github.com/webcompat/webcompat.com/pull/1504)


## 4.0.0 - 2017-04-17

* Fix double "thanks" flash message [Pull #1514](https://github.com/webcompat/webcompat.com/pull/1514)
* Update Grunt-related deps [Pull #1513](https://github.com/webcompat/webcompat.com/pull/1513)
* Upgrade Prettier to 1.0 [Pull #1507](https://github.com/webcompat/webcompat.com/pull/1507)
* Remove Safari Addon link [Pull #1503](https://github.com/webcompat/webcompat.com/pull/1503)
* Docs update [Pull #1484](https://github.com/webcompat/webcompat.com/pull/1484)
* Provide a param to assign a label to a new issue [Pull #1453](https://github.com/webcompat/webcompat.com/pull/1453)

## 3.2.1 - 2017-04-11

* Fix template typo [Pull #1498](https://github.com/webcompat/webcompat.com/pull/1498)
* replaced 'or' with 'and' in MQ for Aside position [Pull #1495](https://github.com/webcompat/webcompat.com/pull/1495)
* removed missing backend-install script call  [Pull #1494](https://github.com/webcompat/webcompat.com/pull/1494)
* removed side effect when button is active [Pull #1492](https://github.com/webcompat/webcompat.com/pull/1492)
* Handle x-www-form-urlencoded spaces in details param [Pull #1486](https://github.com/webcompat/webcompat.com/pull/1486)
* Add functional tests for when typing 'g' or 'l' in an issue or issue comment [Pull #1481](https://github.com/webcompat/webcompat.com/pull/1481)

## 3.2.0 - 2017-04-07

* Rename labelWarp method [Pull #1487](https://github.com/webcompat/webcompat.com/pull/1487)
* Update CSP policy (round 3) [Pull #1479](https://github.com/webcompat/webcompat.com/pull/1479)
* Add auto-expanding feature for textarea [Pull #1476](https://github.com/webcompat/webcompat.com/pull/1476)
* Add grunt lint task for travis [Pull #1472](https://github.com/webcompat/webcompat.com/pull/1472)
* Add prettier [Pull #1468](https://github.com/webcompat/webcompat.com/pull/1468)
* Change GA to alternative tracking snippet [Pull #1467](https://github.com/webcompat/webcompat.com/pull/1467)
* Add grunt build to npm prestart [Pull #1461](https://github.com/webcompat/webcompat.com/pull/1461)
* Move label editor to right column on issues page [Pull #1389](https://github.com/webcompat/webcompat.com/pull/1389)

## 3.1.7 - 2017-03-30

* Prevent shortcuts firing in textarea [Pull #1464](https://github.com/webcompat/webcompat.com/pull/1464)
* makes /rate_limit route send 410 Gone [Pull #1463](https://github.com/webcompat/webcompat.com/pull/1463)
* added grunt build as prestart script [Pull #1461](https://github.com/webcompat/webcompat.com/pull/1461)

## 3.1.6 - 2017-03-29

* Make form.get_metadata string concatenation more idiomatic [Pull #1460](https://github.com/webcompat/webcompat.com/pull/1460)
* Prevent shortcut to open when typing comment [Pull #1459](https://github.com/webcompat/webcompat.com/pull/1459)
* Fixed broken contribute link on all issues page [Pull #1458](https://github.com/webcompat/webcompat.com/pull/1458)

## 3.1.5 - 2017-03-28

* Fix contribute button link. No issue.

## 3.1.4 - 2017-03-28

* New title + link text [Pull #1447](https://github.com/webcompat/webcompat.com/pull/1447)
* bugform.js cleanup [Pull #1435](https://github.com/webcompat/webcompat.com/pull/1435)
* Add support for ctrl+enter for adding comments [Pull #1431](https://github.com/webcompat/webcompat.com/pull/1431)
* Adjust CONTRIBUTING.md markdown format [Pull #1429](https://github.com/webcompat/webcompat.com/pull/1429)
* Update join the team section [Pull #1426](https://github.com/webcompat/webcompat.com/pull/1426)
* Update usage of Flask-Limiter [Pull #1424](https://github.com/webcompat/webcompat.com/pull/1424)
* Add title to (many!) pages [Pull #1419](https://github.com/webcompat/webcompat.com/pull/1419)
* Implement a caching policy for HTML resources [Pull #1415](https://github.com/webcompat/webcompat.com/pull/1415)
* Add functional tests for file upload screenshots [Pull #1411](https://github.com/webcompat/webcompat.com/pull/1411)
* Add docstrings to upload tests [Pull #1392](https://github.com/webcompat/webcompat.com/pull/1392)

## 3.1.3 - 2017-03-09

* Tweak CSP Policy [Pull #1410](https://github.com/webcompat/webcompat.com/pull/1410)
* Clarify steps to reach Github issues [Pull #1407](https://github.com/webcompat/webcompat.com/pull/1407)
* Add missing description to package.json [Pull #1400](https://github.com/webcompat/webcompat.com/pull/1400)
* Change Twitter link to include replies [Pull #1399](https://github.com/webcompat/webcompat.com/pull/1399)
* Add docstrings to some form tests [Pull #1397](https://github.com/webcompat/webcompat.com/pull/1397)
* Add alternative shell command to activate virtualenv [Pull #1395](https://github.com/webcompat/webcompat.com/pull/1395)
* Add docstrings to some upload tests [Pull #1392](https://github.com/webcompat/webcompat.com/pull/1392)

## 3.1.2 - 2017-03-03

* Revert "Issue #609 - Implement Cache-Policy decorator" (it regressed logins) [Pull #1387](https://github.com/webcompat/webcompat.com/pull/1387)
* Only print expected fixture file path when we can't find it [Pull #1382](https://github.com/webcompat/webcompat.com/pull/1382)
* Add a details param to put info in description textarea [Pull #1329](https://github.com/webcompat/webcompat.com/pull/1379)
* CONTRIBUTING Guidelines cleanup [Pull #1351](https://github.com/webcompat/webcompat.com/pull/1351)

## 3.1.1 - 2017-03-01

* Add missing semicolon to Strict-Transport-Security header. No issue.

## 3.1.0 - 2017-03-01

* Implment better HTTP caching for HTML routes [Pull #1335](https://github.com/webcompat/webcompat.com/pull/1335)
* Add support for a problem_type param to preselect type in form [Pull #1362](https://github.com/webcompat/webcompat.com/pull/1362)
* Tweaks to linting JS paths [Pull #1365](https://github.com/webcompat/webcompat.com/pull/1365)
* Add an npm lint & fix command [Pull #1366](https://github.com/webcompat/webcompat.com/pull/1366)
* Add CSP-Report-Only endpoint, and move security headers into app [Pull #1367](https://github.com/webcompat/webcompat.com/pull/1367)
* Change Twitter link in footer [Pull #1371](https://github.com/webcompat/webcompat.com/pull/1373)

## 3.0.0 - 2017-02-27

Note: from now on, versioning will work in the following way:

1) Bug fixes, docs updates, etc.: affect patch number
2) New features: affect minor number
3) API endpoint changes or dependency version updates: affect major number


* Switch to double quotes for JS [Pull #1361](https://github.com/webcompat/webcompat.com/pull/1361)
* Change login message alignment [Pull #1355](https://github.com/webcompat/webcompat.com/pull/1355)
* Add some badges to README [Pull #1354](https://github.com/webcompat/webcompat.com/pull/1354)
* Remove cursor: pointer from form. [Pull #1350](https://github.com/webcompat/webcompat.com/pull/1350)
* Bump NPM deps [Pull #1349](https://github.com/webcompat/webcompat.com/pull/1349)
* Docs update around Java versions [Pull #1348](https://github.com/webcompat/webcompat.com/pull/1348)
* Make dark Report Bug button [Pull #1341](https://github.com/webcompat/webcompat.com/pull/1341)
* Add site:domain.com search [Pull #1340](https://github.com/webcompat/webcompat.com/pull/1340)

## 2.11.0 - 2017-02-10

* Remove support for X-Reported-With header [Pull #1334](https://github.com/webcompat/webcompat.com/pull/1334) [Issue #1254](https://github.com/webcompat/webcompat.com/issues/1254)
* Update privacy policy around report logging and deletion [Pull #1333](https://github.com/webcompat/webcompat.com/pull/1333) [Issue #705](https://github.com/webcompat/webcompat.com/issues/705)
* Add padding to wc-Link class [Pull #1331](https://github.com/webcompat/webcompat.com/pull/1331) [Issue #1155](https://github.com/webcompat/webcompat.com/issues/1155)
* Add more padding around form, for certain viewport widths [Pull #1330](https://github.com/webcompat/webcompat.com/pull/1330) [](https://github.com/webcompat/webcompat.com/issues/1243)
* Change report bug link to new issues endpoint [Pull #1323](https://github.com/webcompat/webcompat.com/pull/1323) [Issue #1290](https://github.com/webcompat/webcompat.com/issues/1290)
* Rename `init` command to `setup`; make sure virtualenv is activated before installing pip packages, [Pull #1322](https://github.com/webcompat/webcompat.com/pull/1322) [Issue #1317](https://github.com/webcompat/webcompat.com/issues/1317)

## 2.10.0 - 2017-02-02

* handful of typo fixes (docs, copy, templates) [Pull #1326](https://github.com/webcompat/webcompat.com/pull/1326) [Pull #1326](https://github.com/webcompat/webcompat.com/pull/1325) [Pull #1315](https://github.com/webcompat/webcompat.com/pull/1315) [Pull #1321](https://github.com/webcompat/webcompat.com/pull/1321) [Pull #1302](https://github.com/webcompat/webcompat.com/pull/1302)
* Add secure flag to session cookie [Pull #1313](https://github.com/webcompat/webcompat.com/pull/1313) [Issue #1312](https://github.com/webcompat/webcompat.com/issues/1312)
* Upgrade Python modules [Pull #1307](https://github.com/webcompat/webcompat.com/pull/1307) [Issue #1304](https://github.com/webcompat/webcompat.com/issues/1304)
* Correctly handle missing BACKUP_DEFAULT_DEST [Issue #1294](https://github.com/webcompat/webcompat.com/issues/1294) [Issue #1291](https://github.com/webcompat/webcompat.com/pull/1291)
* Print message if there's nothing to back up [Pull #1291](https://github.com/webcompat/webcompat.com/pull/1291) [Issue #1161](https://github.com/webcompat/webcompat.com/issues/1161)
* Update Intern to v3.4 (and fix tests accordingly) [Pull #1277](https://github.com/webcompat/webcompat.com/pull/1277) [Issue #982](https://github.com/webcompat/webcompat.com/issues/982)
* Fix long URL overflow on issues page [Pull #1275](https://github.com/webcompat/webcompat.com/pull/1275) [](https://github.com/webcompat/webcompat.com/issues/1264)
* Improvements to comment form and image uploads [Pull #1265](https://github.com/webcompat/webcompat.com/pull/1265) [Issue #1261](https://github.com/webcompat/webcompat.com/issues/1261)


## 2.9.4 - 2017-01-11

* Redirect to issue page after bug creation. [Pull #1273](https://github.com/webcompat/webcompat.com/pull/1273) [Issue #1262](https://github.com/webcompat/webcompat.com/issues/1262)
* Wrap really long URL links. [Pull #1275](https://github.com/webcompat/webcompat.com/pull/1275) [Issue #1264](https://github.com/webcompat/webcompat.com/issues/1264)

## 2.9.3 - 2017-01-06

* support a src param to track "reported-with" avenues [Issue #1249](https://github.com/webcompat/webcompat.com/pull/1249)
* Handle blobs in addition to data URIs in bugform.js [Pull #1253](https://github.com/webcompat/webcompat.com/pull/1253) [Issue #1248](https://github.com/webcompat/webcompat.com/issues/1248)

## 2.9.2 - 2016-12-22

* Kill thanks page [Pull #1247](https://github.com/webcompat/webcompat.com/pull/1247) [Issue #646](https://github.com/webcompat/webcompat.com/issues/646)
* Add header closed class for issues page [Pull #1246](https://github.com/webcompat/webcompat.com/pull/1246) [Issue #1245](https://github.com/webcompat/webcompat.com/issues/1245)
* Remove QR code related code [Pull #1242](https://github.com/webcompat/webcompat.com/pull/1242) [](https://github.com/webcompat/webcompat.com/issues/1239)
* Restrict textarea resize to vertical [Pull #1241](https://github.com/webcompat/webcompat.com/pull/1241) [](https://github.com/webcompat/webcompat.com/issues/1230)

## 2.9.1 - 2016-12-13

* Add cityweb.de to spamlist [Pull #1238](https://github.com/webcompat/webcompat.com/pull/1238) [Issue #1237](https://github.com/webcompat/webcompat.com/issues/1237)
* Test failure fixes [Issue #1236](https://github.com/webcompat/webcompat.com/issues/1236) (no PR)
* Minor layout tweaks [Issue #1235](https://github.com/webcompat/webcompat.com/issues/1235) (no PR)

## 2.9.0 - 2016-12-09 (not deployed due to bugs in issues page re-design)

* Display absolute date for dates more than 1 week old [Pull #1224](https://github.com/webcompat/webcompat.com/pull/1224) [Issue #1154](https://github.com/webcompat/webcompat.com/issues/1154)
* Improve issues page design [Pull #1104](https://github.com/webcompat/webcompat.com/pull/1104) [Issue #545](https://github.com/webcompat/webcompat.com/issues/545)

## 2.8.2 - 2016-11-15

* Un-break copyURL, oops! [Pull #1227](https://github.com/webcompat/webcompat.com/pull/1227) [Issue #1226](https://github.com/webcompat/webcompat.com/issues/1226)

## 2.8.1 - 2016-11-09

* Update humans.txt [Pull #1220](https://github.com/webcompat/webcompat.com/pull/1220) [Issue #1218](https://github.com/webcompat/webcompat.com/issues/1218)
* Use dot instead of paren in STR [Pull #1213](https://github.com/webcompat/webcompat.com/pull/1213) [Issue #1206](https://github.com/webcompat/webcompat.com/issues/1206)
* Don't allow non webby URLs to pass form validation [Pull #1208](https://github.com/webcompat/webcompat.com/pull/1208) [Issue #1054](https://github.com/webcompat/webcompat.com/issues/1054)
* Rename NewCollection to NeedsTriageCollection[Pull #1202](https://github.com/webcompat/webcompat.com/pull/1202) [Issue #1197](https://github.com/webcompat/webcompat.com/issues/1197)

## 2.8 - 2016-10-14

* Create an /issues/new view for reporting issues [Pull #1198](https://github.com/webcompat/webcompat.com/pull/1198) [Issue #1193](https://github.com/webcompat/webcompat.com/issues/1193)
* Add checkmark validation for os and browser names [Pull #1186](https://github.com/webcompat/webcompat.com/pull/1186) [Issue #1167](https://github.com/webcompat/webcompat.com/issues/1167)

## 2.7.3 - 2016-09-30

* Update Markdown-it [Pull #1184](https://github.com/webcompat/webcompat.com/pull/1184) [Issue #1183](https://github.com/webcompat/webcompat.com/issues/1183) [Issue #1148](https://github.com/webcompat/webcompat.com/issues/1148)
* Add hidden metadata to determine how people are reporting issues [Issue #255](https://github.com/webcompat/webcompat.com/issues/355) (no PR, because @miketaylr pushed straight to master... oops)

## 2.7.2.1 - 2016-09-27

* Update (failing) webhook test. Oops. (no issue)

## 2.7.2 - 2016-09-23

* Use secure webhooks (no issue)
* Link to invalid issues wiki from CONTRIBUTING [Pull #1180](https://github.com/webcompat/webcompat.com/pull/1180) [Issue #1175](https://github.com/webcompat/webcompat.com/issues/1175)
* Fix truncated text on contributors page [Pull #1173](https://github.com/webcompat/webcompat.com/pull/1173) [Issue #1004](https://github.com/webcompat/webcompat.com/issues/1004)
* Add class to hide add-on download link (for add-on users)[Pull #1170](https://github.com/webcompat/webcompat.com/pull/1170) [Issue #1169](https://github.com/webcompat/webcompat.com/issues/1169)
* (re-land) Display all comments for an issue [Pull #1147](https://github.com/webcompat/webcompat.com/pull/1147) [Issue #1058](https://github.com/webcompat/webcompat.com/issues/1058)

## 2.7.1 - 2016-07-27

* Adds block for qiangpiaoruanjian [Pull #1142](https://github.com/webcompat/webcompat.com/pull/1142) [Issue #1141](https://github.com/webcompat/webcompat.com/issues/1141)
* Render all comments (not just 30) [Pull #1119](https://github.com/webcompat/webcompat.com/pull/1119) [Issue #1058](https://github.com/webcompat/webcompat.com/issues/1058)
* Add missing fixture files [Pull #1129](https://github.com/webcompat/webcompat.com/pull/1129) [Issue #1123](https://github.com/webcompat/webcompat.com/pull/1123)
* Add 301 redirect for /new endpoint [Pull #1130](https://github.com/webcompat/webcompat.com/pull/1130) [Issue #1120](https://github.com/webcompat/webcompat.com/issues/1120)


## 2.7.0 - 2016-07-11

* Add IP logging for bug reports (to be able to investigate abuse) [Pull #1125](https://github.com/webcompat/webcompat.com/pull/1125) * [Issue #719](https://github.com/webcompat/webcompat.com/issues/719)
* Fix CSS variable name [Pull #1122](https://github.com/webcompat/webcompat.com/pull/1122) [Issue #1121](https://github.com/webcompat/webcompat.com/issues/1121)
* Handle Link headers from Comments endpoints [Pull #1117](https://github.com/webcompat/webcompat.com/pull/1117) [Issue #1100](https://github.com/webcompat/webcompat.com/pull/1100)
* Replace "new" with "needs triage" [Pull #1114](https://github.com/webcompat/webcompat.com/pull/1114) [Issue #975](https://github.com/webcompat/webcompat.com/issues/975)
* Document strict review comment policy [Pull #1112](https://github.com/webcompat/webcompat.com/pull/1112) [Issue #1110](https://github.com/webcompat/webcompat.com/issues/1110)
* Pointer-events tweak on icon images for Chrome [Pull #1107](https://github.com/webcompat/webcompat.com/pull/1107) [Issue #1088](https://github.com/webcompat/webcompat.com/issues/1088)

## 2.6.1 - 2016-06-28

* Hide NSFW images if they have a nsfw label [Pull #1087](https://github.com/webcompat/webcompat.com/pull/1087) [Issue #1001](https://github.com/webcompat/webcompat.com/pull/1001)
* Improve label contrast [Pull #1094](https://github.com/webcompat/webcompat.com/pull/1094) [Issue #482](https://github.com/webcompat/webcompat.com/issues/482)
* Improve comment header layout [Pull #1095](https://github.com/webcompat/webcompat.com/pull/1095) [Issue #972](https://github.com/webcompat/webcompat.com/issues/972)
* Improve submit comment design [Pull #1096](https://github.com/webcompat/webcompat.com/pull/1096) (No issue)
* Fix path for requirements.txt in CONTRIBUTING [Pull #1099](https://github.com/webcompat/webcompat.com/pull/1099) [Issue #1098](https://github.com/webcompat/webcompat.com/issues/1098)
* Pass params with comments endpoint [Pull #1103](https://github.com/webcompat/webcompat.com/pull/1103) [Issue #1101](https://github.com/webcompat/webcompat.com/issues/11001)
* Fix different favicon bug [Pull #1105](https://github.com/webcompat/webcompat.com/pull/1105) [Issue #1046](https://github.com/webcompat/webcompat.com/issues/1046)

## 2.6.0 - 2016-06-14

* Remove nested labels from markup [Pull #1092](https://github.com/webcompat/webcompat.com/pull/1092) [Issue #1072](https://github.com/webcompat/webcompat.com/issues/1072)
* Improved search bar design [Pull #1091](https://github.com/webcompat/webcompat.com/pull/1091) [Issue #1089](https://github.com/webcompat/webcompat.com/issues/1089)
* Syntax and import clean ups [Pull #1085](https://github.com/webcompat/webcompat.com/pull/1085) [Issue #1084](https://github.com/webcompat/webcompat.com/issues/1084)
* Functional tests around label URL updates [Pull #1080](https://github.com/webcompat/webcompat.com/pull/1080) [Issue #1079](https://github.com/webcompat/webcompat.com/pull/1079)
* Add clear filter event to labelSearch [Pull #1078](https://github.com/webcompat/webcompat.com/pull/1078) [Issue #1074](https://github.com/webcompat/webcompat.com/pull/1074)
* Fix label href URL [Pull #1077](https://github.com/webcompat/webcompat.com/pull/1077) [Issue #1075](https://github.com/webcompat/webcompat.com/pull/1075)
* Update docs around ISSUES_REPO_URI [Pull #1076](https://github.com/webcompat/webcompat.com/pull/1076) [Issue #1069](https://github.com/webcompat/webcompat.com/issues/1069)

## 2.5.2 - 2016-05-31

* Ensure label list UI is updated when labels are set [Pull #1073](https://github.com/webcompat/webcompat.com/pull/1073) [Issue #1045](https://github.com/webcompat/webcompat.com/issues/1045)
* Make search bar distinct from background [Pull #1065](https://github.com/webcompat/webcompat.com/pull/1065) [Issue #1064](https://github.com/webcompat/webcompat.com/issues/1064)
* Fix image uploads for issues [Pull #1067](https://github.com/webcompat/webcompat.com/pull/1067) [Issue #1063](https://github.com/webcompat/webcompat.com/pull/1063)

## 2.5.1 - 2016-05-26

* Scope labelSearch to actual anchor elm (not its wrapper) [Pull #1068](https://github.com/webcompat/webcompat.com/pull/1068) [Issue #1066](https://github.com/webcompat/webcompat.com/issues/1066)
* Bandaid fix to allow for up to 100 comments per issue [Pull #1057](https://github.com/webcompat/webcompat.com/pull/1057) [Issue #1044](https://github.com/webcompat/webcompat.com/issues/1044)

## 2.5.0 - 2016-05-20

* Convert PNG to JPEG on the server [Pull #1052](https://github.com/webcompat/webcompat.com/pull/1052) [Issue #1051](https://github.com/webcompat/webcompat.com/issues/1051)
* Upload images before submission [Pull #1053](https://github.com/webcompat/webcompat.com/pull/1053) [Issue #1049](https://github.com/webcompat/webcompat.com/issues/1049)
* Include bmp and gif in the "remove image upload" regex [Pull #1056](https://github.com/webcompat/webcompat.com/pull/1056) [Issue #1055](https://github.com/webcompat/webcompat.com/issues/1055)

## 2.4.10 - 2016-05-04

* Clear out screenshotData in showRemoveUpload [Pull #1040](https://github.com/webcompat/webcompat.com/pull/1040) [Issue #1039](https://github.com/webcompat/webcompat.com/issues/1039)
* Downscale large images that come from the add-on [Pull #1041](https://github.com/webcompat/webcompat.com/pull/1041) [Issue #1012](https://github.com/webcompat/webcompat.com/issues/1012)

## 2.4.9 - 2016-05-03

* Fix button style on contributor page [Pull #1021](https://github.com/webcompat/webcompat.com/pull/1021) [Issue #1005](https://github.com/webcompat/webcompat.com/issues/1005)
* Remove crappy search tests that always fail [Pull #1029](https://github.com/webcompat/webcompat.com/pull/1029) [Issue #890](https://github.com/webcompat/webcompat.com/issues/890)
* More robust UA parsing [Pull #1032](https://github.com/webcompat/webcompat.com/pull/1032) [Issue #1030](https://github.com/webcompat/webcompat.com/issues/1030)
* Add MPL 2.0 license to package.json [Pull #1038](https://github.com/webcompat/webcompat.com/pull/1038) [Issue #977](https://github.com/webcompat/webcompat.com/issues/977)

## 2.4.8 - 2016-04-28

* Add speculative exception logging to figure out #1009. [Pull #1028](https://github.com/webcompat/webcompat.com/pull/1028) [Issue #1027](https://github.com/webcompat/webcompat.com/issues/1027)

## 2.4.7 - 2016-04-27

* Change font-family in comment textareas [Pull #1022](https://github.com/webcompat/webcompat.com/pull/1022) (No Issue)
* Fix blank button (due to focus issues) [Pull #1020](https://github.com/webcompat/webcompat.com/pull/1020) [Issue #1006](https://github.com/webcompat/webcompat.com/issues/1006)
* Improve error styles for image upload errors [Pull #1018](https://github.com/webcompat/webcompat.com/pull/1018) [Issue #995](https://github.com/webcompat/webcompat.com/issues/995)
* Better handling of 413 errors on the client side [Pull #1016](https://github.com/webcompat/webcompat.com/pull/1016) [Issue #994](https://github.com/webcompat/webcompat.com/issues/994)

## 2.4.6 - 2016-04-25

* Bump z-index of loader image [Pull #1014](https://github.com/webcompat/webcompat.com/pull/1014) [Issue #1011](https://github.com/webcompat/webcompat.com/issues/1011)
* Flash messages should use fixedpos [Pull #1013](https://github.com/webcompat/webcompat.com/pull/1013) [Issue #1010](https://github.com/webcompat/webcompat.com/issues/1010)
* [Pull #958](https://github.com/webcompat/webcompat.com/pull/958) [Issue #929](https://github.com/webcompat/webcompat.com/issues/929)

## 2.4.5 - 2015-04-08

* Rearrange admin scripts in repo [Pull #971](https://github.com/webcompat/webcompat.com/pull/971)
* Fix label webhook bug [Pull #984](https://github.com/webcompat/webcompat.com/pull/984) [Issue #983](https://github.com/webcompat/webcompat.com/issues/983)
* Optimize images as we save them to disk [Pull #990](https://github.com/webcompat/webcompat.com/pull/990) [Issue #710](https://github.com/webcompat/webcompat.com/issues/710)
* Add webcompat.com origin comment (for GitHub users) [Pull #991](https://github.com/webcompat/webcompat.com/pull/991) [Issue #741](https://github.com/webcompat/webcompat.com/issues/741)

## 2.4.4 - 2015-03-30

* Fix bug preventing new issues from getting labels [Pull #984](https://github.com/webcompat/webcompat.com/pull/984) [Issue #983](https://github.com/webcompat/webcompat.com/issues/983)

## 2.4.3 - 2015-03-29

* Fix reference to form element [Pull #987](https://github.com/webcompat/webcompat.com/pull/987) [Issue #986](https://github.com/webcompat/webcompat.com/issues/986)

## 2.4.2 - 2015-03-25

* Update .travis.yml to not use manual pip cache [Pull #970](https://github.com/webcompat/webcompat.com/pull/970) [Issue #950](https://github.com/webcompat/webcompat.com/issues/950)
* Update style of image uploader for issues [Pull #964](https://github.com/webcompat/webcompat.com/pull/964) [Issue #906](https://github.com/webcompat/webcompat.com/issues/906)
* Swap out grunt-cssnext for postcss-cssnext [Pull #960](https://github.com/webcompat/webcompat.com/pull/960)
* Make better use of screen realestate for comments in small viewports [Pull #959](https://github.com/webcompat/webcompat.com/pull/959) [Issue #940](https://github.com/webcompat/webcompat.com/issues/940)
* Display proper URL hostname when scheme is missing slashes [Pull #951](https://github.com/webcompat/webcompat.com/pull/951) [Issue #767](https://github.com/webcompat/webcompat.com/issues/767)

## 2.4.1 - 2015-03-09

* Split up Intern tests so some of them can run from forks [Pull #944](https://github.com/webcompat/webcompat.com/pull/944) [Issue #942](https://github.com/webcompat/webcompat.com/issues/942)
* Remove "New" label from worksforme and fixed issues [Pull #943](https://github.com/webcompat/webcompat.com/pull/943) [Issue #832](https://github.com/webcompat/webcompat.com/pull/832)
* Add '(Tablet)' to browser name for tablets [Pull #941](https://github.com/webcompat/webcompat.com/pull/941) [Issue #821](https://github.com/webcompat/webcompat.com/pull/821)
* Add simple Regex validation for URL field [Pull #939](https://github.com/webcompat/webcompat.com/pull/939) [Issue #854](https://github.com/webcompat/webcompat.com/pull/939)
* Prevent default search action for 'g' key [Pull #938](https://github.com/webcompat/webcompat.com/pull/938) [Issue #857](https://github.com/webcompat/webcompat.com/issues/857)
* Add Cloud9 setup instructions to CONTRIBUTING.md [Pull #937](https://github.com/webcompat/webcompat.com/pull/937) [Issue #934](https://github.com/webcompat/webcompat.com/issues/934)
* Fix QR code style regressions [Pull #936](https://github.com/webcompat/webcompat.com/pull/936) [Issue #930](https://github.com/webcompat/webcompat.com/pull/930)
* Add a Markdown CSS compoenent for styling issue comments [Pull #933](https://github.com/webcompat/webcompat.com/pull/933)

## 2.4.0 - 2015-03-02

* Give unique names to error handler methods. [Pull #935](https://github.com/webcompat/webcompat.com/pull/935) [Issue #932](https://github.com/webcompat/webcompat.com/issues/932)
* Padding tweak for comments [Pull #931](https://github.com/webcompat/webcompat.com/pull/931) [Issue #921](https://github.com/webcompat/webcompat.com/issues/921)
* Allow visiting /activity/username route directly [Pull #928](https://github.com/webcompat/webcompat.com/pull/928) [Issue #880](https://github.com/webcompat/webcompat.com/issues/880)
* Tweak highlight color for cssfixme [Pull #927](https://github.com/webcompat/webcompat.com/pull/927) [Issue #926](https://github.com/webcompat/webcompat.com/issues/926)
* Update Python module deps [Pull #920](https://github.com/webcompat/webcompat.com/pull/920) [Issue #902](https://github.com/webcompat/webcompat.com/issues/902)

## 2.3.2 - 2015-02-10

* Fix pixelated images issue [Pull #916](https://github.com/webcompat/webcompat.com/pull/916) [Issue #914](https://github.com/webcompat/webcompat.com/issues/914)
* Fix `<code>` overflow [Pull #917](https://github.com/webcompat/webcompat.com/pull/917) [Issue #913](https://github.com/webcompat/webcompat.com/issues/913)
* Fix issue with issue comment upload form [Pull #918](https://github.com/webcompat/webcompat.com/pull/918) [Issue #915](https://github.com/webcompat/webcompat.com/issues/915)
* Remove GitHub spam measures[Pull #919](https://github.com/webcompat/webcompat.com/pull/919) [Issue #912](https://github.com/webcompat/webcompat.com/issues/912)

## 2.3.1 - 2015-02-05

* Massive refactor of HTML + CSS [Pull #901](https://github.com/webcompat/webcompat.com/pull/901)
* Add :focus styles [Pull #910](https://github.com/webcompat/webcompat.com/pull/910) [Issue #907](https://github.com/webcompat/webcompat.com/issues/907)

## 2.3 - 2015-01-07

* React to add-ons sending screenshots in bug report [Pull #895](https://github.com/webcompat/webcompat.com/pull/895) [Issue #879](https://github.com/webcompat/webcompat.com/issues/879)
* Add nicer UI for adding screenshots in bug report [Pull #893](https://github.com/webcompat/webcompat.com/pull/893) [Issue #867](https://github.com/webcompat/webcompat.com/issues/867)
*  Ensure backend supports combining labels and search terms [Pull #858](https://github.com/webcompat/webcompat.com/pull/858) [Issue #795](https://github.com/webcompat/webcompat.com/issues/795)

## 2.2.1 - 2015-12-31

* Layout bugfix on contributors page [Pull #888](https://github.com/webcompat/webcompat.com/pull/888) [Issue #855](https://github.com/webcompat/webcompat.com/issues/855)
* Various improvments around cssfixme tool layout and style [Pull #891](https://github.com/webcompat/webcompat.com/pull/891) [Pull #887](https://github.com/webcompat/webcompat.com/pull/887) [Issue #848](https://github.com/webcompat/webcompat.com/issues/848)
* Make imagemin a non-default task [Pull #869](https://github.com/webcompat/webcompat.com/pull/869) [Issue #868](https://github.com/webcompat/webcompat.com/issues/868)
* Add a new QueryParams model [Pull #859](https://github.com/webcompat/webcompat.com/pull/859) [Issue #795](https://github.com/webcompat/webcompat.com/issues/795)

## 2.2 - 2015-12-17

* Fix cssfixme scripts in wrong location [Pull #876](https://github.com/webcompat/webcompat.com/pull/876) [Issue #875](https://github.com/webcompat/webcompat.com/issues/875)
* Fix broken rate_limit route [Pull #874](https://github.com/webcompat/webcompat.com/pull/874) [Issue #856](https://github.com/webcompat/webcompat.com/pull/856)
* Clean up some dead code [Pull #873](https://github.com/webcompat/webcompat.com/pull/873) [Issue #872](https://github.com/webcompat/webcompat.com/issues/872)
* Properly handle 304s from GitHub [Pull #872](https://github.com/webcompat/webcompat.com/pull/872) [Issue #870](https://github.com/webcompat/webcompat.com/issues/870)
* Lint pep8 and eslint at Travis level [Pull #861](https://github.com/webcompat/webcompat.com/pull/861) [Issue #860](https://github.com/webcompat/webcompat.com/pull/860)
* Add JS to make cssfix me work [Pull #853](https://github.com/webcompat/webcompat.com/pull/853) [Issue #850](https://github.com/webcompat/webcompat.com/pull/850)
* Handle ?url query string for cssfixme [Pull #852](https://github.com/webcompat/webcompat.com/pull/852) [Issue #847](https://github.com/webcompat/webcompat.com/issues/847)
* Add route and minimal style for cssfixme [Pull #849](https://github.com/webcompat/webcompat.com/pull/849) [Issue #12](https://github.com/webcompat/webcompat.com/issues/12)
* Print a more helpful error if there is no config.py file [Pull #841](https://github.com/webcompat/webcompat.com/pull/842) [Issue #841](https://github.com/webcompat/webcompat.com/issues/841)

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
