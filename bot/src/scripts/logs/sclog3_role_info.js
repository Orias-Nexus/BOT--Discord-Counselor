// src/scripts/logs/sclog3_role_info.js

const { EmbedBuilder } = require('discord.js');
const config = require('../../.config');
const mainImageURL = config.resource.mainImageURL;

module.exports = async (interaction, client) => {
    const role = interaction.options.getRole('role');

    // Lấy danh sách permission quan trọng
    const permissions = role.permissions.toArray();
    const importantPerms = permissions.length > 0 
        ? permissions.map(p => `\`${p}\``).slice(0, 10).join(', ') + (permissions.length > 10 ? ` và ${permissions.length - 10} quyền khác...` : '')
        : 'Không có quyền đặc biệt';

    const embed = new EmbedBuilder()
        .setColor(role.color || '#95a5a6')
        .setTitle(`✦ Role: ${role.name}`)
        .addFields(
            { name: 'Role ID', value: role.id, inline: false },
            { name: 'Color', value: role.hexColor, inline: true },
            { name: 'Members', value: `${role.members.size} members`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
            { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Key Permissions', value: importantPerms, inline: false },
        ).setImage(mainImageURL).setTimestamp();

    await interaction.reply({ embeds: [embed] });
};