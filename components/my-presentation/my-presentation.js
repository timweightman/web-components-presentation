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
    return ['progress', 'controls', 'index'];
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

        :host > main > #progress,
        :host > main > .controls {
          display: none;
        }

        :host([progress]) > main > #progress {
          display: block;
          height: 1%;
          min-height: 2px;
          overflow: hidden;
          position: absolute;
          bottom: 0;
          left: 0;
          transition: .5s width ease-in-out;
          background-color: blueviolet;
        }

        :host([controls]) > main > .controls {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20%;
        }
        :host([controls]) > main > .controls .prev,
        :host([controls]) > main > .controls .next {
          height: 15rem;
          width: 15rem;
          background: transparent;
          border: 0;
          font-size: 10rem;
          opacity: 0.05;
          outline: none;
          transition: opacity 0.15s ease-in-out;
        }
        :host([controls]) > main > .controls .prev {
          left: 20%;
        }
        :host([controls]) > main > .controls .next {
          right: 20%;
        }
      </style>
      <main>
      <slot id="slides" name="slide"></slot>
      <div id="progress"></div>
      <div class="controls">
        <button class="prev">&lt;</button>
        <button class="next">&gt;</button>
      </div>
      </main>
    `;
  }

  // LIFECYCLE
  constructor() {
    super();

    this.render = this.render.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
    this.loadSlides = this.loadSlides.bind(this);
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = MyPresentation.template;
    }

    const index = parseInt(this.getAttribute('index'), 10) || 0;
    const progress = this.hasAttribute('progress') || false;
    const controls = this.hasAttribute('controls') || false;
    const embedded = this.hasAttribute('embedded') || false;

    setState(this, {
      lastIndex: null,
      index,
      progress,
      controls,
      embedded,
    });

    if (embedded) {
      this.tabIndex = 0;
      this.addEventListener('keyup', this.handleKeyUp);
    } else {
      this.ownerDocument.addEventListener('keyup', this.handleKeyUp);
    }

    this.shadowRoot.querySelector('.prev').addEventListener('click', this.prev);
    this.shadowRoot.querySelector('.next').addEventListener('click', this.next);
    this.shadowRoot.querySelector('#slides').addEventListener('slotchange', this.loadSlides);
  }

  disconnectedCallback() {
    this.removeEventListener('keyup', this.handleKeyUp);
    this.ownerDocument.removeEventListener('keyup', this.handleKeyUp);
    this.shadowRoot.querySelector('.prev').removeEventListener('click', this.prev);
    this.shadowRoot.querySelector('.next').removeEventListener('click', this.next);
    this.shadowRoot.querySelector('#slides').removeEventListener('slotchange', this.loadSlides);
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

  get controls() {
    return state.get(this).controls;
  }

  set controls(value) {
    if (value === null || value === undefined || value === false || value === 0) {
      setState(this, { controls: false });
    } else {
      setState(this, { controls: true });
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

  highlightControl(control) {
    const originalOpacity = '0.05';
    control.style.opacity = '0.25';
    setTimeout(() => control.style.opacity = originalOpacity, 200);
  }

  prev() {
    this.highlightControl(this.shadowRoot.querySelector('.prev'));
    if (this.index > 0) {
      this.index = this.index - 1;
    }
  }

  next() {
    this.highlightControl(this.shadowRoot.querySelector('.next'));
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
