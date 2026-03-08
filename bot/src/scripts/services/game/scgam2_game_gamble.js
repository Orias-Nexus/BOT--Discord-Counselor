// src/scripts/services/game/scgam2_game_gamble.js

const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction, client) => {

    const roll = Math.floor(Math.random() * 100) + 1;
    
    let result;
    let color;

    if (roll >= 90) {
        result = "[ !!! JACKPOT !!! ]";
        color = '#e67e22';
    } else if (roll > 50) {
        result = "[ WIN ]";
        color = '#2ecc71';
    } else if (roll === 50) {
        result = "[ EDGE ]";
        color = '#f1c40f';
    } else {
        result = "[ LOSE ]";
        color = '#e74c3c';
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🎲 ROLL RESULT')
        .addFields(
            { name: 'Your Number', value: `\`${roll}\` / 100` },
            { name: 'Outcome', value: `\`\`\`${result}\`\`\`` }
        )
        .setFooter({ text: '-----------------------------------------' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
};