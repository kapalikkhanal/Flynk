const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

const url = 'https://www.hamropatro.com/';

async function scrapeNews() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const newsData = [];

        // Adjust the selector to match the actual structure
        $('.news-story-card').each((i, element) => {
            const newsCard = $(element);
            const title = newsCard.find('.news-story-card-text').text().trim();
            const link = newsCard.attr('href');
            const fullLink = url + link;
            const bgImageStyle = newsCard.attr('style');
            const imageUrlMatch = bgImageStyle.match(/url\((.*?)\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

            newsData.push({
                title,
                link: fullLink,
                imageUrl
            });
        });

        return newsData;
    } catch (error) {
        console.error('Error fetching the website:', error);
        throw error; // Re-throw the error to be caught in the route handler
    }
}

app.get('/api/news', async (req, res) => {
    try {
        const news = await scrapeNews();
        if (news.length === 0) {
            res.status(404).json({ message: 'No news found' });
        } else {
            res.json(news);
        }
    } catch (error) {
        console.error('Error fetching the news:', error);
        res.status(500).json({ error: 'Failed to scrape news' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});