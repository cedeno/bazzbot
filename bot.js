const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const Scraper = require('./scraper');
const textToStream = require('./voice');

const fs = require('fs');
const util = require('util');

const urlPrefix = 'https://www.linternaute.fr/dictionnaire/fr/definition/';
const searchUrlPrefix = 'http://www.linternaute.com/encyclopedie/recherche/id-195/?f_libelle=';


const search = function(wordIn, msg) {
	let word = encodeURIComponent(wordIn);
	Scraper.defParse(urlPrefix + word + '/')
	  .then(function (md) {
		console.log('got md=', md);
		msg.reply(md);
	  })
	  .catch(function(err) {
	  	if (err.statusCode == 400) {
	  		console.log('couldnt find word, lets do a search for word ' + word);
	  		
	  		Scraper.searchParse(searchUrlPrefix + word)
	  			.then(function(urls) {
		  			console.log('got urls=', urls);
		  			if (urls.length < 1) {
		  				msg.reply('no matches');
		  				return;
		  			}
		  			// pick the first one for the definition
		  			Scraper.defParse(urls[0])
		            	.then(function (md) {
			            	console.log('looking up first results gave me this=', md);
			            	msg.reply(md);
			          	})
		  				.catch(function(err){
						  	if (err.statusCode == 400) {
						  		console.log('failed to get first definition from search list');
						  		msg.reply('error retrieving definition');
						  	}
					  	})
				})
				.catch(function(err) {
					msg.reply('no matches');
	  				console.log('got error from search');
	  			});
	  	}
	  	else {
	  		console.log('got error');
	  		msg.reply('no matches');
	  	}
	});
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
	let cmdSplit = msg.content.split(' ');
  	if (cmdSplit[0] === '!def') {
  		if (cmdSplit.length < 2) {
	    	msg.reply('must supply word');
  			return;
  		}
	    let word = cmdSplit[1];
	    if (word.length > 15) {
	    	console.log('word too long');
	    	msg.reply('word too long');
	    	return;
	    }
	    search(word, msg);
  	}
  	else if (cmdSplit[0] === '!say') {
  		if (cmdSplit.length < 2) {
	    	msg.reply('supply sentence after !say');
  			return;
  		}
  		// Voice only works in guilds, if the message does not come from a guild,
		// we ignore it
		if (!msg.guild) return;

	    // Only try to join the sender's voice channel if they are in one themselves
	    if (msg.member.voice.channel) {
	    	msg.member.voice.channel.join().then(function(connection) {
		    	//connection.playFile('output.mp3');
		    	let textToTranslate = msg.content.slice(4,msg.content.length); // remove the !say
		    	console.log('word=', textToTranslate);
		    	textToStream(textToTranslate)
					.then(function(filename) {
						console.log('got stream in promise, name=' + filename);
						const dispatcher = connection.play(filename);
						dispatcher.on('end', reason => {
							console.log('end reason=', reason);
						});
						dispatcher.on('error', e => {
		  					// Catch any errors that may arise
		  					console.log('error', e);
						});
						dispatcher.on('start', e => {
		  					console.log('start' ,e);
						});
						dispatcher.on('debug', e => {
          					console.log("debug", e);
        				});
					})
					.catch(function(err) {
						console.log('error=', err);
					});
				});
	    } else {
	    	msg.reply('please join a voice channel first');
	    	console.log('not in voice channel', msg.member);
	    	return;
	    }
  	}
});

client.on('message', message => {
  // If the message is "how to embed"
  if (message.content === 'how to embed') {
    // We can create embeds using the MessageEmbed constructor
    // Read more about all that you can do with the constructor
    // over at https://discord.js.org/#/docs/main/stable/class/RichEmbed
    const embed = new Discord.RichEmbed()
      // Set the title of the field
      .setTitle('A slick little embed')
      // Set the color of the embed
      .setColor(0xFF0000)
      // Set the main content of the embed
      .setDescription('Hello, this is a slick embed!');
    // Send the embed to the same channel as the message
    message.channel.send(embed);
  }
});

const token = config.get('token');

client.login(token);
