const state = new WeakMap();
const setState = (instance, newState) => {
  const oldState = state.get(instance);
  state.set(instance, {
    ...(oldState || {}),
    ...(newState || {}),
  });

  instance.render();
};

class MyPresentation extends HTMLElement {
  static get is() {
    return 'my-presentation';
  }

  static get observedAttributes() {
    return ['progress', 'index'];
  }

  static get template() {
    return `
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
          height: 1%;
          min-height: 2px;
          overflow: hidden;
          position: absolute;
          bottom: 0;
          left: 0;
          transition: .5s width ease-in-out;
          background-color: black;
        }
      </style>
      <main>
        <slot id="slides" name="slide"></slot>
        <div id="progress"></div>
      </main>
    `;
  }

  // LIFECYCLE
  constructor() {
    super();

    this.render = this.render.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.loadSlides = this.loadSlides.bind(this);
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = MyPresentation.template;
    }

    const index = parseInt(this.getAttribute('index'), 10) || 0;
    const progress = this.hasAttribute('progress') || false;
    const embedded = this.hasAttribute('embedded') || false;

    setState(this, {
      lastIndex: null,
      index,
      progress,
      embedded,
    });

    if (embedded) {
      this.tabIndex = 0;
      this.addEventListener('keyup', this.handleKeyUp);
    } else {
      this.ownerDocument.addEventListener('keyup', this.handleKeyUp);
    }

    this.shadowRoot.querySelector('#slides').addEventListener('slotchange', this.loadSlides);
  }

  disconnectedCallback() {
    this.removeEventListener('keyup', this.handleKeyUp);
    this.ownerDocument.removeEventListener('keyup', this.handleKeyUp);
    this.shadowRoot.querySelector('#slides').addEventListener('slotchange', this.loadSlides);
  }

  attributeChangedCallback(attrName, prevValue, nextValue) {
    if (prevValue !== nextValue) {
      this[attrName] = nextValue;
    }
  }

  // PROPERTIES
  get slides() {
    if (this.shadowRoot) {
      const slideSlot = this.shadowRoot.querySelector('#slides');
      if (slideSlot) {
        return slideSlot.assignedNodes() || [];
      }
    }
    return [];
  }

  get current() {
    return this.slides[this.index];
  }

  get index() {
    return state.get(this).index;
  }

  set index(value) {
    const parsedValue = parseInt(value, 10);
    if (parsedValue >= 0 && this.slides.length) {
      setState(this, {
        lastIndex: this.index,
        index: parsedValue,
      });
    }
  }

  get progress() {
    return state.get(this).progress;
  }

  set progress(value) {
    if (value === null || value === undefined || value === false || value === 0) {
      setState(this, { progress: false });
    } else {
      setState(this, { progress: true });
    }
  }

  // METHODS
  loadSlides(event) {
    this.slides.forEach(slide => slide.setAttribute('out', ''));
    this.render();
  }

  handleKeyUp(event) {
    if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  prev() {
    if (this.index > 0) {
      this.index = this.index - 1;
    }
  }

  next() {
    if (this.index < this.slides.length - 1) {
      this.index = this.index + 1;
    }
  }

  render() {
    const { lastIndex, index, progress } = state.get(this);

    const oldSlide = this.slides[lastIndex];
    const newSlide = this.slides[index];

    if (oldSlide) {
      oldSlide.setAttribute('out', '');
      oldSlide.removeAttribute('in');
    }

    if (newSlide) {
      newSlide.removeAttribute('out');
      newSlide.setAttribute('in', '');
    }

    if (this.shadowRoot) {
      if (this.progress) {
        const ratio = ((this.index+1) / this.slides.length);
        this.shadowRoot.querySelector('#progress').style = `width: ${ratio * 100}%;`;
      } else {
        this.shadowRoot.querySelector('#progress').style = `display: none;`
      }
    }
  }
}

if (!customElements.get(MyPresentation.is)) {
  customElements.define(MyPresentation.is, MyPresentation);
}