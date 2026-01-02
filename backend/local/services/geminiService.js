const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    },
});

/**
 * Extract event data from natural language using Gemini AI
 * @param {string} userText - Natural language event description
 * @returns {object} - Extracted event data
 */
async function extractEventData(userText) {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const prompt = `
You are an expert AI assistant that extracts event details from casual, rough, and even typo-filled natural language input.

**CRITICAL CONTEXT:**
- Current date: ${currentDate.toISOString().split('T')[0]}
- Current year: ${currentYear}
- Current month: ${currentDate.toLocaleString('en-US', { month: 'long' })}

**USER INPUT (may contain typos, informal language, or incomplete details):**
"${userText}"

**YOUR TASK:**
Extract and intelligently infer event details. Be EXTREMELY FORGIVING of:
- Typos and misspellings (e.g., "plac3men" → "placement", "meetting" → "meeting")
- Informal dates (e.g., "21st jan" → interpret as January 21st of current or next year)
- Missing year (always assume current year if month is in future, otherwise next year)
- Casual time formats (e.g., "9 am" → "09:00")
- Rough capacity hints (e.g., "room for 10 people" → seatsRequired: 10)

**OUTPUT FORMAT (MUST be valid JSON, NO markdown, NO code blocks):**
{
  "eventName": "string (corrected and descriptive name, e.g., 'Placement Meeting')",
  "date": "YYYY-MM-DD (inferred future date)",
  "startTime": "HH:MM (24-hour format)",
  "durationHours": number (0.5 to 8, default 2 if unspecified),
  "seatsRequired": number (1 to 1000, infer from context)",
  "facilitiesRequired": ["array of standardized facility names"]
}

**INTELLIGENT INFERENCE RULES:**
1. **Date Parsing:**
   - "21st jan" → Use current year if January is upcoming, otherwise use next year
   - "tomorrow" → Add 1 day to current date
   - "next week" → Add 7 days to current date
   - If only day + month given (no year), infer year intelligently

2. **Time Parsing:**
   - "9 am" / "9am" / "9 a.m." → "09:00"
   - "2:30 pm" → "14:30"
   - "morning" → "10:00"
   - "afternoon" → "14:00"
   - "evening" → "18:00"

3. **Capacity Inference:**
   - "10 people" / "for 10" → seatsRequired: 10
   - "small group" → 30
   - "class" → 60
   - "seminar" → 100
   - "auditorium" / "large" → 200

4. **Event Name Correction:**
   - Auto-correct typos ("plac3men" → "Placement")
   - Make it professional (capitalize properly)

5. **Facilities (Optional, infer from event type):**
   - Meeting → ["Projector", "WiFi", "Whiteboard"]
   - Lab/Workshop → ["Computers", "Lab Equipment"]
   - Seminar → ["Projector", "Audio System", "Air Conditioning"]
   - If not mentioned, use empty array: []

6. **Duration:**
   - Default to 2 hours if not specified
   - "quick meeting" → 1 hour
   - "all day" → 6 hours

**CRITICAL: Return ONLY the JSON object. No explanations, no markdown, no extra text.**
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

/**
 * Filter and rank venues by suitability using Gemini AI
 * @param {object} eventDetails - Full event details including name and description
 * @param {array} venues - List of time-available venues
 * @returns {array} - Ranked list of suitable venues
 */
async function filterVenuesBySuitability(eventDetails, venues) {
    try {
        console.log(`🤖 Gemini: Analyzing suitability for "${eventDetails.eventName}" among ${venues.length} venues`);

        const prompt = `
You are an AI venue coordinator depending on "Suitability" rather than strict rules.

Event Details:
- Name: "${eventDetails.eventName}"
- Description: "${eventDetails.description || 'No description provided'}"
- Date/Time: ${eventDetails.date} at ${eventDetails.startTime}
- Requested Seats: ${eventDetails.seatsRequired}
- Requested Facilities: ${eventDetails.facilitiesRequired.join(', ')}

Available Venues (Time is already checked, these are free):
${JSON.stringify(venues.map(v => ({
            id: v.id,
            name: v.name,
            capacity: v.capacity,
            facilities: v.facilities,
            type: v.type
        })), null, 2)}

TASK:
1. Analyze all venues for suitability.
2. Select the TOP 5 most suitable venues using the rules below.
3. Strict Rule: Capacity must be at least 80% of required.
4. Flexible Rule: Facilities are important but not blockers unless critical.

Return a JSON array of objects (LIMIT TO 5 ITEMS MAX):
[
  {
    "venueId": "string",
    "suitabilityScore": number (0-100),
    "reason": "string (Short reasons only)",
    "isSuitable": boolean
  }
]

Sort by suitabilityScore descending. Return ONLY JSON.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Sometimes text ends with junk, try to find the last closing bracket
        const lastBracket = text.lastIndexOf(']');
        if (lastBracket !== -1) {
            text = text.substring(0, lastBracket + 1);
        }

        console.log('📝 Gemini Response:', text); // Log response for debugging

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON Parse Failed. Raw text:', text);
            // Try to repair common JSON errors if needed, or just throw
            throw new Error(`Invalid JSON from Gemini: ${parseError.message}`);
        }

        // Filter out unsuitable ones and map back to full venue objects
        const suitableVenues = analysis
            .filter(item => item.isSuitable)
            .map(item => {
                const venue = venues.find(v => v.id === item.venueId);
                if (!venue) return null;
                return {
                    ...venue,
                    suitability: {
                        score: item.suitabilityScore,
                        reason: item.reason
                    }
                };
            })
            .filter(v => v !== null); // Remove any not found

        console.log(`✅ Gemini found ${suitableVenues.length} suitable venues`);
        return suitableVenues;

    } catch (error) {
        console.error('Gemini suitability analysis failed:', error);
        // Fallback: Return all venues if AI fails, but sorted by capacity difference
        return venues.sort((a, b) =>
            Math.abs(a.capacity - eventDetails.seatsRequired) - Math.abs(b.capacity - eventDetails.seatsRequired)
        );
    }
}

module.exports = {
    extractEventData,
    suggestAlternatives,
    filterVenuesBySuitability,
};
