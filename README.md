# really-smooth-scroll

[Demo](http://chuson1996.github.io/really-smooth-scroll)

This is it. I have been looking for libraries, shims and tricks for smooth scrolling for way too long on the Internet. And none actually provides the smoothness that I want. THIS ENDS NOW. **(However, this shim only takes effect in desktop browsers, not yet supported for mobile browsers. But soon it will. )**

This is a shim that overrides browser's `window.scrollTo` function. Using this shim, instead of jump immediately jump to the scroll position, it smoothly scrolls (Check demo). If you want the use the old behavior, use `window.oldScrollTo`

### Install

```bash
npm install --save really-smooth-scroll
# or if you use yarn
yarn add really-smooth-scroll
```

### Usage
```js
const reallySmoothScroll = require('really-smooth-scroll');
// or
// import reallySmoothScroll from 'really-smooth-scroll';

reallySmoothScroll();
// Done. Coundn't be easily.
```
