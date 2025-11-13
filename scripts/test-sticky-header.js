// Simple puppeteer test to check sticky header shadow toggling on demo page
// Usage:
//   npm i puppeteer --save-dev
//   node scripts/test-sticky-header.js

const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const demoPath = 'file://' + path.resolve(__dirname, '../client/demo/sticky-header-demo.html');
  await page.goto(demoPath, { waitUntil: 'networkidle2' });

  // measure header height set as CSS variable
  const headerHeight = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '';
  });
  console.log('Header CSS variable:', headerHeight.trim());

  // scroll to table top
  await page.evaluate(() => { window.scrollTo(0, document.querySelector('.demo-table').offsetTop - 10); });
  await page.waitForTimeout(300);

  // check whether the first sticky table's thead has class has-shadow
  const hasShadow = await page.evaluate(() => {
    const t = document.querySelector('table.js-sticky-header thead');
    return t ? t.classList.contains('has-shadow') : false;
  });

  console.log('Sticky table header has-shadow:', hasShadow);

  await browser.close();
  process.exit(hasShadow ? 0 : 2);
})();