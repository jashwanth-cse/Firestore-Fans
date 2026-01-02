const { google } = require('googleapis');
const path = require('path');

// Initialize Google Calendar API


/**
 * Generate a Google Calendar Web Intent URL
 * This allows users to add events to their own calendar without complex OAuth/Service Account permissions.
 * @param {object} eventDetails
 * @returns {string} - The Google Calendar URL
 */
function generateGoogleCalendarUrl(eventDetails) {
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

    // Format dates for Google Calendar URL (YYYYMMDDTHHmmss)
    // Note: We use local time and rely on user's browser for timezone, or explicit 'Z' if UTC.
    // For simplicity/robustness across timezones, we'll format as simple ISO-like string without separators
    const formatTime = (date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const startStr = formatTime(startDateTime);
    const endStr = formatTime(endDateTime);

    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventName,
        details: description || 'Event from NexSync',
        location: venueName,
        dates: `${startStr}/${endStr}`,
    });

    return `${baseUrl}?${params.toString()}`;
}

module.exports = {
    generateGoogleCalendarUrl,
};
