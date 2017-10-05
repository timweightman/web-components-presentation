const state = new WeakMap();

class MyElement extends HTMLElement {
  get color() {
    return state.get(this).color;
  }

  set color(value) {
    state.set(this, {
      color: value,
    });
    this.render();
  }

  constructor() {
    super();
    state.set(this, {
      color: 'red',
    });
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        :host slot::slotted(*) {
          border: 1px solid ${this.color};
        }
      </style>
      <slot></slot>
    `;
  }
}

if (!customElements.get('my-element')) {
  customElements.define('my-element', MyElement);
}