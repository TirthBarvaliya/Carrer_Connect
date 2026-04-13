const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Tells Puppeteer to install Chrome locally inside the project directory
  // instead of the global ~/.cache directory which Azure wipes out.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
