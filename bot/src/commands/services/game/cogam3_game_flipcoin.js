// src/commands/services/game/cogam3_game_flipcoin.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game_flipcoin')
        .setDescription('Cược xem đồng xu sẽ ra Sấp hay Ngửa')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Bạn chọn mặt nào?')
                .setRequired(true)
                .addChoices(
                    { name: '🪙 Heads (Ngửa)', value: 'heads' },
                    { name: '💰 Tails (Sấp)', value: 'tails' }
                )),

    async execute(interaction, client) {
        const scriptName = 'scgam3_game_flipcoin';
        const script = client.scripts.get(scriptName);
        if (!script) return interaction.reply({ content: `❌ Lỗi script: ${scriptName}`, ephemeral: true });
        
        await script(interaction, client);
    },
};