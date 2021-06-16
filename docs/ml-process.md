# ML pipeline for web-bugs repository

This document is describing ML pipeline that is used to help with triaging issues filed on webcompat.com.

We're using [Mozilla Bugbug](https://github.com/mozilla/bugbug) for data fetching, model training and classification. 
Once an anonymous issue report is filed, we send a request to BugBug http service to classify it. Depending on its prediction and confidence threshold, 
we decide whether the issue can be closed automatically pre-triage.   

An in-depth overview of the process is below.

The Bugbug tool consists of 3 steps:

1. [Data collection](#1-data-collection) 
2. [Training the model](#2-training-the-model)
3. [Using the model (Bugbug http service)](#3-using-the-model)

And the last step (using the model to classify issues) is part of this repository:

4. [Classify and close issues](#4-classify-and-close-issues)

## Prerequisites

This section is required if you want to make changes to Bugbug codebase (any of the first 3 steps).

You will need to create a fork of https://github.com/mozilla/bugbug

Then install required dependencies as described in https://github.com/mozilla/bugbug#setup-and-prerequisites:

```
$ git clone https://github.com/<your github username>/bugbug
$ cd bugbug
$ python3 -m venv env
$ . env/bin/activate
$ pip3 install -r requirements.txt
```

Note that Bugbug http service has its own [dependencies and instructions on how
to run it](https://github.com/mozilla/bugbug/blob/master/http_service/README.md#local-development).

## 1. Data collection

During this step we retrieve all issues via GitHub API from [webcompat web-bugs repository](https://github.com/webcompat/web-bugs/issues) and 
store it in a file with [JSON Lines](https://jsonlines.org/) format. This file is our dataset and it will be used for model training in [step 2](#training-the-model).
It's also worth mentioning that this json file is compressed using [Zstandard](https://facebook.github.io/zstd/).

We use [`github_issue_retriever.py`](https://github.com/mozilla/bugbug/blob/master/scripts/github_issue_retriever.py) script for data fetching. 
If you wish to run it locally, use the following command:

```
$ python3 -m scripts.github_issue_retriever --owner=webcompat --repo=web-bugs --retrieve-events
```

`--retrieve-events` in this command will make sure that each issue events data is retrieved and stored in the dataset. 
Issue events are triggered by activity in issues (renaming, change of milestone, labelling, etc) and describing the lifecycle of an issue.
This parameter is required as events are used for our model training (more on that below).

Issues retrieval task is scheduled to run once in two weeks in the Taskcluster, together with the model training task. 
The [task for the issues retrieval](https://github.com/mozilla/bugbug/blob/3e4f452b5e523d3d114cb0477e5a82f22c7e951e/infra/data-pipeline.yml#L232-L270) runs the script and [results of the run](https://community-tc.services.mozilla.com/tasks/index/project.bugbug.data_github_issues/latest) are stored as artifacts.

If you run the above command locally, it will look for the existing dataset and check its `last_modified` timestamp (the dataset is saved as an [artifact of the task](https://community-tc.services.mozilla.com/api/index/v1/task/project.bugbug.data_github_issues.latest/artifacts/public%2Fgithub_issues.json.zst) in the Taskcluster). 
If the dataset is available, it will be downloaded to `bugbug/data` folder to your machine and the script will begin fetching updates from GitHub and save them to this local copy. 

During this update, all changes to issues since `last_modified` timestamp will be fetched. If the dataset or its `last_modified` is not available, the script will begin fetching all issues starting from issue 1.

As per [GitHub API rate limitig rules](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting) we can make up to 5,000 authenticated requests per hour. While fetching all issues this amount will be exceeded (as of June 2021 we have aroung 78000 issues). To make sure we're staying within the limit we're using [ratelimit](https://pypi.org/project/ratelimit/) package:

```python
@sleep_and_retry
@limits(calls=1200, period=RATE_LIMIT_PERIOD)
def api_limit():
    # Allow a limited number of requests to account for rate limiting
    pass
```

This [`api_limit` function](https://github.com/mozilla/bugbug/blob/4796fbd321f09c7156b6bddab408576368819197/bugbug/github.py#L39-L43) is being used in the beginning of every other function making a request to GitHub API:

```python
def fetch_events(events_url: str) -> list:
    api_limit()
    logger.info(f"Fetching {events_url}")
    headers = {"Authorization": "token {}".format(get_token())}
    response = requests.get(events_url, headers=headers)
    response.raise_for_status()
    events_raw = response.json()
    return events_raw
``` 
The function is making sure that after every 1200 requests we sleep for 900 seconds (15 minutes), so we never hit the GitHub rate limit exception (the GitHub limit is 5000/hour = 1250/15 minutes, which is slightly higher). So, to fetch 10000 issues it will take 7500 seconds, which is about 2 hours.

Note that we're getting all issues data (except their events) via [GitHub issues API](https://docs.github.com/en/rest/reference/issues#list-issues-assigned-to-the-authenticated-user--parameters) using maximum `per_page` parameter, which is [100 issues per request](https://api.github.com/repositories/17914657/issues?state=all&sort=created&direction=asc&per_page=100&page=681). This helps to significally reduce API count, as for 78000 issues we would only need to make 780 requests to get all of them. However, as we're also getting events for each issue, we need to make a separate request per issue. So request for events is actully the major contributor to the total API requests count.

## 2. Training the model
We use [needsiagnosis model](https://github.com/mozilla/bugbug/blob/master/bugbug/models/needsdiagnosis.py) for classifying incoming issues. 

The goal of the model is to find issues that don't need to be diagnosed. We look through lifecycle events of each issue and if an issue
has ever been moved to `needsdiagnosis` milestone, we assign a `label 0` (needsdiagnosis=true), and if not `label 1`(needsdiagnosis=false):

```python
         classes = {}


        for issue in github.get_issues():
            # Skip issues that are not moderated yet as they don't have a meaningful title or body
            if issue["title"] == "In the moderation queue.":
                continue


            for event in issue["events"]:
                if (
                    event["event"] == "milestoned"
                    and event["milestone"]["title"] == "needsdiagnosis"
                ):
                    classes[issue["number"]] = 0


            if issue["number"] not in classes:
                classes[issue["number"]] = 1


        logger.info(
            f"{sum(1 for label in classes.values() if label == 1)} issues have not been moved to needsdiagnosis"
        )
        logger.info(
            f"{sum(1 for label in classes.values() if label == 0)} issues have been moved to needsdiagnosis"
        )


        return classes, [0, 1]
```

We're using issue `title` and `body` as our training data:

```python
                    ColumnTransformer(
                        [
                            ("title", self.text_vectorizer(min_df=0.0001), "title"),
                            (
                                "first_comment",
                                self.text_vectorizer(min_df=0.0001),
                                "first_comment",
                            ),
                        ]
                    ),
```

The goal of `min_df` parameter in [`text_vectorizer`](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html) is to ignore words that have very few occurrences to be considered meaningful, so here we're indicating that we want to ignore words with very low frequency (i.e. a word is occurring in 1 out of 1000 documents).

Also, as you may have noticed, here `title` and `first_comment` are being used (which might be a bit confusing), however the [dataframe is built using `issue.body`](https://github.com/mozilla/bugbug/blob/master/bugbug/issue_features.py):

```python


            title = issue["title"]
            body = issue["body"]
            for cleanup_function in self.cleanup_functions:
                title = cleanup_function(title)
                body = cleanup_function(body)


            results.append(
                {
                    "data": data,
                    "title": title,
                    "first_comment": body,
                }
            )


        return pd.DataFrame(results)
```

It's worth mentioning that the model is based on [previous work](https://github.com/mozilla/webcompat-ml/blob/master/src/webcompat_ml/models/needsdiagnosis/model.py) of [John Giannelos](https://github.com/johngian).
More information about it is [available in the documentation](https://webcompat-ml.readthedocs.io/en/latest/datasets.html#needs-diagnosis).

There is an interesting observation:

> While going through the data, we noticed an inflation in our metrics which looked suspicious. It turned out that some of the titles get changed as part of the triaging process which hinted that needsdiagnosis target. In order to fix that we went through the events and extracted the original titles.

To avoid inflation in metrics, similarly to the previous model we're extracting the original titles in https://github.com/mozilla/bugbug/blob/master/bugbug/issue_snapshot.py:

    if issue["events"]:
        for event in issue["events"]:
            # Extract original title that issue got at the moment of creation
            if (
                event["event"] == "renamed"
                and event["rename"]["from"] != "In the moderation queue."
            ):
                issue["title"] = event["rename"]["from"]


    return issue


If you wish to train the model locally, it can be done with the following command (it's going to take a little while to complete):

```
$ python3 -m scripts.trainer needsdiagnosis
```
The [method responsible for training is universal](https://github.com/mozilla/bugbug/blob/3e4f452b5e523d3d114cb0477e5a82f22c7e951e/bugbug/model.py#L340) for all models in Bugbug.
Once the training is done we can look at the results and confidence thresholds:

```
Confidence threshold > 0.9 - 6219 classified
                          pre       rec       spe        f1       geo       iba       sup

                 1       0.96      0.84      0.65      0.90      0.74      0.56      7009
                 0       0.97      0.11      1.00      0.20      0.34      0.10       676
__NOT_CLASSIFIED__       0.00      0.00      0.81      0.00      0.00      0.00         0

       avg / total       0.96      0.78      0.68      0.84      0.71      0.52      7685
```
For confidence threshold 0.9, we have 96% precision and 84% recall for the 1 class (which corresponds to needsdiagnosis=false). Which means the model is able to find 84% of issues where needsdiagnosis is False and in 4% of the times assigns a needsdiagnosis=false to an issue where it should actually be true.

To add additional thresholds you can modify this line in [model.py](https://github.com/mozilla/bugbug/blob/3e4f452b5e523d3d114cb0477e5a82f22c7e951e/bugbug/model.py#L487):

```
   confidence_thresholds = [0.6, 0.7, 0.8, 0.9]
```
If we look at 0.95 and 0.97 thresholds (the metrics as of June 2021):

```
Confidence threshold > 0.95 - 4761 classified
                          pre       rec       spe        f1       geo       iba       sup

                 1       0.98      0.66      0.87      0.79      0.76      0.56      7009
                 0       1.00      0.09      1.00      0.16      0.30      0.08       676
__NOT_CLASSIFIED__       0.00      0.00      0.62      0.00      0.00      0.00         0

       avg / total       0.98      0.61      0.88      0.73      0.72      0.52      7685

```
At confidence threshold 0.95, we have 98% precision and 66% recall, which means the model is able to find 66% of issues where needsdiagnosis is False and is wrong 2% of the times.
```
Confidence threshold > 0.97 - 3353 classified
                          pre       rec       spe        f1       geo       iba       sup

                 1       0.99      0.47      0.95      0.64      0.67      0.42      7009
                 0       1.00      0.06      1.00      0.12      0.25      0.06       676
__NOT_CLASSIFIED__       0.00      0.00      0.44      0.00      0.00      0.00         0

       avg / total       0.99      0.43      0.96      0.59      0.63      0.39      7685
```
At confidence threshold 0.97, we have 99% precision and 47% recall, which means the model is able to find 47% of issues where needsdiagnosis is False and is wrong 1% of the times.

Note that these metrics could change every time the model is retrained. At the moment we're automatically closing issues when needsdiagnosis is False with confidence threshold 0.97, but this could change in the future.

Another important metric is Cross Validation scores:

```
Cross Validation scores:
Accuracy: f0.9270151087978024 (+/- 0.0018233364008310164)
Precision: f0.9320033872563966 (+/- 0.001598188019426497)
Recall: f0.9927554513846539 (+/- 0.0008073463335545091)
X_train: (69165, 11511), y_train: (69165,)
X_test: (7685, 11511), y_test: (7685,)
```
If you wish to adjust the model, you could compare these metrics before/after your change and make a desicion whether a newer model is actually performing better.


The model is retrained automatically based on a [scheduled task](https://github.com/mozilla/bugbug/blob/3e4f452b5e523d3d114cb0477e5a82f22c7e951e/infra/data-pipeline.yml#L1212-L1252) in the Taskcluster and results of the task are [stored](https://community-tc.services.mozilla.com/tasks/index/project.bugbug.train_needsdiagnosis/latest) as artifacts. 
Compressed model is saved as an [artifact of the task](https://community-tc.services.mozilla.com/api/index/v1/task/project.bugbug.train_needsdiagnosis.latest/artifacts/public%2Fneedsdiagnosismodel.zst).

## 3. Using the model
There are two ways to classify the issue using the above model. If you would like to try the model locally, you could run the classifier script:

```
$ python3 -m scripts.github_issue_classifier needsdiagnosis --owner=webcompat --repo=web-bugs --retrieve-events --issue-number=71234

2021-06-16 15:10:54,440:INFO:bugbug.github:Fetching https://api.github.com/repos/webcompat/web-bugs/issues/71234
2021-06-16 15:10:54,440:INFO:bugbug.github:Fetching https://api.github.com/repos/webcompat/web-bugs/issues/71234/events
https://api.github.com/repos/webcompat/web-bugs/issues/71234 - github.com - video or audio doesn't play 
Positive [0.10918355 0.89081645]
```
Here the results are indicating that the issue doesn't need diagnosis with 89% confidence (Positive means it's part of class 1).

The second way is to use Bugbug http service and send a GET request to the production instance:

    https://bugbug.herokuapp.com/needsdiagnosis/predict/github/webcompat/web-bugs/<issue_id>

(note that `X-Api-Key` header is required in this case).

As classification happens in the background you'll need send the request again for getting the results.

A typical response can look like this:
```json
{
    "prob": [
        0.08258616924285889,
        0.9174138307571411
    ],
    "index": 1,
    "class": 1,
    "extra_data": {}
}
```
(issue doesn't need diagnosis with confidence of 91%)
```json
{
    "prob": [
        0.9925981760025024,
        0.007401847280561924
    ],
    "index": 0,
    "class": 0,
    "extra_data": {}
}
```
(issue needs diagnosis with confidence of 99%)

More details about required parametres/ posible responses for this API method is listed in the description of `model_prediction_github`
[method](https://github.com/mozilla/bugbug/blob/master/http_service/bugbug_http/app.py#L450)

It's also possible to run Bugbug http service locally by [following these steps](https://github.com/mozilla/bugbug/blob/master/http_service/README.md#local-development). To be able to access github API when running the service locally, you will need to have GitHub API token setup. To do so create `.env` file inside `bugbug/http_service` folder with the following contents:

```
BUGBUG_GITHUB_TOKEN=<your token>
```

## 4. Classify and close issues
Once an anonymous issue is filed in our private repository, we send a [request to Bugbug service for issue classification](https://github.com/webcompat/webcompat.com/blob/62b18c330ceb2a68a90040e198dcc373ab581ecd/webcompat/webhooks/model.py#L312):

```python
   try:
       self.classify()
   except (HTTPError, ConnectionError) as e:
       msg_log(f'classification failed ({e})', self.number)
       return oops()
```

If the issue is classified with needsdiagnosis=False with a certain confidence threshold (97% at the moment) we move the issue to `autoclosed` milestone

```python
data = get_issue_classification(self.number)
        needsdiagnosis_false = data.get('class')
        proba = data.get('prob')
        
if needsdiagnosis_false and proba and proba[1] > THRESHOLD:
   path = f'repos/{PRIVATE_REPO}/{self.number}'
   payload_request = {'milestone': AUTOCLOSED_MILESTONE_ID}
   make_request('patch', path, payload_request)
```
Once the issue is moved to this milestone and we receive a corresponding webhook, we [close the public and private issues](https://github.com/webcompat/webcompat.com/blob/62b18c330ceb2a68a90040e198dcc373ab581ecd/webcompat/webhooks/model.py#L368). We also replace the body and the title of the public issue with placeholder text as we can't publish unmoderated content to the public issue.

Issues that are closed this way can be accessed by [searching for `bugbug-probability-high` label](https://github.com/webcompat/web-bugs/issues?q=is%3Aissue+label%3Abugbug-probability-high+is%3Aclosed).
