const scraperObject = {
  url: "https://www.autotrader.co.uk/",
  async scraper(browser, mainUrlByPostcode, location) {
    let page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
    );
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);

    await page.goto(mainUrlByPostcode);
    let scrapedData = [];
    // Wait for the required DOM to be rendered on the page
    async function scrapeCurrentPage() {
      await page.waitForSelector(".cvruAv");
      // Get the link to all cards
      let urls = await page.$$eval(".cvruAv > li", (links) => {
        links = links.map((el) => el.querySelector(".krAvkU").href);
        return links;
      });

      // console.log({urls})`
      // Loop through each of those links, open a new page instance and get the relevant data from them
      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
          );

          await newPage.goto(link);

          async function scrapDescription() {
            // Wait for the address element to appear (adjust selector if needed)
            await newPage.waitForSelector(".liFlNf .description");

            // Extract the address using the existing selector or a more specific one
            let description = await newPage.$eval(
              ".liFlNf .description",
              (elm) => elm.textContent
            );
            return description;
          }

          dataObj["postcode"] = location.postcode;
          dataObj["city"] = location.location;
          dataObj["radius"] = location.radius;
          dataObj["dealerTitle"] = await newPage.$eval(
            ".lbmMjz h1",
            (text) => text.textContent
          );
          dataObj["address"] = await newPage.$$eval(
            ".fetpBv ul > li",
            (lis) => {
              const addressResult = []
              for(let i = 0; i < lis.length; i++) {
                const elem = lis[i];
                if(elem.trim()) {
                  addressResult.push(`${elem.textContent}\n`);
                }
              }
              return addressResult.join('').trim();
            }
          );
          // dataObj["description"] = await scrapDescription();
          dataObj["website"] = await newPage.$eval(
            ".fRzNIl h3",
            (elm) => elm.nextSibling.href
          );
          dataObj["phone_numbers"] = await newPage.$$eval(
            ".fRzNIl p",
            (elms) => {
              return elms.map(
                (item) => `${item.querySelector("a").textContent}\n`
              ).join('').trim();
            }
          );
          dataObj["opening_hours"] = await newPage.$$eval(
            ".opening-hours > div",
            (ohs) => {
              return ohs.map((oh) => {
                const weekDay = oh.firstChild.textContent.trim();
                const hours = oh.children[1].textContent.trim();
                return `${weekDay}: ${hours}\n`
                // return {
                //   [weekDay]: hours
                // }
              }).join('').trim()
            }
          );
          resolve(dataObj);
          await newPage.close();
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
      }
      // When all the data on this page is done, click the next button and start the scraping of the next page
      // We are going to check if this button exist first, so we know if there really is a next page.\
      let nextButtonExist = false;
      try {
        const nextButton = await page.$eval(
          ".cvGwQr > .gPXfRQ",
          (parent) => parent.children[1].tagName === "A"
        );
        if (!nextButton) {
          nextButtonExist = false;
          // throw Error('there is no next button')
        } else {
          nextButtonExist = true;
        }
      } catch (err) {
        nextButtonExist = false;
      }
      if (nextButtonExist) {
        await page.click('[data-testid="pagination-next"]');
        return scrapeCurrentPage(); // Call this function recursively
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    return data;
  },
};

module.exports = scraperObject;
