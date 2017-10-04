const puppeteer = require('puppeteer');

const run = testFn => async done => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(true);

  page.on('console', (...args) => console.log(...args));

  try {
    // Run test
    await testFn(page);
  } catch(e) {
    fail(e);
  } finally {
    await browser.close();
    done();
  }
};

const content = (content) => `data:text/html,${content}`;

module.exports = {
  run,
  content,
};
