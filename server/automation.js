const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

async function paraphraser(input) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://paraphrasetool.com/langs/nepali-summarizing-tool', {
            waitUntil: 'networkidle2',
        });

        const textInputSelector = 'div[data-testid="text_entry_paraphrase_text_entry"]';
        await page.waitForSelector(textInputSelector);
        await page.click(textInputSelector);
        await page.keyboard.type(input);

        const paraphraseButtonSelector = 'div.TextEntry_bottom__lBsEw.TextEntry_hide_desktop__thZDA.border-t.border-r.dark\\:border-gray.border_gray_lighter .TextEntry_bottomBtn__pmr_k.flex.gap-x-4.items-center button';

        try {
            await page.waitForSelector(paraphraseButtonSelector, { visible: true, timeout: 10000 });
            await page.evaluate((selector) => {
                const button = document.querySelector(selector);
                if (button) {
                    button.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            }, paraphraseButtonSelector);
            await page.click(paraphraseButtonSelector);
            console.log('Clicked the paraphrase button successfully.');
        } catch (error) {
            console.error('Failed to click the button:', error.message);
            await page.screenshot({ path: 'error_screenshot.png' });
            console.log('Screenshot taken for debugging.');
            await browser.close();
            return;
        }

        await page.waitForFunction(
            (selector) => {
                const button = document.querySelector(selector);
                return button && !button.disabled;
            },
            { timeout: 30000 },
            paraphraseButtonSelector
        );

        const paraphrasedContentSelector = 'div.TextEntry_textAreaHeight__5JSou span';
        const charCountSelector = 'div.TextEntry_entryCol__ba_Qu div.TextEntry_text__qvgv_ span';

        await page.waitForSelector(paraphrasedContentSelector, { timeout: 10000 });
        await page.waitForSelector(charCountSelector, { timeout: 10000 });

        const result = await page.evaluate(({ paraphrasedContentSelector, charCountSelector }) => {
            const paraphrasedContainer = document.querySelector(paraphrasedContentSelector);
            const charCountElement = document.querySelector(charCountSelector);

            if (!paraphrasedContainer || !charCountElement) {
                throw new Error('Required elements not found.');
            }

            const elements = paraphrasedContainer.querySelectorAll('span, mark');
            const textSet = new Set();
            elements.forEach(el => {
                const textContent = el.textContent.trim();
                if (textContent) textSet.add(textContent);
            });
            const paraphrasedText = Array.from(textSet).join(' ');

            const charCountText = charCountElement.textContent.trim();
            return { paraphrasedText, charCountText };
        }, { paraphrasedContentSelector, charCountSelector });

        return result;
    } catch (error) {
        console.error('Error during paraphrasing:', error);
        throw new Error('Failed to paraphrase text');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

app.post('/api/paraphrase', async (req, res) => {
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
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});