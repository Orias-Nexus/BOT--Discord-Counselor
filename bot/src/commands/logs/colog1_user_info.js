// src/commands/logs/colog1_user_info.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user_info')
        .setDescription('Xem thông tin chi tiết của thành viên')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Người bạn muốn xem (để trống sẽ xem chính mình)')
                .setRequired(false)),

    async execute(interaction, client) {
        const scriptName = 'sclog1_user_info';
        const script = client.scripts.get(scriptName);

        if (!script) return interaction.reply({ content: `❌ Lỗi script: ${scriptName}`, ephemeral: true });
        
        await script(interaction, client);
    },
};