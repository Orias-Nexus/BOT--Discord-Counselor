// src/commands/services/game/cogam1_game_rps.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game_rps')
        .setDescription('Chơi Oẳn Tù Tì với Bot')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Lựa chọn của bạn')
                .setRequired(true)
                .addChoices(
                    { name: 'Búa', value: 'rock' },
                    { name: 'Bao', value: 'paper' },
                    { name: 'Kéo', value: 'scissors' }
                )),

    async execute(interaction, client) {
        const script = client.scripts.get('scgam1_game_rps');
        if (!script) return interaction.reply({ content: '❌ Script not found', ephemeral: true });
        await script(interaction, client);
    },
};