/* Minimal dev.js file */

const execa = require('execa');
const argv = require('yargs').argv;
require('colors');

// choose browser to display
if (argv.browser === 'chrome') {
  execa('node', ['scripts/chrome-launch.js']).stdout.pipe(process.stdout);
}
else if (argv.browser === 'firefox') {
  execa('web-ext', ['run', '--source-dir', 'app', '--pref', 'startup.homepage_welcome_url=https://www.github.com/kryptokinght']);
}



