const { scrapeKantipurFinanceNews, getFinanceNewsData } = require('../services/scraper');

exports.getFinanceNewsData = async (req, res) => {
    try {
        let financeNews = getFinanceNewsData();

        if (financeNews.length === 0) {
            console.log('Finance news data is empty, scraping again.');
            await scrapeKantipurFinanceNews();
            financeNews = getFinanceNewsData();
        }
        if (financeNews.length === 0) {
            return res.status(404).json({ message: 'No Finance News Data found' });
        }

        const { page = 1, limit = 10 } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedNews = financeNews.slice(startIndex, endIndex);

        res.json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(financeNews.length / limit),
            totalNews: financeNews.length,
            news: paginatedNews,
        });
    } catch (error) {
        console.error('Error fetching the finance news:', error);
        res.status(500).json({ error: 'Failed to get finance news' });
    }
};