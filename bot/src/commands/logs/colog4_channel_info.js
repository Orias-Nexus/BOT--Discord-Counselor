// src/commands/logs/colog4_channel_info.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel_view')
        .setDescription('Xem thông tin về kênh hiện tại hoặc kênh được chọn')
        .addChannelOption(option => 
            option.setName('target')
                .setDescription('Chọn kênh (để trống sẽ lấy kênh hiện tại)')
                .setRequired(false)),

    async execute(interaction, client) {
        const script = client.scripts.get('sclog4_channel_info');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};