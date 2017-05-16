# really-smooth-scroll

[Demo](http://chuson1996.github.io/really-smooth-scroll)  
[Live Demo](https://youtu.be/aiG4rMLHjUc?t=2m54s)

This is it. I have been looking for libraries, shims and tricks for smooth scrolling for way too long on the Internet. And none actually provides the smoothness that I want. THIS ENDS NOW. **(However, this shim only takes effect in desktop browsers, not yet supported for mobile browsers. But soon it will. )**

This shim overrides browser's `window.scrollTo` function. Instead of jumping immediately, it smoothly scrolls to the scroll position (Check demo). If you want the use the old behavior, use `window.oldScrollTo`.

The magic algorithm is based on the spring animation in react-motion. [Wanna see why it's awesome?](https://youtu.be/1tavDv5hXpo?t=12m25s)

### Install

```bash
npm install --save really-smooth-scroll
# or if you use yarn
yarn add really-smooth-scroll
```

### Usage
```js
const ReallySmoothScroll = require('really-smooth-scroll');
// or
// import ReallySmoothScroll from 'really-smooth-scroll';

ReallySmoothScroll.shim();
// Done. Coundn't be easier.

// If you want to adjust the scrolling sensitivity (Optional)
ReallySmoothScroll.config({
  mousewheelSensitivity: 6, // Default
  keydownSensitivity: 6 // Default (When you press arrow down/up key)
});
```

If you don't use webpack or babel, embed one of these 2 scripts to your html

```html
<!-- Production -->
<script src="https://cdn.rawgit.com/chuson1996/really-smooth-scroll/ff3210e1/build/really-smooth-scroll.js"></script>

<!-- Development -->
<script src="https://rawgit.com/chuson1996/really-smooth-scroll/master/build/really-smooth-scroll.js"></script>
```
