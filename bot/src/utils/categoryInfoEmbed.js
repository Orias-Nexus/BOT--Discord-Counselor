const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

const PREFIX_BTN = 'category_info_btn_';

function isCategoryPublic(channel, guild) {
    const overwrite = channel.permissionOverwrites?.cache?.get(guild.id);
    if (!overwrite) return true;
    return !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
}

function getCategoryStatus(channel, guild) {
    return isCategoryPublic(channel, guild) ? 'Public' : 'Private';
}

/**
 * Đếm kênh con trong category: Chat, Voice, Other.
 */
function getCategoryChannelCounts(guild, categoryId) {
    const children = guild.channels.cache.filter((c) => c.parentId === categoryId);
    const chat = children.filter(
        (c) =>
            c.type === ChannelType.GuildText ||
            c.type === ChannelType.GuildAnnouncement ||
            c.type === ChannelType.GuildForum
    ).size;
    const voice = children.filter(
        (c) =>
            c.type === ChannelType.GuildVoice ||
            c.type === ChannelType.GuildStageVoice
    ).size;
    const other = children.size - chat - voice;
    return { chat, voice, other };
}

/**
 * Embed thông tin category. Layout: ID|Name, Channel (C-V-O)|Status.
 * @param { import('discord.js').GuildChannel } category - channel type GuildCategory
 * @param { import('discord.js').Guild } guild
 */
function buildCategoryEmbed(category, guild) {
    const counts = getCategoryChannelCounts(guild, category.id);
    const channelLine = `Chat: **${counts.chat}** · Voice: **${counts.voice}** · Other: **${counts.other}**`;
    const status = getCategoryStatus(category, guild);

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`✦ ${category.name}`)
        .addFields(
            { name: 'ID', value: category.id, inline: true },
            { name: 'Name', value: category.name, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Channel (C-V-O)', value: channelLine, inline: true },
            { name: 'Status', value: status, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
        )
        .setTimestamp();

    return embed;
}

/**
 * Nút: Public/Private, Clone.
 */
function buildCategoryComponents(categoryId, guild, category) {
    const status = getCategoryStatus(category, guild);
    const toggleLabel = status === 'Public' ? 'Private' : 'Public';
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}toggle_${categoryId}`)
            .setLabel(toggleLabel)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}clone_${categoryId}`)
            .setLabel('Clone')
            .setStyle(ButtonStyle.Primary)
    );
    return { row };
}

module.exports = {
    buildCategoryEmbed,
    buildCategoryComponents,
    getCategoryStatus,
    isCategoryPublic,
    PREFIX_BTN,
};
