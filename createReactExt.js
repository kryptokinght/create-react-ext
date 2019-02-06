var inquirer = require('inquirer');

async function main() {
  const ans = await inquirer.prompt([
    {
      type: 'list',
      message: 'What kind of extension do you want?',
      name: 'extensionType',
      choices: [
        "Just give me an extension (with recommended config)",
        "Basic Extension           (no React and config)",
        "Custom React extension    (add your own toppings)"
      ],
      validate: function (answer) {
        if (answer.length < 1) {
          return 'Choose at least one of the extension types!';
        }
        return true;
      }
    }
  ]);

  console.log(JSON.stringify(ans, null, '  '));
  console.log();
}



module.exports = main;