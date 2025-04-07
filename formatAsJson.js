const { chromium } = require("playwright");

async function fetchAndFormatAsJSON() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to the Hacker News "newest" page
  await page.goto("https://news.ycombinator.com/newest");

  // Scrape article data
  const articles = await page.evaluate(() => {
    const data = [];
    const articleRows = document.querySelectorAll('.athing');

    articleRows.forEach((row) => {
      const titleEl = row.querySelector('.titleline a');
      const id = row.getAttribute('id');

      // subtext is in the next sibling row
      const subtextRow = row.nextElementSibling;
      const ageEl = subtextRow?.querySelector('.age');
      const timeStr = ageEl?.getAttribute('title'); // ISO string

      if (titleEl && timeStr) {
        data.push({
          id,
          title: titleEl.innerText,
          timestamp: timeStr || null,
        });
      }
    });

    return data;
  });

  // consoling fetcxhed articles in JSON format
  console.log(JSON.stringify(articles, null, 2));

  await browser.close();
}

(async () => {
  await fetchAndFormatAsJSON();
})();