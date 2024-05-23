const fs = require("fs");
const { Parser } = require("json2csv");

// Read the JSON file
fs.readFile("./data.json", "utf8", (err, jsonData) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }

  try {
    // Parse the JSON data
    const data = JSON.parse(jsonData);

    // Define the fields for the CSV file
    const fields = Object.keys(data[0]);
    const opts = { fields };

    // Create a new parser instance with the specified fields
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    // Write the CSV data to a file
    fs.writeFile("data.csv", csv, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
        return;
      }
      console.log("CSV file has been saved.");
    });
  } catch (err) {
    console.error("Error parsing JSON data:", err);
  }
});
