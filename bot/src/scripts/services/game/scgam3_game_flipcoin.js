// src/scripts/services/game/scgam3_game_flipcoin.js

const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction, client) => {
    const userChoice = interaction.options.getString('choice');

    const isHeads = Math.random() < 0.5;
    const resultKey = isHeads ? 'heads' : 'tails';

    const displayMap = {
        'heads': 'HEADS (Ngửa)',
        'tails': 'TAILS (Sấp)'
    };
    
    let status;
    let color;

    if (userChoice === resultKey) {
        status = "🏆 CORRECT! YOU WON";
        color = '#2ecc71';
    } else {
        status = "💸 WRONG! YOU LOST";
        color = '#e74c3c';
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🪙 COIN FLIP RESULT')
        .addFields(
            { name: 'You Chose', value: `**${displayMap[userChoice]}**`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Coin Result', value: `**${displayMap[resultKey]}**`, inline: true },
            { name: 'Outcome', value: `\`\`\`${status}\`\`\``, inline: false }
        )
        .setFooter({ text: '-----------------------------------------' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
};