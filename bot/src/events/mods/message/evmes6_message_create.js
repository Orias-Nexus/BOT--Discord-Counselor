// src/events/mods/message/evmes6_message_create.js
// Xử lý tin nhắn tiếp theo khi user đang chờ nhập time (member_info -> Time).

const memberInfoComponents = require('../../../utils/memberInfoComponents.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        const handled = await memberInfoComponents.handleTimeReply(message, client);
        if (handled) return;
    },
};
