// src/commands/utilities/couti1_help.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiển thị danh sách các lệnh hỗ trợ'),

    async execute(interaction, client) {
        // Gọi script scuti1_help
        const scriptName = 'scuti1_help';
        const script = client.scripts.get(scriptName);

        if (!script) {
            return interaction.reply({ content: `❌ Lỗi: Không tìm thấy script xử lý \`${scriptName}\``, ephemeral: true });
        }

        await script(interaction, client);
    },
};