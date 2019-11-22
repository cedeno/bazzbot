const rp = require('request-promise');
const $ = require('cheerio');
const TurndownService = require('turndown');


var turndownService = new TurndownService( {emDelimiter: '*'});
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

// TODO: make a new harness for testing, discord is too heavy
// TODO: work with search
// TODO: check for accents
// TODO: make way to get 2nd or 3rd meaning or get all meanings
// TODO: print out how many other meanings there are so user knows even if we return only 1
// returns markdown text
const defParse = function(url) {
	return rp(url)
	  .then(function(html){
	  	let word = $('.dico_title_2', html).first().html();
	  	var markdown = turndownService.turndown(word);
	  	console.log("first sense: ", markdown);

		let def = $('.dico_definition .dico_liste .grid_last', html).first().html();
		markdown += '\n' + turndownService.turndown(def);
		console.log('md=\n' + markdown);
		return markdown;
	  })
	  .catch(function(err){
	  	console.log('error code=', err.statusCode);
	  	throw (err);
	  });
};

// returns list of URLs
const searchParse = function(url) {
	return rp(url)
	  .then(function(html){
	  	let results = [];
		$('.results li h2 a', html).each(function(i, elem) {
			results.push($(this)[0].attribs.href);
		});
		return results;
	  })
	  .catch(function(err){
	  	console.log('error code=', err.statusCode);
	  	throw (err);
	  });
};

module.exports = {
	defParse,
	searchParse
};
