const uniqueSlug = require('unique-slug');
const utils = require('mocha/lib/utils');

module.exports = (str) => `${utils.slug(str)}-${uniqueSlug(str)}`.trim()
