// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(
  projectId = 'formal-triode-259814' // Your GCP Project Id
) {
  // [START translate_quickstart]
  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  //const projectId = 'formal-triode-259814';

  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Instantiates a client
  const translate = new Translate({projectId});

  async function quickStart() {
    // The text to translate
    const text = 'Hello, world!';

    // The target language
    const target = 'fr';

    // Translates some text into Russian
    const [translation] = await translate.translate(text, target);
    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);
  }

  quickStart();
  // [END translate_quickstart]
}

main(...process.argv.slice(2));
