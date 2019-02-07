const fs = require('fs');
const Ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const inquirer = require('inquirer');

const mode_questions = require('./lib/mode_questions');
const create_template = require('./lib/create_template');

async function main() {
  const args = process.argv;
  const filename = args[args.length - 1];
  const DEST = path.resolve(process.cwd(), filename);
  /* Check if the filename already exists or not in the specified folder */
  if (fs.existsSync(DEST)) {
    console.log(chalk.red.bold(`\nA folder with similar name already exists! Create a project with a different filename or delete the already existing folder.`));
    process.exit(0);
  }

  const ans = await inquirer.prompt([mode_questions]);
  create_template(ans.mode, DEST);

  /* Install npm packages */
  let spinner = new Ora({
    text: chalk.blue('Installing npm packages'),
    stream: process.stdout
  });
  spinner.start();
  await execa('npm', ['install', '--prefix', DEST]);
  spinner.succeed();
  console.log("\n");
  console.log(chalk.magenta("----------------------------------------------"));
  console.log(chalk.green(`Finished creating extension ${chalk.yellow(DEST)}.`));

}



module.exports = main;