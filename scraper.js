
const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.linternaute.fr/dictionnaire/fr/definition/compter/';
const TurndownService = require('turndown');

var turndownService = new TurndownService();
turndownService.addRule('noLinks', {
    filter: function (node, options) {
      return (
        node.nodeName === 'A' &&
        node.getAttribute('href')
      )
    },
    replacement: function (content, node) {
	    return content;
	}
});

// TODO: make way to get 2nd or 3rd meaning or get all meanings
// TODO: print out how many other meanings there are so user knows even if we return only 1
rp(url)
  .then(function(html){
  	let word = $('.dico_title_2', html).first().html();
  	var markdown = turndownService.turndown(word);
  	console.log("first sense: ", markdown);

	let def = $('.dico_definition .dico_liste .grid_last', html).first().html();
	markdown = turndownService.turndown(def);
	console.log('md=\n' + markdown);
  })
  .catch(function(err){
  	console.log('got error: ', err);
    //handle error
  });

