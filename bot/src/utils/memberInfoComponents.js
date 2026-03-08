const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} = require('discord.js');
const ENV = require('../../env.js');
const { getProfile, updateLevel, updateStatus } = require('./memberProfilesDb.js');
const { getTimeForStatus, getTimes, setTimes } = require('./serverProfileDb.js');
const {
    buildEmbed,
    buildComponents,
    buildRolePanel,
    buildMoveChannelSelectRow,
    PREFIX_BTN,
    PREFIX_BTN_NEWROLE,
    PREFIX_BTN_NEWROLE_MODAL,
    PREFIX_BTN_STATUS,
    PREFIX_BTN_TIME,
    PREFIX_SELECT_ROLES,
    PREFIX_SELECT_MOVE,
    PREFIX_MODAL,
} = require('./memberInfoEmbed.js');

const LOCKED_CHAT_ROLE_ID = (ENV.LOCKED_CHAT_ROLE_ID || '').trim() || null;

function hasManagePermission(member) {
    return (
        member.permissions.has(PermissionFlagsBits.ManageGuild) ||
        member.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
}

function parseTargetUserId(customId, prefix) {
    if (!customId.startsWith(prefix)) return null;
    return customId.slice(prefix.length);
}

/**
 * Parse chuỗi X:Y:Z (ngày:giờ:phút) thành tổng số phút. Sai format trả về null.
 * @param {string} str
 * @returns {{ minutes: number } | { error: string }}
 */
function parseTimeXYZ(str) {
    const s = (str ?? '').trim();
    const parts = s.split(':');
    if (parts.length !== 3) return { error: 'Định dạng phải là X:Y:Z (ví dụ 0:1:30).' };
    const d = parseInt(parts[0].trim(), 10);
    const h = parseInt(parts[1].trim(), 10);
    const m = parseInt(parts[2].trim(), 10);
    if (Number.isNaN(d) || Number.isNaN(h) || Number.isNaN(m) || d < 0 || h < 0 || m < 0) {
        return { error: 'X, Y, Z phải là số nguyên không âm.' };
    }
    const minutes = d * 24 * 60 + h * 60 + m;
    return { minutes };
}

async function refreshMemberInfoReply(interaction, client, targetUserId) {
    const guild = interaction.guild;
    const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) {
        return interaction.followUp?.({ content: 'Không tìm thấy thành viên.', ephemeral: true });
    }
    const profile = await getProfile(targetUserId, guild.id);
    if (!profile) {
        return interaction.followUp?.({ content: 'Lỗi tải dữ liệu.', ephemeral: true });
    }
    const times = await getTimes(guild.id);
    const embed = await buildEmbed(targetMember, profile);
    const { row1, row2 } = buildComponents(targetUserId, profile?.status, times);
    await interaction.update({ embeds: [embed], components: [row1, row2] }).catch(() => {});
}

async function refreshMemberInfoMessage(message, guild, targetUserId) {
    const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) return;
    const profile = await getProfile(targetUserId, guild.id);
    if (!profile) return;
    const times = await getTimes(guild.id);
    const embed = await buildEmbed(targetMember, profile);
    const { row1, row2 } = buildComponents(targetUserId, profile?.status, times);
    await message.edit({ embeds: [embed], components: [row1, row2] }).catch(() => {});
}

