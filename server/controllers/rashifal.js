const { scrapeRashifal, scrapeGold, scrapeNepse, getNepseData, getGoldData, getRashifalData } = require('../services/scraper');

const getRashifal = async (req, res) => {
    try {
        let rashifal = getRashifalData();
        let gold = getGoldData();
        console.log('Gold', gold)
        let nepse = getNepseData(); 

        if (rashifal.length === 0) {
            console.log('Rashifal data is empty, scraping again.');
            await scrapeRashifal();
            rashifal = getRashifalData();
        }

        if (gold.length === 0) {
            console.log('Gold data is empty, scraping again.');
            await scrapeGold();
            gold = getGoldData();
        }

        if (nepse.length === 0) {
            console.log('Nepse data is empty, scraping again.');
            await scrapeNepse();
            nepse = getNepseData();
        }

        const response = {
            rashifal: rashifal.length > 0 ? rashifal : 'No Rashifal data found',
            gold: gold.length > 0 ? gold : 'No Gold data found',
            nepse: nepse.length > 0 ? nepse : 'No Nepse data found'
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching the rashifal:', error);
        res.status(500).json({ error: 'Failed to get rashifal' });
    }
};

module.exports = { getRashifal };
