import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Service for EventSync event extraction
 */

interface ExtractedEventData {
    eventName?: string;
    date?: string;
    startTime?: string;
    durationHours?: number;
    seatsRequired?: number;
    facilitiesRequired?: string[];
}

interface ExtractionResult {
    success: boolean;
    data?: ExtractedEventData;
    missingFields?: string[];
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Extract event details from natural language using Gemini AI
 */
export async function extractEventFromText(userText: string): Promise<ExtractionResult> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an intelligent event extraction system for a college campus venue booking platform.

Extract the following information from the user's request:
- eventName: Name or type of the event
- date: Date in YYYY-MM-DD format (if relative like "tomorrow", calculate based on today being ${new Date().toISOString().split('T')[0]})
- startTime: Start time in HH:MM 24-hour format
- durationHours: Duration in hours (as a number)
- seatsRequired: Number of seats/capacity needed (as a number)
- facilitiesRequired: Array of required facilities (e.g., ["projector", "ac", "computers", "whiteboard"])

User request: "${userText}"

Respond ONLY with valid JSON in this exact format:
{
  "eventName": "string or null",
  "date": "YYYY-MM-DD or null",
  "startTime": "HH:MM or null",
  "durationHours": number or null,
  "seatsRequired": number or null,
  "facilitiesRequired": ["array"] or []
}

Rules:
- Use null for missing information
- For facilities, common ones are: projector, ac, computers, whiteboard, microphone, speakers
- If duration not specified, estimate based on event type (workshop=2-3h, meeting=1h, seminar=2h)
- If seats not specified, estimate based on event type (workshop=30-50, lecture=60-100)
- Return ONLY the JSON, no explanations`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from Gemini response');
        }

        const extractedData: ExtractedEventData = JSON.parse(jsonMatch[0]);

        // Check which fields are missing
        const missingFields: string[] = [];
        if (!extractedData.eventName) missingFields.push('eventName');
        if (!extractedData.date) missingFields.push('date');
        if (!extractedData.startTime) missingFields.push('startTime');
        if (!extractedData.durationHours) missingFields.push('durationHours');
        if (!extractedData.seatsRequired) missingFields.push('seatsRequired');

        // If ANY critical field is missing, return incomplete
        if (missingFields.length > 0) {
            return {
                success: false,
                data: extractedData,
                missingFields,
            };
        }

        // All fields present
        return {
            success: true,
            data: extractedData,
        };
    } catch (error: any) {
        console.error('Gemini extraction error:', error);
        throw new Error(`Failed to extract event details: ${error.message}`);
    }
}

/**
 * Legacy Gemini Service class (kept for backward compatibility)
 */
export class GeminiService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
    }

    /**
     * Generate text using Gemini AI
     */
    async generateText(prompt: string): Promise<string> {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Analyze image using Gemini Vision
     */
    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        // TODO: Implement Gemini Vision API
        console.log('Gemini Vision API not yet implemented');
        return '';
    }

    /**
     * Generate travel recommendations using Gemini AI
     */
    async generateTravelRecommendations(
        holidays: any[],
        userEvents: any[],
        travelTime: number
    ): Promise<any[]> {
        // TODO: Implement AI-powered travel planning
        console.log('Gemini travel recommendations not yet implemented');
        return [];
    }
}

export default new GeminiService();
