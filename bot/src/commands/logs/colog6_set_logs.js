// src/commands/logs/colog6_set_logs.js

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_logs')
        .setDescription('Thiết lập kênh ghi nhận Logs (Nhật ký hoạt động)')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Chọn kênh để gửi logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Chỉ Admin

    async execute(interaction, client) {
        const script = client.scripts.get('sclog6_set_logs');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};