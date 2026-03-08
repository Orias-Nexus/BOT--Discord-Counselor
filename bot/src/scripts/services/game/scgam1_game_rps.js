// src/scripts/services/game/scgam1_game_rps.js

const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction, client) => {
    const userChoice = interaction.options.getString('choice');
    
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    const displayMap = {
        'rock': 'búa',
        'paper': 'bao',
        'scissors': 'kéo'
    };

    let result;
    let color;

    if (userChoice === botChoice) {
        result = "[ DRAW ]";
        color = '#95a5a6';
    } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = "[ VICTORY ]";
        color = '#2ecc71';
    } else {
        result = "[ DEFEAT ]";
        color = '#e74c3c';
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('✌ RPS RESULT')
        .addFields(
            { name: 'User Choice', value: `> ${displayMap[userChoice]}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Bot Choice', value: `> ${displayMap[botChoice]}`, inline: true },
            { name: 'Outcome', value: `\`\`\`${result}\`\`\``, inline: false }
        )
        .setFooter({ text: '-----------------------------------------' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
};