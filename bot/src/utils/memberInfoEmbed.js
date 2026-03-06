const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ChannelType,
} = require('discord.js');
const config = require('../.config.js');

const STATUS_COLORS = {
    Good: 0x57f287,
    Warning: 0xfee75c,
    Muted: 0xed4245,
    Locked: 0x992d22,
};

const PREFIX_BTN = 'member_info_btn_';
const PREFIX_BTN_NEWROLE = 'member_info_btn_newrole_';
const PREFIX_BTN_NEWROLE_MODAL = 'member_info_btn_newrole_modal_';
const PREFIX_BTN_STATUS = 'member_info_btn_status_';
const PREFIX_BTN_TIME = 'member_info_btn_time_';
const PREFIX_SELECT_ROLES = 'member_info_select_roles_';
const PREFIX_SELECT_MOVE = 'member_info_select_move_';
const PREFIX_MODAL = 'member_info_modal_';

function getStatusColor(status) {
    return STATUS_COLORS[status] ?? STATUS_COLORS.Good;
}

function formatStatusExpires(expiresAt) {
    if (expiresAt == null) return 'Vĩnh viễn';
    const ts = Math.floor(new Date(expiresAt).getTime() / 1000);
    return `<t:${ts}:R>`;
}

/** Status hiển thị kèm thời gian còn lại (ví dụ: "Muted: 2h" hoặc "Good"). */
function formatStatusWithTimer(status, expiresAt) {
    const name = status ?? 'Good';
    if (expiresAt != null) return `${name}: ${formatStatusExpires(expiresAt)}`;
    return name;
}

/**
 * Build embed member info — 2 cột, status kèm ": {timeremain}" trong cùng trường.
 */
