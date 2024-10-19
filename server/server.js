const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { scrapeNews, scrapeRashifal, scrapeKantipurSportNews, scrapeTechnologyNews } = require('./services/scraper');
const newsRoutes = require('./routes/allNews');
const rashifalRoutes = require('./routes/rashifal');
const sportsRoutes = require('./routes/sportsNews');
const techRoutes = require('./routes/techNews')
const ttsRoutes = require('./routes/ttsRoutes');
const paraphraseRoutes = require('./routes/paraphaser');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(compression());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.use('/api/news', newsRoutes);
app.use('/api', newsRoutes);
app.use('/api/rashifal', rashifalRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/tech', techRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/paraphrase', paraphraseRoutes);

// Schedule scraping jobs
cron.schedule('*/59 * * * *', async () => {
    try {
        await scrapeRashifal();
        await scrapeNews();
        await scrapeKantipurSportNews();
        await scrapeTechnologyNews();
        console.log('Content fetched and updated.');
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


