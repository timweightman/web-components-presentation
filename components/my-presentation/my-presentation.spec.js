const { run, content } = require('../../test-utils/browser');

describe('MyPresentation', () => {
  const componentScript = 'components/my-presentation/my-presentation.js';

  it('should be defined', run(async page => {
    await page.goto(content(`
      <my-presentation>
        <article slot="slide">
          <h1>one</h1>
        </article>
        <article slot="slide">
          <h1>two</h1>
        </article>
      </my-presentation>
    `));
    await page.injectFile(componentScript);

    const exists = await page.evaluate(async () => {
      return customElements.whenDefined('my-presentation').then(() => true)
    });

    expect(exists).toBe(true);
  }));

  describe('shadow root', () => {
    it('should not exist at creation time', run(async page => {
      await page.goto(content(``));
      await page.injectFile(componentScript);

      const shadowRoot = await page.evaluate(async () => {
        return document.createElement('my-presentation').shadowRoot;
      });

      expect(shadowRoot).toBe(null);
    }));

    it('should exist at connection time', run(async page => {
      await page.goto(content(``));
      await page.injectFile(componentScript);

      const shadowRoot = await page.evaluate(async () => {
        const element = document.createElement('my-presentation');
        document.body.appendChild(element);
        return element.shadowRoot;
      });

      expect(shadowRoot).not.toBe(null);
    }));
  });
});
