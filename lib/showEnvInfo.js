const envinfo = require('envinfo');
const chalk = require('chalk');

module.exports = () => {
  console.log(chalk.bold('\nEnvironment Info:'));
  return envinfo
    .run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'npm', 'Yarn'],
        Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari'],
        npmGlobalPackages: ['create-react-ext'],
      },
      {
        clipboard: false,
        duplicates: true,
        showNotFound: true,
      }
    )
    .then(console.log);
}