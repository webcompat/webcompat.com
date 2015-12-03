var issueList = issueList || {};

issueList.configUrls = {
  _githubSearchEndpoint: 'https://api.github.com/search/issues'
}

/*
* QueryParams is a model for keeping track of all parameters
* we need to fetch the list of issues.
*
* Dropdown, filter, search and sorting views will update the params,
* typically by calling
* this.mainView.params.setParam(name, value).
* The QueryParams model will observe itself and trigger relevant
* updates to the various views through firing events.
*
* The model can serialize its params to generate URLs. Queries are
* either proxied through webcompat.com or go directly to GitHub.
*
* If the request is a simple query (no search terms / ?q= parameter),
* it is always proxied through webcompat and the backend uses GitHub's
* Issues API - https://developer.github.com/v3/issues/
* Generated URLs are for example
* /api/issues?page=1&per_page=50&sort=created&direction=desc
* /api/issues/needsdiagnosis?page=1&per_page=50&sort=created&direction=desc
*
* If the request has a search query, and the user is logged in,
* it is also proxied through webcompat and the backend uses GitHub's
* Search API - https://developer.github.com/v3/search/#search-issues
*
* If the request has a search query and the user is *not* logged in,
* we send the query directly to GitHub's CORS-enabled Search API.
* Generated URLs are for example
* https://api.github.com/search/issues?q=foo&sort=created&order=desc
*
* The query itself can contain name:value parts like label:state-needsdiagnosis
* but we have no control over paging and number of results when querying
* GitHub directly.
*/
issueList.QueryParams = Backbone.Model.extend({
  defaults:{
    stage:'all',
    page:1,
    per_page:50,
    sort:'created',
    direction: 'desc',
    q: '',
    creator: '',
    mentioned: '',
    label: [] // Using 'labels' plural form would be nice, but needs to be
              // singular for the backend - or we'd have to translate name on send
  },
  bugstatuses: ['contactready', 'needsdiagnosis', 'needscontact', 'sitewait'],
  initialize: function(){
    var self = this;
    this.on('change', function(e){
      // When the query/parameters change, we want to
      // * update the drop-down menu if required
      // * update the URL and push a history entry
      // * update the relevant views (list of issues, search box)
      // To do so, this method will fire various events.
      // However, first we want to check if the change is significant..
      var significant = false;
      var changelist = Object.keys(e.changed);
      for(var i=0, change; change = changelist[i]; i++) {
        // I think we only get notified of one property at a time so looping is
        // maybe not necessary here. However..
        var newvalue = e.changed[change];
        var oldvalue = e._previousAttributes[change];
        if(newvalue.toString().trim() === oldvalue.toString().trim()) {
          continue; // just whitespace change, let's ignore this
        }
        significant = true;
        if (change === 'per_page') {
          issueList.events.trigger('dropdown:update', 'per_page=' + newvalue);
        } else if (change === 'sort' || change === 'direction') {
          issueList.events.trigger('dropdown:update', 'sort=' +
              this.attributes.sort + '&direction=' + this.attributes.direction);
        } else if (change === 'q') {
          issueList.events.trigger('search:update', newvalue);
        } else if (change === 'label') {
          issueList.events.trigger('appliedlabels:update');
        } else if (!(change in {page:1,stage:1})) {
          issueList.events.trigger('search:update', change + ':' + newvalue);
        }
      }
      if (significant) {
        issueList.events.trigger('issues:update');
        issueList.events.trigger('url:update');
      }
    });
  },
  /*
  * This creates a query suitable for the URL bar from the current params
  */
  toDisplayURLQuery: function(){
    var urlParams = [];
    _.each(this.attributes, function(value, key){
      urlParams.push(key + '=' + value);
    });
    return urlParams.join('&');
  },
  toBackendURL: function(loggedIn){
    /*
    * This method returns either a GitHub API URL or a webcompat.com/api URL
    * depending on the login status and what type of query we run.
    * Some queries go directly to GitHub's CORS-enabled backend,
    * some are proxied on webcompat.com :
    * /api/issues/category/<category> (new|closed|status label)
    * /api/issues/search/ - with ?q argument CAVEAT: stage/state must also be in ?q
    * /api/issues/search/category/<category>
    *
    * Choosing a backend depends on logged-in status and whether we have
    * a search query. If the visitor is not logged in and we do have a
    * search query, the request goes direct to GitHub. Otherwise (but why?)
    * it is proxied.
    *
    * Basically, we have three kinds of input:
    *   * Stage: client-side this is added to the pathname. On the backend it's
    *     transformed to a label:status-foo string and added to q
    *     (a bit complex but I hope the API vainly loves the prettier URLs)
    *     The backend also knows that "new" and "closed" are special values
    *     that map to the state= keyword, not directly to a label.
    *
    *   * Keywords that go into separate URL arguments - direction, sort, page, per_page
    *
    *   * Certain others need to go into q= field, as name:value
    */
    var paramsToSend = {q:''};
    // These are added to the query string as name=value (but some names change)
    var urlKeywords = ['direction', 'q', 'sort', 'page', 'per_page']
    var urlKeywordTransforms = {
      direction:'order'
    };
    // These properties must end up in the ?q=name:value
    var qMap = {
      creator:   'author',
      mentioned: 'mentions'
    };
    // new is a special category that must be retrieved via the Search API,
    // rather than the Issues API (which can return results for label)
    var searchAPICategories = ['new'];
    var issuesAPICategories = ['closed'].concat(this.bugstatuses);

    // Now we're ready to start populating paramsToSend
    // urlKeywords simply get copied over
    for(var i=0, kw; kw = urlKeywords[i]; i++) {
      if (this.attributes[kw]) {
        if (urlKeywordTransforms[kw]) {
          paramsToSend[urlKeywordTransforms[kw]] = this.attributes[kw];
        } else {
          paramsToSend[kw] = this.attributes[kw];
        }
      }
    }
    /* ported version of normalize_api_params from helpers.py
    Normalize GitHub Issues API params to Search API conventions:

    Issues API params        | Search API converted values
    -------------------------|---------------------------------------
    state                    | into q as "state:open", "state:closed"
    creator                  | into q as "author:username"
    mentioned                | into q as "mentions:username"
    direction                | order
    */
    // Any qMap properties need to be added to the "q" param as name:value
    for(key in qMap) {
      if (key in this.attributes && this.attributes[key]) {
        params.q += ' ' + val + ':' + this.attributes[key];
      }
    };

    // labels is an array that needs some special care
    var label = this.get('label');
    if(label && label.length) {
      label.forEach(function(label){
        paramsToSend.q += ' label:' + issues.allLabels.toPrefixed(label);
      });
    }
    // TODO: clarify rules for when to use GitHub directly and when Webcompat
    // Perhaps also write a fallback
    var backendPrefix = '';
    if (paramsToSend.q) {
      if (!loggedIn) {
        backendPrefix = issueList.configUrls._githubSearchEndpoint;
        // Scope this to our issues repo. (Our backend proxy handles this but
        // when sending the request directly to GitHub it must happen here)
        paramsToSend.q += ' repo:' + repoPath.slice(0,-7);
        // stage=new translates to "not one of these labels"..
        // This is handled in our backend - except when we query Github directly
        if (this.get('stage') === 'new') {
          issuesAPICategories.forEach(function(label) {
            paramsToSend.q += ' -label:' + label;
          });
          paramsToSend.q += ' state:open';
        } else if (this.get('stage') && !(this.get('stage') in {all:1,closed:1})) {
          paramsToSend.q += ' label:status-' + this.get('stage');
        }else if (this.get('stage') === 'closed') {
          paramsToSend.q += ' state:closed';
        }
      } else {
        backendPrefix = '/api/issues/search';
      }
    }

    if (loggedIn) {
      if (_.contains(searchAPICategories, this.get('stage'))) {
        backendPrefix = '/api/issues/search/' + this.get('stage');
      } else if (_.contains(issuesAPICategories, this.get('stage'))) {
        backendPrefix = '/api/issues/category/' + this.get('stage');
      } else {
        backendPrefix = '/api/issues';
      }
    }

    // Ignore q param if empty. This simplifies the URL sent to the backend
    if(!paramsToSend.q) {
      delete paramsToSend.q;
    }
    return backendPrefix + '?' + $.param(paramsToSend);

  },
  setParam: function(name, value) {
    // Because we query two separate GitHub APIs, which use slightly different keywords,
    // we have two names for some of the params - let's limit it to one name internally
    if(name === 'order') {
      name = 'direction';
    }
    // if the q parameter is set, the value might contain name:value params
    // for consistency, we should do a bit of parsing and extract those..
    // Both API and UI will be more confusing if we allow both labels:foo inside search
    // AND labels: ['bar'] internally.
    if(name === 'q') {
      var namevalues = value.match(/\b\w+(%3A|:)\w+\b/g);
      if(namevalues) {
        for(var thisValue, parts, i=0; thisValue = namevalues[i]; i++) {
          parts = thisValue.split(/%3A|:/);
          // If the name part is a keyword we know about, we set it in the API
          // and remove it from the eventual q string.
          // Otherwise, we just leave it as-is
          if(this.has(parts[0])) {
            this.setParam(parts[0], parts[1]);
            value = value.replace(thisValue, '');
          }
        }
      }
    }
    if(this.has(name)) {
      var currentValue = this.get(name);
      if(currentValue instanceof Array) {
        // Likely a 'labels' array..
        // We don't want to consider status- labels as labels
        // in this API although they are at the backend.
        // We should special-case label:status-* updates and set the
        // corresponding stage value instead.
        if(name === 'label' &&
           (value.indexOf('status-') === 0 || this.bugstatuses.indexOf(value) > -1)) {
          return this.setParam('stage', value.replace(/^status-/,''));
        }
        if(value && currentValue.indexOf(value) === -1) {
          if(value instanceof Array) {
            this.set(name, value);
          } else {
            this.set(name, currentValue.concat([value]));
          }
        } else {
          this.set(name, []);
        }
      } else {
        this.set(name, value);
      }
      return;
    } else {
      // if it's not a known property, stuff it into search
      // append name:value to existing search
      // TODO: we should never get here. Is it OK to stuff it into search,
      // or should we throw?
      this.set('q', this.get('q') + ' ' + name + ':' + value);
    }
  },
  deleteLabel: function(labelStr){
    var currentLabels = this.get('label');
    if(currentLabels.indexOf(labelStr) > -1) {
      currentLabels.splice(currentLabels.indexOf(labelStr), 1);
      this.set('label', {}, {silent:true}); // hack: to trigger change event on *next* set..
      // hack explained: currentLabels is a reference to the array, so updating
      // it causes an immediate change. But because we're just manipulating the array
      // directly, it does not fire any change events..
      this.setParam('label', currentLabels);
    }
  },
  fromQueryString: function(str){
    var self = this;
    if(str.substr(0,1) === '?') {
      str = str.substr(1);
    }
    var namevalues = str.split(/&/g);
    namevalues.forEach(function(namevalue){
      var pair = namevalue.split('=');
      self.setParam(pair[0], pair[1]);
    });
  }
});
