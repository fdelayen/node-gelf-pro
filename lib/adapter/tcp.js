/**
 * Licensed under the MIT License
 *
 * @author   Kanstantsin A Kamkou (2ka.by)
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/node-gelf-pro
 */

'use strict';

// required stuff
var _ = require('lodash'),
  path = require('path'),
  net = require('net'),
  abstract = require(path.join(__dirname, 'abstract'));

// the class itself
var adapter = Object.create(abstract);

/**
 * Sends a message to the server
 * @param {String} message
 * @param {Function} callback
 * @returns {adapter}
 */
adapter.send = function (message, callback) {
  var cb = _.once(callback),
    client = this._instance ? this._instance : this._createInstance(this.options);

  if (client.connecting) {
    client.once('connect', sendMessage);
  } else {
    sendMessage();
  }

  function sendMessage() {
    var msg = new Buffer(message), // @todo! 1h add deflation with GELF 2.0
      packet = new Buffer(Array.prototype.slice.call(msg, 0, msg.length).concat(0x00));
    client.write(packet, null, function () {
      cb(null, packet.length);
    });
  }

  return this;
};

/**
 * @param {Object} options
 * @returns {net.Socket}
 * @access private
 */
adapter._createInstance = function (options) {
  adapter._instance = net.connect(options).setKeepAlive(true).once('error', function () {
    adapter._instance.end();
    adapter._instance.destroy();
  }).once('close', function () {
    adapter._createInstance(options);
  });
  return adapter._instance;
};

// exporting outside
module.exports = adapter;
