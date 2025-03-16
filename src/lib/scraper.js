const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeEpisodes(updateCallback) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto('https://founderspodcast.com/episodes', { waitUntil: 'domcontentloaded' });

  let allEpisodes = [];
  let previousCount = 0;

  while (true) {
    await page.waitForSelector('.sc-episode-teaser', { timeout: 15000 });

    const episodes = await page.evaluate(() => {
      const episodeElements = document.querySelectorAll('.sc-episode-teaser');
      return Array.from(episodeElements).map(ep => {
        const titleElement = ep.querySelector('.sc-episode-teaser-title a');
        const descriptionElement = ep.querySelector('.sc-episode-teaser-description');
        const timeElement = ep.querySelector('.sc-episode-teaser-time');

        const timeText = timeElement?.innerText || '';
        const [datePart, durationPart] = timeText.split(' | ');
        const duration = durationPart?.match(/\d{2}:\d{2}:\d{2}|\d{2}:\d{2}/)?.[0] || 'No duration';

        return {
          title: titleElement?.innerText.trim() || 'No title',
          description: descriptionElement?.innerText.trim() || 'No description',
          date: datePart?.trim() || 'No date',
          duration: duration,
        };
      });
    });

    const newEpisodes = episodes.slice(previousCount);
    allEpisodes = allEpisodes.concat(newEpisodes);
    previousCount = episodes.length;

    await fs.writeFile('_data/episodes.json', JSON.stringify(allEpisodes, null, 2));
    if (updateCallback) updateCallback(allEpisodes);

    const loadMoreButton = await page.$('.button.button-secondary');
    if (!loadMoreButton) break;

    await loadMoreButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCount = await page.evaluate(() => document.querySelectorAll('.sc-episode-teaser').length);
    if (newCount <= previousCount) break;
  }

  await browser.close();
  return allEpisodes;
}

module.exports = { scrapeEpisodes };