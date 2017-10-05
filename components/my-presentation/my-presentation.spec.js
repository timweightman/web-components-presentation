const puppeteer = require('puppeteer');
const dataURI = require('../../test-utils/data-uri.js');

describe('MyPresentation', () => {
  const component = 'components/my-presentation/my-presentation.js';

  let browser;
  let page;

  beforeAll(async done => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    page.on('console', (...args) => console.log(...args));
    done();
  });

  afterAll(async done => {
    await browser.close();
    done();
  });

  beforeEach(async done => {
    await page.setContent('');
    done();
  });

  it('should be defined', async () => {
    await page.goto(dataURI());
    await page.injectFile(component);

    const exists = await page.evaluate(async () => {
      return customElements.whenDefined('my-presentation').then(() => true)
    });

    expect(exists).toBe(true);
  });

  describe('shadow root', () => {
    it('should not exist at creation time', async () => {
      await page.goto(dataURI());
      await page.injectFile(component);

      const shadowRoot = await page.evaluate(async () => {
        return document.createElement('my-presentation').shadowRoot;
      });

      expect(shadowRoot).toBe(null);
    });

    it('should exist at connection time', async () => {
      await page.goto(dataURI());
      await page.injectFile(component);

      const shadowRoot = await page.evaluate(async () => {
        const element = document.createElement('my-presentation');
        document.body.appendChild(element);
        return element.shadowRoot;
      });

      expect(shadowRoot).not.toBe(null);
    });
  });

  describe('when my-presentation element has been upgraded', () => {
    const fixture = (attributes, slides) => `
      <my-presentation ${[].concat(attributes).join(' ')}>
        ${[].concat(slides).join(' ')}
      </my-presentation>
    `;

    it('should have a slides property', async () => {
      await page.goto(dataURI(fixture(null, `
        <article slot="slide">TEST_SLIDE</article>
        <article>NOT A SLIDE</article>
      `)));
      await page.injectFile(component);

      const slides = await page.evaluate(async () => {
        return document.querySelector('my-presentation').slides.map(s => s.innerHTML);
      });

      expect(slides).toEqual(['TEST_SLIDE']);
    })

    it('should have an index property', async () => {
      await page.goto(dataURI(fixture()));
      await page.injectFile(component);

      const index = await page.evaluate(async () => {
        return document.querySelector('my-presentation').index;
      });

      expect(index).toBe(0);
    });

    it('should initialise the index property from the index attribute', async () => {
      await page.goto(dataURI(fixture('index="3"')));
      await page.injectFile(component);

      const index = await page.evaluate(async () => {
        return document.querySelector('my-presentation').index;
      });

      expect(index).toBe(3);
    });

    it('should show the slide at index', async () => {
      await page.goto(dataURI(fixture('index="1"', `
        <article slot="slide"></article>
        <article slot="slide">TEST_SLIDE</article>
      `)));
      await page.injectFile(component);

      const slideHTML = await page.evaluate(async () => {
        const presentation = document.querySelector('my-presentation');
        return presentation.slides[presentation.index].innerHTML;
      });

      expect(slideHTML).toEqual('TEST_SLIDE');
    });
  });
});
