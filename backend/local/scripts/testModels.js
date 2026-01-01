
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // Only fetch models that support generateContent
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey;
        // Wait, the SDK doesn't have a direct 'listModels' on the main class in all versions easily accessible this way without raw REST usually.
        // Actually, checking standard usage for debugging model names often implies checking docs or a specific raw call.
        // However, let's try a direct test of the most standard stable model 'gemini-pro' or 'gemini-1.5-flash' without 'latest' if v1beta is not used.

        console.log("Checking standard models...");

        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ Success! Model '${modelName}' is available.`);
                return;
            } catch (e) {
                console.log(`❌ Model '${modelName}' failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