function buildEmbed(member, profile) {
    const user = member.user;
    const joinedAt = member.joinedAt ? member.joinedAt.toLocaleDateString('vi-VN') : 'N/A';
    const createdAt = user.createdAt.toLocaleDateString('vi-VN');
    const highestRole = member.roles.cache
        .filter((r) => r.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .first();
    const roles = highestRole ? `<@&${highestRole.id}>` : 'None';

    const status = profile?.status ?? 'Good';
    const statusWithTimer = formatStatusWithTimer(status, profile?.status_expires_at ?? null);
    const level = profile?.level ?? 0;
    const mainImageURL = config.resource?.mainImageURL || null;

    const embed = new EmbedBuilder()
        .setColor(getStatusColor(status))
        .setTitle(`✦ ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'UID', value: user.id, inline: true },
            { name: 'Name', value: member.displayName, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Join Discord', value: createdAt, inline: true },
            { name: 'Join Server', value: joinedAt, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Level', value: String(level), inline: true },
            { name: 'Status', value: statusWithTimer, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Role', value: roles, inline: false }
        )
        .setTimestamp();

    if (mainImageURL) embed.setImage(mainImageURL);
    return embed;
}

/**
 * Nhãn nút "Good" tùy trạng thái hiện tại: Unwarn / Unmute / Unlock / Good.
 */
function getGoodButtonLabel(currentStatus) {
    const s = currentStatus ?? 'Good';
    if (s === 'Warning') return 'Unwarn';
    if (s === 'Muted') return 'Unmute';
    if (s === 'Locked') return 'Unlock';
    return 'Good';
}

const BTN_LEN = 6;

function padLabel(text, maxLen = BTN_LEN) {
    return text.padEnd(maxLen).slice(0, maxLen);
}

/**
 * Nhãn nút Time (3 loại phạt: Warn, Mute, Lock trong panel).
 * @param {{ time_warn?: number, time_mute?: number, time_lock?: number } | null} times
 */
function getTimeButtonLabel(times) {
    return 'Time';
}

/**
 * Row 1: Name, Level, Role, Move, Kick (cùng độ rộng). Không dùng icon.
 * Row 2: Good/Unwarn/Unmute/Unlock, Warning, Muted, Locked, Time.
 * @param {string} targetUserId
 * @param {string} [currentStatus]
 * @param {{ time_warn?: number, time_mute?: number, time_lock?: number }} [times] - Thời gian mặc định Warn/Mute/Lock (phút)
 */
function buildComponents(targetUserId, currentStatus, times) {
    const goodLabel = getGoodButtonLabel(currentStatus);
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}nick_${targetUserId}`)
            .setLabel(padLabel('Name'))
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}level_${targetUserId}`)
            .setLabel(padLabel('Level'))
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_NEWROLE}${targetUserId}`)
            .setLabel(padLabel('Role'))
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}move_${targetUserId}`)
            .setLabel(padLabel('Move'))
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN}kick_${targetUserId}`)
            .setLabel(padLabel('Kick'))
            .setStyle(ButtonStyle.Danger)
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_STATUS}Good_${targetUserId}`)
            .setLabel(padLabel(goodLabel))
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_STATUS}Warning_${targetUserId}`)
            .setLabel(padLabel('Warn'))
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_STATUS}Muted_${targetUserId}`)
            .setLabel(padLabel('Mute'))
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_STATUS}Locked_${targetUserId}`)
            .setLabel(padLabel('Lock'))
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_TIME}${targetUserId}`)
            .setLabel(padLabel(getTimeButtonLabel(times ?? null), 8))
            .setStyle(ButtonStyle.Secondary)
    );
    return { row1, row2 };
}

/**
 * Panel vai trò (ephemeral): checklist = select đa chọn (check = gán), nút "Tạo vai trò và gán" mở modal.
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').GuildMember} member - Thành viên đang chỉnh
 * @param {string} targetUserId
 * @param {string} embedMessageId - ID tin nhắn embed để refresh sau khi đổi role
 */
function buildRolePanel(guild, member, targetUserId, embedMessageId) {
    const allRoles = guild.roles.cache
        .filter((r) => r.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .first(25);
    const options = allRoles.map((role) => ({
        label: role.name,
        value: role.id,
        description: member.roles.cache.has(role.id) ? 'Đang gán' : 'Chưa gán',
        default: member.roles.cache.has(role.id),
    }));

    const rowSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`${PREFIX_SELECT_ROLES}${targetUserId}_${embedMessageId}`)
            .setPlaceholder('Chọn vai trò được gán (đã chọn = gán, bỏ chọn = không gán)')
            .setMinValues(0)
            .setMaxValues(Math.max(1, options.length))
            .addOptions(options.length ? options : [{ label: 'Không có role', value: 'none', default: true }])
    );
    const rowButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${PREFIX_BTN_NEWROLE_MODAL}${targetUserId}_${embedMessageId}`)
            .setLabel('Tạo vai trò và gán')
            .setStyle(ButtonStyle.Primary)
    );
    return { rowSelect, rowButton };
}

/** Row chọn kênh voice (Move) — danh sách kênh voice trong server (max 25). */
function buildMoveChannelSelectRow(guild, targetUserId) {
    const voiceChannels = guild.channels.cache
        .filter((c) => c.type === ChannelType.GuildVoice)
        .sort((a, b) => a.position - b.position)
        .first(25);
    const options = voiceChannels.map((ch) => ({
        label: ch.name,
        value: ch.id,
    }));
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`${PREFIX_SELECT_MOVE}${targetUserId}`)
            .setPlaceholder('Chọn kênh voice để chuyển thành viên')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(options.length ? options : [{ label: 'Không có kênh voice', value: 'none' }])
    );
}

module.exports = {
    buildEmbed,
    buildComponents,
    buildRolePanel,
    buildMoveChannelSelectRow,
    getStatusColor,
    formatStatusExpires,
    getGoodButtonLabel,
    getTimeButtonLabel,
    PREFIX_BTN,
    PREFIX_BTN_NEWROLE,
    PREFIX_BTN_NEWROLE_MODAL,
    PREFIX_BTN_STATUS,
    PREFIX_BTN_TIME,
    PREFIX_SELECT_ROLES,
    PREFIX_SELECT_MOVE,
    PREFIX_MODAL,
};
