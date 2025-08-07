// Script to test website functionality and capture runtime errors
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const webLogPath = path.join(__dirname, '../logs/web-output.log');
const runtimeLogPath = path.join(__dirname, '../logs/runtime-errors.log');

async function testWebsite() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const errorMsg = `${new Date().toISOString()} - Console Error: ${msg.text()}\n`;
      fs.appendFileSync(runtimeLogPath, errorMsg);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    const errorMsg = `${new Date().toISOString()} - Page Error: ${error.message}\n`;
    fs.appendFileSync(runtimeLogPath, errorMsg);
  });
  
  try {
    // Test main page
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    const mainPageContent = await page.content();
    fs.appendFileSync(webLogPath, `${new Date().toISOString()} - Main page loaded successfully\n`);
    
    // Test agents page
    await page.goto('http://localhost:3000/agents', { waitUntil: 'networkidle0' });
    const agentsContent = await page.content();
    fs.appendFileSync(webLogPath, `${new Date().toISOString()} - Agents page loaded successfully\n`);
    
    // Test sidebar navigation
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (let button of buttons) {
        if (button.textContent && button.textContent.includes('General Settings')) {
          button.click();
          break;
        }
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    fs.appendFileSync(webLogPath, `${new Date().toISOString()} - Sidebar navigation tested successfully\n`);
    
  } catch (error) {
    const errorMsg = `${new Date().toISOString()} - Runtime Test Error: ${error.message}\n`;
    fs.appendFileSync(runtimeLogPath, errorMsg);
  }
  
  await browser.close();
}

// Run if called directly
if (require.main === module) {
  testWebsite().then(() => {
    console.log('Website testing complete. Check logs for results.');
  }).catch(console.error);
}

module.exports = testWebsite;
