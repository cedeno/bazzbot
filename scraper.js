
const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.linternaute.fr/dictionnaire/fr/definition/compter/';

rp(url)
  .then(function(html){
    //console.log($('.dico_title_2', html));

    
/*    $('.dico_title_2', html).each(function(i, elem) {
  		console.log( $(this).text() );
	});*/


    // each dico liste is a different kind of word, like a noun vs a verb or even transitif vs instransitif verb
    // each one can have several 'sens'
    $('.dico_definition.dico_liste', html).each(function(i, elem) {

  		//let txt = $(this).text();

  		//console.log('looking for gridline: ', txt.trim().substring(0,128));

    	// find grid_last
/*    	let gridLast = $(this).find('.grid_last');
    	console.log('grid left: ', gridLast);*/
	});

	// maybe i want the UL or LI?? for the list
	$('.dico_definition .dico_liste .grid_last', html).each(function(i, elem) {
	  		let txt = $(this).text();
	  		// then remove the first div you see after.. it will be extra stuff we dont need?
	  		console.log('LI: ', txt);

		});
  })
  .catch(function(err){
    //handle error
  });