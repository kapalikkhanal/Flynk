const moment = require('moment');

function generateRandomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function parseDuration(durationString) {
    const durationParts = durationString.match(/(\d+)([h|m])/g);
    let totalMinutes = 0;

    if (durationParts) {
        durationParts.forEach(part => {
            const value = parseInt(part, 10);
            if (part.includes('h')) {
                totalMinutes += value * 60; // Convert hours to minutes
            } else if (part.includes('m')) {
                totalMinutes += value;
            }
        });
    }

    return moment().subtract(totalMinutes, 'minutes');
}

function formatElapsedTime(dateString) {
    let date;
    if (/^\d+h \d+m/.test(dateString)) {
        // Parse duration format like '1h 20m'
        date = parseDuration(dateString);
    } else if (/^\d+m/.test(dateString)) {
        // Parse duration format like '2m'
        date = parseDuration(dateString);
    } else {
        // Parse ISO date string
        date = moment(dateString);
    }

    const now = moment(); // Current time

    // Calculate the difference in minutes
    const diffInMinutes = now.diff(date, 'minutes');
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInMinutes / (24 * 60));

    if (diffInMinutes < 60) {
        return `${diffInMinutes} मिनेट अघी`;
    } else if (diffInHours < 24) {
        return `${diffInHours} घण्टा अघी`;
    } else {
        return `${diffInDays} दिन अघी`;
    }
}

module.exports = {
    generateRandomId,
    formatElapsedTime
};