const fs = require('fs');
const path = require('path');

async function checkModels() {
    try {
        // 1. Get API Key
        const dbPath = path.join(process.cwd(), 'database.json');
        if (!fs.existsSync(dbPath)) {
            console.error("Database not found");
            return;
        }
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const user = db.users[0];
        if (!user || !user.api_key) {
            console.error("No API Key found in DB");
            return;
        }

        const apiKey = user.api_key;
        console.log(`Checking models for Key: ${apiKey.substring(0, 5)}...`);

        // 2. Fetch Models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("--- AVAILABLE MODELS ---");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found?", data);
        }

    } catch (e) {
        console.error("Script Error:", e);
    }
}

checkModels();
