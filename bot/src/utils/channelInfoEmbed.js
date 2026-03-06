const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { formatShortDate } = require('./date.js');

const PREFIX_BTN = 'channel_info_btn_';

const CHANNEL_TYPE_NAMES = {
    [ChannelType.GuildText]: 'Text',
    [ChannelType.GuildVoice]: 'Voice',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement',
    [ChannelType.GuildStageVoice]: 'Stage',
    [ChannelType.GuildForum]: 'Forum',
};

function getChannelTypeName(channel) {
    return CHANNEL_TYPE_NAMES[channel.type] ?? String(channel.type);
}

function isChannelPublic(channel, guild) {
    const overwrite = channel.permissionOverwrites?.cache?.get(guild.id);
    if (!overwrite) return true;
    return !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
}

function getChannelStatus(channel, guild) {
    return isChannelPublic(channel, guild) ? 'Public' : 'Private';
}

/**
 * Embed thông tin kênh. Layout: ID|Name, Created At|Category, Type|Status (bỏ Limit).
 * @param { import('discord.js').GuildChannel } channel
 * @param { import('discord.js').Guild } guild
 */
function buildChannelEmbed(channel, guild) {
    const created = channel.createdAt ? formatShortDate(channel.createdAt) : 'N/A';
    const categoryName = channel.parent?.name ?? '—';
    const typeName = getChannelTypeName(channel);
    const status = getChannelStatus(channel, guild);

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`✦ ${channel.name}`)
        .addFields(
            { name: 'ID', value: channel.id, inline: true },
            { name: 'Name', value: channel.name, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Created At', value: created, inline: true },
            { name: 'Category', value: categoryName, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Type', value: typeName, inline: true },
            { name: 'Status', value: status, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
        )
        .setTimestamp();

    return embed;
}

/**
 * Nút: Public/Private (đổi trạng thái), Clone.
 */
function buildChannelComponents(channelId, guild, channel) {
    const status = getChannelStatus(channel, guild);
    const toggleLabel = status === 'Public' ? 'Private' : 'Public';
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}toggle_${channelId}`)
            .setLabel(toggleLabel)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}clone_${channelId}`)
            .setLabel('Clone')
            .setStyle(ButtonStyle.Primary)
    );
    return { row };
}

module.exports = {
    buildChannelEmbed,
    buildChannelComponents,
    getChannelStatus,
    isChannelPublic,
    PREFIX_BTN,
};
