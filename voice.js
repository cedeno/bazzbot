/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START tts_quickstart]
// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
const fs = require('fs');
const util = require('util');
const stream = require('stream');

function makeMP3Filename() {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 20; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return "./mp3s/" + result + ".mp3";
}

const textToStream = async function(textIn, accent, gender) {
  let text = textIn;
  if (textIn.length > 600) {
    text = "Text is too long";
  }

  // Creates a client
  const client = new textToSpeech.TextToSpeechClient();

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML Voice Gender (optional)
    voice: {languageCode: accent, ssmlGender: gender},
    // Select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3', pitch: '0', speakingRate: '1.0'},
  };

  // Performs the Text-to-Speech request
  const [response] = await client.synthesizeSpeech(request);

  // Write the binary audio content to a local file
  const filename = makeMP3Filename();
  console.log('made filename ', filename);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(filename, response.audioContent, 'binary');
  console.log('Audio content written to file: '+ filename);
  return filename;
}
// [END tts_quickstart]
//main().catch(console.error);

module.exports = textToStream;
