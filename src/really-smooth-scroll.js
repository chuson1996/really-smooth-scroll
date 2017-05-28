const SmoothScroll = require('./SmoothScroll');
const spring = require('./spring');

let mousewheelSensitivity = 6;
let keydownSensitivity = 6;
let forceStop = false;

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
  },
});

function move(deltaY) {
  if (!moving) {
    if (difference(getSpringVal(scrollY), Math.round(window.scrollY)) > 4) {
      scrollY = window.scrollY;
      smoothScroll.componentWillReceiveProps({
        style: {scrollY},
      });
    }
    moving = true;
  }

  if (document.querySelector('html').style.overflowY === 'hidden') {
    return;
  }

  scrollY = stayInRange(
    0,
    document.querySelector('html').offsetHeight - window.innerHeight,
    // getSpringVal(scrollY) + deltaY
    window.scrollY + deltaY * mousewheelSensitivity
  );
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

let mousewheelTimeout;
let maxDeltaY = 0;
function onmousewheel(e) {
  const deltaY = stayInRange(-50, 50, e.deltaY);

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
      mousewheelTimeout = setTimeout(function() {
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
    window.oldScrollTo = (...args) => {
      if (moving) {
        window.stopScrolling();
      }

      smoothScroll.componentWillReceiveProps({
        style: { scrollY: args[1] },
      });
    };

    window.scrollTo = (x, y) => {
      window._scrollTo(x, window.scrollY);
      smoothScroll.componentWillReceiveProps({
        style: { scrollY: spring(y) },
      });
    };

  }
  window.stopScrolling = () => {
    forceStop = true;
    smoothScroll.componentWillReceiveProps({
      style: { scrollY: window.scrollY },
    });
  }
}

exports.config = function config(options) {
  if (options.mousewheelSensitivity) {
    mousewheelSensitivity = options.mousewheelSensitivity;
  }
  if (options.keydownSensitivity) {
    keydownSensitivity = options.keydownSensitivity;
  }
}
