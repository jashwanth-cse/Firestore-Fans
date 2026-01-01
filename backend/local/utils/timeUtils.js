/**
 * Time and date utility functions
 */

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - "HH:MM"
 * @param {number} durationHours - Duration in hours
 * @returns {string} - End time "HH:MM"
 */
function calculateEndTime(startTime, durationHours) {
    const [startH, startM] = startTime.split(':').map(Number);

    const totalMinutes = startH * 60 + startM + (durationHours * 60);
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;

    return `${String(endH).padStart(2, '0')}:${String(Math.floor(endM)).padStart(2, '0')}`;
}

/**
 * Convert time string to minutes since midnight
 * @param {string} time - "HH:MM"
 * @returns {number} - Minutes since midnight
 */
function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Convert minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - "HH:MM"
 */
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(Math.floor(m)).padStart(2, '0')}`;
}

/**
 * Format date for display
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {string} - Formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} - Current date
 */
function getCurrentDate() {
    const date = new Date();
    return date.toISOString().split('T')[0];
}

/**
 * Add days to a date
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {number} days - Number of days to add
 * @returns {string} - New date "YYYY-MM-DD"
 */
function addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

module.exports = {
    calculateEndTime,
    timeToMinutes,
    minutesToTime,
    formatDate,
    getCurrentDate,
    addDays,
};
