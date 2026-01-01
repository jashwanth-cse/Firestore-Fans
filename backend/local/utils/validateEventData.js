/**
 * Validate extracted event data
 * @param {object} data - Extracted event data
 * @returns {object} - { valid: boolean, errors: array }
 */
function validateEventData(data) {
    const errors = [];

    // Check required fields
    if (!data.eventName || data.eventName.trim() === '') {
        errors.push('Event name is required');
    }

    if (!data.date) {
        errors.push('Date is required');
    } else {
        // Validate date format and future date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.date)) {
            errors.push('Date must be in YYYY-MM-DD format');
        } else {
            const eventDate = new Date(data.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (isNaN(eventDate.getTime())) {
                errors.push('Invalid date');
            } else if (eventDate < today) {
                errors.push('Date must be in the future');
            }
        }
    }

    if (!data.startTime) {
        errors.push('Start time is required');
    } else {
        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(data.startTime)) {
            errors.push('Start time must be in HH:MM format (24-hour)');
        }
    }

    if (typeof data.durationHours !== 'number' || data.durationHours < 0.5 || data.durationHours > 8) {
        errors.push('Duration must be between 0.5 and 8 hours');
    }

    if (typeof data.seatsRequired !== 'number' || data.seatsRequired < 1 || data.seatsRequired > 1000) {
        errors.push('Seats required must be between 1 and 1000');
    }

    if (!Array.isArray(data.facilitiesRequired)) {
        errors.push('Facilities must be an array');
    } else if (data.facilitiesRequired.length === 0) {
        errors.push('At least one facility is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Sanitize user input
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .trim()
        .substring(0, 1000); // Limit length
}

module.exports = {
    validateEventData,
    sanitizeInput,
};
