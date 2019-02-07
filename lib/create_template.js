
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const ncp = require('ncp').ncp;
ncp.limit = 16;

async function create_template(mode, DEST) {

  let template_src;
  if (mode === 3) {
    template_src = path.resolve(__dirname, '..', 'basic-template');
  }
  else
    template_src = path.resolve(__dirname, '..', 'custom-template');

  try {
    await fs.copy(template_src, DEST);
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = create_template;