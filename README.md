# LiteStatus

<h3 align="center"><img src="media/demo.png"></h3>

<p align="center">
  <a href="#about">About</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start--information">Quick Start & Information</a> •
  <a href="#download">Download</a> 
</p>

## About

LiteStatus is a lightweight site uptime monitoring solution that uses GitHub Actions to regularly check the availability of specified websites. Results are stored in a JSON file (`pingResults.json`) this file is accessed by the front end, built with Astro.js, to provide a dynamically updated status page hosted on GitHub Pages. This setup enables a fully automated, cost-free, and easily customizable status page deployment just using GitHub's free ecosystem.

## Features

- The GitHub Action pings each website hourly, ensuring your status page displays current availability.
- `pingResults.json` provides a structured and easily parsable format, ideal for front-end integration.
- Leverages Astro.js for a static site build, making it efficient and flexible for customization.
- Host the entire solution on GitHub with GitHub Pages and GitHub Actions.

## Quick Start & Information

1. **Clone the repository**: `git clone https://github.com/SegoCode/LiteStatus.git`
2. **Set Up GitHub Action**: Configure the GitHub Action to run the ping monitoring script in `LiteStatus/code/ping` automatically. This Action will populate `pingResults.json` with up-to-date status data.
3. **Deploy the front with Astro.js**:
   - Navigate to the front-end directory: `cd LiteStatus/code/front`
   - Install dependencies: `npm install`
   - Build the static site: `npm run dev`

## Download

Download the latest version of `pingResults.json` [here](https://github.com/SegoCode/LiteStatus/blob/main/code/ping/pingResults.json).

---
<p align="center"><a href="https://github.com/SegoCode/LiteStatus/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SegoCode/LiteStatus" />
</a></p>
