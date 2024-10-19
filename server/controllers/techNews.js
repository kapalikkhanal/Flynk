const { scrapeTechnologyNews, getTechNewsData } = require('../services/scraper');

exports.getTechNews = async (req, res) => {
    try {
        let techNews = getTechNewsData();

        if (techNews.length === 0) {
            console.log('Tech news data is empty, scraping again.');
            await scrapeTechnologyNews();
            techNews = getTechNewsData();
        }
        if (techNews.length === 0) {
            return res.status(404).json({ message: 'No Tech News Data found' });
        }

        const { page = 1, limit = 10 } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedNews = techNews.slice(startIndex, endIndex);

        res.json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(techNews.length / limit),
            totalNews: techNews.length,
            news: paginatedNews,
        });
    } catch (error) {
        console.error('Error fetching the sports news:', error);
        res.status(500).json({ error: 'Failed to get sports news' });
    }
};