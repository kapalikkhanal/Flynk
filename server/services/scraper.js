const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { launchPuppeteer } = require('../config/puppeteer');
const { convertToSpeech } = require('../services/tts')
const { paraphraseText } = require('../services/paraphaser')

let newsData = [];
let sportNews = [];
let techNews = [];
let financeNews = [];
let selfPushedNewsData = [];
let rashifal = [];
let nepse = [];
let gold = [];

const url = 'https://www.hamropatro.com/';
const API_URL = "https://app.micmonster.com/restapi/create";

async function scrapeNews() {
    try {
        console.log('Scraping All News Data...');
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleUrls = [];
        const news = [];
        const uniqueIds = new Set();

        const nepaliDate = $('.date .nep').text().trim();
        const tithi = $('div[style="margin: 10px 0; color: white; font-size: 1.3rem"]').text().trim();
        const panchanga = $('div[style="line-height: 1.9"]').text().replace('पञ्चाङ्ग:', '').trim();

        $('.news-story-card').each(async (i, element) => {
            const newsCard = $(element);
            const title = newsCard.find('.news-story-card-text').text().trim();
            const link = newsCard.attr('href');
            const fullLink = url + link;
            const bgImageStyle = newsCard.attr('style');
            const imageUrlMatch = bgImageStyle.match(/url\((.*?)\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

            const sourceImages = [];
            newsCard.find('.news-story-card-sources-wrapper img').each((i, imgElement) => {
                const src = $(imgElement).attr('src');
                if (src) {
                    sourceImages.push(src);
                }
            });

            const idMatch = fullLink.match(/#(.+)$/);
            const id = idMatch ? idMatch[1] : '';

            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                articleUrls.push({
                    title,
                    link: fullLink,
                    sourceImageUrl: sourceImages,
                    id,
                    imageUrl,
                });
            }
        });

        // const currentTitles = articleUrls.map(article => article.title);
        // cleanUpCache(currentTitles);

        for (let article of articleUrls) {
            const { title, link, imageUrl, id, sourceImageUrl } = article;

            try {
                const { data: articleData } = await axios.get(link);
                const $article = cheerio.load(articleData);
                const publishedDate = $article(`#${id} .news-published-date`).text().trim();
                const articleText = $article(`#${id} .font-light.text-lg.text-justify.leading-loose`).text().trim();
                const sourceUrls = [];
                $article(`#${id} .source-items a`).each((index, element) => {
                    const href = $article(element).attr('href');
                    if (href) {
                        sourceUrls.push(href);
                    }
                });

                const titleAudio = await convertToSpeech(title);
                const contentAudio = await convertToSpeech(articleText);
                // const titleAudio = '';
                // const contentAudio = '';

                news.push({
                    title,
                    titleAudio: titleAudio || null,
                    sourceImageUrl,
                    imageUrl,
                    id,
                    urls: sourceUrls,
                    date: publishedDate,
                    content: articleText,
                    contentAudio: contentAudio || null,
                    nepaliDate,
                    tithi,
                    panchanga,
                })
            } catch (error) {
                console.error(`Error fetching details for ${url}.`);
            }
        }
        newsData = [...news];
        console.log('All news data scraped successfully');
    } catch (error) {
        console.error('Error fetching the website.');
        throw error;
    }
}

async function scrapeKantipurSportNews() {
    console.log('Scraping Sports News Data...');
    const browser = await launchPuppeteer();
    try {
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

        await page.goto('https://ekantipur.com/sports', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });

        await page.waitForSelector('.normal');

        const sportNewsData = await page.evaluate(() => {
            const articleUrls = [];
            const uniqueIds = new Set();
            document.querySelectorAll('.normal').forEach((element) => {
                const newsCard = element;
                const title = newsCard.querySelector('.teaser h2 a')?.textContent?.trim();
                const link = newsCard.querySelector('.teaser h2 a')?.getAttribute('href');
                const fullLink = link ? [`https://ekantipur.com + ${link}`] : [];

                const imageElement = newsCard.querySelector('.image figure a img');
                let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || '';

                const content = newsCard.querySelector('.teaser p')?.textContent?.trim();
                const sourceImages = ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRupQwELqDYhcmL8weYk7SrxlqoDbVZX9OhJA&s'];

                const id = [...Array(20)].map(() => Math.random().toString(36)[2]).join('');

                if (!uniqueIds.has(id)) {
                    uniqueIds.add(id);
                    articleUrls.push({
                        title,
                        content,
                        link: fullLink,
                        sourceImageUrl: sourceImages,
                        id,
                        imageUrl,
                    });
                }
            });
            return articleUrls;
        });

        // const currentTitles = sportNewsData.map(article => article.title);
        // cleanUpCache(currentTitles);

        const finalSportNewsData = [];

        for (let article of sportNewsData) {
            const { title, content, link, imageUrl, id, sourceImageUrl } = article;

            try {
                const titleAudio = await convertToSpeech(title);
                const contentAudio = await convertToSpeech(content);
                // const titleAudio = '';
                // const contentAudio = '';

                finalSportNewsData.push({
                    title,
                    titleAudio: titleAudio || null,
                    sourceImageUrl,
                    imageUrl,
                    id,
                    urls: link,
                    date: 'N/A',
                    content: content,
                    contentAudio: contentAudio || null
                });
            } catch (error) {
                console.error(`Error processing article: ${link}`);
            }
        }

        sportNews = [...finalSportNewsData];
        console.log('All sports news data scraped successfully');
    } catch (error) {
        console.error('Error scraping Kantipur Sports News.', error);
    } finally {
        if (browser) {
            await browser.close(); // Ensure the browser is closed to avoid memory leaks
        }
    }
}

async function scrapeKantipurFinanceNews() {
    console.log('Scraping Finance News Data...');
    const browser = await launchPuppeteer();
    try {
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

        await page.goto('https://ekantipur.com/business', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });

        await page.waitForSelector('.normal');

        const financeNewsData = await page.evaluate(() => {
            const articleUrls = [];
            const uniqueIds = new Set();
            document.querySelectorAll('.normal').forEach((element) => {
                const newsCard = element;
                const title = newsCard.querySelector('.teaser h2 a')?.textContent?.trim();
                const link = newsCard.querySelector('.teaser h2 a')?.getAttribute('href');
                const fullLink = link ? [`https://ekantipur.com + ${link}`] : [];

                const imageElement = newsCard.querySelector('.image figure a img');
                let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || '';

                const content = newsCard.querySelector('.teaser p')?.textContent?.trim();
                const sourceImages = ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRupQwELqDYhcmL8weYk7SrxlqoDbVZX9OhJA&s'];

                const id = [...Array(20)].map(() => Math.random().toString(36)[2]).join('');

                if (!uniqueIds.has(id)) {
                    uniqueIds.add(id);
                    articleUrls.push({
                        title,
                        content,
                        link: fullLink,
                        sourceImageUrl: sourceImages,
                        id,
                        imageUrl,
                    });
                }
            });
            return articleUrls;
        });

        // const currentTitles = financeNewsData.map(article => article.title);
        // cleanUpCache(currentTitles);

        const finalfinanceNewsData = [];

        for (let article of financeNewsData) {
            const { title, content, link, imageUrl, id, sourceImageUrl } = article;

            try {
                const titleAudio = await convertToSpeech(title);
                const contentAudio = await convertToSpeech(content);
                // const titleAudio = '';
                // const contentAudio = '';

                finalfinanceNewsData.push({
                    title,
                    titleAudio: titleAudio || null,
                    sourceImageUrl,
                    imageUrl,
                    id,
                    urls: link,
                    date: 'N/A',
                    content: content,
                    contentAudio: contentAudio || null
                });
            } catch (error) {
                console.error(`Error processing article: ${link}`);
            }
        }

        financeNews = [...finalfinanceNewsData];
        // console.log(financeNews)
        console.log('All finanace news data scraped successfully');
    } catch (error) {
        console.error('Error scraping Kantipur Finanace News.', error);
    } finally {
        if (browser) {
            await browser.close(); // Ensure the browser is closed to avoid memory leaks
        }
    }
}

