const { convertToSpeech } = require('../services/tts');

exports.convertTextToSpeech = async (req, res) => {
    const { text, locale = "ne-NP" } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const audioData = await convertToSpeech(text, locale);
        res.json({ audio: audioData });
    } catch (error) {
        console.error("Error converting text to speech:", error.message);
        res.status(500).json({ error: "Failed to convert text to speech." });
    }
};