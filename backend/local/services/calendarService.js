const { google } = require('googleapis');
const path = require('path');

// Initialize Google Calendar API
const calendar = google.calendar('v3');

// Load service account credentials
const SERVICE_ACCOUNT_FILE = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

/**
 * Create a Google Calendar event
 * @param {object} eventDetails - Event information
 * @returns {object} - Calendar event with ID and link
 */
async function createCalendarEvent(eventDetails) {
    try {
        const {
            eventName,
            description,
            date,
            startTime,
            durationHours,
            venueName,
        } = eventDetails;

        // Parse date and time
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = startTime.split(':').map(Number);

        // Create start datetime
        const startDateTime = new Date(year, month - 1, day, hour, minute);

        // Create end datetime
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + Math.floor(durationHours));
        endDateTime.setMinutes(endDateTime.getMinutes() + ((durationHours % 1) * 60));

        // Create calendar event
        const event = {
            summary: eventName,
            location: venueName,
            description: description || 'Event created via NexSync EventSync',
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Asia/Kolkata',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 }, // 1 hour before
                ],
            },
        };

        // Insert event into calendar
        const authClient = await auth.getClient();
        const response = await calendar.events.insert({
            auth: authClient,
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            requestBody: event,
        });

        return {
            calendarEventId: response.data.id,
            htmlLink: response.data.htmlLink,
            status: response.data.status,
        };
    } catch (error) {
        console.error('Google Calendar API error:', error);
        throw new Error(`Failed to create calendar event: ${error.message}`);
    }
}

/**
 * Delete a Google Calendar event
 * @param {string} calendarEventId - Google Calendar event ID
 */
async function deleteCalendarEvent(calendarEventId) {
    try {
        const authClient = await auth.getClient();

        await calendar.events.delete({
            auth: authClient,
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId: calendarEventId,
        });

        return { success: true };
    } catch (error) {
        console.error('Google Calendar delete error:', error);
        throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
}

module.exports = {
    createCalendarEvent,
    deleteCalendarEvent,
};
