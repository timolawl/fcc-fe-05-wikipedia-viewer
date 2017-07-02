// FCC: Build a Wikipedia Viewer
// User Story: I can search Wikipedia entries in a search box and see the resulting Wikipedia entries.
// User Story: I can click a button to see a random Wikipedia entry.

// Wrap everything in an IIFE

!function() {

// But make processMainSearch and processSimilarSearch global since they're needed for callback.
  this.processMainSearch = function(json) {

    var keys = Object.keys(json.query.pages);
    var title = json.query.pages[keys.toString()].title;
    var extract = json.query.pages[keys.toString()].extract;
    var pageID = json.query.pages[keys.toString()].pageid;
    var extractFirstSentence = extract.substr(0, extract.indexOf('.')) + '.';
    var link = '//en.wikipedia.org/?curid=' + pageID;

    var titleText = document.createTextNode(title);
    var extractFSText = document.createTextNode(extractFirstSentence);

    document.getElementById('mL').href = link;

    var mainTitle = document.getElementById('m-title');
    var mainSnippet = document.getElementById('m-snippet');
    mainTitle.innerText = '';
    mainSnippet.innerText = '';
    mainTitle.appendChild(titleText);
    mainSnippet.appendChild(extractFSText);
  }

  this.processSimilarSearch = function(json) {
    var snippetsArray = Array.prototype.map.call(json.query.search, function(obj) {
      return [obj.title, obj.snippet];
    }); 

    snippetsArray.shift(); //remove the first entry.

    snippetsArray.forEach(function(entry, index, array) {
      var titleNode = document.createTextNode(entry[0]);
      var entryId = 's' + index;
      var entryBlock = document.getElementById(entryId);
      var entryTitle = document.getElementById(entryId + '-title');
      var entrySnippet = document.getElementById(entryId + '-snippet');
      entryTitle.innerText = '';
      entrySnippet.innerText = '';
      entryTitle.appendChild(titleNode);
      var formattedSnippet = entry[1].replace(/(<[^>]+)>/g, '');
      var snippetNode = document.createTextNode(formattedSnippet + '...');
      entrySnippet.appendChild(snippetNode);
      entryBlock.title = entry[0];
    });

    var linkStr = snippetsArray.map(function(element) {
      return element[0];
    }).join('|');

    //Request links
    var script3 = document.createElement('script');
    script3.src = '//en.wikipedia.org/w/api.php?format=json&action=query&titles=' + linkStr + '&callback=processLinkSearch';
    document.head.appendChild(script3);
  }

  this.processLinkSearch = function(json) {
    var linkArray = [];

    for(var key in json.query.pages) {
      var pageId = key;
      var title = json.query.pages[pageId].title;
      var identifier = 'div[title="' + title + '"]';

      document.querySelector(identifier).parentNode.href = '//en.wikipedia.org/?curid=' + pageId;  
    }
    
    if(document.getElementById('m-title').childNodes.length !== 0)
      document.getElementById('entries').classList.remove('is-invisible');
    
  };

  function executeSearch(str) {
    var formattedSearchStr =  str.replace(/\w\S*/g, function(text) {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });

    // Get JSON via JSON-P
    var script = document.createElement('script');
    script.src = '//en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + formattedSearchStr + '&callback=processMainSearch';
    document.head.appendChild(script);

    var script2 = document.createElement('script');
    script2.src = '//en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=' + formattedSearchStr + '&callback=processSimilarSearch';
    document.head.appendChild(script2);
  }

  function readInput() {
    var entries = document.getElementById('entries');

    entries.classList.toggle('is-invisible');
    document.getElementById('queryfield').addEventListener('keyup', function(e) {
      var text = document.getElementById('queryfield').value;

      if(e.keyCode == 13) {    
        executeSearch(text);
        document.getElementById('queryfield').blur();
      }
      
      if(!text) {
        entries.classList.add('is-invisible');
      }    
    });
  }

  readInput();

}();
