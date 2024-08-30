const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const cron = require('node-cron');
const bodyParser = require("body-parser");
const { URLSearchParams } = require("url");

const app = express();
const PORT = 3001;

const url = 'https://www.hamropatro.com/';
const API_URL = "https://app.micmonster.com/restapi/create";

app.use(bodyParser.json());

let newsData = [];
let rashifal = [];

async function scrapeNews() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleUrls = [];
        const news = [];

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

            articleUrls.push({
                title,
                link: fullLink,
                sourceImageUrl: sourceImages,
                id,
                imageUrl,
            });
        });

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

                news.push({
                    title,
                    sourceImageUrl,
                    imageUrl,
                    id,
                    urls: sourceUrls,
                    date: publishedDate,
                    content: articleText,
                    nepaliDate,
                    tithi,
                    panchanga,
                })
            } catch (error) {
                console.error(`Error fetching details for ${url}:`, error);
            }
        }

        newsData = news;
    } catch (error) {
        console.error('Error fetching the website:', error);
        throw error; // Re-throw the error to be caught in the route handler
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

scrapeNews();
scrapeRashifal()

// Schedule a cron job to fetch news every 5 minutes
cron.schedule('*/3 * * * *', async () => {
    try {
        await scrapeNews();
        console.log('News fetched and updated.');
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.get('/api/news', (req, res) => {
    try {
        if (newsData.length === 0) {
            res.status(404).json({ message: 'No news found' });
        } else {
            res.json(newsData);
        }
    } catch (error) {
        console.error('Error fetching the news:', error);
        res.status(500).json({ error: 'Failed to get news' });
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
    const { text, locale = "ne-NP" } = req.body; // Get text and locale from the request body

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});