const store = new WeakMap();
const setState = function(instance, state) {
  const oldState = store.get(instance);

  store.set(instance, {
    ...(oldState || {}),
    ...(state || {}),
  });

  instance.render();
};

class MyPresentation extends HTMLElement {
  static get is() { return 'my-presentation'; }

  // LIFECYCLE
  constructor() {
    super();

    this.render = this.render.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.loadSlides = this.loadSlides.bind(this);

    setState(this, {
      slides: [],
      outgoing: null,
      incoming: 0,
    });
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 50px;
            overflow: hidden;
            position: relative;
            outline: none;
          }

          :host > main slot::slotted(*) {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
          }

          :host > main > #progress {
            height: 1vh;
            background-color: tomato;
            position: absolute;
            bottom: 0;
            left: 0;
          }
        </style>
        <main>
          <slot id="slides" name="slide"></slot>
          <div id="progress"></div>
        </main>
      `;
    }

    this.tabIndex = 0;
    this.focus();

    this.render();

    this.addEventListener('keyup', this.handleKeyUp);
    this.shadowRoot.querySelector('#slides').addEventListener('slotchange', this.loadSlides);
  }

  disconnectedCallback() {
    this.removeEventListener('keyup', this.handleKeyUp);
    this.shadowRoot.querySelector('#slides').addEventListener('slotchange', this.loadSlides);
  }

  // ATTRIBUTES
  get progress() {
    return this.hasAttribute('progress');
  }

  set progress(value) {
    if (value === true) {
      this.setAttribute('progress', '');
    } else {
      this.removeAttribute('progress');
    }
  }

  get current() {
    return this.getAttribute('current');
  }

  set current(value) {
    this.setAttribute('current', value);
  }

  // METHODS
  loadSlides() {
    const { slides, outgoing, incoming } = store.get(this);

    const newSlides = this.shadowRoot.querySelector('#slides').assignedNodes();
    const newIncoming = newSlides.indexOf(slides[incoming]);
    const newOutgoing = newSlides.indexOf(slides[outgoing]);

    setState(this, {
      slides: newSlides,
      incoming: newIncoming >= 0 ? newIncoming : 0,
      outgoing: newOutgoing >= 1 ? newOutgoing - 1 : null,
    });
  }

  handleKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  prev() {
    const { slides, outgoing, incoming } = store.get(this);
    if (incoming === 0) { return; }

    setState(this, {
      incoming: incoming -1,
      outgoing: incoming,
    });
  }

  next() {
    const { slides, outgoing, incoming } = store.get(this);
    if (incoming === slides.length - 1) { return; }

    setState(this, {
      incoming: incoming + 1,
      outgoing: incoming,
    });
  }

  render() {
    const { slides, outgoing, incoming } = store.get(this);
    if (!this.shadowRoot) { return; }

    if (slides[outgoing]) {
      slides[outgoing].setAttribute('outgoing', '');
      slides[outgoing].removeAttribute('active');
    }

    if (slides[incoming]) {
      slides[incoming].removeAttribute('outgoing');
      slides[incoming].setAttribute('active', '');
    }

    if (this.progress) {
      const progressPercent = ((incoming+1) / slides.length) * 100;
      this.shadowRoot.querySelector('#progress').style = `width: ${progressPercent}%;`
    }
  }
}

if (!customElements.get(MyPresentation.is)) {
  customElements.define(MyPresentation.is, MyPresentation);
}