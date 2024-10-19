const { scrapeRashifal, getRashifalData } = require('../services/scraper');

const getRashifal = async (req, res) => {
    try {
        let rashifal = getRashifalData();

        if (rashifal.length === 0) {
            console.log('Rashifal data is empty, scraping again.');
            await scrapeRashifal();
            rashifal = getRashifalData();
        }
        if (rashifal.length === 0) {
            return res.status(404).json({ message: 'No Rashifal found' });
        }

        res.json(rashifal);
    } catch (error) {
        console.error('Error fetching the rashifal:', error);
        res.status(500).json({ error: 'Failed to get rashifal' });
    }
};

module.exports = { getRashifal };
