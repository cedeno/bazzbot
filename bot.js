const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const Scraper = require('./scraper');

const urlPrefix = 'https://www.linternaute.fr/dictionnaire/fr/definition/';
const searchUrlPrefix = 'http://www.linternaute.com/encyclopedie/recherche/id-195/?f_libelle=';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
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
	    let url = urlPrefix + word + '/';
	    console.log('url=', url);
	    Scraper.defParse(url).then(function (md) {
	    	console.log('got md=', md);
	    	msg.reply(md);
	    });
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
