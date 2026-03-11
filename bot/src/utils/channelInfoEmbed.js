const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { formatShortDate } = require('./date.js');
const config = require('../.config.js');

const PREFIX_BTN = 'channel_info_btn_';

const CHANNEL_TYPE_NAMES = {
    [ChannelType.GuildText]: 'Text Channel',
    [ChannelType.GuildVoice]: 'Voice Channel',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement',
    [ChannelType.GuildStageVoice]: 'Stage Voice',
    [ChannelType.GuildForum]: 'Forum',
};

function getChannelTypeName(channel) {
    return CHANNEL_TYPE_NAMES[channel.type] ?? 'Unknown';
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
 * Embed thông tin kênh: cùng cấu trúc với channel view (tiêu đề, các trường), cuối là trường Status = Public/Private.
 * @param { import('discord.js').GuildChannel } channel
 * @param { import('discord.js').Guild } guild
 */
function buildChannelEmbed(channel, guild) {
    const created = channel.createdAt ? formatShortDate(channel.createdAt) : 'N/A';
    const categoryName = channel.parent ? channel.parent.name : 'None';
    const typeName = getChannelTypeName(channel);
    const nsfw = channel.nsfw ? 'Yes' : 'No';
    const slowmode = channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Off';
    const status = getChannelStatus(channel, guild);
    const mainImageURL = config.resource?.mainImageURL ?? null;

    const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle(`✦ Channel: ${channel.name}`)
        .addFields(
            { name: 'Channel ID', value: channel.id, inline: true },
            { name: 'Type', value: typeName, inline: true },
            { name: 'Category', value: categoryName, inline: true },
            { name: 'Creation', value: created, inline: true },
            { name: 'NSFW', value: nsfw, inline: true },
            { name: 'Slowmode', value: slowmode, inline: true },
            { name: 'Status', value: status, inline: true }
        )
        .setTimestamp();

    if (channel.topic) {
        embed.setDescription(`**Topic:** ${channel.topic}`);
    }
    if (mainImageURL) {
        embed.setImage(mainImageURL);
    }

    return embed;
}

/**
 * Nút: Public/Private, Clone, Sync (đồng bộ quyền với danh mục), SFW/NSFW (chuyển đổi).
 */
function buildChannelComponents(channelId, guild, channel) {
    const status = getChannelStatus(channel, guild);
    const toggleLabel = status === 'Public' ? 'Private' : 'Public';
    const hasParent = Boolean(channel.parent);
    const nsfwLabel = channel.nsfw ? 'NSFW' : 'SFW';
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}clone_${channelId}`)
            .setLabel('Clone')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}toggle_${channelId}`)
            .setLabel(toggleLabel)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}sync_${channelId}`)
            .setLabel('Sync')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!hasParent),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}nsfw_${channelId}`)
            .setLabel(nsfwLabel)
            .setStyle(ButtonStyle.Secondary)
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
