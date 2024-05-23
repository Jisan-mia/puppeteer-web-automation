const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function scrapeDealerTitle(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set User-Agent to a common browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36');

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for the element to appear
            await page.waitForSelector('.dealer-title', { timeout: 30000 });

            const dealerTitle = await page.$eval('.dealer-title', el => el.textContent.trim());
            console.log(`Scraped dealer title from ${url}: ${dealerTitle}`);

            await browser.close();
            return dealerTitle;
        } catch (error) {
            retryCount++;
            console.error(`Error scraping ${url} (Attempt ${retryCount}):`, error.message);

            if (retryCount >= maxRetries) {
                console.error(`Failed to scrape ${url} after ${maxRetries} attempts.`);
                const content = await page.content();
                console.error(`Page content of ${url}:`, content);

                await browser.close();
                throw new Error(`Failed to scrape ${url} after ${maxRetries} attempts.`);
            } else {
                console.log(`Retrying... (${retryCount}/${maxRetries})`);
            }
        }
    }
}

(async () => {
    const url = 'https://www.autotrader.co.uk/dealers/st-georges-autocentre-limited-10005184?channel=cars';

    try {
        const dealerTitle1 = await scrapeDealerTitle(url);
        const dealerTitle2 = await scrapeDealerTitle(
          "https://www.autotrader.co.uk/dealers/smart-motors-10011741?channel=cars"
        );
        console.log('Scraped dealer title:', dealerTitle1);

        const fs = require('fs');
        fs.writeFileSync(
          "./data.json",
          JSON.stringify({ dealerTitle1, dealerTitle2 }, null, 2)
        );
        console.log('The data has been scraped and saved successfully! View it at ./data.json');
    } catch (error) {
        console.error('Error during scraping process:', error.message);
    }
})();
