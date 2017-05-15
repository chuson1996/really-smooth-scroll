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

	const SmoothScroll = __webpack_require__(1);
	const spring = __webpack_require__(9);
	
	let mousewheelSensitivity = 6;
	let keydownSensitivity = 6;
	
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
	
	let moving = false;
	let scrollY = spring(0);
	
	const smoothScroll = new SmoothScroll({
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
	        style: { scrollY }
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
	
	function onmousewheel(e) {
	  if (document.body.contains(e.target) || e.target === document.body) {
	    e.preventDefault();
	    move(e.deltaY);
	  }
	}
	
	exports.shim = function shim() {
	  window.addEventListener('wheel', onmousewheel);
	  window.addEventListener('keydown', onkeydown);
	
	  window.oldScrollTo = window.scrollTo.bind(window);
	
	  window.scrollTo = (x, y) => {
	    window.oldScrollTo(x, window.scrollY);
	    smoothScroll.componentWillReceiveProps({
	      style: { scrollY: spring(y) }
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

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	const mapToZero = __webpack_require__(2);
	const stripStyle = __webpack_require__(3);
	const stepper = __webpack_require__(4);
	const defaultNow = __webpack_require__(5);
	const defaultRaf = __webpack_require__(7);
	const shouldStopAnimation = __webpack_require__(8);
	
	const msPerFrame = 1000 / 60;
	
	module.exports = class SmoothScroll {
	  constructor(props) {
	    this.clearUnreadPropStyle = destStyle => {
	      let dirty = false;
	      let { currentStyle, currentVelocity, lastIdealStyle, lastIdealVelocity } = this.state;
	
	      for (let key in destStyle) {
	        if (!Object.prototype.hasOwnProperty.call(destStyle, key)) {
	          continue;
	        }
	
	        const styleValue = destStyle[key];
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
	        this.setState({ currentStyle, currentVelocity, lastIdealStyle, lastIdealVelocity });
	      }
	    };
	
	    this.startAnimationIfNecessary = () => {
	      // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
	      // call cb? No, otherwise accidental parent rerender causes cb trigger
	      this.animationID = defaultRaf(timestamp => {
	        // check if we need to animate in the first place
	        const propsStyle = this.props.style;
	        if (shouldStopAnimation(this.state.currentStyle, propsStyle, this.state.currentVelocity)) {
	          if (this.wasAnimating && this.props.onRest) {
	            this.props.onRest();
	          }
	
	          // no need to cancel animationID here; shouldn't have any in flight
	          this.animationID = null;
	          this.wasAnimating = false;
	          this.accumulatedTime = 0;
	          return;
	        }
	
	        this.wasAnimating = true;
	
	        const currentTime = timestamp || defaultNow();
	        const timeDelta = currentTime - this.prevTime;
	        this.prevTime = currentTime;
	        this.accumulatedTime = this.accumulatedTime + timeDelta;
	        // more than 10 frames? prolly switched browser tab. Restart
	        if (this.accumulatedTime > msPerFrame * 10) {
	          this.accumulatedTime = 0;
	        }
	
	        if (this.accumulatedTime === 0) {
	          // no need to cancel animationID here; shouldn't have any in flight
	          this.animationID = null;
	          this.startAnimationIfNecessary();
	          return;
	        }
	
	        let currentFrameCompletion = (this.accumulatedTime - Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame;
	        const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame);
	
	        let newLastIdealStyle = {};
	        let newLastIdealVelocity = {};
	        let newCurrentStyle = {};
	        let newCurrentVelocity = {};
	
	        for (let key in propsStyle) {
	          if (!Object.prototype.hasOwnProperty.call(propsStyle, key)) {
	            continue;
	          }
	
	          const styleValue = propsStyle[key];
	          if (typeof styleValue === 'number') {
	            newCurrentStyle[key] = styleValue;
	            newCurrentVelocity[key] = 0;
	            newLastIdealStyle[key] = styleValue;
	            newLastIdealVelocity[key] = 0;
	          } else {
	            let newLastIdealStyleValue = this.state.lastIdealStyle[key];
	            let newLastIdealVelocityValue = this.state.lastIdealVelocity[key];
	            for (let i = 0; i < framesToCatchUp; i++) {
	              [newLastIdealStyleValue, newLastIdealVelocityValue] = stepper(msPerFrame / 1000, newLastIdealStyleValue, newLastIdealVelocityValue, styleValue.val, styleValue.stiffness, styleValue.damping, styleValue.precision);
	            }
	            const [nextIdealX, nextIdealV] = stepper(msPerFrame / 1000, newLastIdealStyleValue, newLastIdealVelocityValue, styleValue.val, styleValue.stiffness, styleValue.damping, styleValue.precision);
	
	            newCurrentStyle[key] = newLastIdealStyleValue + (nextIdealX - newLastIdealStyleValue) * currentFrameCompletion;
	            newCurrentVelocity[key] = newLastIdealVelocityValue + (nextIdealV - newLastIdealVelocityValue) * currentFrameCompletion;
	            newLastIdealStyle[key] = newLastIdealStyleValue;
	            newLastIdealVelocity[key] = newLastIdealVelocityValue;
	          }
	        }
	
	        this.animationID = null;
	        // the amount we're looped over above
	        this.accumulatedTime -= framesToCatchUp * msPerFrame;
	
	        this.setState({
	          currentStyle: newCurrentStyle,
	          currentVelocity: newCurrentVelocity,
	          lastIdealStyle: newLastIdealStyle,
	          lastIdealVelocity: newLastIdealVelocity
	        });
	
	        this.unreadPropStyle = null;
	
	        this.startAnimationIfNecessary();
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
	
	  defaultState() {
	    const { defaultStyle, style } = this.props;
	    const currentStyle = defaultStyle || stripStyle(style);
	    const currentVelocity = mapToZero(currentStyle);
	    return {
	      currentStyle,
	      currentVelocity,
	      lastIdealStyle: currentStyle,
	      lastIdealVelocity: currentVelocity
	    };
	  }
	
	  componentWillReceiveProps(nextProps) {
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
	
	  setState(newState) {
	    this.state = _extends({}, this.state, newState);
	
	    window.oldScrollTo(window.scrollX, this.state.currentStyle.scrollY);
	  }
	};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// currently used to initiate the velocity style object to 0
	module.exports = function mapToZero(obj) {
	  let ret = {};
	  for (const key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      ret[key] = 0;
	    }
	  }
	  return ret;
	};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/* @flow */
	// turn {x: {val: 1, stiffness: 1, damping: 2}, y: 2} generated by
	// `{x: spring(1, {stiffness: 1, damping: 2}), y: 2}` into {x: 1, y: 2}
	
	module.exports = function stripStyle(style) {
	  let ret = {};
	  for (const key in style) {
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

	/* @flow */
	
	// stepper is used a lot. Saves allocation to return the same array wrapper.
	// This is fine and danger-free against mutations because the callsite
	// immediately destructures it and gets the numbers inside without passing the
	// array reference around.
	let reusedTuple = [0, 0];
	module.exports = function stepper(secondPerFrame, x, v, destX, k, b, precision) {
	  // Spring stiffness, in kg / s^2
	
	  // for animations, destX is really spring length (spring at rest). initial
	  // position is considered as the stretched/compressed position of a spring
	  const Fspring = -k * (x - destX);
	
	  // Damping, in kg / s
	  const Fdamper = -b * v;
	
	  // usually we put mass here, but for animation purposes, specifying mass is a
	  // bit redundant. you could simply adjust k and b accordingly
	  // let a = (Fspring + Fdamper) / mass;
	  const a = Fspring + Fdamper;
	
	  const newV = v + a * secondPerFrame;
	  const newX = x + newV * secondPerFrame;
	
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

	/* WEBPACK VAR INJECTION */(function(process) {// Generated by CoffeeScript 1.12.2
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
	    getNanoSeconds = function () {
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
	}).call(this);
	
	//# sourceMappingURL=performance-now.js.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

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

	/* WEBPACK VAR INJECTION */(function(global) {var now = __webpack_require__(5),
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
	
	  raf = function (callback) {
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
	
	  caf = function (handle) {
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

	// usage assumption: currentStyle values have already been rendered but it says
	// nothing of whether currentStyle is stale (see unreadPropStyle)
	module.exports = function shouldStopAnimation(currentStyle, style, currentVelocity) {
	  for (let key in style) {
	    if (!Object.prototype.hasOwnProperty.call(style, key)) {
	      continue;
	    }
	
	    if (currentVelocity[key] !== 0) {
	      return false;
	    }
	
	    const styleValue = typeof style[key] === 'number' ? style[key] : style[key].val;
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

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	const presets = __webpack_require__(10);
	
	const defaultConfig = _extends({}, presets.noWobble, {
	  precision: 0.01
	});
	
	module.exports = function spring(val, config) {
	  return _extends({}, defaultConfig, config, { val });
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

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