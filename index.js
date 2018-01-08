#!/usr/bin/env node

const fs = require('fs');
const url = require('url');
const path = require('path');

const opn = require('opn');
const mri = require('mri');
const chalk = require('chalk');

const configPath = path.resolve(__dirname, 'config.json');
const config = require(configPath);

const commandArgs = mri(process.argv.slice(2), {
  alias: {
    h: 'help',
    g: 'google',
    y: 'yandex',
    d: 'duck',
    b: 'bing',
    D: 'default',
  },
  default: {
    D: null,
  },
  boolean: ['q', 'y', 'd', 'b', 'google', 'yandex', 'duck', 'bing', 'help'],
  string: ['default'],
});

const availableEngines = config.availableEngines.map(s => chalk.green.bold(s)).join(', ');

const helpString = `
  Open selected search engine (Google by default) in a default browser with a provided query

  Usage:
    googleme <this>

  Options:
    -g, --google            Use Google - https://google.com/
    -y, --yandex            Use Yandex - https://yandex.ru/
    -d, --duck              Use DuckDuckGo - https://duckduckgo.com/
    -b, --bing              Use Bing - https://www.bing.com/

    -D, --default <engine>  Set default search engine to <engine>.
                            Avaliable values are ${availableEngines}

  Example:
    googleme how to cook an egg
`;

const selectEngine = flags => config.availableEngines.find(key => flags[key]) || config.engine;

const main = commandArgs => {
  const { _, help, google, yandex, duck, bing, default: newEngine } = commandArgs;
  const query = _.join(' ');

  if (help === true) {
    console.log(helpString);
  } else if (newEngine !== null) {
    const isEngineSupported = config.availableEngines.indexOf(newEngine) !== -1;
    if (isEngineSupported === true) {
      const newConfig = JSON.stringify(Object.assign(config, { engine: newEngine }), null, 2);
      const description = config.description[newEngine];
      const baseUrl = url.parse(config.baseUrl[newEngine]);
      const displayUrl = baseUrl.protocol + '//' + baseUrl.host;

      fs.writeFileSync(configPath, newConfig, 'utf-8');
      console.log(`Default search engine is set to ${chalk.bold(description)} - ${displayUrl}`);
    } else {
      console.log(`Unsupported search engine: "${newEngine}"`);
      console.log(`Avaliable values are ${availableEngines}`);
    }
  } else {
    const engine = selectEngine({ google, yandex, duck, bing });
    const url = config.baseUrl[engine] + encodeURIComponent(query);

    opn(url);
    console.log(`🔎  ${url}`);
    process.exit();
  }
};

main(commandArgs);
