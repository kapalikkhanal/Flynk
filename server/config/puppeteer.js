const puppeteer = require('puppeteer');

async function launchPuppeteer() {
    return await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--single-process',
            '--no-zygote',
        ],
        executablePath: process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    });
}

module.exports = { launchPuppeteer };