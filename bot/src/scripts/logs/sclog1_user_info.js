// src/scripts/logs/sclog1_user_info.js

const { EmbedBuilder } = require('discord.js');
const config = require('../../.config');
const mainImageURL = config.resource.mainImageURL;

module.exports = async (interaction, client) => {
    // Lấy user được tag, nếu không có thì lấy chính người gõ lệnh
    const targetUser = interaction.options.getUser('target') || interaction.user;
    
    // Lấy thông tin thành viên trong Guild
    const member = await interaction.guild.members.fetch(targetUser.id);

    // Format ngày giờ
    const joinedAt = member.joinedAt.toLocaleDateString("vi-VN");
    const createdAt = targetUser.createdAt.toLocaleDateString("vi-VN");

    // Lấy danh sách roles
    const roles = member.roles.cache
        .filter(r => r.name !== '@everyone')
        .map(r => `<@&${r.id}>`)
        .join(', ') || "None";

    const embed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setTitle(`✦ ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'UID', value: targetUser.id, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Name', value: member.displayName, inline: true },
            { name: 'Roles', value: roles, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Join Discord', value: createdAt, inline: true },
            { name: 'Join Server', value: joinedAt, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
        ).setImage(mainImageURL).setTimestamp();

    await interaction.reply({ embeds: [embed] });
};