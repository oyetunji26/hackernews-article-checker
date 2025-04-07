// // EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
// const { chromium } = require("playwrigh

const { chromium } = require("playwright");

async function validateSortedArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com/newest");

  let articles = [];

  while (articles.length < 100) {
    const articleData = await page.evaluate(() => {
      const data = [];
      const articleRows = document.querySelectorAll(".athing");

      articleRows.forEach((row) => {
        const titleEl = row.querySelector(".titleline a");
        const id = row.getAttribute("id");

        // subtext is in the next sibling row
        const subtextRow = row.nextElementSibling;
        const ageEl = subtextRow?.querySelector(".age");
        const timeStr = ageEl?.innerText; // e.g. "3 minutes ago"

        function parseRelativeTime(text) {
          const [value, unit] = text.split(" ");
          const count = parseInt(value);
          const now = new Date();

          if (unit.startsWith("minute")) {
            return new Date(now.getTime() - count * 60 * 1000);
          } else if (unit.startsWith("hour")) {
            return new Date(now.getTime() - count * 60 * 60 * 1000);
          } else if (unit.startsWith("day")) {
            return new Date(now.getTime() - count * 24 * 60 * 60 * 1000);
          } else {
            return null;
          }
        }

        if (titleEl && timeStr) {
          data.push({
            id,
            title: titleEl.innerText,
            timestamp: parseRelativeTime(timeStr) || null,
          });
        }
      });

      return data;
    });

    // Filter and push valid ones
    for (let article of articleData) {
      if (article.timestamp && articles.length < 100) {
        articles.push({
          id: article.id,
          title: article.title,
          timestamp: new Date(article.timestamp),
        });
      }
    }

    if (articles.length < 100) {
      const more = await page.$("a.morelink");
      if (!more) break;

      await Promise.all([page.waitForNavigation(), more.click()]);
    }
  }

  // ✅ Ensure there are exactly 100 articles
  if (articles.length !== 100) {
    console.log(`❌ Error: Expected 100 articles, but got ${articles.length}.`);
    await browser.close();
    return;
  }

  // ✅ Validate sort order
  let isSorted = true;

  for (let i = 0; i < articles.length - 1; i++) {
    if (articles[i].timestamp < articles[i + 1].timestamp) {
      console.log(
        `\n❌ Article -- "${articles[i].title}" Id -- ${articles[i]?.id} : is older than the next one.`
      );
      isSorted = false;
      break;
    }
  }

  if (isSorted) {
    console.log("\n✅ Articles are sorted from newest to oldest.");
  }

  // Log the articles in JSON format
  console.log(JSON.stringify(articles, null, 2)); // nicely formatted JSON

  await browser.close();
}

(async () => {
  await validateSortedArticles();
})();