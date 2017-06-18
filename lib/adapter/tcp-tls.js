/**
 * Licensed under the MIT License
 *
 * @author   Kanstantsin A Kamkou (2ka.by)
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/node-gelf-pro
 */

'use strict';

// required stuff
var path = require('path'),
  tls = require('tls'),
  tcp = require(path.join(__dirname, 'tcp'));

// the class itself
var adapter = Object.create(tcp);

/**
 * @param {Object} options
 * @returns {tls.TLSSocket}
 * @access private
 */
adapter._createInstance = function (options) {
  adapter._instance = tls.connect(options).setKeepAlive(true).once('error', function () {
    adapter._instance.end();
    adapter._instance.destroy();
  }).once('close', function () {
    adapter._createInstance(options);
  });
  return adapter._instance;
};

// exporting outside
module.exports = adapter;
