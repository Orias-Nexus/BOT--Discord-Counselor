// src/commands/logs/colog3_role_info.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role_info')
        .setDescription('Xem thông tin chi tiết về một vai trò (Role)')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Chọn vai trò cần xem')
                .setRequired(true)),

    async execute(interaction, client) {
        const script = client.scripts.get('sclog3_role_info');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};