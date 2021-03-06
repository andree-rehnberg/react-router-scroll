import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import warning from 'warning';
import { withRouter } from 'react-router-dom';
import ScrollBehavior from 'scroll-behavior';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var DEV = process.env.NODE_ENV !== 'production';

var propTypes = {
  scrollKey: PropTypes.string.isRequired,
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired
};

var contextTypes = {
  // This is necessary when rendering on the client. However, when rendering on
  // the server, this container will do nothing, and thus does not require the
  // scroll behavior context.
  scrollBehavior: PropTypes.object
};

var ScrollContainer = function (_React$Component) {
  inherits(ScrollContainer, _React$Component);

  function ScrollContainer(props, context) {
    classCallCheck(this, ScrollContainer);

    // We don't re-register if the scroll key changes, so make sure we
    // unregister with the initial scroll key just in case the user changes it.
    var _this = possibleConstructorReturn(this, (ScrollContainer.__proto__ || Object.getPrototypeOf(ScrollContainer)).call(this, props, context));

    _this.shouldUpdateScroll = function (prevRouterProps, routerProps) {
      var shouldUpdateScroll = _this.props.shouldUpdateScroll;

      if (!shouldUpdateScroll) {
        return true;
      }

      // Hack to allow accessing scrollBehavior._stateStorage.
      return shouldUpdateScroll.call(_this.context.scrollBehavior.scrollBehavior, prevRouterProps, routerProps);
    };

    _this.scrollKey = props.scrollKey;
    return _this;
  }

  createClass(ScrollContainer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.context.scrollBehavior.registerElement(this.props.scrollKey, ReactDOM.findDOMNode(this), this.shouldUpdateScroll);

      // Only keep around the current DOM node in development, as this is only
      // for emitting the appropriate warning.
      if (DEV) {
        this.domNode = ReactDOM.findDOMNode(this);
      }
    }

    // componentWillReceiveProps(nextProps) {
    //   warning(
    //     nextProps.scrollKey === this.props.scrollKey,
    //     '<ScrollContainer> does not support changing scrollKey.',
    //   );
    // }

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      process.env.NODE_ENV !== 'production' ? warning(prevProps.scrollKey === this.props.scrollKey, '<ScrollContainer> does not support changing scrollKey.') : void 0;

      if (DEV) {
        var prevDomNode = this.domNode;
        this.domNode = ReactDOM.findDOMNode(this);

        process.env.NODE_ENV !== 'production' ? warning(this.domNode === prevDomNode, '<ScrollContainer> does not support changing DOM node.') : void 0;
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.context.scrollBehavior.unregisterElement(this.scrollKey);
    }
  }, {
    key: 'render',
    value: function render() {
      return React.Children.only(this.props.children);
    }
  }]);
  return ScrollContainer;
}(React.Component);

ScrollContainer.propTypes = propTypes;
ScrollContainer.contextTypes = contextTypes;

var STATE_KEY_PREFIX = '@@scroll|';

var SessionStorage = function () {
  function SessionStorage() {
    classCallCheck(this, SessionStorage);
  }

  createClass(SessionStorage, [{
    key: 'read',
    value: function read(location, key) {
      var stateKey = this.getStateKey(location, key);

      try {
        var value = sessionStorage.getItem(stateKey);
        return JSON.parse(value);
      } catch (e) {
        return {};
      }
    }
  }, {
    key: 'save',
    value: function save(location, key, value) {
      var stateKey = this.getStateKey(location, key);
      var storedValue = JSON.stringify(value);

      try {
        sessionStorage.setItem(stateKey, storedValue);
      } catch (e) {}
    }
  }, {
    key: 'getStateKey',
    value: function getStateKey(location, key) {
      var locationKey = location.key;
      var stateKeyBase = '' + STATE_KEY_PREFIX + locationKey;
      return key == null ? stateKeyBase : stateKeyBase + '|' + key;
    }
  }]);
  return SessionStorage;
}();

var propTypes$1 = {
  shouldUpdateScroll: PropTypes.func,
  children: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  scrollBehavior: PropTypes.func
};

var childContextTypes = {
  scrollBehavior: PropTypes.object.isRequired
};

var ScrollContext = function (_React$Component) {
  inherits(ScrollContext, _React$Component);

  function ScrollContext(props, context) {
    classCallCheck(this, ScrollContext);

    var _this = possibleConstructorReturn(this, (ScrollContext.__proto__ || Object.getPrototypeOf(ScrollContext)).call(this, props, context));

    _this.shouldUpdateScroll = function (prevRouterProps, routerProps) {
      var shouldUpdateScroll = _this.props.shouldUpdateScroll;

      if (!shouldUpdateScroll) {
        return true;
      }

      // Hack to allow accessing scrollBehavior._stateStorage.
      return shouldUpdateScroll.call(_this.scrollBehavior, prevRouterProps, routerProps);
    };

    _this.registerElement = function (key, element, shouldUpdateScroll) {
      _this.scrollBehavior.registerElement(key, element, shouldUpdateScroll, _this.getRouterProps());
    };

    _this.unregisterElement = function (key) {
      _this.scrollBehavior.unregisterElement(key);
    };

    var history = props.history;


    var ScrollBehaviorConstructor = _this.props.scrollBehavior || ScrollBehavior;
    _this.scrollBehavior = new ScrollBehaviorConstructor({
      addTransitionHook: history.listen,
      stateStorage: new SessionStorage(),
      getCurrentLocation: function getCurrentLocation() {
        return _this.props.location;
      },
      shouldUpdateScroll: _this.shouldUpdateScroll
    });

    _this.scrollBehavior.updateScroll(null, _this.getRouterProps());
    return _this;
  }

  createClass(ScrollContext, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        scrollBehavior: this
      };
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _props = this.props,
          location = _props.location,
          history = _props.history;

      var prevLocation = prevProps.location;

      if (location === prevLocation) {
        return;
      }

      var prevRouterProps = {
        history: prevProps.history,
        location: prevProps.location
      };

      this.scrollBehavior.updateScroll(prevRouterProps, { history: history, location: location });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.scrollBehavior.stop();
    }
  }, {
    key: 'getRouterProps',
    value: function getRouterProps() {
      var _props2 = this.props,
          history = _props2.history,
          location = _props2.location;

      return { history: history, location: location };
    }
  }, {
    key: 'render',
    value: function render() {
      return React.Children.only(this.props.children);
    }
  }]);
  return ScrollContext;
}(React.Component);

ScrollContext.propTypes = propTypes$1;
ScrollContext.childContextTypes = childContextTypes;

var ScrollBehaviorContext = withRouter(ScrollContext);

export { ScrollContainer, ScrollBehaviorContext as ScrollContext };
