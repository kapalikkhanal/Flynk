const { scrapeKantipurSportNews, getSportsNewsData } = require('../services/scraper');

exports.getSportsNews = async (req, res) => {
    try {
        let sportNews = getSportsNewsData();

        if (sportNews.length === 0) {
            console.log('Sports news data is empty, scraping again.');
            await scrapeKantipurSportNews();
            sportNews = getSportsNewsData();
        }
        if (sportNews.length === 0) {
            return res.status(404).json({ message: 'No Sports News Data found' });
        }

        const { page = 1, limit = 10 } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedNews = sportNews.slice(startIndex, endIndex);

        res.json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(sportNews.length / limit),
            totalNews: sportNews.length,
            news: paginatedNews,
        });
    } catch (error) {
        console.error('Error fetching the sports news:', error);
        res.status(500).json({ error: 'Failed to get sports news' });
    }
};