const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = 3001;

const url = 'https://www.hamropatro.com/';

let newsData = [];

async function scrapeNews() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleUrls = [];
        const news = [];

        // Adjust the selector to match the actual structure
        $('.news-story-card').each(async (i, element) => {
            const newsCard = $(element);
            const title = newsCard.find('.news-story-card-text').text().trim();
            const link = newsCard.attr('href');
            const fullLink = url + link;
            const bgImageStyle = newsCard.attr('style');
            const imageUrlMatch = bgImageStyle.match(/url\((.*?)\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

            // Extract ID from link
            const idMatch = fullLink.match(/#(.+)$/);
            const id = idMatch ? idMatch[1] : '';

            articleUrls.push({
                title,
                link: fullLink,
                imageUrl,
                id
            });
        });

        for (let article of articleUrls) {
            const { title, link, imageUrl, id } = article;
            // 
            try {
                const { data: articleData } = await axios.get(link);
                const $article = cheerio.load(articleData);
                const publishedDate = $article(`#${id} .news-published-date`).text().trim();
                const articleText = $article(`#${id} .font-light.text-lg.text-justify.leading-loose`).text().trim();
                const articleUrl = $article(`#${id} .source-items a`).first().attr('href') || '';

                news.push({
                    title,
                    imageUrl,
                    id,
                    url: articleUrl,
                    date: publishedDate,
                    content: articleText
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

scrapeNews();

// Schedule a cron job to fetch news every 5 minutes
cron.schedule('*/5 * * * *', async () => {
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});