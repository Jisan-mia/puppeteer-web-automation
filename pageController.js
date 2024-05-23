const { stringify } = require("csv-stringify");
const fs = require("fs");
const pageScraper = require("./pageScraper");
const allLocation = [
  { location: "Leicester", postcode: "LE2 0QB", radius: "10" },
  { location: "Coventry", postcode: "CV1 2GT", radius: "10" },
  { location: "Worcester", postcode: "WR1 1DB", radius: "15" },
  { location: "Northampton", postcode: "NN1 1SP", radius: "15" },
  { location: "Milton Keynes", postcode: "MK9 1LA", radius: "10" },
  { location: "Bedford", postcode: "MK40 1DS", radius: "10" },
  { location: "Cambridge", postcode: "CB1 2JW", radius: "20" },
  { location: "Cheltenham", postcode: "GL51 8NP", radius: "20" },
  { location: "Oxford", postcode: "OX1 1HS", radius: "20" },
  { location: "Swindon", postcode: "SN1 1DQ", radius: "20" },
  { location: "Bath", postcode: "BA1 1SU", radius: "5" },
  { location: "Bristol", postcode: "BS1 6QF", radius: "10" },
  { location: "Reading", postcode: "RG1 1LZ", radius: "10" },
  { location: "Slough", postcode: "SL1 1XW", radius: "5" },
  { location: "Colchester", postcode: "CO1 1XD", radius: "15" },
  { location: "Chelmsford", postcode: "CM1 1HT", radius: "10" },
  { location: "Luton", postcode: "LU1 2LT", radius: "10" },
  { location: "Birmingham", postcode: "TF10 9LL", radius: "5" },
  { location: "Birmingham", postcode: "TF11 9DF", radius: "5" },
  { location: "Birmingham", postcode: "WV15 6QW", radius: "5" },
  { location: "Birmingham", postcode: "DY12 2XJ", radius: "5" },
  { location: "Birmingham", postcode: "ST18 9AN", radius: "5" },
  { location: "Birmingham", postcode: "WV10 9TB", radius: "5" },
  { location: "Birmingham", postcode: "DY5 2JF", radius: "5" },
  { location: "Birmingham", postcode: "B61 9AJ", radius: "5" },
  { location: "Birmingham", postcode: "WS9 0LR", radius: "5" },
  { location: "Birmingham", postcode: "B2 4QA", radius: "5" },
  { location: "Birmingham", postcode: "B48 7HP", radius: "5" },
  { location: "Birmingham", postcode: "B77 1EN", radius: "5" },
  { location: "Birmingham", postcode: "B46 3JH", radius: "5" },
  { location: "Birmingham", postcode: "CV35 7NJ", radius: "5" },
];

async function scrapeAll(browserInstance) {
  const t0 = performance.now();
  let browser;
  try {
    browser = await browserInstance;
    const scrapedData = [];

    for (const location of allLocation.slice(0, 1)) {
      const searchUrl = `https://www.autotrader.co.uk/car-dealers/search?page=1&sort=with-retailer-reviews&advertising-locations=at_cars&forSale=on&toOrder=on&postcode=${location.postcode}&radius=${location.radius}&make=`;

      const postcodeData = await pageScraper.scraper(
        browser,
        searchUrl,
        location
      );
      scrapedData.push(...postcodeData); // Flatten the data from each postcode
    }

    const csvData = [];
    // Define the header row for your CSV
    csvData.push([
      "dealerTitle",
      "address",
      "opening_hours",
      "website",
      "phone_numbers",
      "postcode",
      "city",
      "radius",
    ]);
    for (const item of scrapedData) {
      // Push an array containing the values for each property in the CSV row
      csvData.push([
        item.dealerTitle,
        item.address,
        item.opening_hours,
        item.website,
        item.phone_numbers,
        item.postcode,
        item.city,
        item.radius,
      ]);
    }

    stringify(csvData, { delimiter: "," }, (err, csvContent) => {
      if (err) {
        console.error("Error converting data to CSV:", err);
        return;
      }
      fs.writeFile("data.csv", csvContent, "utf8", function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          "The data has been scraped and saved successfully! View it at './data.csv'"
        );
      });
    });

    await browser.close();
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
  let t1 = performance.now();
  console.log(`total time ${t1 - t0} milliseconds.`);
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
