const { paraphraser } = require('../services/paraphaser');

exports.paraphraseText = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text input is required' });
    }

    try {
        const paraphrasedText = await paraphraser(text);
        res.json({ paraphrasedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};