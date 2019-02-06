
const path = require('path');
const chalk = require('chalk');
const ncp = require('ncp').ncp;
ncp.limit = 16;

async function create_template(mode, filename) {
  const EXT_LOCATION = path.resolve(process.cwd(), filename);
  if (mode === 1) {
    ncp(path.resolve(__dirname, '..', 'custom-template'), path.resolve(process.cwd(), filename), function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("\n\n");
      console.log(chalk.magenta("----------------------------------------------"));
      console.log(chalk.green(`Finished creating extension ${chalk.yellow(filename)}.`));
    });
  }

  if (mode === 3) {
    ncp(path.resolve(__dirname, '..', 'basic-template'), path.resolve(process.cwd(), filename), function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("\n\n");
      console.log(chalk.magenta("----------------------------------------------"));
      console.log(chalk.green(`Finished creating basic extension ${chalk.yellow(filename)}.`));
    });
  }
}

module.exports = create_template;