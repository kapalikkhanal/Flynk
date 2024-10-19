const axios = require('axios');
const { URLSearchParams } = require('url');

const API_URL = "https://app.micmonster.com/restapi/create";

async function convertToSpeech(text, locale = "ne-NP") {
    // console.log("Text::", text)
    const formData = new URLSearchParams({
        locale,
        content: `<voice name="ne-NP-SagarNeural">${text}</voice>`,
        ip: "127.0.0.1",
    });

    try {
        const response = await axios.post(API_URL, formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const audioData = response.data.match(/([A-Za-z0-9+/=]+)/);
        if (!audioData) {
            throw new Error("No valid base64 audio data found in the response.");
        }

        return audioData[1];
    } catch (error) {
        console.error("Error converting text to speech:", error.message);
        throw error;
    }
}

module.exports = { convertToSpeech };