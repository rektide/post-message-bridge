'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function Request(timeout) {
  var _this = this;

  _classCallCheck(this, Request);

  this.response = new Promise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
  this.timeout = setTimeout(function () {
    return _this.reject(new Error('The request timed out.'));
  }, timeout);
};

module.exports = function () {
  function _class(_ref) {
    var _this2 = this;

    var _ref$source = _ref.source;
    var source = _ref$source === undefined ? typeof window === 'undefined' ? null : window : _ref$source;
    var _ref$origin = _ref.origin;
    var origin = _ref$origin === undefined ? '*' : _ref$origin;
    var _ref$timeout = _ref.timeout;
    var timeout = _ref$timeout === undefined ? 100 : _ref$timeout;

    _classCallCheck(this, _class);

    // Validate options.
    if (!source || !source.addEventListener || !source.postMessage) throw new TypeError('Source must be a DOM window.');
    if (!origin || typeof origin !== 'string') throw new TypeError('Origin must be a non empty string.');
    if (isNaN(parseFloat(timeout)) || !isFinite(timeout) || timeout < 0) throw new TypeError('Timeout must be a number greater than 0.');

    // Assign options.
    this._source = source;
    this._origin = origin;
    this._timeout = timeout;

    // Initialize.
    this._target = null;
    this._handlers = new Map();
    this._requests = new Map();
    this._listener = function (event) {
      return _this2._onMessage(event);
    };
  }

  _createClass(_class, [{
    key: 'connect',
    value: function connect(target) {
      this.disconnect();
      if (!target || !target.addEventListener || !target.postMessage) throw new TypeError('Target must be a DOM window.');
      this._target = target;
      this._target.addEventListener('message', this._listener, false);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (this._target) this._target.removeEventListener('message', this._listener);
    }
  }, {
    key: 'register',
    value: function register(name, handler) {
      this._handlers.set(name, handler);
    }
  }, {
    key: 'unregister',
    value: function unregister(name) {
      this._handlers.delete(name);
    }
  }, {
    key: 'request',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, payload) {
        var transfer = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
        var id, request;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this._target) {
                  _context.next = 2;
                  break;
                }

                throw new Error('Interface is not connected.');

              case 2:

                // Generate promises for handshake and response.
                id = Math.random();
                request = new Request();

                // Store the request.

                this._requests.set(id, request);

                // Send the message across the interface.
                this._send({ id: id, type: 'request', name: name, payload: payload, transfer: transfer });

                // Wait for the response.
                _context.next = 8;
                return request.response;

              case 8:
                return _context.abrupt('return', _context.sent);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function request(_x, _x2, _x3) {
        return ref.apply(this, arguments);
      }

      return request;
    }()
  }, {
    key: '_onRequest',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(_ref2) {
        var id = _ref2.id;
        var name = _ref2.name;
        var payload = _ref2.payload;
        var response;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this._handlers.has(name)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return', this._send({ id: id, type: 'error', payload: 'Request was unhandled' }));

              case 2:
                this._send({ id: id, type: 'receipt' });
                _context2.prev = 3;
                _context2.next = 6;
                return this._handlers.get(name)(payload);

              case 6:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 9;
                  break;
                }

                _context2.t0 = {};

              case 9:
                response = _context2.t0;

                this._send({ id: id, type: 'response', payload: response.payload, transfer: response.transfer });
                _context2.next = 16;
                break;

              case 13:
                _context2.prev = 13;
                _context2.t1 = _context2['catch'](3);

                this._send({ id: id, type: 'error', payload: String(_context2.t1) });

              case 16:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[3, 13]]);
      }));

      function _onRequest(_x5) {
        return ref.apply(this, arguments);
      }

      return _onRequest;
    }()
  }, {
    key: '_send',
    value: function _send(_ref3) {
      var id = _ref3.id;
      var type = _ref3.type;
      var payload = _ref3.payload;
      var transfer = _ref3.transfer;

      if (this._target) this._target.postMessage({ id: id, type: type, payload: payload }, this._origin, transfer);
    }
  }, {
    key: '_onReceipt',
    value: function _onReceipt(_ref4) {
      var id = _ref4.id;

      if (!this._requests.has(id)) return;
      clearTimeout(this._requests.get(id).timeout);
    }
  }, {
    key: '_onResponse',
    value: function _onResponse(_ref5) {
      var id = _ref5.id;
      var payload = _ref5.payload;

      if (!this._requests.has(id)) return;
      this._requests.get(id).response.resolve(payload);
      this._requests.delete(id);
    }
  }, {
    key: '_onError',
    value: function _onError(_ref6) {
      var id = _ref6.id;
      var _ref6$message = _ref6.message;
      var message = _ref6$message === undefined ? 'An unknown error has occured.' : _ref6$message;

      if (!this._requests.has(id)) return;
      this._requests.get(id).reject(new Error(message));
      this._requests.delete(id);
    }
  }, {
    key: '_onMessage',
    value: function _onMessage(_ref7) {
      var source = _ref7.source;
      var origin = _ref7.origin;
      var data = _ref7.data;

      if (!this._target || source !== this._target || this._origin !== '*' && origin !== this._origin) {
        return this._source.console.debug('Dropping message from unknown source or origin');
      } else if (!data || !data.type) {
        return this._source.console.debug('Dropping non-conforming message.');
      }

      if (data.type === 'request') return this._onRequest(data);else if (data.type === 'receipt') return this._onReceipt(data);else if (data.type === 'response') return this._onResponse(data);else if (data.type === 'error') return this._onError(data);else this._source.console.debug('Dropping message with unknown type.');
    }
  }]);

  return _class;
}();