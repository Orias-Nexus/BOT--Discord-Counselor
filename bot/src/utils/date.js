// src/utils/date.js

/**
 * Format date ngắn gọn dạng: dd/mm/yyyy hh:mm AM/PM
 */
function formatShortDate(date) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date).replace(',', '');
}

module.exports = { formatShortDate };
