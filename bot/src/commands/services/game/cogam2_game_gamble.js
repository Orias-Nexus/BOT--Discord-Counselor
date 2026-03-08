// src/commands/services/game/cogam2_game_gamble.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game_gamble')
        .setDescription('Thử vận may với trò xúc xắc (Roll 1-100)'),

    async execute(interaction, client) {
        const script = client.scripts.get('scgam2_game_gamble');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};