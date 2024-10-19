const { scrapeNews, getAllNewsData } = require('../services/scraper');
const { formatElapsedTime, convertToSpeech } = require('../utils/helpers');

exports.getNews = async (req, res) => {
    try {
        let newsData = getAllNewsData();

        if (newsData.length === 0) {
            console.log('News data is empty, scraping again.');
            await scrapeNews();
            newsData = getAllNewsData();
        }
        if (newsData.length === 0) {
            return res.status(404).json({ message: 'No News Data found' });
        }

        const { page = 1, limit = 10 } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedNews = newsData.slice(startIndex, endIndex);

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
};

exports.getTop5News = async (req, res) => {
    try {
        let newsData = getAllNewsData();

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

        res.json({ top5News });
    } catch (error) {
        console.error('Error fetching top 5 news:', error);
        res.status(500).json({ error: 'Failed to get top 5 news' });
    }
};

exports.addNews = async (req, res) => {
    try {
        const { title, content, sourceImageUrl, imageUrl, urls, id, date } = req.body;

        let titleAudio, contentAudio;
        try {
            titleAudio = await convertToSpeech(title);
            contentAudio = await convertToSpeech(content);
        } catch (error) {
            console.error('Error converting to speech:', error);
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
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getSelfPushedNews = (req, res) => {
    try {
        res.status(200).json(selfPushedNewsData);
    } catch (error) {
        console.error('Error fetching self-posted news:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateNews = (req, res) => {
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
};

exports.deleteNews = (req, res) => {
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
};