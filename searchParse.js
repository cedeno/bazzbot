const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const Scraper = require('./scraper');

const urlPrefix = 'https://www.linternaute.fr/dictionnaire/fr/definition/';
const searchUrlPrefix = 'http://www.linternaute.com/encyclopedie/recherche/id-195/?f_libelle=';


// this file for testing only

let word = encodeURIComponent('accusé');


Scraper.defParse(urlPrefix + 'accusé' + '/')
  .then(function (md) {
	console.log('got md=', md);
  })
  .catch(function(err) {
  	if (err.statusCode == 400) {
  		console.log('couldnt find word, lets do a search');
  		
  		Scraper.searchParse(searchUrlPrefix + word)
  			.then(function(urls) {
	  			console.log('got urls=', urls);
	  			if (urls.length < 1) {
	  				return;
	  			}
	  			// pick the first one for the definition
	  			Scraper.defParse(urls[0])
	            	.then(function (md) {
		            	console.log('looking up first results gave me this=', md);
		          	})
	  				.catch(function(err){
					  	if (err.statusCode == 400) {
					  		console.log('failed to get first definition from search list');
					  	}
				  	})
			})
			.catch(function(err) {
  				console.log('got error from search');
  			});
  	}
  	else {
  		console.log('got error');
  	}
});
