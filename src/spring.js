const presets = require('./presets');

const defaultConfig = {
  ...presets.noWobble,
  precision: 0.01,
};

module.exports = function spring(val, config) {
  return {...defaultConfig, ...config, val};
}
