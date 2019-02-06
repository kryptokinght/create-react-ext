const inquirer = require('inquirer');
const path = require('path');

const mode_questions = require('./lib/mode_questions');
const create_template = require('./lib/create_template');

async function main() {
  const args = process.argv;
  const filename = args[args.length - 1];
  const ans = await inquirer.prompt([mode_questions]);

  create_template(ans.mode, filename);

}



module.exports = main;