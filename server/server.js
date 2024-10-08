const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const cron = require('node-cron');
const bodyParser = require("body-parser");
const { URLSearchParams } = require("url");
const compression = require('compression');
const moment = require('moment');
const fs = require('fs');

const app = express();
const PORT = 3001;

const url = 'https://www.hamropatro.com/';
const API_URL = "https://app.micmonster.com/restapi/create";

app.use(compression());
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'));

let newsData = [];
let selfPushedNewsData = [];
let rashifal = [];
let audioCache = new Map();

function cleanUpCache(currentTitle) {
    // Iterate over the cache and remove entries that do not match the currentTitle
    for (const [title, filePath] of audioCache.entries()) {
        if (title !== currentTitle) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete ${filePath}`);
                }
            });
            audioCache.delete(title);
        }
    }
}

async function convertToSpeech(text, locale = "ne-NP") {

    if (audioCache.has(text)) {
        return audioCache.get(text);
    }
    // console.log("Title:", text)
    const formData = new URLSearchParams({
        locale,
        content: `<voice name="ne-NP-SagarNeural">${text}</voice>`,
        ip: "127.0.0.1",
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();

        const audioData = responseText.match(/([A-Za-z0-9+/=]+)/);
        if (!audioData) {
            throw new Error("No valid base64 audio data found in the response.");
        }

        // Store the audio data in the cache
        audioCache.set(text, audioData[1]);

        return audioData[1];
    } catch (error) {
        console.error("Error converting text to speech:", error.message);
        return null;
    }
}

async function scrapeNews() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleUrls = [];
        const news = [];
        const uniqueIds = new Set();

        const nepaliDate = $('.date .nep').text().trim();
        const tithi = $('div[style="margin: 10px 0; color: white; font-size: 1.3rem"]').text().trim();
        const panchanga = $('div[style="line-height: 1.9"]').text().replace('पञ्चाङ्ग:', '').trim();

        // Adjust the selector to match the actual structure
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

            // Extract ID from link
            const idMatch = fullLink.match(/#(.+)$/);
            const id = idMatch ? idMatch[1] : '';

            if (!uniqueIds.has(id)) { // Check if the ID is already in the set
                uniqueIds.add(id); // Add ID to the set to prevent duplicates
                articleUrls.push({
                    title,
                    link: fullLink,
                    sourceImageUrl: sourceImages,
                    id,
                    imageUrl,
                });
            }
        });

        const currentTitles = articleUrls.map(article => article.title);
        cleanUpCache(currentTitles);
        
        for (let article of articleUrls) {
            const { title, link, imageUrl, id, sourceImageUrl } = article;
            // 
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
        // console.log(selfPushedNewsData)
        newsData = [...news];
        newsData.push(...selfPushedNewsData);
    } catch (error) {
        console.error('Error fetching the website.');
        throw error;
    }
}

async function scrapeRashifal() {
    try {
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
    } catch (error) {
        console.error('Error scraping Rashifal data:', error.message);
    }
};


function parseDuration(durationString) {
    const durationParts = durationString.match(/(\d+)([h|m])/g);
    let totalMinutes = 0;

    if (durationParts) {
        durationParts.forEach(part => {
            const value = parseInt(part, 10);
            if (part.includes('h')) {
                totalMinutes += value * 60; // Convert hours to minutes
            } else if (part.includes('m')) {
                totalMinutes += value;
            }
        });
    }

    return moment().subtract(totalMinutes, 'minutes');
}

function formatElapsedTime(dateString) {
    let date;
    if (/^\d+h \d+m/.test(dateString)) {
        // Parse duration format like '1h 20m'
        date = parseDuration(dateString);
    } else if (/^\d+m/.test(dateString)) {
        // Parse duration format like '2m'
        date = parseDuration(dateString);
    } else {
        // Parse ISO date string
        date = moment(dateString);
    }

    const now = moment(); // Current time

    // Calculate the difference in minutes
    const diffInMinutes = now.diff(date, 'minutes');
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInMinutes / (24 * 60));

    if (diffInMinutes < 60) {
        return `${diffInMinutes} मिनेट अघी`;
    } else if (diffInHours < 24) {
        return `${diffInHours} घण्टा अघी`;
    } else {
        return `${diffInDays} दिन अघी`;
    }
}

async function paraphraser(input) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://paraphrasetool.com/langs/nepali-summarizing-tool', {
            waitUntil: 'networkidle2',
        });

        const textInputSelector = 'div[data-testid="text_entry_paraphrase_text_entry"]';
        await page.waitForSelector(textInputSelector);
        await page.click(textInputSelector);
        await page.keyboard.type(input);

        const paraphraseButtonSelector = 'div.TextEntry_bottom__lBsEw.TextEntry_hide_desktop__thZDA.border-t.border-r.dark\\:border-gray.border_gray_lighter .TextEntry_bottomBtn__pmr_k.flex.gap-x-4.items-center button';

        try {
            await page.waitForSelector(paraphraseButtonSelector, { visible: true, timeout: 10000 });
            await page.evaluate((selector) => {
                const button = document.querySelector(selector);
                if (button) {
                    button.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            }, paraphraseButtonSelector);
            await page.click(paraphraseButtonSelector);
            console.log('Clicked the paraphrase button successfully.');
        } catch (error) {
            console.error('Failed to click the button:', error.message);
            await page.screenshot({ path: 'error_screenshot.png' });
            console.log('Screenshot taken for debugging.');
            await browser.close();
            return;
        }

        await page.waitForFunction(
            (selector) => {
                const button = document.querySelector(selector);
                return button && !button.disabled;
            },
            { timeout: 30000 },
            paraphraseButtonSelector
        );

        const paraphrasedContentSelector = 'div.TextEntry_textAreaHeight__5JSou span';
        const charCountSelector = 'div.TextEntry_entryCol__ba_Qu div.TextEntry_text__qvgv_ span';

        await page.waitForSelector(paraphrasedContentSelector, { timeout: 10000 });
        await page.waitForSelector(charCountSelector, { timeout: 10000 });

        const result = await page.evaluate(({ paraphrasedContentSelector, charCountSelector }) => {
            const paraphrasedContainer = document.querySelector(paraphrasedContentSelector);
            const charCountElement = document.querySelector(charCountSelector);

            if (!paraphrasedContainer || !charCountElement) {
                throw new Error('Required elements not found.');
            }

            const elements = paraphrasedContainer.querySelectorAll('span, mark');
            const textSet = new Set();
            elements.forEach(el => {
                const textContent = el.textContent.trim();
                if (textContent) textSet.add(textContent);
            });
            const paraphrasedText = Array.from(textSet).join(' ');

            const charCountText = charCountElement.textContent.trim();
            return { paraphrasedText, charCountText };
        }, { paraphrasedContentSelector, charCountSelector });

        return result;
    } catch (error) {
        console.error('Error during paraphrasing:', error);
        throw new Error('Failed to paraphrase text');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

scrapeNews();
scrapeRashifal()

// Schedule a cron job to fetch news every 5 minutes
cron.schedule('*/59 * * * *', async () => {
    try {
        await scrapeNews();
        console.log('News fetched and updated.');
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.get('/api/news', (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Get page and limit from query params
        const startIndex = (page - 1) * limit;     // Calculate starting index
        const endIndex = page * limit;             // Calculate ending index

        const paginatedNews = newsData.slice(startIndex, endIndex); // Slice the news data for pagination

        res.json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(newsData.length / limit),
            totalNews: newsData.length,
            news: paginatedNews,
        });
    } catch (error) {
        console.error('Error fetching the news:', error);
        res.status(500).json({ error: 'Failed to get news' });
    }
});

app.get('/api/top5', (req, res) => {
    try {
        const top5News = newsData.slice(0, 5).map(news => ({
            title: news.title,
            sourceImageUrl: news.sourceImageUrl,
            id: news.id,
            imageUrl: news.imageUrl,
            urls: news.urls,
            date: news.date,
            nepaliDate: news.nepaliDate,
            tithi: news.tithi,
            panchanga: news.panchanga
        }));

        res.json({
            top5News,
        });
    } catch (error) {
        console.error('Error fetching top 5 news:', error);
        res.status(500).json({ error: 'Failed to get top 5 news' });
    }
});

app.get('/api/rashifal', (req, res) => {
    try {
        if (rashifal.length === 0) {
            res.status(404).json({ message: 'No Rashifal found' });
        } else {
            res.json(rashifal);
        }
    } catch (error) {
        console.error('Error fetching the rashifal:', error);
        res.status(500).json({ error: 'Failed to get rashifal' });
    }
});

app.post("/api/convert-tts", async (req, res) => {
    const { text, locale = "ne-NP" } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    const formData = new URLSearchParams({
        locale,
        content: `<voice name="ne-NP-SagarNeural">${text}</voice>`,
        ip: "127.0.0.1",
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();

        const audioData = responseText.match(/([A-Za-z0-9+/=]+)/); // Adjust regex as needed
        if (!audioData) {
            throw new Error("No valid base64 audio data found in the response.");
        }

        res.json({ audio: audioData[1] });

    } catch (error) {
        console.error("Error converting text to speech:", error.message);
        res.status(500).json({ error: "Failed to convert text to speech." });
    }
});

app.post('/api/post', async (req, res) => {
    try {
        const { title, content, sourceImageUrl, imageUrl, urls, id, date } = req.body;

        try {
            titleAudio = await convertToSpeech(title);
        } catch (error) {
            console.error('Error converting title to speech:', error);
        }
        try {
            contentAudio = await convertToSpeech(content);
        } catch (error) {
            console.error('Error converting content to speech:', error);
        }

        const convertedTime = formatElapsedTime(date);

        const newNewsItem = {
            title,
            titleAudio: titleAudio || null,
            sourceImageUrl: sourceImageUrl || null,
            imageUrl: imageUrl || null,
            id,
            urls: urls || null,
            date: convertedTime,
            content: content || null,
            contentAudio: contentAudio || null,
            nepaliDate: null,
            tithi: null,
            panchanga: null,
        };
        selfPushedNewsData.push(newNewsItem);

        res.status(200).json({ message: 'Added successfully' });
    } catch (error) {
        console.error('Error handling the request:', error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
});

app.get('/api/post', (req, res) => {
    try {
        res.status(200).json(selfPushedNewsData);
    } catch (error) {
        console.error('Error fetching self-posted news:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/post/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, imageUrl, urls, date } = req.body;

        const newsIndex = selfPushedNewsData.findIndex(newsItem => newsItem.id === id);

        if (newsIndex === -1) {
            return res.status(404).json({ message: 'News item not found' });
        }

        selfPushedNewsData[newsIndex] = {
            ...selfPushedNewsData[newsIndex],
            title: title || selfPushedNewsData[newsIndex].title,
            content: content || selfPushedNewsData[newsIndex].content,
            imageUrl: imageUrl || selfPushedNewsData[newsIndex].imageUrl,
            urls: urls || selfPushedNewsData[newsIndex].urls,
            date: date || selfPushedNewsData[newsIndex].date,
        };

        res.status(200).json({ message: 'News item updated successfully', updatedItem: selfPushedNewsData[newsIndex] });
    } catch (error) {
        console.error('Error updating news item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/api/post/:id', (req, res) => {
    try {
        const { id } = req.params;

        const newsIndex = selfPushedNewsData.findIndex(newsItem => newsItem.id === id);

        if (newsIndex === -1) {
            return res.status(404).json({ message: 'News item not found' });
        }

        selfPushedNewsData.splice(newsIndex, 1);

        res.status(200).json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/paraphrase', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text input is required' });
    }

    try {
        const paraphrasedText = await paraphraser(text);
        res.json({ paraphrasedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});