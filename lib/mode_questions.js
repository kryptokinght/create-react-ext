const chalk = require('chalk');

module.exports = {
  type: 'list',
  message: 'What kind of extension do you want?',
  name: 'mode',
  choices: [
    {
      name: `1. Just give me an extension ${chalk.yellow("   (with recommended config)")} `,
      value: 1
    },
    {
      name: `2. Custom React extension ${chalk.yellow("      (add your own customizations)")} `,
      value: 2
    },
    {
      name: `3. Basic extension ${chalk.yellow("             (no React and config)")} `,
      value: 3
    }
  ],
  validate: function (answer) {
    if (answer.length < 1) {
      return 'Choose at least one of the extension types!';
    }
    return true;
  }
};