const express = require("express");
const bodyParser = require("body-parser");
const { URLSearchParams } = require("url");

const API_URL = "https://app.micmonster.com/restapi/create";

const formData = new URLSearchParams({
    locale: "ne-NP",
    content: `<voice name="ne-NP-SagarNeural"> इजरायलले गाजामा मानवीय सहायता र बालबालिकालाई पोलियो खोप दिन युद्धविराम गर्न सहमति जनाएको छ। विश्व स्वास्थ्य संगठनका अनुसार तीन दिनमा ६ लाख ४० हजार बालबालिकालाई खोप लगाइनेछ। यो निर्णय पोलियोका कारण १० महिने शिशुमा पक्षाघात देखिएपछि भएको हो। यस अभियानमा विभिन्न अन्तर्राष्ट्रिय संस्थाहरूको सहभागिता हुनेछ।</voice>`,
    ip: "27.34.65.63",
});

async function convertTextToSpeech() {
    try {
        const startTime = Date.now(); // Start timing

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        // Assuming response is text with encoded audio, extract the audio data part
        const responseText = await response.text();

        // Check the response format and extract audio data
        const audioData = responseText.match(/([A-Za-z0-9+/=]+)/); // Extract base64 data
        if (!audioData) {
            throw new Error("No valid base64 audio data found in the response.");
        }

        // Decode the base64 audio data
        const decodedAudio = Buffer.from(audioData[1], "base64");

        // Save the decoded audio as an MP3 file
        await fs.writeFile("./audio/output_speech.mp3", decodedAudio);
        console.log("Audio saved as output_speech.mp3");

        const endTime = Date.now(); // End timing
        console.log(`Time taken to convert text to audio: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
        console.error("Error converting text to speech:", error.message);
    }
}

convertTextToSpeech();
