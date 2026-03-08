// src/scripts/logs/sclog4_channel_info.js

const { EmbedBuilder, ChannelType } = require('discord.js');
const { formatShortDate } = require('../../utils/date');
const config = require('../../.config');
const mainImageURL = config.resource.mainImageURL;

module.exports = async (interaction, client) => {
    const channel = interaction.options.getChannel('target') || interaction.channel;

    const created = new Date(channel.createdTimestamp);
    const formattedDate = formatShortDate(created);

    let typeName = 'Unknown';
    if (channel.type === ChannelType.GuildText) typeName = 'Text Channel';
    if (channel.type === ChannelType.GuildVoice) typeName = 'Voice Channel';
    if (channel.type === ChannelType.GuildCategory) typeName = 'Category';
    if (channel.type === ChannelType.GuildAnnouncement) typeName = 'Announcement';

    const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle(`✦ Channel: ${channel.name}`)
        .addFields(
            { name: 'Channel ID', value: channel.id, inline: true },
            { name: 'Type', value: typeName, inline: true },
            { name: 'Category', value: channel.parent ? channel.parent.name : 'None', inline: true },
            { name: 'Creation', value: formattedDate, inline: true },
            { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
            { name: 'Slowmode', value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Off', inline: true }
        ).setImage(mainImageURL).setTimestamp();
        
    if (channel.topic) {
        embed.setDescription(`**Topic:** ${channel.topic}`);
    }

    await interaction.reply({ embeds: [embed] });
};