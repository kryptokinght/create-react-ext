#!/usr/bin/env node

const path = require('path');
const chromeLaunch = require('chrome-launch');

require('colors');

const url = 'https://www.github.com/kryptokinght';
const app = path.resolve(__dirname, '..', 'app');
const args = [`--load-extension=${app}`];

chromeLaunch(url, { args });