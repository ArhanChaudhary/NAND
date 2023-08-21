
const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [
    cssnano,
    postcssPresetEnv,
  ],
};