async function handleButton(interaction, client) {
    const customId = interaction.customId;
    const isNewRoleModal = customId.startsWith(PREFIX_BTN_NEWROLE_MODAL);
    const isNewRole = customId.startsWith(PREFIX_BTN_NEWROLE);
    const isStatusBtn = customId.startsWith(PREFIX_BTN_STATUS);
    const isTimeBtn = customId.startsWith(PREFIX_BTN_TIME);
    const isOtherBtn = customId.startsWith(PREFIX_BTN);
    if (!isOtherBtn && !isNewRole && !isNewRoleModal && !isStatusBtn && !isTimeBtn) return false;

    if (!hasManagePermission(interaction.member)) {
        interaction.reply({
            content: 'Bạn không có quyền thực hiện thao tác này.',
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    if (isTimeBtn) {
        const targetUserId = customId.slice(PREFIX_BTN_TIME.length);
        const guild = interaction.guild;
        const times = await getTimes(guild.id);
        const toXYZ = (minutes) => {
            if (minutes == null || minutes <= 0) return '0:0:0';
            const d = Math.floor(minutes / (24 * 60));
            const h = Math.floor((minutes % (24 * 60)) / 60);
            const m = minutes % 60;
            return `${d}:${h}:${m}`;
        };
        const modal = new ModalBuilder()
            .setCustomId(`${PREFIX_MODAL}time_${targetUserId}`)
            .setTitle('Thời gian phạt (Warn / Mute / Lock)');
        const warnInput = new TextInputBuilder()
            .setCustomId('time_warn')
            .setLabel('Warn (Ngày:Giờ:Phút)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(20)
            .setPlaceholder('0:0:0 = vĩnh viễn');
        warnInput.setValue(toXYZ(times.time_warn));
        const muteInput = new TextInputBuilder()
            .setCustomId('time_mute')
            .setLabel('Mute (Ngày:Giờ:Phút)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(20)
            .setPlaceholder('0:0:0 = vĩnh viễn');
        muteInput.setValue(toXYZ(times.time_mute));
        const lockInput = new TextInputBuilder()
            .setCustomId('time_lock')
            .setLabel('Lock (Ngày:Giờ:Phút)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(20)
            .setPlaceholder('0:0:0 = vĩnh viễn');
        lockInput.setValue(toXYZ(times.time_lock));
        modal.addComponents(
            new ActionRowBuilder().addComponents(warnInput),
            new ActionRowBuilder().addComponents(muteInput),
            new ActionRowBuilder().addComponents(lockInput)
        );
        interaction.showModal(modal).catch(() => {});
        return true;
    }

    if (isStatusBtn) {
        const rest = customId.slice(PREFIX_BTN_STATUS.length);
        const [status, targetUserId] = rest.split('_');
        if (!targetUserId) return true;
        await handleStatusButton(interaction, client, targetUserId, status);
        return true;
    }

    if (isNewRoleModal) {
        const rest = customId.slice(PREFIX_BTN_NEWROLE_MODAL.length);
        const [targetUserId, embedMessageId] = rest.split('_');
        if (!targetUserId || !embedMessageId) return true;
        const modal = new ModalBuilder()
            .setCustomId(`${PREFIX_MODAL}newrole_${targetUserId}_${embedMessageId}`)
            .setTitle('Tạo vai trò và gán');
        const input = new TextInputBuilder()
            .setCustomId('create_roles')
            .setLabel('Tên vai trò (cách nhau bởi dấu phẩy)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(500)
            .setPlaceholder('Vai trò mới sẽ được tạo nếu chưa tồn tại');
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        interaction.showModal(modal).catch(() => {});
        return true;
    }

    if (isNewRole) {
        const targetUserId = customId.slice(PREFIX_BTN_NEWROLE.length);
        const guild = interaction.guild;
        const embedMessageId = interaction.message?.id ?? '';
        const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
        if (!targetMember) {
            await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
            return true;
        }
        const { rowSelect, rowButton } = buildRolePanel(guild, targetMember, targetUserId, embedMessageId);
        await interaction.reply({
            content: '**Checklist:** Chọn vai trò bên dưới = gán, bỏ chọn = không gán.\n**Tạo vai trò và gán:** bấm nút bên dưới, nhập tên (kiểm tra tồn tại, tạo mới nếu chưa có).',
            components: [rowSelect, rowButton],
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    const rest = customId.slice(PREFIX_BTN.length);
    const parts = rest.split('_');
    const action = parts[0];

    if (action === 'kick' && parts[1] === 'confirm') {
        const targetUserId = parts[2];
        const guild = interaction.guild;
        const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
        if (!targetMember) {
            await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
            return true;
        }
        await targetMember.kick().catch((err) => {
            return interaction.reply({ content: `Không kick được: ${err.message}`, ephemeral: true }).catch(() => {});
        });
        await interaction.update({ content: `Đã kick **${targetMember.user.tag}**.`, components: [] }).catch(() => {});
        return true;
    }

    if (action === 'kick' && parts[1] === 'cancel') {
        await interaction.update({ content: 'Đã hủy.', components: [] }).catch(() => {});
        return true;
    }

    if (action === 'kick') {
        const targetUserId = parts[1];
        const guild = interaction.guild;
        const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
        if (!targetMember) {
            await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
            return true;
        }
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`${PREFIX_BTN}kick_confirm_${targetUserId}`)
                .setLabel('Xác nhận')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`${PREFIX_BTN}kick_cancel_${targetUserId}`)
                .setLabel('Hủy')
                .setStyle(ButtonStyle.Secondary)
        );
        await interaction.reply({
            content: `Bạn có chắc muốn kick **${targetMember.user.tag}**?`,
            components: [row],
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    if (action === 'move') {
        const targetUserId = parts[1];
        await interaction.reply({
            content: 'Chọn kênh voice để chuyển thành viên:',
            components: [buildMoveChannelSelectRow(interaction.guild, targetUserId)],
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    const targetUserId = parts[1];
    if (!targetUserId || !['nick', 'level'].includes(action)) return true;

    if (action === 'nick') {
        const modal = new ModalBuilder()
            .setCustomId(`${PREFIX_MODAL}nick_${targetUserId}`)
            .setTitle('Name');
        const input = new TextInputBuilder()
            .setCustomId('nickname')
            .setLabel('Nickname')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(32)
            .setPlaceholder('Tên hiển thị trên server');
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        interaction.showModal(modal).catch(() => {});
        return true;
    }

    if (action === 'level') {
        const modal = new ModalBuilder()
            .setCustomId(`${PREFIX_MODAL}level_${targetUserId}`)
            .setTitle('Level');
        const input = new TextInputBuilder()
            .setCustomId('level')
            .setLabel('Level (số nguyên)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('0');
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        interaction.showModal(modal).catch(() => {});
        return true;
    }

    return true;
}

async function handleStatusButton(interaction, client, targetUserId, status) {
    const guild = interaction.guild;
    const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) {
        await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
        return;
    }

    if (status === 'Good') {
        await interaction.deferUpdate().catch(() => {});
        await updateStatus(targetUserId, guild.id, 'Good', null);
        await targetMember.timeout(null).catch(() => {});
        if (LOCKED_CHAT_ROLE_ID) await targetMember.roles.add(LOCKED_CHAT_ROLE_ID).catch(() => {});
        if (interaction.message) await refreshMemberInfoMessage(interaction.message, guild, targetUserId);
        return;
    }

    const minutes = await getTimeForStatus(guild.id, status);
    let expiresAt = null;
    if (minutes != null && minutes > 0) {
        expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    }

    await interaction.deferUpdate().catch(() => {});
    await updateStatus(targetUserId, guild.id, status, expiresAt);

    if (status === 'Muted') {
        const timeoutMs = expiresAt ? expiresAt.getTime() - Date.now() : 28 * 24 * 60 * 60 * 1000;
        await targetMember.timeout(timeoutMs).catch(() => {});
    }
    if (status === 'Locked' && LOCKED_CHAT_ROLE_ID) {
        await targetMember.roles.remove(LOCKED_CHAT_ROLE_ID).catch(() => {});
    }
    if (interaction.message) await refreshMemberInfoMessage(interaction.message, guild, targetUserId);
}

async function handleChannelSelectMove(interaction, client, targetUserId) {
    const channelId = interaction.values[0];
    if (!channelId || channelId === 'none') {
        await interaction.reply({ content: 'Chọn một kênh voice.', ephemeral: true }).catch(() => {});
        return;
    }
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        await interaction.reply({ content: 'Không tìm thấy kênh.', ephemeral: true }).catch(() => {});
        return;
    }
    const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) {
        await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
        return;
    }
    await targetMember.voice.setChannel(channel).catch((err) => {
        return interaction.reply({
            content: `Không chuyển được: ${err.message}`,
            ephemeral: true,
        }).catch(() => {});
    });
    await interaction.update({
        content: `Đã chuyển **${targetMember.user.tag}** vào **${channel.name}**.`,
        components: [],
    }).catch(() => {});
}

async function handleRoleChecklistSubmit(interaction, client, targetUserId, embedMessageId) {
    const guild = interaction.guild;
    const selectedRoleIds = interaction.values.filter((v) => v !== 'none');
    const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) {
        await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
        return;
    }
    const currentRoleIds = targetMember.roles.cache
        .filter((r) => r.name !== '@everyone')
        .map((r) => r.id);
    const toAdd = selectedRoleIds.filter((id) => !currentRoleIds.includes(id));
    const toRemove = currentRoleIds.filter((id) => !selectedRoleIds.includes(id));
    for (const roleId of toAdd) {
        await targetMember.roles.add(roleId).catch(() => {});
    }
    for (const roleId of toRemove) {
        await targetMember.roles.remove(roleId).catch(() => {});
    }
    if (embedMessageId) {
        const msg = await interaction.channel?.messages.fetch(embedMessageId).catch(() => null);
        if (msg) await refreshMemberInfoMessage(msg, guild, targetUserId);
    }
    await interaction.deferUpdate().catch(() => {});
    await interaction.followUp({ content: 'Đã cập nhật vai trò.', ephemeral: true }).catch(() => {});
}

async function handleStringSelect(interaction, client) {
    const customId = interaction.customId;
    if (customId.startsWith(PREFIX_SELECT_ROLES)) {
        const rest = customId.slice(PREFIX_SELECT_ROLES.length);
        const [targetUserId, embedMessageId] = rest.split('_');
        if (targetUserId && embedMessageId) await handleRoleChecklistSubmit(interaction, client, targetUserId, embedMessageId);
        return true;
    }
    if (customId.startsWith(PREFIX_SELECT_MOVE)) {
        const targetUserId = parseTargetUserId(customId, PREFIX_SELECT_MOVE);
        if (targetUserId) await handleChannelSelectMove(interaction, client, targetUserId);
        return true;
    }
    return false;
}

async function handleModalSubmit(interaction, client) {
    const customId = interaction.customId;
    if (!customId.startsWith(PREFIX_MODAL)) return false;

    if (!hasManagePermission(interaction.member)) {
        await interaction.reply({
            content: 'Bạn không có quyền thực hiện thao tác này.',
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    const rest = customId.slice(PREFIX_MODAL.length);
    const parts = rest.split('_');
    const action = parts[0];
    const targetUserId = parts[1];
    const embedMessageId = parts[2] ?? null;
    const guild = interaction.guild;

    if (action === 'time') {
        const rawWarn = interaction.fields.getTextInputValue('time_warn')?.trim() ?? '';
        const rawMute = interaction.fields.getTextInputValue('time_mute')?.trim() ?? '';
        const rawLock = interaction.fields.getTextInputValue('time_lock')?.trim() ?? '';
        const rWarn = parseTimeXYZ(rawWarn);
        const rMute = parseTimeXYZ(rawMute);
        const rLock = parseTimeXYZ(rawLock);
        if (rWarn.error || rMute.error || rLock.error) {
            const msg = [rWarn.error && `**Warn:** ${rWarn.error}`, rMute.error && `**Mute:** ${rMute.error}`, rLock.error && `**Lock:** ${rLock.error}`].filter(Boolean).join('\n');
            await interaction.reply({ content: `Sai định dạng. ${msg}\nMỗi ô nhập đúng dạng **X:Y:Z** (X=ngày, Y=giờ, Z=phút).`, ephemeral: true }).catch(() => {});
            return true;
        }
        await setTimes(guild.id, {
            time_warn: rWarn.minutes > 0 ? rWarn.minutes : 0,
            time_mute: rMute.minutes > 0 ? rMute.minutes : 0,
            time_lock: rLock.minutes > 0 ? rLock.minutes : 0,
        });
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        if (interaction.message) await refreshMemberInfoMessage(interaction.message, guild, targetUserId);
        await interaction.editReply({
            content: `Đã cập nhật: Warn **${rWarn.minutes}** phút, Mute **${rMute.minutes}** phút, Lock **${rLock.minutes}** phút (0 = vĩnh viễn).`,
        }).catch(() => {});
        return true;
    }

    const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) {
        await interaction.reply({ content: 'Không tìm thấy thành viên.', ephemeral: true }).catch(() => {});
        return true;
    }

    if (action === 'nick') {
        const nickname = interaction.fields.getTextInputValue('nickname').trim().slice(0, 32);
        await targetMember.setNickname(nickname || null).catch(() => {});
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        if (interaction.message) await refreshMemberInfoMessage(interaction.message, guild, targetUserId);
        await interaction.editReply({ content: 'Đã đổi nickname.' }).catch(() => {});
        return true;
    }

    if (action === 'level') {
        const raw = interaction.fields.getTextInputValue('level').trim();
        const level = Math.max(0, parseInt(raw, 10) || 0);
        await updateLevel(targetUserId, guild.id, level);
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        if (interaction.message) await refreshMemberInfoMessage(interaction.message, guild, targetUserId);
        await interaction.editReply({ content: 'Đã cập nhật level.' }).catch(() => {});
        return true;
    }

    if (action === 'newrole') {
        const raw = interaction.fields.getTextInputValue('create_roles')?.trim() ?? '';
        const names = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
        const added = [];
        const created = [];
        for (const name of names) {
            if (!name) continue;
            let role = guild.roles.cache.find((r) => r.name === name);
            if (!role) {
                try {
                    role = await guild.roles.create({ name });
                    created.push(name);
                } catch (err) {
                    await interaction.reply({
                        content: `Không tạo được vai trò **${name}**: ${err.message}`,
                        ephemeral: true,
                    }).catch(() => {});
                    return true;
                }
            }
            await targetMember.roles.add(role).catch(() => {});
            added.push(name);
        }
        if (embedMessageId) {
            const msg = await interaction.channel?.messages.fetch(embedMessageId).catch(() => null);
            if (msg) await refreshMemberInfoMessage(msg, guild, targetUserId);
        }
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        const msgParts = [];
        if (added.length) msgParts.push(`Đã gán: ${added.join(', ')}`);
        if (created.length) msgParts.push(`(Tạo mới: ${created.join(', ')})`);
        await interaction.editReply({
            content: msgParts.length ? msgParts.join(' ') : 'Không thay đổi.',
        }).catch(() => {});
        return true;
    }

    return true;
}

/**
 * Gọi từ event interactionCreate: nếu customId bắt đầu bằng member_info_ thì xử lý và return true.
 */
async function handle(interaction, client) {
    if (!hasManagePermission(interaction.member)) {
        await interaction.reply({
            content: 'Bạn không có quyền thực hiện thao tác này.',
            ephemeral: true,
        }).catch(() => {});
        return true;
    }

    if (interaction.isButton()) {
        return await handleButton(interaction, client);
    }
    if (interaction.isStringSelectMenu()) {
        return await handleStringSelect(interaction, client);
    }
    if (interaction.isModalSubmit()) {
        return await handleModalSubmit(interaction, client);
    }
    return false;
}

/**
 * Trước đây dùng tin nhắn chat để nhập time; giờ dùng modal. Giữ hàm để event messageCreate không crash.
 * @returns {Promise<boolean>} false = không xử lý (không có flow nhập time qua chat nữa).
 */
async function handleTimeReply(message, client) {
    return false;
}

module.exports = { handle, handleTimeReply };
