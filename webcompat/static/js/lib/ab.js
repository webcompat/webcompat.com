/*global Mozilla experiment:true*/
/*eslint no-undef: "error"*/

var experiment = new Mozilla.TrafficCop({
  id: "issue-form-experiment",
  variations: {
    "experiment=issueFormExperiment": 0
  }
});

experiment.init();