async function scrapeTechnologyNews() {
    console.log('Scraping Technology News Data...');
    const browser = await launchPuppeteer();
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

        await page.goto('https://technologykhabar.com/', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });
        await page.waitForSelector('.latest_news .news_area .news_box');

        const techNewsData = await page.evaluate(() => {
            const articleUrls = [];
            const uniqueIds = new Set();

            document.querySelectorAll('.news_box .col-lg-6 .news_items').forEach((element) => {
                const newsCard = element;
                const title = newsCard.querySelector('.news_title a')?.textContent?.trim();
                const link = newsCard.querySelector('.news_title a')?.getAttribute('href');
                const fullLink = [`${link}`];
                const imageElement = newsCard.querySelector('.news_img a img');
                let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || '';
                const sourceImages = ['https://scontent.fktm10-1.fna.fbcdn.net/v/t39.30808-6/433005954_911798867617699_7228903362847666689_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=SM44t8_QDjwQ7kNvgGxWqTr&_nc_zt=23&_nc_ht=scontent.fktm10-1.fna&_nc_gid=Aspp8xLHzttCeesiEnitsI-&oh=00_AYAfQ5Lv3vNElusR9T-jVOgLrK5dkpmedC7R2SiWckq0eQ&oe=67190862'];
                const id = [...Array(20)].map(() => Math.random().toString(36)[2]).join('');

                if (!uniqueIds.has(id)) {
                    uniqueIds.add(id);
                    articleUrls.push({
                        title,
                        link: fullLink,
                        sourceImageUrl: sourceImages,
                        id,
                        imageUrl,
                    });
                }
            });
            return articleUrls;
        });

        // const currentTitles = techNewsData.map(article => article.title);
        // cleanUpCache(currentTitles);

        const finalTechNewsData = [];

        for (let article of techNewsData) {
            const { title, link, imageUrl, id, sourceImageUrl } = article;

            try {
                const { data: articleData } = await axios.get(link);
                const $article = cheerio.load(articleData);
                let content = $article(`.single_news_body .single_news_paragraph p:nth-of-type(2)`).text().trim();
                if (content.length < 50) {
                    content = $article('.single_news_body .single_news_paragraph p:nth-of-type(3)').text().trim();
                }

                // const content = await paraphraseText(articleText);
                const titleAudio = await convertToSpeech(title);
                const contentAudio = await convertToSpeech(content);

                // const titleAudio = '';
                // const contentAudio = '';

                finalTechNewsData.push({
                    title,
                    titleAudio: titleAudio || null,
                    sourceImageUrl,
                    imageUrl,
                    id,
                    urls: link,
                    date: 'N/A',
                    content: content,
                    contentAudio: contentAudio || null
                });
            } catch (error) {
                console.error(`Error processing article: ${link}`);
            }
        }
        // console.log(finalTechNewsData)
        techNews = [...finalTechNewsData];
        console.log('All tech news data scraped successfully');
    } catch (error) {
        console.error('Error scraping Tech News.', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function scrapeRashifal() {
    try {
        console.log('Scraping Rashifal data...');
        const { data } = await axios.get('https://www.hamropatro.com/rashifal');
        const $ = cheerio.load(data);

        const rashifalData = [];

        $('#rashifal .item').each((index, element) => {
            const zodiacSign = $(element).find('h3').text().trim();
            const description = $(element).find('.desc p').text().trim();
            rashifalData.push({
                sign: zodiacSign,
                description: description,
            });
        });

        rashifal = rashifalData;
        console.log('Rashifal data scraped successfully');
    } catch (error) {
        console.error('Error scraping Rashifal data:', error.message);
    }
};

async function scrapeNepse() {
    console.log('Scraping Nepse Data...');
    const browser = await launchPuppeteer();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

        await page.goto('https://nepalstock.com/', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });

        const nepseData = await page.evaluate(() => {
            const data = [];
            const elements = document.querySelectorAll('.index__points');
            elements.forEach((element) => {
                const nepseIndex = element.querySelector('.index__points--number span')?.textContent?.trim() || '';
                const totalTurnoverText = element.querySelector('.index__points--summary span')?.textContent?.trim() || '';
                const totalTradedShareText = element.querySelector('.index__points--summary span:nth-child(2)')?.textContent?.trim() || '';

                const totalTurnover = totalTurnoverText.match(/[\d,]+\.\d+/)?.[0] || '';
                const totalTradedShare = totalTradedShareText.match(/[\d,]+/)?.[0] || '';

                const nepseChangeValue = element.querySelector('.index__points--number .index__points--index .index__points--change')?.textContent?.trim() || '';
                const nepseChangePer = element.querySelector('.index__points--number .index__points--index .index__points--changepercent')?.textContent?.trim() || '';

                data.push({
                    nepseIndex,
                    totalTurnover,
                    totalTradedShare,
                    nepseChangeValue,
                    nepseChangePer,
                });
            });
            return data;
        });

        // console.log(nepseData);
        console.log('Nepse data scraped successfully');
        nepse = nepseData;
        await browser.close();
    } catch (error) {
        console.error('Error scraping Nepse data with Puppeteer:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function scrapeGold() {
    console.log('Scraping Gold data...');
    const browser = await launchPuppeteer();
    try {

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

        await page.goto('https://www.fenegosida.org/', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });

        const goldData = await page.evaluate(() => {
            const data = [];
            const fineGold = document.querySelectorAll('.rate-gold.post:nth-child(1) b')[1]?.textContent.trim() || null;
            const silver = document.querySelectorAll('.rate-silver.post b')[1]?.textContent.trim() || null;

            const day = document.querySelector('.rate-date-day')?.textContent.trim() || '';
            const month = document.querySelector('.rate-date-month')?.textContent.trim() || '';
            const year = document.querySelector('.rate-date-year')?.textContent.trim() || '';

            const date = `${day} ${month}, ${year}`;

            data.push({
                fineGold,
                silver,
                date
            });

            return data;
        });

        await browser.close();
        // console.log(goldData);
        console.log('Gold data scraped successfully');
        gold = goldData;

    } catch (error) {
        console.error('Error scraping Gold data:');
        // console.log(gold);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function runScrapingFunctionsSequentially() {
    try {
        await scrapeRashifal();
        await scrapeNews();
        await scrapeKantipurSportNews();
        await scrapeTechnologyNews();
        await scrapeKantipurFinanceNews();
        await scrapeNepse();
        await scrapeGold();
    } catch (error) {
        console.error('Error in scraping:', error);
    }
}

runScrapingFunctionsSequentially();


module.exports = {
    scrapeNews,
    scrapeKantipurSportNews,
    scrapeTechnologyNews,
    scrapeKantipurFinanceNews,
    scrapeRashifal,
    scrapeGold,
    scrapeNepse,
    getAllNewsData: () => newsData,
    getSportsNewsData: () => sportNews,
    getTechNewsData: () => techNews,
    getFinanceNewsData: () => financeNews,
    getRashifalData: () => rashifal,
    getNepseData: () => nepse,
    getGoldData: () => gold,
    selfPushedNewsData,
};