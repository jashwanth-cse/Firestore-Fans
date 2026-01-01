const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Extract event data from natural language using Gemini AI
 * @param {string} userText - Natural language event description
 * @returns {object} - Extracted event data
 */
async function extractEventData(userText) {
    try {
        const currentDate = new Date();
        const prompt = `
You are an AI assistant that extracts event details from natural language.

Current date: ${currentDate.toISOString().split('T')[0]}

Extract event details from the following text:
"${userText}"

Return ONLY valid JSON with these exact fields (no markdown, no code blocks):
{
  "eventName": "string (descriptive event name)",
  "date": "YYYY-MM-DD (future date)",
  "startTime": "HH:MM (24-hour format)",
  "durationHours": number (0.5 to 8),
  "seatsRequired": number (1 to 1000),
  "facilitiesRequired": ["string array of facilities"]
}

Rules:
1. If date is relative (e.g., "next Tuesday", "tomorrow"), calculate actual date from ${currentDate.toISOString().split('T')[0]}
2. If time is relative (e.g., "morning"), use 10:00; "afternoon" use 14:00; "evening" use 18:00
3. If duration not specified, default to 2 hours
4. Extract facilities as standardized names: "Computers", "Projector", "Air Conditioning", "WiFi", "Whiteboard", "Audio System", "Lab Equipment"
5. If seats not specified, estimate based on context (small=30, medium=60, large=200)
6. Event name should be descriptive and professional

Return ONLY the JSON object, nothing else.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const extractedData = JSON.parse(text);

        // Validate extracted data
        if (!extractedData.eventName || !extractedData.date || !extractedData.startTime) {
            throw new Error('Missing required fields in extraction');
        }

        return extractedData;
    } catch (error) {
        console.error('Gemini AI extraction error:', error);
        throw new Error(`Failed to extract event data: ${error.message}`);
    }
}

/**
 * Suggest alternative venues using Gemini AI
 * @param {object} eventRequirements - Event details
 * @param {array} venues - Available venues from Firestore
 * @returns {array} - Ranked alternative suggestions
 */
async function suggestAlternatives(eventRequirements, venues) {
    try {
        const prompt = `
You are an AI assistant that recommends venues for events.

Event Requirements:
- Date: ${eventRequirements.date}
- Time: ${eventRequirements.startTime}
- Duration: ${eventRequirements.durationHours} hours
- Seats: ${eventRequirements.seatsRequired}
- Facilities: ${eventRequirements.facilitiesRequired.join(', ')}

Available Venues:
${JSON.stringify(venues, null, 2)}

Suggest the 3 BEST venues from the list above that match the requirements.
Rank them by suitability (best first).
For each venue, explain WHY it's a good match.

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "venueId": "string (must be an ID from the venues list)",
    "reason": "string (explain why this venue is suitable)",
    "matchScore": number (0-100, based on how well it matches)
  }
]

Consider:
- Capacity should meet or slightly exceed requirements
- Facilities should match as many requirements as possible
- Assign higher scores to better matches

Return ONLY the JSON array, nothing else.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const suggestions = JSON.parse(text);

        // Validate and limit to 3
        return suggestions.slice(0, 3);
    } catch (error) {
        console.error('Gemini AI suggestion error:', error);
        throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
}

module.exports = {
    extractEventData,
    suggestAlternatives,
};
