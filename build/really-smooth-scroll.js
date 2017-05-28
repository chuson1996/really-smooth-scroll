(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ReallySmoothScroll", [], factory);
	else if(typeof exports === 'object')
		exports["ReallySmoothScroll"] = factory();
	else
		root["ReallySmoothScroll"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var SmoothScroll = __webpack_require__(1);
	var spring = __webpack_require__(9);
	
	var mousewheelSensitivity = 6;
	var keydownSensitivity = 6;
	var forceStop = false;
	
	function getSpringVal(val) {
	  if (typeof val === 'number') return val;
	  return val.val;
	}
	
	function stayInRange(min, max, value) {
	  return Math.min(max, Math.max(min, value));
	}
	
	function difference(a, b) {
	  return Math.abs(a - b);
	}
	
	var moving = false;
	var scrollY = spring(0);
	
	var smoothScroll = new SmoothScroll({
	  style: { scrollY: 0 },
	  defaultStyle: { scrollY: 0 },
	  onRest: function onRest() {
	    moving = false;
	  }
	});
	
	function move(deltaY) {
	  if (!moving) {
	    if (difference(getSpringVal(scrollY), Math.round(window.scrollY)) > 4) {
	      scrollY = window.scrollY;
	      smoothScroll.componentWillReceiveProps({
	        style: { scrollY: scrollY }
	      });
	    }
	    moving = true;
	  }
	
	  if (document.querySelector('html').style.overflowY === 'hidden') {
	    return;
	  }
	
	  scrollY = stayInRange(0, document.querySelector('html').offsetHeight - window.innerHeight,
	  // getSpringVal(scrollY) + deltaY
	  window.scrollY + deltaY * mousewheelSensitivity);
	  window.scrollTo(window.scrollX, scrollY);
	}
	
	function onkeydown(e) {
	  if (e.target === document.body && e.key === 'ArrowDown') {
	    e.preventDefault();
	    move(keydownSensitivity * 3);
	  } else if (e.target === document.body && e.key === 'ArrowUp') {
	    e.preventDefault();
	    move(-keydownSensitivity * 3);
	  }
	}
	
	var mousewheelTimeout = void 0;
	var maxDeltaY = 0;
	function onmousewheel(e) {
	  var deltaY = stayInRange(-50, 50, e.deltaY);
	
	  if (maxDeltaY === 0 || !forceStop) {
	    maxDeltaY = deltaY;
	    // console.log('Set maxDeltaY');
	  }
	  if (document.body.contains(e.target) || e.target === document.body) {
	    e.preventDefault();
	    if (forceStop) {
	      // console.log(Math.abs(maxDeltaY), Math.abs(deltaY));
	      if (Math.abs(maxDeltaY) < Math.abs(deltaY) || maxDeltaY * deltaY < 0) {
	        // console.log('Should disable forceStop now 2');
	        forceStop = false;
	      } else {
	        maxDeltaY = deltaY;
	      }
	
	      if (mousewheelTimeout) clearTimeout(mousewheelTimeout);
	      mousewheelTimeout = setTimeout(function () {
	        // console.log('Should disable forceStop now');
	        forceStop = false;
	        maxDeltaY = 0;
	      }, 100);
	      return;
	    }
	    // console.log('Wheeling', forceStop);
	    move(deltaY);
	  }
	}
	
	window._scrollTo = window.scrollTo.bind(window);
	exports.shim = function shim() {
	  window.addEventListener('wheel', onmousewheel);
	  window.addEventListener('keydown', onkeydown);
	
	  if (!window.oldScrollTo) {
	    window.oldScrollTo = function () {
	      if (moving) {
	        window.stopScrolling();
	      }
	
	      smoothScroll.componentWillReceiveProps({
	        style: { scrollY: arguments.length <= 1 ? undefined : arguments[1] }
	      });
	    };
	
	    window.scrollTo = function (x, y) {
	      window._scrollTo(x, window.scrollY);
	      smoothScroll.componentWillReceiveProps({
	        style: { scrollY: spring(y) }
	      });
	    };
	  }
	  window.stopScrolling = function () {
	    forceStop = true;
	    smoothScroll.componentWillReceiveProps({
	      style: { scrollY: window.scrollY }
	    });
	  };
	};
	
	exports.config = function config(options) {
	  if (options.mousewheelSensitivity) {
	    mousewheelSensitivity = options.mousewheelSensitivity;
	  }
	  if (options.keydownSensitivity) {
	    keydownSensitivity = options.keydownSensitivity;
	  }
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var mapToZero = __webpack_require__(2);
	var stripStyle = __webpack_require__(3);
	var stepper = __webpack_require__(4);
	var defaultNow = __webpack_require__(5);
	var defaultRaf = __webpack_require__(7);
	var shouldStopAnimation = __webpack_require__(8);
	
	var msPerFrame = 1000 / 60;
	
	module.exports = function () {
	  function SmoothScroll(props) {
	    var _this = this;
	
	    _classCallCheck(this, SmoothScroll);
	
	    this.clearUnreadPropStyle = function (destStyle) {
	      var dirty = false;
	      var _state = _this.state,
	          currentStyle = _state.currentStyle,
	          currentVelocity = _state.currentVelocity,
	          lastIdealStyle = _state.lastIdealStyle,
	          lastIdealVelocity = _state.lastIdealVelocity;
	
	
	      for (var key in destStyle) {
	        if (!Object.prototype.hasOwnProperty.call(destStyle, key)) {
	          continue;
	        }
	
	        var styleValue = destStyle[key];
	        if (typeof styleValue === 'number') {
	          if (!dirty) {
	            dirty = true;
	            currentStyle = _extends({}, currentStyle);
	            currentVelocity = _extends({}, currentVelocity);
	            lastIdealStyle = _extends({}, lastIdealStyle);
	            lastIdealVelocity = _extends({}, lastIdealVelocity);
	          }
	
	          currentStyle[key] = styleValue;
	          currentVelocity[key] = 0;
	          lastIdealStyle[key] = styleValue;
	          lastIdealVelocity[key] = 0;
	        }
	      }
	
	      if (dirty) {
	        _this.setState({ currentStyle: currentStyle, currentVelocity: currentVelocity, lastIdealStyle: lastIdealStyle, lastIdealVelocity: lastIdealVelocity });
	      }
	    };
	
	    this.startAnimationIfNecessary = function () {
	      // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
	      // call cb? No, otherwise accidental parent rerender causes cb trigger
	      _this.animationID = defaultRaf(function (timestamp) {
	        // check if we need to animate in the first place
	        var propsStyle = _this.props.style;
	        if (shouldStopAnimation(_this.state.currentStyle, propsStyle, _this.state.currentVelocity)) {
	          if (_this.wasAnimating && _this.props.onRest) {
	            _this.props.onRest();
	          }
	
	          // no need to cancel animationID here; shouldn't have any in flight
	          _this.animationID = null;
	          _this.wasAnimating = false;
	          _this.accumulatedTime = 0;
	          return;
	        }
	
	        _this.wasAnimating = true;
	
	        var currentTime = timestamp || defaultNow();
	        var timeDelta = currentTime - _this.prevTime;
	        _this.prevTime = currentTime;
	        _this.accumulatedTime = _this.accumulatedTime + timeDelta;
	        // more than 10 frames? prolly switched browser tab. Restart
	        if (_this.accumulatedTime > msPerFrame * 10) {
	          _this.accumulatedTime = 0;
	        }
	
	        if (_this.accumulatedTime === 0) {
	          // no need to cancel animationID here; shouldn't have any in flight
	          _this.animationID = null;
	          _this.startAnimationIfNecessary();
	          return;
	        }
	
	        var currentFrameCompletion = (_this.accumulatedTime - Math.floor(_this.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame;
	        var framesToCatchUp = Math.floor(_this.accumulatedTime / msPerFrame);
	
	        var newLastIdealStyle = {};
	        var newLastIdealVelocity = {};
	        var newCurrentStyle = {};
	        var newCurrentVelocity = {};
	
	        for (var key in propsStyle) {
	          if (!Object.prototype.hasOwnProperty.call(propsStyle, key)) {
	            continue;
	          }
	
	          var styleValue = propsStyle[key];
	          if (typeof styleValue === 'number') {
	            newCurrentStyle[key] = styleValue;
	            newCurrentVelocity[key] = 0;
	            newLastIdealStyle[key] = styleValue;
	            newLastIdealVelocity[key] = 0;
	          } else {
	            var newLastIdealStyleValue = _this.state.lastIdealStyle[key];
	            var newLastIdealVelocityValue = _this.state.lastIdealVelocity[key];
	            for (var i = 0; i < framesToCatchUp; i++) {
	              var _stepper = stepper(msPerFrame / 1000, newLastIdealStyleValue, newLastIdealVelocityValue, styleValue.val, styleValue.stiffness, styleValue.damping, styleValue.precision);
	
	              var _stepper2 = _slicedToArray(_stepper, 2);
	
	              newLastIdealStyleValue = _stepper2[0];
	              newLastIdealVelocityValue = _stepper2[1];
	            }
	
	            var _stepper3 = stepper(msPerFrame / 1000, newLastIdealStyleValue, newLastIdealVelocityValue, styleValue.val, styleValue.stiffness, styleValue.damping, styleValue.precision),
	                _stepper4 = _slicedToArray(_stepper3, 2),
	                nextIdealX = _stepper4[0],
	                nextIdealV = _stepper4[1];
	
	            newCurrentStyle[key] = newLastIdealStyleValue + (nextIdealX - newLastIdealStyleValue) * currentFrameCompletion;
	            newCurrentVelocity[key] = newLastIdealVelocityValue + (nextIdealV - newLastIdealVelocityValue) * currentFrameCompletion;
	            newLastIdealStyle[key] = newLastIdealStyleValue;
	            newLastIdealVelocity[key] = newLastIdealVelocityValue;
	          }
	        }
	
	        _this.animationID = null;
	        // the amount we're looped over above
	        _this.accumulatedTime -= framesToCatchUp * msPerFrame;
	
	        _this.setState({
	          currentStyle: newCurrentStyle,
	          currentVelocity: newCurrentVelocity,
	          lastIdealStyle: newLastIdealStyle,
	          lastIdealVelocity: newLastIdealVelocity
	        });
	
	        _this.unreadPropStyle = null;
	
	        _this.startAnimationIfNecessary();
	      });
	    };
	
	    this.wasAnimating = false;
	    this.animationID = null;
	    this.prevTime = 0;
	    this.accumulatedTime = 0;
	    // it's possible that currentStyle's value is stale: if props is immediately
	    // changed from 0 to 400 to spring(0) again, the async currentStyle is still
	    // at 0 (didn't have time to tick and interpolate even once). If we naively
	    // compare currentStyle with destVal it'll be 0 === 0 (no animation, stop).
	    // In reality currentStyle should be 400
	    this.unreadPropStyle = null;
	    // after checking for unreadPropStyle != null, we manually go set the
	    // non-interpolating values (those that are a number, without a spring
	    // config)
	
	
	    this.props = props;
	    this.state = this.defaultState();
	
	    this.prevTime = defaultNow();
	    this.startAnimationIfNecessary();
	  }
	
	  _createClass(SmoothScroll, [{
	    key: 'defaultState',
	    value: function defaultState() {
	      var _props = this.props,
	          defaultStyle = _props.defaultStyle,
	          style = _props.style;
	
	      var currentStyle = defaultStyle || stripStyle(style);
	      var currentVelocity = mapToZero(currentStyle);
	      return {
	        currentStyle: currentStyle,
	        currentVelocity: currentVelocity,
	        lastIdealStyle: currentStyle,
	        lastIdealVelocity: currentVelocity
	      };
	    }
	  }, {
	    key: 'componentWillReceiveProps',
	    value: function componentWillReceiveProps(nextProps) {
	      if (this.unreadPropStyle != null) {
	        // previous props haven't had the chance to be set yet; set them here
	        this.clearUnreadPropStyle(this.unreadPropStyle);
	      }
	
	      this.unreadPropStyle = nextProps.style;
	      if (this.animationID == null) {
	        this.prevTime = defaultNow();
	        this.startAnimationIfNecessary();
	      }
	
	      this.props = _extends({}, this.props, nextProps);
	    }
	  }, {
	    key: 'setState',
	    value: function setState(newState) {
	      this.state = _extends({}, this.state, newState);
	
	      window._scrollTo(window.scrollX, this.state.currentStyle.scrollY);
	    }
	  }]);
	
	  return SmoothScroll;
	}();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	
	// currently used to initiate the velocity style object to 0
	module.exports = function mapToZero(obj) {
	  var ret = {};
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      ret[key] = 0;
	    }
	  }
	  return ret;
	};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';
	
	/* @flow */
	// turn {x: {val: 1, stiffness: 1, damping: 2}, y: 2} generated by
	// `{x: spring(1, {stiffness: 1, damping: 2}), y: 2}` into {x: 1, y: 2}
	
	module.exports = function stripStyle(style) {
	  var ret = {};
	  for (var key in style) {
	    if (!Object.prototype.hasOwnProperty.call(style, key)) {
	      continue;
	    }
	    ret[key] = typeof style[key] === 'number' ? style[key] : style[key].val;
	  }
	  return ret;
	};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";
	
	/* @flow */
	
	// stepper is used a lot. Saves allocation to return the same array wrapper.
	// This is fine and danger-free against mutations because the callsite
	// immediately destructures it and gets the numbers inside without passing the
	// array reference around.
	var reusedTuple = [0, 0];
	module.exports = function stepper(secondPerFrame, x, v, destX, k, b, precision) {
	  // Spring stiffness, in kg / s^2
	
	  // for animations, destX is really spring length (spring at rest). initial
	  // position is considered as the stretched/compressed position of a spring
	  var Fspring = -k * (x - destX);
	
	  // Damping, in kg / s
	  var Fdamper = -b * v;
	
	  // usually we put mass here, but for animation purposes, specifying mass is a
	  // bit redundant. you could simply adjust k and b accordingly
	  // let a = (Fspring + Fdamper) / mass;
	  var a = Fspring + Fdamper;
	
	  var newV = v + a * secondPerFrame;
	  var newX = x + newV * secondPerFrame;
	
	  if (Math.abs(newV) < precision && Math.abs(newX - destX) < precision) {
	    reusedTuple[0] = destX;
	    reusedTuple[1] = 0;
	    return reusedTuple;
	  }
	
	  reusedTuple[0] = newX;
	  reusedTuple[1] = newV;
	  return reusedTuple;
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	
	// Generated by CoffeeScript 1.12.2
	(function () {
	  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;
	
	  if (typeof performance !== "undefined" && performance !== null && performance.now) {
	    module.exports = function () {
	      return performance.now();
	    };
	  } else if (typeof process !== "undefined" && process !== null && process.hrtime) {
	    module.exports = function () {
	      return (getNanoSeconds() - nodeLoadTime) / 1e6;
	    };
	    hrtime = process.hrtime;
	    getNanoSeconds = function getNanoSeconds() {
	      var hr;
	      hr = hrtime();
	      return hr[0] * 1e9 + hr[1];
	    };
	    moduleLoadTime = getNanoSeconds();
	    upTime = process.uptime() * 1e9;
	    nodeLoadTime = moduleLoadTime - upTime;
	  } else if (Date.now) {
	    module.exports = function () {
	      return Date.now() - loadTime;
	    };
	    loadTime = Date.now();
	  } else {
	    module.exports = function () {
	      return new Date().getTime() - loadTime;
	    };
	    loadTime = new Date().getTime();
	  }
	}).call(undefined);
	
	//# sourceMappingURL=performance-now.js.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';
	
	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout() {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	})();
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) {
	    return [];
	};
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var now = __webpack_require__(5),
	    root = typeof window === 'undefined' ? global : window,
	    vendors = ['moz', 'webkit'],
	    suffix = 'AnimationFrame',
	    raf = root['request' + suffix],
	    caf = root['cancel' + suffix] || root['cancelRequest' + suffix];
	
	for (var i = 0; !raf && i < vendors.length; i++) {
	  raf = root[vendors[i] + 'Request' + suffix];
	  caf = root[vendors[i] + 'Cancel' + suffix] || root[vendors[i] + 'CancelRequest' + suffix];
	}
	
	// Some versions of FF have rAF but not cAF
	if (!raf || !caf) {
	  var last = 0,
	      id = 0,
	      queue = [],
	      frameDuration = 1000 / 60;
	
	  raf = function raf(callback) {
	    if (queue.length === 0) {
	      var _now = now(),
	          next = Math.max(0, frameDuration - (_now - last));
	      last = next + _now;
	      setTimeout(function () {
	        var cp = queue.slice(0);
	        // Clear queue here to prevent
	        // callbacks from appending listeners
	        // to the current frame's queue
	        queue.length = 0;
	        for (var i = 0; i < cp.length; i++) {
	          if (!cp[i].cancelled) {
	            try {
	              cp[i].callback(last);
	            } catch (e) {
	              setTimeout(function () {
	                throw e;
	              }, 0);
	            }
	          }
	        }
	      }, Math.round(next));
	    }
	    queue.push({
	      handle: ++id,
	      callback: callback,
	      cancelled: false
	    });
	    return id;
	  };
	
	  caf = function caf(handle) {
	    for (var i = 0; i < queue.length; i++) {
	      if (queue[i].handle === handle) {
	        queue[i].cancelled = true;
	      }
	    }
	  };
	}
	
	module.exports = function (fn) {
	  // Wrap in a new function to prevent
	  // `cancel` potentially being assigned
	  // to the native rAF function
	  return raf.call(root, fn);
	};
	module.exports.cancel = function () {
	  caf.apply(root, arguments);
	};
	module.exports.polyfill = function () {
	  root.requestAnimationFrame = raf;
	  root.cancelAnimationFrame = caf;
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';
	
	// usage assumption: currentStyle values have already been rendered but it says
	// nothing of whether currentStyle is stale (see unreadPropStyle)
	module.exports = function shouldStopAnimation(currentStyle, style, currentVelocity) {
	  for (var key in style) {
	    if (!Object.prototype.hasOwnProperty.call(style, key)) {
	      continue;
	    }
	
	    if (currentVelocity[key] !== 0) {
	      return false;
	    }
	
	    var styleValue = typeof style[key] === 'number' ? style[key] : style[key].val;
	    // stepper will have already taken care of rounding precision errors, so
	    // won't have such thing as 0.9999 !=== 1
	    if (currentStyle[key] !== styleValue) {
	      return false;
	    }
	  }
	
	  return true;
	};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var presets = __webpack_require__(10);
	
	var defaultConfig = _extends({}, presets.noWobble, {
	  precision: 0.01
	});
	
	module.exports = function spring(val, config) {
	  return _extends({}, defaultConfig, config, { val: val });
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = {
	  noWobble: { stiffness: 170, damping: 26 }, // the default, if nothing provided
	  gentle: { stiffness: 120, damping: 14 },
	  wobbly: { stiffness: 180, damping: 12 },
	  stiff: { stiffness: 210, damping: 20 }
	};

/***/ })
/******/ ])
});
;
//# sourceMappingURL=really-smooth-scroll.map