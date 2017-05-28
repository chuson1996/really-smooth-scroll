const mapToZero = require('./mapToZero');
const stripStyle = require('./stripStyle');
const stepper = require('./stepper');
const defaultNow = require('performance-now');
const defaultRaf = require('raf');
const shouldStopAnimation = require('./shouldStopAnimation');

const msPerFrame = 1000 / 60;

module.exports = class SmoothScroll {
  constructor(props) {
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
    const {defaultStyle, style} = this.props;
    const currentStyle = defaultStyle || stripStyle(style);
    const currentVelocity = mapToZero(currentStyle);
    return {
      currentStyle,
      currentVelocity,
      lastIdealStyle: currentStyle,
      lastIdealVelocity: currentVelocity,
    };
  }

  clearUnreadPropStyle = (destStyle) => {
    let dirty = false;
    let {currentStyle, currentVelocity, lastIdealStyle, lastIdealVelocity} = this.state;

    for (let key in destStyle) {
      if (!Object.prototype.hasOwnProperty.call(destStyle, key)) {
        continue;
      }

      const styleValue = destStyle[key];
      if (typeof styleValue === 'number') {
        if (!dirty) {
          dirty = true;
          currentStyle = {...currentStyle};
          currentVelocity = {...currentVelocity};
          lastIdealStyle = {...lastIdealStyle};
          lastIdealVelocity = {...lastIdealVelocity};
        }

        currentStyle[key] = styleValue;
        currentVelocity[key] = 0;
        lastIdealStyle[key] = styleValue;
        lastIdealVelocity[key] = 0;
      }
    }

    if (dirty) {
      this.setState({currentStyle, currentVelocity, lastIdealStyle, lastIdealVelocity});
    }
  };

  startAnimationIfNecessary = () => {
    // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
    // call cb? No, otherwise accidental parent rerender causes cb trigger
    this.animationID = defaultRaf((timestamp) => {
      // check if we need to animate in the first place
      const propsStyle = this.props.style;
      if (shouldStopAnimation(
        this.state.currentStyle,
        propsStyle,
        this.state.currentVelocity,
      )) {
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

      let currentFrameCompletion =
        (this.accumulatedTime - Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame;
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
            [newLastIdealStyleValue, newLastIdealVelocityValue] = stepper(
              msPerFrame / 1000,
              newLastIdealStyleValue,
              newLastIdealVelocityValue,
              styleValue.val,
              styleValue.stiffness,
              styleValue.damping,
              styleValue.precision,
            );
          }
          const [nextIdealX, nextIdealV] = stepper(
            msPerFrame / 1000,
            newLastIdealStyleValue,
            newLastIdealVelocityValue,
            styleValue.val,
            styleValue.stiffness,
            styleValue.damping,
            styleValue.precision,
          );

          newCurrentStyle[key] =
            newLastIdealStyleValue +
            (nextIdealX - newLastIdealStyleValue) * currentFrameCompletion;
          newCurrentVelocity[key] =
            newLastIdealVelocityValue +
            (nextIdealV - newLastIdealVelocityValue) * currentFrameCompletion;
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
        lastIdealVelocity: newLastIdealVelocity,
      });

      this.unreadPropStyle = null;

      this.startAnimationIfNecessary();
    });
  };

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

    this.props = {
      ...this.props,
      ...nextProps,
    };
  }

  setState(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };

    window._scrollTo(window.scrollX, this.state.currentStyle.scrollY);
  }
}
