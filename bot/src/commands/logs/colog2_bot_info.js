// src/commands/logs/colog2_bot_info.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot_info')
        .setDescription('Xem thông tin chi tiết về hệ thống Bot'),

    async execute(interaction, client) {
        const script = client.scripts.get('sclog2_bot_info');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};