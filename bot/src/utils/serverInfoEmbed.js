const { EmbedBuilder, ChannelType } = require('discord.js');
const { formatShortDate } = require('./date.js');
const config = require('../.config.js');

/** Loại server: thứ tự ưu tiên (cao nhất trước). Chỉ hiển thị một type. */
const GUILD_TYPE_ORDER = [
    'PARTNERED',   // Partner
    'VERIFIED',    // Verified
    'COMMUNITY',   // Community
    'DISCOVERABLE',
    'COMMERCE',
    'NEWS',
    'PREVIEW_ENABLED',
    'WELCOME_SCREEN_ENABLED',
    'MEMBER_VERIFICATION_GATE_ENABLED', // Screening
];
const GUILD_TYPE_LABELS = {
    PARTNERED: 'Partner',
    VERIFIED: 'Verified',
    COMMUNITY: 'Community',
    DISCOVERABLE: 'Discoverable',
    COMMERCE: 'Commerce',
    NEWS: 'News',
    PREVIEW_ENABLED: 'Preview',
    WELCOME_SCREEN_ENABLED: 'Welcome screen',
    MEMBER_VERIFICATION_GATE_ENABLED: 'Screening',
};

/**
 * Loại server: chỉ lấy một type theo thứ tự ưu tiên (lớn nhất = ưu tiên nhất).
 * @param { import('discord.js').Guild } guild
 * @returns {string}
 */
function getGuildTypeString(guild) {
    const raw = guild.features;
    const set = new Set(Array.isArray(raw) ? raw : (raw ? [...raw] : []));
    for (const key of GUILD_TYPE_ORDER) {
        if (set.has(key)) return GUILD_TYPE_LABELS[key];
    }
    return 'Standard';
}

/**
 * Đếm kênh: Chat (text + announcement + forum), Voice (voice + stage), Other (còn lại trừ category).
 */
function getChannelCounts(guild) {
    const channels = guild.channels.cache;
    const chat = channels.filter(
        (c) =>
            c.type === ChannelType.GuildText ||
            c.type === ChannelType.GuildAnnouncement ||
            c.type === ChannelType.GuildForum
    ).size;
    const voice = channels.filter(
        (c) =>
            c.type === ChannelType.GuildVoice ||
            c.type === ChannelType.GuildStageVoice
    ).size;
    const categories = channels.filter((c) => c.type === ChannelType.GuildCategory).size;
    // const other = channels.size - categories - chat - voice;
    return { category: categories, chat, voice };
}

/**
 * Build embed thông tin server. Layout 2 cột, không vỡ (value ≤1024, đủ cặp inline).
 * @param { import('discord.js').Guild } guild
 * @param {string | null} inviteLink - link mời tham gia (DB hoặc getInviteLink)
 */
function buildEmbed(guild, inviteLink) {
    const created = guild.createdAt ? formatShortDate(guild.createdAt) : 'N/A';
    const bio = (guild.description || '').trim() || 'There is no biography for this server';
    const biography = bio.length > 1024 ? bio.slice(0, 1021) + '...' : bio;

    const counts = getChannelCounts(guild);
    const channelLine = `Chat: **${counts.chat}** | Voice: **${counts.voice}**`;
    const rolesCount = guild.roles.cache.size;
    const memberCount = guild.memberCount ?? 0;
    const boostCount = guild.premiumSubscriptionCount ?? 0;
    const stickerCount = guild.stickers?.cache?.size ?? 0;
    const emojiCount = guild.emojis?.cache?.size ?? 0;
    const soundCount = 0;

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`✦ ${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 256 }))
        .addFields(
            { name: 'ID', value: guild.id, inline: true },
            { name: 'Name', value: guild.name, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Created At', value: created, inline: true },
            { name: 'Type', value: getGuildTypeString(guild), inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Biography', value: biography, inline: false },
            { name: '\u200B', value: '\u200B', inline: false },
            { name: 'Channel', value: channelLine, inline: true },
            { name: 'Category', value: String(counts.category), inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Member', value: String(memberCount), inline: true },
            { name: 'Role', value: String(rolesCount), inline: true },
            { name: 'Boost', value: String(boostCount), inline: true },
            { name: 'Sticker', value: String(stickerCount), inline: true },
            { name: 'Emoji', value: String(emojiCount), inline: true },
            { name: 'Sound', value: String(soundCount), inline: true }
        )
        .setTimestamp();

    if (inviteLink) {
        embed.addFields({ name: 'Link tham gia server', value: `[Tham gia server](${inviteLink})`, inline: false });
        embed.setFooter({ text: 'Link tham gia server', iconURL: guild.iconURL({ size: 32 }) });
    }
    const mainImageURL = config.resource?.mainImageURL;
    if (mainImageURL) embed.setImage(mainImageURL);

    return embed;
}

/**
 * Không còn nút chỉnh sửa (đã bỏ Name, Bio).
 */
function buildComponents() {
    return { row: null };
}

module.exports = {
    buildEmbed,
    buildComponents,
};
