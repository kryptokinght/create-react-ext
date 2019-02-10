const Ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const commander = require('commander');
const spawn = require('cross-spawn');
const validateProjectName = require('validate-npm-package-name');

const mode_questions = require('./lib/mode_questions');
const showEnvInfo = require('./lib/showEnvInfo');
const create_template = require('./lib/create_template');
const packageJson = require('./package.json');

// These files should be allowed to remain on a failed install,
// but then silently removed during the next create.
const errorLogFilePatterns = [
  'npm-debug.log',
  'yarn-error.log',
  'yarn-debug.log',
];

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .option('--verbose', 'print additional logs')
  .option('--info', 'print environment debug info')
  .allowUnknownOption()
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
    console.log();
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(
      `      ${chalk.cyan(
        'https://github.com/kryptokinght/create-react-ext/issues/new'
      )}`
    );
    console.log();
  })
  .parse(process.argv);

if (program.info) {
  return showEnvInfo();
}

const hasMultipleProjectNameArgs = process.argv[3] && !process.argv[3].startsWith('-');
if (typeof projectName === 'undefined' || hasMultipleProjectNameArgs) {
  console.log();
  if (hasMultipleProjectNameArgs) {
    console.error(
      `You have provided more than one argument for ${chalk.green(
        '<project-directory>'
      )}.`
    );
    console.log();
    console.log('Please specify only one project directory, without spaces.');
  } else {
    console.error('Please specify the project directory:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
  }
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-extension')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}


createApp(
  projectName,
  program.verbose
);

async function createApp(
  name,
  verbose
) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }

  console.log(`Creating a new web Extension in ${chalk.green(root)}.`);
  console.log();

  //****************************************************************
  const ans = await inquirer.prompt([mode_questions]);
  create_template(ans.mode, root);

  // ************MY CONTENT******************************************

  process.chdir(root);
  run(
    root,
    appName,
    verbose
  );
}



function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}


function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    '.hg',
    '.hgignore',
    '.hgcheck',
    '.npmignore',
    'mkdocs.yml',
    'docs',
    '.travis.yml',
    '.gitlab-ci.yml',
    '.gitattributes',
  ];
  console.log();

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter(file => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter(
      file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0)
    );

  if (conflicts.length > 0) {
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();
    for (const file of conflicts) {
      console.log(`  ${file}`);
    }
    console.log();
    console.log('Either try using a new directory name, or remove the files listed above.');

    return false;
  }

  // Remove any remnant files from a previous installation
  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach(file => {
    errorLogFilePatterns.forEach(errorLogFilePattern => {
      // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
      if (file.indexOf(errorLogFilePattern) === 0) {
        fs.removeSync(path.join(root, file));
      }
    });
  });
  return true;
}

function run(
  root,
  appName,
  verbose
) {
  console.log('Installing packages. This might take a couple of minutes.');

  // Install npm packages
  let spinner = new Ora({
    text: chalk.blue('Installing npm packages'),
    stream: process.stdout
  });
  spinner.start();
  install(verbose).catch(reason => {
    console.log();
    console.log('Aborting installation.');
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(chalk.red('Unexpected error. Please report it as a bug:'));
      console.log(reason);
    }
    console.log();

    // On 'exit' we will delete these files from target directory.
    const knownGeneratedFiles = ['package.json', 'yarn.lock', 'node_modules'];
    const currentFiles = fs.readdirSync(path.join(root));
    currentFiles.forEach(file => {
      knownGeneratedFiles.forEach(fileToMatch => {
        // This remove all of knownGeneratedFiles.
        if (file === fileToMatch) {
          console.log(`Deleting generated file... ${chalk.cyan(file)}`);
          fs.removeSync(path.join(root, file));
        }
      });
    });
    const remainingFiles = fs.readdirSync(path.join(root));
    if (!remainingFiles.length) {
      // Delete target folder if empty
      console.log(
        `Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(
          path.resolve(root, '..')
        )}`
      );
      process.chdir(path.resolve(root, '..'));
      fs.removeSync(path.join(root));
    }
    console.log('Done.');
    process.exit(1);
  });
  spinner.succeed();

  console.log("\n");
  console.log(chalk.magenta("----------------------------------------------"));
  console.log(chalk.green(`Finished creating extension ${chalk.yellow(DEST)}.`));
}

function install(verbose) {
  return new Promise((resolve, reject) => {
    const command = 'npm';
    let args = [
      'install',
      '--loglevel',
      'error',
    ];

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}





/*
async function main() {
  const args = process.argv;
  const filename = args[args.length - 1];
  const DEST = path.resolve(process.cwd(), filename);
  // Check if the filename already exists or not in the specified folder
  if (fs.existsSync(DEST)) {
    console.log(chalk.red.bold(`\nA folder with similar name already exists! Create a project with a different filename or delete the already existing folder.`));
    process.exit(0);
  }

  const ans = await inquirer.prompt([mode_questions]);
  create_template(ans.mode, DEST);

  // Install npm packages
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
 */