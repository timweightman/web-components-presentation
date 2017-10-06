# &lt;my-presentation&gt; &#x1F5A5;

A zero-dependency vanilla Web Component.

> Please note the `<my-presentation>` custom element was developed for presentation purposes only, and was not intended for production use. I do not intend to maintain it regularly, however feel free to submit an issue, and / or fork this repo for your own purposes.

I have left the very basic `<my-element>` component as well, as this is a good boilerplate that can be used to play with Custom Elements and Shadow DOM.

## Getting started
```html
  <!-- Add the component script to the document -->
  <script type="module" src="components/my-presentation/my-presentation.js">

  <!-- Add styles for your presentation -->
  <style>
    article {
      transition: all 1s ease-in-out;
      transform: translateX(100%);
    }
    article[in] {
      transform: translateX(0);
    }
    article[out] {
      transform: translateX(-100%);
    }
    article[in] ~ article[out] {
      transform: translateX(100%);
    }
  </style>

  <!--
    Add my-presentation element and some slides.
    Be sure to include `slot="slide"` attribute!
  -->

  <my-presentation progress>
    <article slot="slide">
      Slide one
    </article>
    <div slot="slide">
      Slide two
    </div>
    <ul slot="slide">
      <li>Content</li>
    </ul>
  </my-presentation>
```

## Important notes
- `<my-presentation>` only handles the _presentation logic_. The slide styling, transitions, etc are completely external and up to you. You can use CSS transitions and animations.

- `<my-presentation>` will add and remove helper-attributes from the slides that you give it.
<br />
The `in` attribute is for the incoming slide (or current slide).
<br />
The `out` attribute is for all others.
<br />
These are applied when the element is upgraded and its `slotchange` event has been fired.

- `<my-presentation>` has _no dependencies_. It is 100% vanilla, and self-contained.

- `<my-presentation>` uses:
    - `WeakMap`
    - Arrow functions `() => {}`
    - Class and extends `class extends HTMLElement`
    - Shorthand object properties `{ myProperty }`
    - Object rest / spread `...myObject`
    - Destructuring `const { foo, bar } = myObject`
    - Shadow DOM `this.attachShadow()`, `this.shadowRoot`
    - Custom Elements `customElements.get()`, `customElements.define()`
    - The `<slot>` element.

- At time of writing, `<my-presentation>` has only been tested in Chrome 61.0.3163.100 and using `puppeteer`. See [webcomponents.org](https://webcomponents.org) for a Web Components browser support chart, or [caniuse](https://caniuse.com) to ensure there is support for all of the features. Otherwise, feel free to use [babel](babeljs.io) or some other tool to transpile `my-presentation.js` into an ES5 bundle with [polyfills](https://github.com/webcomponents/webcomponentsjs).

- `node` is only necessary to run a barebones http server (to host index.html, theme.css and my-presentation.js), and run tests (jest, puppeteer). There is no concept of a `build`

## Running locally

```bash
  npm install
  npm start
```

## Running tests
```bash
  npm test
```

## API
name | attribute | property | type | description
---- | --------- | -------- | ---- | -----------
index | &#x2714; | &#x2714; `get`<br/>&#x2714; `set` | `number` | The index of the current slide.
progress | &#x2714; | &#x2714; `get`<br/>&#x2714; `set` | `boolean` | If `true`, will show a progress bar at the bottom of the presentation.
controls | &#x2714; | &#x2714; `get`<br/>&#x2714; `set` | `boolean` | If `true`, will show clickable arrow controls to go to previous / next slide.
slides |  | &#x2714; `get` | `array[Element]` | An array of all slides Elements that are included in the presentation.
current | | &#x2714; `get` | `Element` | The current slide Element being shown.
embedded | &#x2714; | | `boolean` | Only used during initial upgrade when `<my-presentation>` is connected to the document. If `true`, will attach event listeners directly onto the element, and make `<my-presentation>` focusable. If `false`, event handlers are added to `ownerDocument`.

