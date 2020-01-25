const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const Scraper = require('./scraper');
const textToStream = require('./voice');

const rp = require('request-promise');
const fs = require('fs');
const util = require('util');

const urlPrefix = 'https://www.linternaute.fr/dictionnaire/fr/definition/';
const searchUrlPrefix = 'http://www.linternaute.com/encyclopedie/recherche/id-195/?f_libelle=';

var voiceAccent = 'fr-FR';
var voiceGender = 'FEMALE';

// last message someone said
var lastMessage = "";

// TODO: use expression search http://www.linternaute.fr/expression/
// TODO: print out the song lyrics AS they are being sung??
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

const translate = function(destLang, inText, msg) {
  console.log('translate function, got text ' + inText);

  projectId = 'formal-triode-259814' // Your GCP Project Id

  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Instantiates a client
  const translate = new Translate({projectId});

  async function quickStart(text) {
  	console.log('quickStart function, text=' + text);

    // The target language
    const target = destLang;

    // Translates some text
    const [translation] = await translate.translate(text, target);
    console.log('Text: ' + text);
    console.log('Translation: ' + translation);
    msg.reply('Translation: ' + translation);
  }

  quickStart(inText);
  // [END translate_quickstart]
}

const downloadImageAttachment = function (msg) {
  const extensions = ["png", "jpg", "jpeg", "gif"];
  
  if(msg.attachments.first()){//checks if there is an attachment
    console.log("got ATTACHMENT: ", msg.attachments.first());
  }
  else {
    console.log("got NO ATTACHMENTS");
    return;
  }
  
  const optionsStart = {
    uri: msg.attachments.first().url,
    method: 'GET',
    encoding: "binary"
  }
  return rp(optionsStart)
    .then(function(body, data) {
      let writeStream = fs.createWriteStream('testoutput.jpg');
      //console.log(body)
      writeStream.write(body, 'binary');
      writeStream.on('finish', () => {
        console.log('wrote all data to file');
      });
      writeStream.end();
      return 'testoutput.jpg';
    }
  );
}


const handleTranslateCommand = function(destLang, msg) {
  let cmdSplit = msg.content.split(' ');
  let textInTranslate = "error";
  if (cmdSplit.length < 2) {
  	if (lastMessage == "" && !msg.attachments.first()) {
  		msg.reply('must supply a messge');
  		return;
  	}
  	textInTranslate = lastMessage;
  } else {
  	textInTranslate = msg.content.substring(4);
  }
  if (textInTranslate.length > 600) {
		msg.reply("Text is too long");
  	return;
	}
  console.log('incoming text to translate is ' + textInTranslate);
  if(msg.attachments.first()) {
    downloadImageAttachment(msg).then(function(filename) {
      console.log('inside wonload: filename=' + filename);
      getTextFromImage(filename).then(function(texts) {
        console.log('got texts final=', texts);
        let textDetected = "";
        texts.forEach(text => textDetected += text.description);
        msg.reply('Text Detected=' + textDetected.substring(0,1900));
      });
    });
  }
  else {
	  translate(destLang, textInTranslate, msg);
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

async function getTextFromImage(filename) {
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  const [result] = await client.labelDetection(filename);
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
  
  const [textResult] = await client.textDetection(filename);
  const texts = textResult.textAnnotations;
  console.log('Texts:');
  texts.forEach(text => console.log(text.description));
  return texts;
}

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
    else if (cmdSplit[0].startsWith('!tr')) {
      if (cmdSplit[0].startsWith('!tr-')) {
        let destLang = cmdSplit[0].substring(4);
        if (destLang === "") {
          destLang = "fr";
        }
        console.log("got destLang=" + destLang);
        handleTranslateCommand(destLang, msg);
      }
      else {
        handleTranslateCommand('fr', msg);
      }
    }
    else if (cmdSplit[0] === '!fr') {
      handleTranslateCommand('fr', msg);
    }
    else if (cmdSplit[0] === '!it') {
      handleTranslateCommand('it', msg);
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
		    	textToStream(textToTranslate, voiceAccent, voiceGender)
					.then(function(filename) {
						console.log('got stream in promise, name=' + filename);
						const dispatcher = connection.play(filename);
						dispatcher.setVolume(0.5); // Set the volume to 50%
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
  	// !voice accent fr-FR
  	else if (cmdSplit[0] === '!voice') {
  		if (cmdSplit.length < 3) {
	    	msg.reply('example usage: !voice accent fr-FR, !voice gender male');
  			return;
  		}
  		if (cmdSplit[1] === 'accent') {
  			voiceAccent = cmdSplit[2];
  			msg.reply('changed accent to ' + voiceAccent);
  			return;
  		}
  		if (cmdSplit[1] === 'gender') {
  			if (cmdSplit[2] === 'male') {
  				voiceGender = 'MALE';
  				msg.reply('guy voice activated');
  			}
  			else {
  				voiceGender = 'FEMALE';
  				msg.reply('gal voice activated');
  			}
  			return;
  		}
  	}
  	else {
  		// in case we want to refer to the last message
  		lastMessage = msg.content;
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
