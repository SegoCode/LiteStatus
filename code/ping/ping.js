const fs = require('fs');
const https = require('https');
const http = require('http');

// List of predefined websites to ping
const websites = [
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "OpenIA", url: "https://openai.com/" },
  { name: "API OpenIA", url: "https://api.openai.com/" }
];

const dataFile = 'pingResults.json';

// Function to check if a file exists
function fileExists(path) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

// Initialize the JSON file if it doesn't exist
if (!fileExists(dataFile)) {
  const initialData = websites.map(site => ({
    name: site.name,
    pings: []
  }));
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

// Function to ping a website and measure response time
function pingWebsite(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const isHttps = url.startsWith('https://');
    const requestModule = isHttps ? https : http;
    const req = requestModule.get(url, res => {
      res.on('data', () => {}); // Consume data
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        resolve({ status: 'up', responseTime });
      });
    });

    req.on('error', err => {
      console.error(`Error pinging ${url}: ${err.message}`);
      resolve({ status: 'down', responseTime: 0 });
    });

    // Set a timeout in case the request hangs
    req.setTimeout(5000, () => {
      req.abort();
      console.error(`Timeout pinging ${url}`);
      resolve({ status: 'down', responseTime: 0 });
    });
  });
}

// Main function to perform pings and update the JSON file
async function main() {
  // Load data from the JSON file
  let data = JSON.parse(fs.readFileSync(dataFile));

  const timestamp = new Date().toISOString();

  // Perform pings in parallel
  const pingPromises = websites.map(async site => {
    const result = await pingWebsite(site.url);

    // Find the site in the data
    let siteData = data.find(s => s.name === site.name);
    if (!siteData) {
      // If the site is not found, add it
      siteData = { name: site.name, pings: [] };
      data.push(siteData);
    }

    // Add the new ping record
    siteData.pings.push({
      timestamp,
      status: result.status,
      responseTime: result.responseTime
    });

    // Ensure the pings array has at most 20 records
    if (siteData.pings.length > 50) {
      siteData.pings = siteData.pings.slice(-50);
    }
  });

  await Promise.all(pingPromises);

  // Save the updated data back to the JSON file
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

main();
